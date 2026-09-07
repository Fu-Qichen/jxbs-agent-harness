# Detail Template

## 适用场景

- 主体详情
- 信息页
- 资料页
- 档案页
- 报告详情的基础骨架

不适用：

- 审批单
- 申请单
- 报销单
- 付款单
- 合同流程单
- 工单类单据

## 模板 ID

- `detail-generic`

## 结构顺序

`detail-generic` 固定按以下顺序组织：

1. `header`
2. `overview`
3. `attributes`
4. `metrics`
5. `records`
6. `timeline`
7. `summary`
8. `actions`

## 概览区互斥规则

`overview` 槽位默认使用 `detail-overview` 标准子组件（`detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-facts`、`detail-fact`、`detail-stats`）。只有用户明确指定 `overview-header` 时，才允许使用 `overview-header` 组件（`overview-header`、`overview-header__title`、`overview-header__desc`、`overview-header__period`）。两者**互斥，不可同时出现**。使用 `overview-header` 时，可以与 `overview-metrics`、`metrics-grid`、`metric-card`、`metric-label`、`metric-value` 配合使用；`detail-header` 区块也必须移除。

## 内容原则

- `overview` 先给主体判断，再给事实和统计
- `attributes` 只放静态属性，不与指标混排
- `metrics` 只回答“当前表现如何”
- `records` 只放需要检索或对照的关联明细
- `summary` 只收敛结论，不重复展开字段明细

如果页面包含状态流转、参与方、审批过程、风险结论、扩展详情，应改用 `domain-document-template.md` 中的 `domain-public-document`。
