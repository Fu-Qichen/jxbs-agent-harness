# Render Output Contract

## 目标

本文件定义本 skill 如何输出“右侧区域可直接渲染的完整 HTML”。

当前流程固定为：

1. 用户关键词或其他 skill 命中某个模板结构
2. 路由进入本 skill
3. 本 skill 选择对应模板
4. 本 skill 产出完整 HTML
5. 产出的 HTML 渲染到龙虾右侧区域

## 输出协议

本 skill 的输出不是组件定义，不是 JSON，不是字段表，而是：

- 样式引用
- 图表运行时引用（仅图表场景）
- 通用展示交互脚本（仅 tabs / modal / charts 场景）
- 内容 HTML
- 已经命中的结构区块

## 标准输出形态

```html
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css" />
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css" />
{{echarts_cdn_html}}
{{chart_runtime_cdn_html}}
<main class="detail-page detail-page-embedded">
  <!-- 可直接渲染的完整内容 -->
</main>
<script>
  // 如果页面包含图表或单据交互，统一在这里初始化
</script>
```

## 强制要求

- 必须输出完整 HTML，不能只输出结构说明
- 必须引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 分析增强场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 必须把内容直接组织成页面区块
- 必须让右侧区域拿到后能直接渲染出完整效果
- 页面包含图表时，固定 12 类必须先引用 `chart_runtime_v1_2.js` 并输出统一初始化脚本
- 所有受支持的常见图表只能调用 `YonChartRuntimeV12` 对应固定入口；稳定运行时缺失时明确失败，禁止静默降级
- 固定 12 类与非固定图类必须逐卡路由：固定 12 类（竖柱、横条、堆叠柱/条、折线、面积、饼/环、雷达、散点、气泡、双轴、漏斗、仪表盘）只能调用对应固定入口；非固定图才可使用独立兜底通道，并在自己的容器内完成原生 ECharts `init`、`setOption` 和 resize。兜底不得改变同一报告中固定图表的主题、色板、option、全局 ECharts 注册项或 CSS；固定图表失败默认显示同类型示例图并标注原因，调试态 `strict: true` 才保留失败态；报告中两类图表可以同时存在，不能按整份报告二选一。
- 页面包含 tabs / modal 时，允许输出通用展示交互脚本
- 禁止输出需要二次解释才能落地的中间结构
- 所有组件结构类、原子类和视觉都必须来自 `yondesign.css`
- main 标签禁止添加 `max-w-*`、`w-*` 等宽度约束类
- **概览区选择规则**：默认使用 `detail-overview` 标准子组件（`detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-facts`、`detail-fact`、`detail-stats`）。只有用户明确指定 `overview-header` 时，才允许使用 `overview-header`。两者不可同时出现；使用 `overview-header` 时，`detail-header` 区块也必须移除。`overview-header` 可与 `overview-metrics > metrics-grid > metric-card` 指标区在同一个 `detail-overview` 内配合使用。
- **硬失败条件**：输出 HTML 中只要出现 `overview-header`，就绝对不能出现 `detail-header`。如果两者同时出现，必须删除完整 `detail-header` 区块后再输出；不得把该组合交付为最终答案。
- **表格数值列规则**：右侧预览区 HTML 中，数量、金额、比例、单价、余额、税额、汇率、耗时、笔数、件数、人数、天数等数值列，`th` 和 `td` 必须使用现有原子类 `text-right text-nowrap`，例如 `<td class="text-right text-nowrap">12,345.67</td>`。`text-right` 负责右对齐，`text-nowrap` 负责不折行；只有明确需要省略号时，才叠加 `truncate`。禁止使用 `style=""` 手写 `text-align` / `white-space`，禁止自造 `table-cell-number`、`amount-cell`、`number-cell` 等新 class。文本列、状态列、说明列仍使用默认左对齐。

## 模板选择规则

| 命中来源 | 应输出模板 |
| --- | --- |
| 公共模板、领域模板、统一模板、问数右侧预览 | `domain-public-report` |
| 单据、审批单、申请单、报销、付款、采购、合同、请假、结算、发票、工单 | `domain-public-document` |
| echarts、趋势图、柱图、图表卡、dashboard | `domain-echarts-cluster` |
| 详情页、资料页、主体页 | `detail-generic` |
| 报告、分析结论、经营简报 | `report-detail` |
| 指标摘要、KPI 区、指标卡 | `metric-cluster` |

## 内容填充规则

- 上游给了明确标题，就填入标题区
- 上游给了明确状态，就映射到状态标签和数字语义
- 上游给了指标，就按主指标卡 + 普通指标卡填充
- 上游给了趋势、对比、分布、占比诉求，报告 / 问数右侧预览优先放到“证据图表”区块
- 上游给了记录，就落到 `table-wrap > table`
- 上游给了多组并列明细，就落到 `tabs + tab-content + tab-panel`
- 上游给了流程阶段，就落到 `detail-progress`
- 上游给了审批流或处理日志，就落到 `detail-timeline`
- 上游给了结论，就落到 `summary`

## 图表输出规则

- 图表卡统一使用 `chart-grid`、`chart-card`、`chart-card-head`、`chart-card-title`、`chart-card-note`
- 图表卡标题结构必须保持 V1.2.3 写法：`chart-card-head` 内只放一个标题内容容器，`chart-card-title` 与 `chart-card-note` 必须在该容器内上下排列、左对齐；禁止把 `chart-card-note` 作为 `chart-card-head` 的第二个直接子元素，也禁止将副标题放到卡片右上角或图表绘图区内。
- 图表主体统一使用 `chart-shell`、`chart-shell-wide`、`chart-shell-square`
- 每个图表容器必须有唯一 `id`，命名为 `chart-{语义}`
- 非固定扩展图的 `echarts.init()` 和 `setOption()` 统一写在页面末尾一个 `<script>` 块里，并统一补 `resize` 监听
- 所有受支持的常见图表是例外：只调用 V1.2.3 一键 mount 入口，不得另写初始化、`setOption()` 或 resize

## 不允许的输出

- 只返回 `data-slot` 骨架
- 只返回模板 ID
- 只返回颜色规则表
- 只返回结构说明文字
- 只返回组件名或 props
- 返回图表容器但没有 ECharts 初始化脚本
- 图表区使用 `page-grid` / `page-grid-item` 代替 `chart-grid` / `chart-card`
- tabs / modal 交互混入业务请求逻辑

## 推荐做法

- 优先输出接近 `assets/final-template-reference/optimized_index.html` 的完整效果
- 公共模板优先复用 `yondesign.css` 中的 `detail-*`、`table-*`、`btn-*` 这类现成结构类
- 业务单据模板优先复用 `detail-fields`、`detail-progress`、`detail-timeline`、`tabs`、`modal`
- 图表区优先复用 `chart-grid` + `chart-card` + `chart-shell*` 统一结构
- 图表网格最大为三列：桌面端普通卡每行最多 3 张，`1024px` 以下按两列换行，`640px` 以下单列；末行剩 2 张时两张均分剩余空间，末行剩 1 张时跨满整行，例如两列模式下 5 张图必须是 `2 + 2 + 1`，禁止留下右侧大片空白。
- 运行时尚未取得有效容器尺寸时显示加载态并等待布局完成；数据或初始化失败时默认在图表容器内显示同类型示例图并标注原因，禁止输出“有卡片但无图且无提示”的空白状态。
