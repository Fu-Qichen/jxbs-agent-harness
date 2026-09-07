#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
共享输出渲染引擎 v2.2.0 — 领域技能只需调用 render_by_schema()，所有控制权在这里。

v2.2.0 新增功能：
  - 千分符跳过规则扩展：手机号(11位)、邮编(6位)、税号(15-18位)、物料编码(含字母/连字符)一律跳过
  - 引言句式校验：render_schema 引言输出自动检查是否符合"状态/动作 + 来源 + 对象 + 结果"结构
  - 错误反馈安全过滤：render_error 强制过滤密钥/SQL/堆栈/内部服务名等敏感信息
  - Emoji 白名单：仅允许 ⚠️（风险/异常）与 ✅（已完成/成功），其余 emoji 一律不使用（规范 20）

v2.1.0 新增功能：
  - 表格自动序号列（规范 3.2 内容规则-1）
  - 分割线条件判断：不含明细时不再输出分割线（规范 3.8 禁止项-1）
  - 单列表项转普通句（规范 3.3 内容规则-3）
  - 相对日期自动转实际日期范围（规范 3.4 日期格式-4）
  - 千分符防误伤：4 位年份数字跳过千分符（规范 3.4 千分符禁止项）

v2.0 新增功能：
  - Emoji 白名单：标题不再附加 emoji，状态仅显示中文名称；生成内容仅允许 ⚠️/✅（规范 20）
  - 分割线：明细和操作建议之间的通栏分割线（规范 3.8）
  - 空值统一显示 "--"（规范 3.4 空值）
  - 千分符格式化（规范 3.4 千分符）
  - 业务摘要节类型 "summary"（规范 4.3）
  - 核心结论节类型 "conclusion"（规范 4.5）
  - 信息来源节类型 "source"（规范 4.6）
  - 错误反馈节类型 "error"（规范 4.7）
  - 追问与建议支持「」动作词包裹（规范 4.4）
  - 业务模板区分（规范 5.1-5.4）

领域技能示例（formatter.py 全部内容）：
    from shared_formatter import render_by_schema
    def format_progress_result(data):
        return render_by_schema("query_progress", data)
"""

from __future__ import annotations
import os, sys, json, re
from datetime import datetime, timedelta

VERSION = "2.2.0"

# ============================================================
# 0. 相对日期解析（规范 3.4 日期格式-4）
# ============================================================

_RELATIVE_DATE_PATTERNS = {
    "今天":       lambda now: now.strftime("%Y-%m-%d"),
    "昨天":       lambda now: (now - timedelta(days=1)).strftime("%Y-%m-%d"),
    "前天":       lambda now: (now - timedelta(days=2)).strftime("%Y-%m-%d"),
    "本周":       lambda now: _week_range(now),
    "本月":       lambda now: _month_range(now),
    "本季":       lambda now: _quarter_range(now),
    "本年":       lambda now: _year_range(now),
}

# 近X天 / 近X月 / 近X年 正则
_RE_NEAR_DAYS  = re.compile(r"近(\d+)天")
_RE_NEAR_MONTHS = re.compile(r"近(\d+)月")
_RE_NEAR_YEARS  = re.compile(r"近(\d+)年")


def _week_range(now):
    monday = now - timedelta(days=now.weekday())
    sunday = monday + timedelta(days=6)
    return f"{monday.strftime('%Y-%m-%d')}～{sunday.strftime('%Y-%m-%d')}"


def _month_range(now):
    first = now.replace(day=1)
    if now.month == 12:
        last = now.replace(year=now.year + 1, month=1, day=1) - timedelta(days=1)
    else:
        last = now.replace(month=now.month + 1, day=1) - timedelta(days=1)
    return f"{first.strftime('%Y-%m-%d')}～{last.strftime('%Y-%m-%d')}"


def _quarter_range(now):
    q_start_month = ((now.month - 1) // 3) * 3 + 1
    first = now.replace(month=q_start_month, day=1)
    if q_start_month + 3 > 12:
        last = now.replace(year=now.year + 1, month=1, day=1) - timedelta(days=1)
    else:
        last = now.replace(month=q_start_month + 3, day=1) - timedelta(days=1)
    return f"{first.strftime('%Y-%m-%d')}～{last.strftime('%Y-%m-%d')}"


def _year_range(now):
    return f"{now.year}-01-01～{now.year}-12-31"


def _resolve_relative_dates(text: str, now=None) -> str:
    """将文本中的相对日期替换为实际日期范围（规范 3.4 日期格式-4）

    示例：
        "今天" → "今天（2026-07-10）"
        "近7天" → "近7天（2026-07-04～2026-07-10）"
    """
    if not text:
        return text
    if now is None:
        now = datetime.now()

    result = text

    # 替换精确关键词
    for keyword, func in _RELATIVE_DATE_PATTERNS.items():
        if keyword in result:
            actual = func(now)
            result = result.replace(keyword, f"{keyword}（{actual}）")

    # 替换 近X天 近X月 近X年
    def _replace_near(m, unit, delta_factory):
        n = int(m.group(1))
        start = (now - delta_factory(n)).strftime("%Y-%m-%d")
        end = now.strftime("%Y-%m-%d")
        return f"近{m.group(1)}{unit}（{start}～{end}）"

    result = _RE_NEAR_DAYS.sub(lambda m: _replace_near(m, "天", lambda n: timedelta(days=n)), result)
    result = _RE_NEAR_MONTHS.sub(lambda m: _replace_near(m, "月", lambda n: timedelta(days=n * 30)), result)
    result = _RE_NEAR_YEARS.sub(lambda m: _replace_near(m, "年", lambda n: timedelta(days=n * 365)), result)

    return result

# ============================================================
# 一、状态名称注册（不再附加 emoji）
# ============================================================
_STATUS_LIGHT_MAP = {}

# v2.2.0+: emoji 白名单 —— 技能生成内容仅允许以下 emoji，其余一律不使用（规范 20）
_ALLOWED_EMOJI = {"⚠️", "✅"}


def _validate_emoji(emoji_str: str) -> str:
    """校验 emoji 是否合规（规范 20）

    规则：
      - 仅允许白名单内的 emoji（⚠️ 风险/异常，✅ 已完成/成功）
      - 其余 emoji 一律返回空字符串，保持 B 端专业感
    """
    if not emoji_str:
        return ""
    if emoji_str in _ALLOWED_EMOJI:
        return emoji_str
    return ""


def _register_status_light(status_type: str, names: dict):
    """注册状态类型 状态码→中文名称 映射（仅名称，无彩色灯 emoji）"""
    _STATUS_LIGHT_MAP[status_type] = names


# 公开别名，供 demo_usage.py 等外部脚本调用
def set_status_light_map(status_type: str, names: dict):
    """注册状态名称映射：names 为 {状态码: 中文名}"""
    _register_status_light(status_type, names)


def _validate_intro_sentence(intro: str) -> str:
    """校验引言是否符合标准句式（v2.2.0 — 规范 4.2 引言规范）

    标准句式：状态/动作 + 来源或条件 + 对象 + 结果
    空泛句检测：禁止"已完成处理""信息如下""查询结果如下"等无对象无结果表述
    """
    if not intro:
        return intro

    # 空泛句检测模式
    _VAGUE_PATTERNS = [
        re.compile(r'(已完成处理|查询成功|操作完成|处理完成)[,\s]*[，,\s]*信息如下'),
        re.compile(r'^(查询结果如下|结果如下|以下为|如下所示)'),
    ]
    for pattern in _VAGUE_PATTERNS:
        if pattern.match(intro.strip()):
            return ""  # 返回空字符串，提示调用方重新生成

    return intro


def h1(title: str, section_num: str = "一") -> str:
    """生成一级标题（规范 3.7；标题不再附加 emoji，见规范 20）"""
    return f"## **{section_num}、{title}**"


def status_light(status_code, status_type: str = "default") -> str:
    """状态 → 中文名称（不再附加彩色灯 emoji，规范 20）"""
    s = int(status_code) if status_code else 0
    mapping = _STATUS_LIGHT_MAP.get(status_type, {})
    return mapping.get(s, "未知")


# ============================================================
# 二、低层渲染函数（通用，不绑定业务）
# ============================================================

def render_overview(record_count: int, categories: list, record_label: str = "条记录") -> str:
    """概览统计渲染 — 可自定义记录标签

    Args:
        record_count: 记录总数
        categories: [(label, count, desc), ...]
        record_label: 记录量词，默认"条记录"
    """
    lines = [f"共 **{record_count}** {record_label}，其中：", ""]
    for label, count, desc in categories:
        if count > 0:
            lines.append(f"• {label}：**{count}** | {desc}")
            lines.append("")
    return "\n".join(lines)


def render_alert(alerts: list, suggestions: list = None) -> str:
    """异常关注渲染 — 表格形式"""
    lines = ["| 类别 | 数量 | 说明 |", "| :--- | :--- | :--- |"]
    for name, count, desc in alerts:
        if count > 0:
            lines.append(f"| {name} | **{count}** | {desc} |")
    if suggestions:
        lines.append("")
        lines.append("**处理建议**")
        lines.append("")
        for name, text in suggestions:
            if text:
                lines.append(f"• {name}: {text}")
                lines.append("")
    return "\n".join(lines)


def render_pagination(pagination: dict) -> str:
    """分页提示"""
    rc = pagination.get("record_count", 0)
    ps = pagination.get("page_size", 20)
    cp = pagination.get("current_page", 1)
    tp = max(1, (rc + ps - 1) // ps) if ps > 0 else 1
    return f"> 共**{rc}**条数据，每页**{ps}**条，当前第**{cp}/{tp}**页。可回复[继续加载]或[第{cp + 1}页]查看更多"


def render_card(fields: list) -> str:
    """卡片表（两列：项目 | 内容）"""
    lines = ["| 项目 | 内容 |", "| :--- | :--- |"]
    for label, value in fields:
        lines.append(f"| {label} | {value} |")
    return "\n".join(lines)


def render_suggestions(items: list) -> str:
    """执行建议列表（规范 3.3 内容规则-3：只有 1 项时不使用列表，改为普通句）"""
    if len(items) == 1:
        return items[0]
    return "\n".join(f"• {item}" for item in items)


def render_action(items: list, intro_text: str = None, has_table: bool = False) -> str:
    """操作引导渲染 — 支持「」动作词包裹（规范 4.4）

    Args:
        items: 操作项列表，每项可以是纯字符串或 (action_verb, display_text) 元组
               如果是元组，action_verb 会被 「」 包裹加粗
        intro_text: 自定义引导语，默认使用标准引导语
        has_table: 是否已渲染过明细表格（规范 3.8 禁止项-1：不含明细时不得使用分割线）
    """
    if intro_text is None:
        intro_text = "如需进一步推进后续处理，可通过以下操作执行相关业务动作。"
    lines = []
    # 规范 3.8 禁止项-1：不含明细时，不得使用分割线
    if has_table:
        lines.append("---")
        lines.append("")
    lines.append(intro_text)
    lines.append("")
    for it in items:
        if isinstance(it, tuple):
            # (verb, display_text) 动词用 「」 包裹加粗
            verb, text = it
            lines.append(f"• **「{verb}」**{text}")
            lines.append("")
        else:
            lines.append(f"• {it}")
            lines.append("")
    return "\n".join(lines)


def render_summary(fields: list) -> str:
    """业务摘要渲染（规范 4.3）— 无序列表，字段名可加粗

    Args:
        fields: [(label, value, bold_value), ...]
                label: 字段名
                value: 字段值
                bold_value: 是否加粗值（仅关键金额、风险等级等）

    规范 3.3 内容规则-3：只有 1 项时，不使用列表，改为普通句。
    """
    if len(fields) == 1:
        item = fields[0]
        if len(item) == 3:
            label, value, is_bold = item
        else:
            label, value = item
            is_bold = False
        if is_bold:
            return f"**{label}**：**{value}**"
        return f"**{label}**：{value}"

    lines = []
    for item in fields:
        if len(item) == 3:
            label, value, is_bold = item
        else:
            label, value = item
            is_bold = False
        if is_bold:
            lines.append(f"• **{label}**：**{value}**")
        else:
            lines.append(f"• **{label}**：{value}")
    return "\n".join(lines)


def render_conclusion(text: str, conclusion_type: str = "normal") -> str:
    """核心结论渲染（规范 4.5）

    Args:
        text: 结论文本
        conclusion_type: "normal" 正常结论（绿色）或 "abnormal" 异常结论（红色）
                         在 Markdown 中用 emoji 标识
    """
    if conclusion_type == "abnormal":
        prefix = "⚠️ "
    else:
        prefix = "✅ "
    return f"{prefix}{text}"


def render_source(sources: list) -> str:
    """信息来源渲染（规范 4.6）

    Args:
        sources: [(label, url_or_desc, is_external), ...]
    """
    lines = [""]
    for label, desc, is_external in sources:
        if is_external and desc:
            lines.append(f"• {label}：[{desc}]({desc})")
        else:
            lines.append(f"• {label}：{desc}")
    return "\n".join(lines)


def render_error(failure_reason: str, recovery_actions: list = None,
                 partial_results: str = None) -> str:
    """错误反馈与恢复渲染（规范 4.7）

    Args:
        failure_reason: 失败原因简短说明（v2.2.0: 自动过滤敏感信息）
        recovery_actions: 恢复动作列表
        partial_results: 已完成的部分结果说明

    v2.2.0 安全底线：
      - 过滤密钥、SQL、堆栈、内部服务名、接口参数
      - 过滤归咎用户的表述
      - 空状态词自动替换为友好提示
    """
    # 安全过滤：检测并替换敏感内容
    reason = _sanitize_error_message(failure_reason)

    lines = [f"⚠️ {reason}", ""]
    if partial_results:
        lines.append(f"已处理：{partial_results}")
        lines.append("")
    if recovery_actions:
        lines.append("**恢复建议**")
        lines.append("")
        for action in recovery_actions:
            lines.append(f"• {action}")
            lines.append("")
    return "\n".join(lines)


# ============================================================
# v2.2.0 错误反馈安全过滤
# ============================================================

# 敏感信息检测模式
_SENSITIVE_PATTERNS = [
    (re.compile(r'(?i)(password|passwd|secret|token|api[_-]?key|access[_-]?key)\s*[:=]\s*\S+'),
     "密钥信息"),
    (re.compile(r'(?i)(SELECT\s|INSERT\s|UPDATE\s|DELETE\s|DROP\s|ALTER\s)'),
     "SQL 语句"),
    (re.compile(r'(Traceback|File\s+"[^"]+",\s+line\s+\d+|Error\s+at\s+/[^\s]+)'),
     "堆栈追踪"),
    (re.compile(r'(?i)(\d{1,3}\.){3}\d{1,3}(:\d+)?'),
     "IP 地址/端口"),
    (re.compile(r'(?i)(jdbc:|mongodb://|redis://|mysql://|postgresql://)'),
     "数据库连接串"),
]

# 用户归咎表述
_BLAME_PATTERNS = [
    re.compile(r'(你(的)?操作|你(的)?输入|你(的)?权限|你(的)?请求)(有误|错误|无效|失败|不足|不够)'),
    re.compile(r'(你没有|你未|你缺少)'),
]

# 空状态词
_EMPTY_STATE_PATTERNS = re.compile(r'^(失败|异常|错误|出错)[\s。！!]*$')


def _sanitize_error_message(msg: str) -> str:
    """过滤错误消息中的敏感信息（v2.2.0）

    规则：
      1. 包含密钥/SQL/堆栈/IP/连接串 → 替换为通用提示
      2. 包含归咎用户的表述 → 替换为中性表述
      3. 纯空状态词 → 替换为友好提示
    """
    if not msg:
        return "操作未能完成，请稍后重试"

    # 空状态检测
    if _EMPTY_STATE_PATTERNS.match(msg.strip()):
        return "操作未能完成，请稍后重试"

    result = msg

    # 敏感信息检测
    for pattern, label in _SENSITIVE_PATTERNS:
        if pattern.search(result):
            return "系统处理异常，请稍后重试"

    # 归咎用户表述替换
    for pattern in _BLAME_PATTERNS:
        match = pattern.search(result)
        if match:
            # 替换为中性表述
            result = "当前无法完成此操作，请检查后重试"
            break

    return result


def _format_thousands(val: str) -> str:
    """为数值添加千分符

    规范 3.4 千分符禁止项（v2.2.0 扩展）：
      以下类型禁止添加千分符：
        - 年份（4 位，范围 1000-2999）
        - 手机号（中国大陆 11 位纯数字，以 1 开头）
        - 邮政编码（6 位纯数字）
        - 税号（15-18 位纯数字）
        - 物料编码（含字母/连字符/下划线的视为编码）
        - 订单编号（含字母/连字符/下划线的视为编码）
    """
    try:
        clean = val.strip()
        if not clean:
            return val

        # v2.2.0: 含字母/连字符/下划线 → 物料编码或订单编号，跳过
        if re.match(r'^[-a-zA-Z_]', clean) or re.search(r'[-_a-zA-Z]', clean):
            return val

        # v2.2.0: 识别编码型数字
        digit_only = clean.lstrip('-')
        if digit_only.isdigit():
            dlen = len(digit_only)
            # 年份：4 位且范围 1000-2999
            if dlen == 4 and 1000 <= int(digit_only) <= 2999:
                return val
            # 手机号：11 位，以 1 开头（中国大陆）
            if dlen == 11 and digit_only.startswith('1'):
                return val
            # 邮政编码：6 位
            if dlen == 6:
                return val
            # 税号/统一社会信用代码：15-18 位
            if 15 <= dlen <= 18:
                return val

        # 纯数字才格式化
        if re.match(r'^-?\d+(\.\d+)?$', clean):
            if '.' in clean:
                int_part, dec_part = clean.split('.')
                int_part = f"{int(int_part):,}" if int_part and int_part != '-' else int_part or "0"
                return f"{int_part}.{dec_part}"
            else:
                return f"{int(clean):,}"
        return val
    except (ValueError, TypeError):
        return val


# ============================================================
# 三、Schema 定义区 —— 所有领域技能的输出结构都在这里集中控制
# ============================================================

SCHEMAS = {}

# -----------------------------------------------------------
# 3.1 生产订单技能（yonbip-mm-po-order-handling）
# -----------------------------------------------------------
_SCHEMA_PO = {

    "query_progress": {
        "status_lights": {
            "order": {0: "开立", 1: "已审核", 2: "已关闭", 3: "审核中",
                      4: "已锁定", 5: "已开工", 6: "已完工"},
        },
        "intro": "{date_period} 期间的生产订单执行情况",
        "sections": [
            {"type": "overview", "title": "概览统计",
             "record_label": "张订单",
             "categories": [
                ("待审核", "pending_audit", "开立或审核中的订单数量"),
                ("在制中", "in_production", "正在生产中的订单数量"),
                ("已完工", "finished", "已完成生产的订单数量"),
                ("已关闭", "closed", "已关闭的订单数量"),
             ]},
            {"type": "alert", "title": "异常关注",
             "condition": "has_alert",
             "alerts": [
                ("逾期未开工", "delayed_not_started",
                 "订单已超开工日期，尚未开工生产",
                 "建议尽快对 {count} 条订单执行开工操作"),
                ("逾期未完工", "delayed_not_finished",
                 "订单已超完工日期，尚未完成生产",
                 "建议关注 {count} 条订单的生产进度"),
             ]},
            {"type": "table", "title": "订单明细",
             "condition": "has_data",
             "columns": [
                ("生产订单号", "code", "backtick"),
                ("状态",      "status_field", "status_light(order)"),
                ("日期",      "vouchdate",    "date"),
                ("部门",      "department",   "plain"),
                ("物料",      "material",     "code_name"),
                ("计划日期",  "plan_dates",   "date_range"),
                ("生产量",    "quantity",     "number"),
                ("开工",      "start_qty",    "number"),
                ("已完工",    "done_qty",     "number"),
                ("已入库",    "in_qty",       "number"),
             ],
             "row_fields": {
                "code":        ("code",),
                "status_field": ("status",),
                "vouchdate":   ("vouchdate",),
                "department":  ("productionDepartmentId.name",),
                "material":    ("orderProduct.0.productId.code", "orderProduct.0.productId.name"),
                "plan_dates":  ("orderProduct.0.startDate", "orderProduct.0.finishDate"),
                "quantity":    ("orderProduct.0.quantity",),
                "start_qty":   ("orderProduct.0.startQuantity",),
                "done_qty":    ("orderProduct.0.completedQuantity",),
                "in_qty":      ("orderProduct.0.incomingQuantity",),
             }},
            {"type": "suggestion", "title": "执行建议",
             "rules": [
                ("pending_audit > 0",
                 "共 **{pending_audit}** 条订单待审核，建议优先审核后安排生产计划"),
                ("delayed_not_started > 0",
                 "共 **{delayed_not_started}** 条订单超开工日期未开工，建议立即处理"),
                ("delayed_not_finished > 0",
                 "共 **{delayed_not_finished}** 条订单超完工日期未完工，需重点关注生产进度"),
             ]},
            {"type": "action",
             "actions": [
                ("发起订单审核", "发起订单审核"),
                ("发起订单开工", "发起订单开工"),
                ("发起领料或申请", "发起领料或申请"),
                ("发起完工或入库", "发起完工或入库"),
             ]},
        ],
    },

}  # _SCHEMA_PO

# 注册生产订单 skill 的 schema
SCHEMAS["po"] = _SCHEMA_PO


# ============================================================
# 四、字段提取器
# ============================================================

def _get_field(record: dict, field_path: str):
    """从嵌套 dict 中按点号路径提取值，支持数组索引

    示例：
        _get_field(order, "productionDepartmentId.name")
        _get_field(order, "orderProduct.0.productId.code")
    """
    parts = field_path.split(".")
    current = record
    for part in parts:
        if isinstance(current, dict):
            current = current.get(part)
        elif isinstance(current, list) and part.isdigit():
            idx = int(part)
            current = current[idx] if idx < len(current) else None
        else:
            return None
        if current is None:
            return None
    return current


def _get_field_display(record: dict, field_paths: tuple, fmt: str) -> str:
    """按格式提取并格式化字段

    fmt: "plain" | "backtick" | "date" | "number" | "thousands" | "code_name"
         | "date_range" | "status_light(type)"
    """
    values = []
    for fp in field_paths:
        v = _get_field(record, fp)
        if v is not None:
            values.append(str(v))
        else:
            values.append(None)

    # 空值统一显示 "--"（规范 3.4 空值）
    EMPTY = "--"

    if fmt == "backtick":
        return f"`{values[0]}`" if values[0] else EMPTY
    if fmt == "date":
        return values[0][:10] if values[0] else EMPTY
    if fmt == "code_name":
        parts = [v for v in values if v]
        return " / ".join(parts) if parts else EMPTY
    if fmt == "date_range":
        parts = []
        for v in values:
            if v:
                d = v[:10] if len(v) >= 10 else v
                parts.append(d[5:] if len(d) >= 10 else d)
            else:
                parts.append(EMPTY)
        return " / ".join(parts) if parts[0] != EMPTY else EMPTY
    if fmt == "number":
        return values[0] if values[0] else EMPTY
    if fmt == "thousands":
        # 千分符格式化（规范 3.4 千分符）
        if values[0]:
            return _format_thousands(values[0])
        return EMPTY
    if fmt.startswith("status_light"):
        # status_light(order) -> extract type
        stype = fmt[13:-1]  # "status_light(order)" -> "order"
        return status_light(values[0], stype) if values[0] else EMPTY
    return values[0] if values[0] else EMPTY


# ============================================================
# 五、主渲染入口
# ============================================================

def render_by_schema(schema_key: str, data: dict) -> str:
    """中央注册式入口（向后兼容，po 域在用）。"""
    schema = None
    for domain in SCHEMAS.values():
        if schema_key in domain:
            schema = domain[schema_key]
            break
    if not schema:
        return f"错误：未找到 schema '{schema_key}'"

    return render_schema(schema, data)


def render_schema(schema: dict, data: dict) -> str:
    """Schema 自治入口 —— 领域 skill 自带 schema，不走中央注册。

    领域 skill 用法：
        from shared_formatter import render_schema
        MY_SCHEMA = {...}  # 自己的 schema
        def format_xxx(data):
            return render_schema(MY_SCHEMA, data)

    Args:
        schema: schema dict，包含 status_lights / intro / sections
        data:   原始业务数据 dict（含 success、data 等外层包装）

    Returns:
        格式化的完整输出文本
    """
    # 校验
    if not data.get("success"):
        err_data = data.get("data", {})
        return render_error(
            data.get("message", "操作失败"),
            err_data.get("recovery_actions", None),
            err_data.get("partial_results", None),
        )

    inner = data.get("data", data)
    overview = inner.get("overview", {})
    pagination = inner.get("pagination", {})
    record_list = inner.get("record_list", [])
    query_params = inner.get("query_params", {})

    # 注册状态名称映射（仅名称，无 emoji）
    for key, names in schema.get("status_lights", {}).items():
        _register_status_light(key, names)

    # 从 overview 中自动提取所有统计值
    stats = {k: (v or 0) for k, v in overview.items()}

    has_data = len(record_list) > 0
    has_alert = overview.get("has_alert", False) or any(
        stats.get(field, 0) > 0
        for sec in schema.get("sections", [])
        if sec.get("type") == "alert"
        for item in sec.get("alerts", [])
        for field in [item[1]]
    )

    lines = []

    # ===== 引言 =====
    date_period = _build_date_period(query_params)
    intro_tpl = schema.get("intro", "查询完成")
    intro_text = intro_tpl.format(date=date_period, date_period=date_period)
    # 规范 3.4 日期格式-4：相对日期 → 实际日期范围
    intro_text = _resolve_relative_dates(intro_text)
    # v2.2.0 规范 4.2：引言句式校验
    validated_intro = _validate_intro_sentence(intro_text)
    if not validated_intro:
        # 空泛句回退：使用 state object result 默认生成
        action = "已查询" if has_data else "未找到"
        target = schema.get("_domain_label", "数据")
        validated_intro = f"{action} {target}，{date_period} 期间，共找到 **{len(record_list)}** 条记录"
    lines.append(validated_intro)
    lines.append("")

    # ===== 按章节渲染 =====
    section_num_list = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]
    sec_idx = 0
    # 标记是否已渲染过表格（用于分割线判断）
    has_rendered_table = False
    has_rendered_action = False

    for sec in schema.get("sections", []):
        stype = sec["type"]
        title = sec.get("title", "")

        condition = sec.get("condition", "")
        if condition == "has_alert" and not has_alert:
            continue
        if condition == "has_data" and not has_data:
            continue

        sec_idx += 1
        sn = section_num_list[sec_idx]

        if stype == "overview":
            lines.append(h1(title, sn))
            lines.append("")
            categories = [
                (c[0], stats.get(c[1], 0), c[2])
                for c in sec.get("categories", [])
            ]
            record_count = pagination.get("record_count", 0) or len(record_list)
            record_label = sec.get("record_label", "条记录")
            lines.append(render_overview(record_count, categories, record_label))
            lines.append("")

        elif stype == "summary":
            """业务摘要（规范 4.3）"""
            lines.append(h1(title, sn))
            lines.append("")
            fields = sec.get("fields", [])
            lines.append(render_summary(fields))
            lines.append("")

        elif stype == "conclusion":
            """核心结论（规范 4.5）"""
            lines.append(h1(title, sn))
            lines.append("")
            conclusion_type = sec.get("conclusion_type", "normal")
            text = sec.get("text", "")
            if not text and sec.get("rules"):
                # 从规则中生成结论
                for cond, tpl in sec.get("rules", []):
                    try:
                        if eval(cond, {"__builtins__": {}}, stats):
                            text = tpl.format(**stats)
                            break
                    except Exception:
                        pass
                if not text:
                    text = sec.get("fallback", "无异常")
            lines.append(render_conclusion(text, conclusion_type))
            lines.append("")

        elif stype == "alert":
            lines.append(h1(title, sn))
            lines.append("")
            alerts = []
            suggestions = []
            for item in sec.get("alerts", []):
                name, field, desc = item[0], item[1], item[2]
                sug_tpl = item[3] if len(item) > 3 else ""
                count = stats.get(field, 0)
                if count > 0:
                    alerts.append((name, count, desc))
                    sug_text = sug_tpl.replace("{count}", str(count)) if sug_tpl else ""
                    suggestions.append((name, sug_text))
            if alerts:
                lines.append(render_alert(alerts, suggestions))
                lines.append("")

        elif stype == "table":
            lines.append(h1(title, sn))
            lines.append("")
            col_defs = sec.get("columns", [])
            show_seq = sec.get("show_seq", True)  # 默认显示序号列（规范 3.2 内容规则-1）
            headers = [c[0] for c in col_defs]
            if show_seq:
                headers = ["序号"] + headers
            lines.append("| " + " | ".join(headers) + " |")
            lines.append("| " + " | ".join([":---"] * len(headers)) + " |")
            row_fields = sec.get("row_fields", {})
            # 计算当前页起始序号
            page_size = pagination.get("page_size", 20) or 20
            current_page = pagination.get("current_page", 1) or 1
            seq_start = (current_page - 1) * page_size + 1
            for idx, record in enumerate(record_list[:20]):
                cells = []
                if show_seq:
                    cells.append(str(seq_start + idx))
                for c in col_defs:
                    col_key = c[1]
                    fmt = c[2]
                    field_paths = row_fields.get(col_key, (col_key,))
                    val = _get_field_display(record, field_paths, fmt)
                    cells.append(val)
                lines.append("| " + " | ".join(cells) + " |")
            lines.append("")
            lines.append(render_pagination(pagination))
            lines.append("")
            has_rendered_table = True

        elif stype == "suggestion":
            lines.append(h1(title, sn))
            lines.append("")
            rules = sec.get("rules", [])
            items = []
            for cond, text in rules:
                try:
                    if eval(cond, {"__builtins__": {}}, stats):
                        formatted = text.format(**stats)
                        items.append(formatted)
                except Exception:
                    pass
            if not items:
                items.append(sec.get("fallback", "一切正常"))
            lines.append(render_suggestions(items))
            lines.append("")

        elif stype == "action":
            actions = sec.get("actions", [])
            intro_text = sec.get("intro_text", None)
            # 规范 3.8 禁止项-1：不含明细时，不得使用分割线
            lines.append(render_action(actions, intro_text, has_table=has_rendered_table))
            lines.append("")
            has_rendered_action = True

        elif stype == "source":
            """信息来源（规范 4.6）"""
            lines.append("---")
            lines.append("")
            lines.append(render_source(sec.get("sources", [])))
            lines.append("")

    return "\n".join(lines)


def _build_date_period(query_params: dict) -> str:
    """从 query_params 中提取日期区间文本"""
    for key in ("vouchdate", "date", "date_range"):
        val = query_params.get(key, "")
        if val:
            return val.replace(",", " ~ ")
    return ""


# ============================================================
# 六、向后兼容 —— 旧 formatter.py 原有的函数名仍然可用
# ============================================================

def format_overview_stat(record_count, summary):
    """旧接口兼容"""
    return render_overview(record_count, [
        ("待审核", summary.get("pending_audit", 0), "开立或审核中的订单数量"),
        ("在制中", summary.get("in_production", 0), "正在生产中的订单数量"),
        ("已完工", summary.get("finished", 0), "已完成生产的订单数量"),
        ("已关闭", summary.get("closed", 0), "已关闭的订单数量"),
    ])

def format_exception_table(exceptions: dict) -> str:
    alerts = [(k, v, "") for k, v in exceptions.items() if v > 0]
    desc_map = {"逾期未开工": "订单已超开工日期，尚未开工生产",
                "逾期未完工": "订单已超完工日期，尚未完成生产",
                "欠领材料": "已完工但材料未领完，需补领"}
    sug_map = {"逾期未开工": "建议尽快执行开工操作",
               "逾期未完工": "建议关注生产进度",
               "欠领材料": "建议补领申请"}
    items = [(k, v, desc_map.get(k, ""), sug_map.get(k, "")) for k, v in alerts]
    if not items:
        return ""
    return render_alert([(n, c, d) for n, c, d in items],
                        [(n, s) for n, _, _, s in items])

def format_pagination_hint(pagination):
    return render_pagination(pagination)

def format_status_light(status_code, status_type="order"):
    return status_light(status_code, status_type)