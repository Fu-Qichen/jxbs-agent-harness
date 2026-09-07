# Domain Invocation Simple Template

## 用途

这是发给业务领域的最简调用模板。

## 最简模板：报告场景

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
- 必须输出完整 HTML
- 必须引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 分析增强场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 有图表时补 ECharts CDN 和初始化脚本
- 不输出组件代码
- 不处理适配逻辑
```

## 最简模板：业务单据场景

```text
请直接调用 `yondesign-agentic` skill，按 [领域名称] 的业务单据场景输出龙虾右侧区域的完整 HTML。

一级结构：
- 标题区
- 概览区
- 基础字段区
- 明细区
- 结果摘要区

按需补充：
- 结论区
- 指标区
- 流程阶段区
- 时间线区
- 图表区
- 特殊提示区
- 弹窗详情

输出要求：
- 必须输出完整 HTML
- 必须引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 单据增强或分析场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 有图表时补 ECharts CDN 和初始化脚本
- 有页签或弹窗时允许补通用展示交互脚本
- 不输出组件代码
- 不处理适配逻辑
```
