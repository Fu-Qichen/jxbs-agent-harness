# Domain Hit Script Template

## 用途

本文件提供可直接发给业务领域的命中话术模板。

如果你要沉淀的是上游领域 skill 的规范，而不是一次性调用话术：

- 没有特殊要求时，优先使用 `domain-skill-simple-template.md`
- 需要完整字段契约时，再使用 `domain-skill-template.md`

目标是让领域在提需求时：

- 明确调用 `yondesign-agentic`
- 明确要右侧区域可直接渲染的完整 HTML
- 明确不要真实组件和适配逻辑

## 报告模板

```text
请直接调用 `yondesign-agentic` skill，按 [领域名称] 场景输出龙虾右侧区域的完整 HTML。

一级结构：
- 标题区
- 概览区
- 核心结论区
- 指标区
- 图表区
- 明细区
- 结论建议区

输出要求：
- 完整 HTML
- 引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 分析增强场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 有图表时补 ECharts CDN 和初始化脚本
- 不输出组件代码
- 不处理适配逻辑
```

## 业务单据模板

```text
请直接调用 `yondesign-agentic` skill，按 [领域名称] 的业务单据场景输出一个可直接渲染到龙虾右侧区域的完整 HTML 模板。

需求关键词：
[单据] / [审批] / [申请] / [明细] / [流程]

场景说明：
我要的是一个业务单据页，主题是 [主题名称]，用于展示 [单据对象] 的状态、参与方、基础字段、明细记录、流程阶段、时间线、结果摘要和补充详情。

输出要求：
1. 必须命中并调用 `yondesign-agentic` skill
2. 必须直接输出完整 HTML
3. 运行时样式和组件统一引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
4. 如果页面包含图表，允许并需要输出 ECharts CDN 和统一初始化脚本
5. 如果页面包含页签或弹窗，允许输出 tabs / modal 的通用展示交互脚本
6. 不要输出 React、Vue、组件库组件、业务脚本逻辑、请求逻辑
7. 不处理适配和响应式逻辑

内容要求：
- 标题区：展示 [标题内容]
- 概览区：展示 [状态 / 类型 / 参与方 / 摘要]
- 基础字段区：展示 [会计主体 / 部门 / 关联信息 / 对象信息]
- 明细区：展示 [表格或多页签明细]
- 结果摘要区：展示 [结算 / 结论 / 下一步动作]

按需补充：
- 结论区：展示 [审批结论 / 稽核结果 / 风险判断]
- 指标区：展示 [金额 / 数量 / 风险数 / 周期]
- 流程阶段区：展示 [阶段信息]
- 时间线区：展示 [审批记录 / 处理履历]
- 图表区：展示 [趋势或构成图]
- 特殊提示区：展示 [风险提醒 / 人工复核说明]
- 弹窗详情：展示 [扩展字段]
```
