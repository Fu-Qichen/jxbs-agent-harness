# Domain Skill Simple Template

## 目标

这是给上游领域复用的极简 `SKILL.md` 规范模板。

适用前提：

- 领域没有特殊布局要求
- 不需要领域自己定义报告结构
- 只需要稳定命中 `yondesign-agentic`
- 领域只负责提供业务语义和结构化数据

如果你需要更完整的字段契约、扩展区块规则和自检清单，改读：

- `domain-skill-template.md`

如果你只是要发给领域同学一句调用话术，改读：

- `domain-invocation-simple-template.md`
- `domain-hit-script-template.md`

## 极简版正文

下面这段可以直接写进上游领域 skill：

```markdown
当用户需要 [领域名称] 的分析报告、问数右侧预览、指标摘要或专项分析时：

1. 查询并整理本领域分析所需结构化数据
2. 调用 `yondesign-agentic`
3. 默认传入：
   - `template_id = domain-public-report`
   - `render_target = lobster-right-panel`
   - `analysis_topic`
   - `object_scope`
   - `summary`
   - `key_findings`
   - `metrics`
   - `charts`（可选）
   - `details`（可选）
   - `recommendations`
4. 若 `charts` 为空，跳过图表区
5. 若 `details` 为空，跳过明细区，并把动作信息并入结论建议区
6. 由 `yondesign-agentic` 负责默认报告结构和完整 HTML
7. 最终只输出完整 HTML，不追加 Markdown、图片或第二套图表
```

## 最小字段要求

领域侧最少只要准备这些内容：

- `analysis_topic`：分析主题
- `object_scope`：分析对象范围
- `summary`：`2-3` 句摘要
- `key_findings`：`2-3` 句核心结论
- `metrics`：`3-10` 个指标
- `recommendations`：`1-5` 条建议

按需补充：

- `time_label`
- `charts`
- `details`

## 最小载荷示例

```json
{
  "template_id": "domain-public-report",
  "render_target": "lobster-right-panel",
  "analysis_topic": "[分析主题]",
  "object_scope": "[分析对象范围]",
  "summary": [
    "[摘要第 1 句]",
    "[摘要第 2 句]"
  ],
  "key_findings": [
    "[核心结论第 1 句]",
    "[核心结论第 2 句]"
  ],
  "metrics": [
    {
      "label": "[指标名称]",
      "value": "[指标值]"
    }
  ],
  "recommendations": [
    "[建议 1]"
  ]
}
```

## 使用原则

- 没有特殊要求时，领域不要自己写“标题区 / 概览区 / 指标区”这类页面结构。
- 领域只描述业务语义、数据结果和最终建议，页面骨架默认交给 `yondesign-agentic`。
- 如果领域开始出现额外区块、复杂图表约束、特殊口径区或时间线区，再升级到 `domain-skill-template.md`。
