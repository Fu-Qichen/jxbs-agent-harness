#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
演示：通用输出引擎用法

业务技能只需 3 步：
1. 注册状态名称映射（仅中文名称，无 emoji）
2. 按章节调用渲染函数
3. 输出
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared_formatter import *
from shared_formatter import _STATUS_LIGHT_MAP


# ===== 第1步：业务技能注册自己的配置（仅状态名称，无 emoji） =====
set_status_light_map("order", {
    0: "开立", 1: "已审核", 2: "已关闭", 3: "审核中",
    4: "已锁定", 5: "已开工", 6: "已完工",
})

set_status_light_map("material", {
    0: "未领料", 1: "部分领料", 2: "全部领料", 3: "无需领料", 4: "超额领料",
})


def simulate_list():
    """场景：列表查询"""
    lines = []
    lines.append("已查询 **2026-06-24 ~ 2026-06-30** 期间的数据")
    lines.append("")

    # — 概览 —
    lines.append(h1("概览", "一"))
    lines.append("")
    lines.append(render_overview(8, [
        ("待处理", 2, "等待审核的记录"),
        ("进行中", 4, "正在处理中的记录"),
        ("已完成", 2, "已完成处理的记录"),
    ]))

    # — 异常 —
    lines.append("")
    lines.append(h1("异常", "二"))
    lines.append("")
    lines.append(render_alert(
        [("逾期未处理", 1, "超过计划日期")],
        [("逾期未处理", "建议尽快处理")],
    ))

    # — 明细 —
    lines.append("")
    lines.append(h1("明细", "三"))
    lines.append("")
    lines.append("| 编号 | 状态 | 日期 | 名称 |")
    lines.append("| :--- | :--- | :--- | :--- |")
    lines.append(f"| `SCDD001` | {status_light(1, 'order')} | 06-24 | 项目A |")
    lines.append(f"| `SCDD002` | {status_light(5, 'order')} | 06-25 | 项目B |")
    lines.append(f"| `SCDD003` | {status_light(0, 'order')} | 06-26 | 项目C |")
    lines.append("")
    lines.append(render_pagination({"record_count": 8, "page_size": 20, "current_page": 1}))

    # — 建议 —
    lines.append("")
    lines.append(h1("建议", "四"))
    lines.append("")
    lines.append(render_suggestions([
        "共 2 条待审核，建议优先处理",
        "共 1 条逾期未处理，建议立即跟进",
    ]))

    # — 后续操作 —
    lines.append("")
    lines.append(render_action(["发起审核", "发起开工"]))

    return "\n".join(lines)


def simulate_card():
    """场景：单条详情（卡片）"""
    lines = []
    lines.append("已对 **SCDD001** 执行操作")
    lines.append("")
    lines.append(h1("结果", "一"))
    lines.append("")
    lines.append("操作成功！状态已更新为 **已审核**。")
    lines.append("")
    lines.append(h1("详情", "二"))
    lines.append("")
    lines.append(render_card([
        ("编号", "SCDD001"),
        ("状态", status_light(1, "order")),
        ("处理人", "张三"),
        ("处理日期", "2026-06-30"),
    ]))
    lines.append("")
    lines.append(h1("建议", "三"))
    lines.append("")
    lines.append(render_suggestions(["已审核，可进入下一环节"]))
    lines.append("")
    lines.append(render_action(["查看明细", "发起下一步"]))

    return "\n".join(lines)


if __name__ == "__main__":
    print("=" * 50)
    print("  通用输出引擎演示")
    print("  当前注册的状态名称：")
    for k, v in sorted(_STATUS_LIGHT_MAP.items()):
        print(f"    {k}: {v}")
    print("=" * 50)

    print("\n\n【场景：列表查询】")
    print(simulate_list())

    print("\n\n【场景：卡片详情】")
    print(simulate_card())

    print("\n\n改状态名称：")
    print("   set_status_light_map('order', {0: '草稿', ...})")
