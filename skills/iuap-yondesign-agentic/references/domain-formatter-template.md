# 领域 Skill 会话区改造模板

> 把本文档直接扔给大模型，让它改造任意领域 skill 的会话区输出。

---

## 调用指令（直接复制使用）

在对话中 attach `@skill:iuap-yondesign-agentic`，然后发送以下任意一句：

```
帮我改造 {领域名} 领域 skill 的会话区输出，统一用共享格式化引擎输出 Markdown
```

```
把 {领域名} skill 的查询结果/操作结果输出规范化，走 iuap-yondesign-agentic 的会话区约束
```

```
约束 {领域名} skill 的会话区输出，让它跟其他领域用同一套格式
```

LLM 会自动读取本模板，按 schema 驱动方式生成领域专属的 `formatter.py`。

---

## 你的任务

把当前领域 skill 的**会话区 Markdown 输出**（查询结果、操作结果、审核详情等）统一改用共享格式化引擎。

**核心改动**：在领域 skill 目录下新增 `formatter.py`，定义自己的输出 schema，调 `render_schema()`。

**不改的**：领域 skill 的业务逻辑、API 调用、右侧预览区 HTML 渲染等一律不动。你只改会话区文本输出。

---

## 第 1 步：确认共享引擎路径

共享引擎在以下路径（根据 WorkBuddy skill 安装位置调整）：

```
~/.workbuddy/skills/iuap-yondesign-agentic/scripts/shared_formatter.py
```

领域 skill 的 `formatter.py` 需要把这个路径加入 `sys.path`，然后 import：

```python
import sys, os
sys.path.insert(0, os.path.expanduser(
    "~/.workbuddy/skills/iuap-yondesign-agentic/scripts"
))
from shared_formatter import render_schema
```

---

## 第 2 步：定义 Schema

根据领域 skill 的会话区输出需求，定义一个 Python dict。**所有业务方共用同一个 schema 结构**，只需填自己领域的内容。

### Schema 完整结构

```python
MY_SCHEMA = {
    # ---- 可选：状态名称映射（仅中文名称，无彩色灯 emoji）----
    "status_lights": {
        "order": {                     # 状态类型名，自定义
            0: "草稿", 1: "已提交", 2: "已关闭",
            3: "审核中", 4: "已驳回"
        },
    },

    # ---- 必填：引言模板 ----
    # 可用变量：{date}、{date_period}（会自动从 data.query_params 中取）
    "intro": "已查询 {date} 期间的采购订单执行情况",

    # ---- 必填：章节列表 ----
    "sections": [
        # 类型 1：概览统计
        {
            "type": "overview",
            "title": "概览统计",
            "categories": [
                # (显示名称, overview字段名, 说明文字)
                ("待审核", "pending_audit", "等待审核的订单数量"),
                ("在途",   "in_transit",     "正在运输途中的订单数量"),
                ("已完成", "finished",        "已完成采购的订单数量"),
            ],
        },

        # 类型 2：异常关注（数量为 0 的项自动隐藏；整节在全部为 0 时隐藏）
        {
            "type": "alert",
            "title": "异常关注",
            "condition": "has_alert",          # "has_alert" | "has_data" | ""
            "alerts": [
                # (显示名称, overview字段名, 说明, 处理建议模板)
                ("逾期未到货", "delayed_arrival",
                 "订单已超预计到货日期，尚未到货",
                 "建议联系供应商确认 {count} 条订单的交货时间"),
            ],
        },

        # 类型 3：数据明细表
        {
            "type": "table",
            "title": "采购明细",
            "condition": "has_data",           # 无数据时隐藏此节
            "columns": [
                # (列标题, 列key, 显示格式)
                # 可用格式：plain / backtick / date / number / code_name / date_range / status_light(类型名)
                ("订单编号",   "code",          "backtick"),
                ("状态",       "status_field",  "status_light(order)"),
                ("采购日期",   "vouchdate",     "date"),
                ("供应商",     "supplier",      "plain"),
                ("物料",       "material",      "code_name"),
                ("采购量",     "quantity",      "number"),
            ],
            "row_fields": {
                # 列key → 数据中的嵌套字段路径（点号分层，数字为数组索引）
                "code":          ("code",),
                "status_field":  ("status",),
                "vouchdate":     ("vouchdate",),
                "supplier":      ("supplierId.name",),
                "material":      ("purchaseItems.0.materialId.code",
                                  "purchaseItems.0.materialId.name"),
                "quantity":      ("purchaseItems.0.quantity",),
            },
        },

        # 类型 4：执行建议（条件判断 + 模板渲染）
        {
            "type": "suggestion",
            "title": "执行建议",
            "fallback": "采购进度正常",         # 无条件命中时的兜底文字
            "rules": [
                # ("条件表达式", "命中后的建议文字，可用 {变量} 引用 overview 字段")
                ("pending_audit > 0",
                 "共 **{pending_audit}** 条订单待审核，建议优先处理"),
                ("delayed_arrival > 0",
                 "共 **{delayed_arrival}** 条订单逾期未到货，建议联系供应商"),
            ],
        },

        # 类型 5：后续操作引导
        {
            "type": "action",
            "actions": [
                "发起请购", "发起审核", "查看供应商详情",
            ],
        },
    ],
}
```

### Schema 字段速查

| 节类型 | `type` | 必须有 | 说明 |
|---|---|---|---|
| 概览统计 | `"overview"` | `categories` | 每项包含 (显示名, overview字段名, 描述)；可选 `record_label` 自定义量词 |
| 异常关注 | `"alert"` | `alerts` | 每项包含 (显示名, overview字段名, 说明, 建议模板) |
| 明细表 | `"table"` | `columns` + `row_fields` | columns 定义表头，row_fields 定义字段映射 |
| 执行建议 | `"suggestion"` | `rules` | 每条包含 (Python条件表达式, 模板字符串) |
| 后续操作 | `"action"` | `actions` | 操作名列表；支持 (verb, text) 元组实现「」包裹动词 |
| 业务摘要 | `"summary"` | `fields` | 无序列表展示关键字段，字段名可加粗 |
| 核心结论 | `"conclusion"` | `text` / `rules` | 可选 `conclusion_type` 为 "normal" 或 "abnormal" |
| 信息来源 | `"source"` | `sources` | 每项 (标签, 描述/URL, 是否外部) |
| 错误反馈 | `"error"` | 渲染器自动 | 失败时自动调用 render_error |

### v2.1.0 新增功能

| 功能 | 说明 |
|------|------|
| `show_seq` | table 节可选字段，默认 `true`，自动添加序号列（规范 3.2） |
| 分割线条件 | `render_action` 自动判断，无明细时不输出分割线（规范 3.8） |
| 单列表项 | 仅有 1 项时自动转普通句（规范 3.3） |
| 相对日期 | 引言中自动转换"今天""近7天"等为实际日期（规范 3.4） |
| 千分符防误伤 | 4 位年份数字（1000-2999）跳过千分符（规范 3.4） |

### v2.0 新增功能

| 功能 | 说明 |
|------|------|
| `record_label` | overview 节可选字段，自定义量词（如 "张订单"、"条记录"） |
| 动作动词包裹 | action 节 actions 支持 `(verb, text)` 元组 → `• **「申请休假」**申请休假` |
| `intro_text` | action 节可自定义引导文本 |
| Emoji 位置 | 自动位于序号与正文之间 |
| Emoji 白名单 | 生成内容仅允许 ⚠️/✅，其余 emoji 一律不使用（见 shared_format_rules.md 第二十节） |
| 空值 | 统一显示 `--` |
| 千分符 | fmt 支持 `"thousands"` 类型 |
| 分割线 | 自动在明细和操作建议之间 |

### 条件表达式规则

`condition` 可选值：
- `""` 或省略：始终渲染
- `"has_data"`：有 record_list 时才渲染
- `"has_alert"`：自动从 alerts 各项对应的 overview 字段判断，任一 > 0 即渲染

`suggestion.rules` 的条件是 Python 表达式，可用变量来自 `data.overview` 的全部字段。
示例：`"pending_audit > 0 and finished < 5"`

### 数据格式约定

`render_schema(schema, data)` 期望的 `data` 结构：

```python
{
    "success": True,
    "data": {
        "overview": {            # 统计值，所有字段自动变为可用变量
            "pending_audit": 2,
            "in_transit": 5,
            "finished": 10,
            "delayed_arrival": 1,
        },
        "pagination": {
            "record_count": 17,
            "page_size": 20,
            "current_page": 1
        },
        "record_list": [         # 明细数据列表
            {"code": "CG001", "status": 1, "vouchdate": "2026-01-15", ...},
            ...
        ],
        "query_params": {        # 查询参数（date/date_period 用于引言）
            "date": "2026-01-01,2026-06-30"
        }
    }
}
```

**要求**：领域 skill 的数据层必须把返回数据组织成上述结构，然后传给 `render_schema`。

---

## 第 3 步：领域 formatter.py 完整示例

把下面这个改成你领域的名字和 schema，放到领域 skill 目录下：

```python
# {domain_name}/formatter.py
"""会话区输出格式化 — 基于共享引擎 render_schema"""

import sys, os
sys.path.insert(0, os.path.expanduser(
    "~/.workbuddy/skills/iuap-yondesign-agentic/scripts"
))
from shared_formatter import render_schema

# ═══════════════════════════════════════
# 领域 Schema（从这里开始改成自己的）
# ═══════════════════════════════════════

PURCHASE_SCHEMA = {
    "status_lights": {
        "po": {0: "草稿", 1: "已提交", 2: "已关闭", 3: "审核中", 4: "已驳回"},
    },
    "intro": "已查询 {date} 期间的采购订单执行情况",
    "sections": [
        {
            "type": "overview",
            "title": "概览统计",
            "categories": [
                ("待审核", "pending_audit", "等待审核的采购订单"),
                ("在途",   "in_transit",   "正在运输途中的订单"),
                ("已完成", "finished",      "已完成采购的订单"),
                ("已关闭", "closed",        "已关闭的订单"),
            ],
        },
        {
            "type": "alert",
            "title": "异常关注",
            "condition": "has_alert",
            "alerts": [
                ("逾期未到货", "delayed_arrival",
                 "订单超预计到货日期，尚未到货",
                 "建议联系供应商确认 {count} 条订单交货时间"),
            ],
        },
        {
            "type": "table",
            "title": "采购明细",
            "condition": "has_data",
            "columns": [
                ("订单编号", "code",         "backtick"),
                ("状态",     "status_field", "status_light(po)"),
                ("日期",     "vouchdate",    "date"),
                ("供应商",   "supplier",     "plain"),
                ("物料",     "material",     "code_name"),
                ("数量",     "quantity",     "number"),
            ],
            "row_fields": {
                "code":         ("code",),
                "status_field": ("status",),
                "vouchdate":    ("vouchdate",),
                "supplier":     ("supplierId.name",),
                "material":     ("purchaseItems.0.materialId.code",
                                 "purchaseItems.0.materialId.name"),
                "quantity":     ("purchaseItems.0.quantity",),
            },
        },
        {
            "type": "suggestion",
            "title": "执行建议",
            "fallback": "采购进度正常，暂无异常",
            "rules": [
                ("pending_audit > 0",
                 "共 **{pending_audit}** 条订单待审核，建议优先处理"),
                ("delayed_arrival > 0",
                 "共 **{delayed_arrival}** 条订单逾期未到货，需跟进供应商"),
            ],
        },
        {
            "type": "action",
            "actions": ["发起请购", "发起审核", "查看供应商"],
        },
    ],
}


# ═══════════════════════════════════════
# 公开入口（领域 skill 主流程调用）
# ═══════════════════════════════════════

def format_result(data: dict) -> str:
    """领域 skill 唯一需要调用的格式化函数"""
    return render_schema(PURCHASE_SCHEMA, data)
```

---

## 第 4 步：对接领域 skill 主流程

在领域 skill 的 `SKILL.md` 或主逻辑中，把原来的 `print(...)` / 手写 Markdown 替换为：

```python
from formatter import format_result

# 数据层返回结构化数据
data = query_orders(...)  # 业务自己的查询函数

# 格式化输出
output = format_result(data)

# 输出到会话区
print(output)
```

---

## 改完后检查

- [ ] `formatter.py` 放在领域 skill 目录下，`sys.path` 指向了共享引擎
- [ ] `sections` 的顺序就是输出顺序
- [ ] 数据层返回的 `data` 结构满足 `{success, data: {overview, pagination, record_list, query_params}}`
- [ ] `overview` 的字段名和 schema 中 `categories` / `alerts` / `rules` 引用的一致
- [ ] `row_fields` 的嵌套路径和实际数据字段一致
- [ ] 条件表达式只用了 `overview` 中的字段名
