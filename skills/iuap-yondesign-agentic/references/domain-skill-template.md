# Domain Skill Template

## 目标

本文件提供一份给上游领域复用的 `SKILL.md` 规范模板。

它解决的是“领域 skill 如何组织数据和调用 `yondesign-agentic`”的问题，不是给人临时复制的一次性 prompt。

默认前提：

- 领域没有特殊布局需求
- 输出目标是龙虾右侧区域
- 最终渲染模板默认命中 `domain-public-report`
- 最终完整 HTML 仍由 `yondesign-agentic` 独占负责

如果你只需要发给领域同学一段调用话术，改读：

- `domain-hit-script-template.md`
- `domain-invocation-simple-template.md`

如果领域没有特殊要求，只想保留最少编排规则，改读：

- `domain-skill-simple-template.md`

## 可直接复用的 SKILL.md 规范模板

下面 5 段就是建议直接写进上游领域 skill 的正文结构，按需替换中括号内容即可。

## 1. 定位与职责

- 本 skill 面向 `[领域名称]` 的通用分析 / 报告场景，负责查询本领域分析所需结构化数据、整理语义内容，并在载荷准备完成后调用 `yondesign-agentic`。
- 本 skill 不负责类名设计、样式定义、视觉拼装或 HTML 细节实现；最终完整 HTML 由 `yondesign-agentic` 输出。
- 默认报告骨架采用 7 个一级区块：标题区、概览区、核心结论区、指标区、图表区、明细区、结论建议区。
- 只有当上游明确提供 `scope`、`progress`、`timeline`、`insights` 等额外内容时，才扩展到完整报告区块。

## 2. 触发条件

- 当用户需要输出“龙虾右侧区域”的分析内容或完整 HTML 时触发。
- 当用户需要 `[领域名称]` 的报告、分析结论、问数右侧预览、指标摘要或专项分析时触发。
- 默认命中 `domain-public-report`，输出目标固定为 `lobster-right-panel`。

## 3. 执行流程

1. 先读取并整理本领域分析所需结构化数据。
2. 仅在结构化分析载荷准备完成后调用 `yondesign-agentic`。
3. 调用时传入 `analysis_topic`、`object_scope`、`summary`、`key_findings`、`metrics`、`charts`、`details`、`recommendations` 以及可选的 `optional_sections`。
4. 若 `charts` 为空，跳过图表区，不输出空容器。
5. 若 `details` 为空，跳过明细区，并把动作信息并入结论建议区。
6. 若当前 skill 或引用文档中未提供所需脚本、模板或资源，必须停止在资源缺失边界，不得臆造替代方案。
7. 若已调用 `yondesign-agentic` 输出完整 HTML，不再追加 Markdown 说明、图片附件或第二套图表表达。

## 4. 传入 yondesign-agentic 的载荷契约

- 顶层字段固定如下：
  - `template_id`: 固定 `domain-public-report`
  - `render_target`: 固定 `lobster-right-panel`
  - `analysis_topic`: 必填，`string`
  - `time_label`: 可选，`string`
  - `object_scope`: 必填，`string`
  - `summary`: 必填，`string[]`，长度 `2-3`
  - `key_findings`: 必填，`string[]`，长度 `2-3`
  - `metrics`: 必填，数组长度 `3-10`
  - `charts`: 可选，数组长度 `0-6`
  - `details`: 可选，数组长度 `0-n`
  - `recommendations`: 必填，`string[]`，长度 `1-5`
  - `optional_sections`: 可选对象，只允许 `scope`、`progress`、`timeline`、`insights`
- `metrics` 每项字段固定如下：
  - `label`
  - `value`
  - `unit?`
  - `trend_text?`
  - `trend_direction`: `positive | negative | neutral`
  - `tone`: `primary | info | warning | danger`
- `charts` 每项字段固定如下：
  - `id`
  - `title`
  - `chart_type`
  - `insight`
  - `data`
- `details` 每项字段固定如下：
  - `title?`
  - `columns`
  - `rows`
- `optional_sections` 结构固定如下：
  - `scope`: `[{ "label": "...", "value": "..." }]`
  - `progress`: `[{ "label": "...", "value": "...", "status": "..." }]`
  - `timeline`: `[{ "time": "...", "title": "...", "description": "..." }]`
  - `insights`: `[{ "title": "...", "description": "..." }]`
- 默认渲染顺序固定为：
  标题 -> 概览 -> 核心结论 -> 指标 -> 图表 -> 明细 -> 结论建议
- 领域 skill 只提供语义区块和结构化字段，不指定 CSS 类、颜色、尺寸或自定义视觉类名。

参考载荷：

```json
{
  "template_id": "domain-public-report",
  "render_target": "lobster-right-panel",
  "analysis_topic": "[分析主题]",
  "time_label": "[统计周期，可省略]",
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
      "value": "[指标值]",
      "unit": "[单位，可省略]",
      "trend_text": "[趋势说明，可省略]",
      "trend_direction": "positive",
      "tone": "primary"
    }
  ],
  "charts": [
    {
      "id": "chart-[语义]",
      "title": "[图表标题]",
      "chart_type": "[trend|bar|pie|radar|gauge|scatter|funnel|heatmap|treemap|combo]",
      "insight": "[图表解读]",
      "data": {}
    }
  ],
  "details": [
    {
      "title": "[明细标题，可省略]",
      "columns": ["[列表头 1]", "[列表头 2]"],
      "rows": [
        ["[单元格 1]", "[单元格 2]"]
      ]
    }
  ],
  "recommendations": [
    "[建议 1]",
    "[建议 2]"
  ],
  "optional_sections": {
    "timeline": [
      {
        "time": "[时间]",
        "title": "[事件标题]",
        "description": "[事件说明]"
      }
    ]
  }
}
```

`trend|bar|donut|ring|pie|radar|gauge|scatter|funnel|combo` 必须先归入 V1.2.3 固定 12 类入口，其中饼图和环图统一使用 `YonChartRuntimeV12.mountDonut(dom, config)`；`heatmap|treemap` 等明确未被固定入口覆盖的图类才走 `YonChartRuntimeV12.mountNative(dom, { chartType, option, theme })`，并且必须显式传入固定 12 类之外的 `chartType`。固定 12 类默认渲染示例图兜底，只有 `strict: true` 才保留失败态。不得因固定图表需要自定义 option 就改走原生通道，也不得直接在页面调用 `echarts.init()`、`setOption()` 或自行绑定 resize。

## 5. 输出禁令与自检

- 最终结果必须是完整 HTML，且直接输出，不再附带 Markdown 解释。
- 允许的外部依赖只有 `yondesign-agentic` 既有协议里的 `<link>` 和图表场景 `<script>`。
- 明确禁止 `<style>`、`style=`、十六进制颜色、`rgb()`、`rgba()`、`px`、`rem`、`em` 等硬编码视觉值。
- 明确禁止使用 `matplotlib`、PNG、JPG、SVG 图片附件或 `<img>` 生成图表。
- 明细区只能使用原生 `<table>`、`<thead>`、`<tbody>`、`<tr>`、`<th>`、`<td>`。
- 明确要求 `yondesign-agentic` 只使用现有结构类和模板语义，不新增视觉表现类名。
- 输出前固定自检：
  - [ ] 是否只保留了一套完整 HTML 结果
  - [ ] 是否没有 `<style>` 和 `style=`
  - [ ] 是否没有硬编码颜色和尺寸值
  - [ ] 是否没有图片图表或第二套图表表达
  - [ ] 是否没有空图表区、空明细区或其他空区块占位

## 使用建议

- 领域差异弱时，优先让上游按这个模板准备结构化载荷，再调用 `yondesign-agentic`。
- 只要最终目标是报告、问数、分析结论或右侧预览，优先固定 `template_id = domain-public-report`。
- 如果只是一次性临时生成页面，不需要沉淀到领域 skill，直接使用 `domain-hit-script-template.md` 或 `domain-invocation-simple-template.md` 会更轻。
