# Domain Public Template

## 目标

这是给各业务领域直接套用的统一公共报告模板。最终参考来自 `归档_样式统一.zip`,详见 `final-template-reference.md`。

本模板负责:

- 让领域先命中统一的报告骨架
- 再替换各自文案、字段、指标、结论和图表数据
- 最终直接输出完整 HTML 到龙虾右侧区域渲染

示例资产:

- `assets/domain-public-sample.html`:一份填充了完整示例内容的报告型公共模板,可直接打开预览

如果场景是审批单、申请单、报销单、采购单、付款单、合同流程单等业务单据,请改读 `domain-document-template.md`。

## 模板 ID

- `domain-public-report`:报告 / 问数 / 分析结论 / 右侧预览优先使用

## 最终结构顺序

1. `header`
2. `overview`
3. `conclusion`
4. `scope`
5. `metrics`
6. `progress`
7. `timeline`
8. `insights`
9. `charts`
10. `records`
11. `summary`
12. `special-tips`

## 关键约束

- 核心结论中的"当前判断"与"分析发现"统一使用 `analysis-card`
- 正文解读使用 `analysis-card`
- 指标卡使用 `detail-metric`
- 图表区使用 `chart-grid` / `chart-card` / `chart-shell*`
- **概览区选择规则**：默认使用 `detail-overview` 标准子组件（`detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-facts`、`detail-fact`、`detail-stats`）。只有用户明确指定 `overview-header` 时，才允许使用 `overview-header` 组件（`overview-header`、`overview-header__title`、`overview-header__desc`、`overview-header__period`）。两者**互斥，不可同时出现**。使用 `overview-header` 时，可以与 `overview-metrics`、`metrics-grid`、`metric-card`、`metric-label`、`metric-value` 配合使用；`detail-header` 区块也必须移除。
- 特殊提示区固定使用 `alert alert-warning` + `alert-content` + `space space-between space-md` + `alert-title text-warning` + `space space-col space-sm` + `analysis-card-text text-secondary`
- 特殊提示区正文局部强调只使用 `text-warning`，不要混入 `analysis-hl`
- 审批记录、稽核明细、长表格继续放在 `timeline`、`records` 或 `modal`，不要挤进 `special-tips`
- 不输出 React、Vue、真实组件代码、业务请求逻辑或适配逻辑
