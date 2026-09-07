# Domain Document Template

## 目标

这是新增的“业务单据公共模板”真源。

它与 `domain-public-report` 并列，负责承接：

- 报销单
- 审批单
- 申请单
- 采购单
- 付款单
- 合同流程单
- 请假单
- 结算单
- 发票说明
- 工单类单据

本模板负责：

- 让领域先命中统一的业务单据骨架
- 让单据场景按需组合图表、进度、页签、弹窗、时间线
- 最终输出龙虾右侧区域可直接渲染的完整 HTML

示例资产：

- `assets/domain-public-document.html`：业务单据公共模板主资产
- `assets/expense-reimbursement-text-output.html`：报销单样例实例
- `assets/domain-public-detail.html`：旧命名兼容入口

## 模板 ID

- `domain-public-document`：业务单据公共模板正式 ID
- `domain-public-detail`：兼容别名，仅做过渡接受

## 与其他模板的边界

| 模板 | 适用场景 |
| --- | --- |
| `domain-public-document` | 有状态流转、参与方、明细、审批/处理过程、风险/结论、扩展详情的业务单据 |
| `domain-public-report` | 报告、问数、分析结论、经营简报、右侧预览 |
| `detail-generic` | 主体/对象静态资料、档案、信息页 |

## 固定骨架顺序

业务单据模板固定按下面顺序组织：

1. `header`
2. `overview`
3. `conclusion`
4. `scope`
5. `metrics`
6. `records`
7. `progress`
8. `timeline`
9. `charts`
10. `summary`
11. `special-tips`
12. `modal`

## 必显与按需区块

必显区块：

- `header`
- `overview`
- `scope`
- `records`
- `summary`

按需区块：

- `conclusion`：有审批结果、稽核结果、异常判断或风险结论时显示
- `metrics`：有金额、数量、比例、周期、风险数等聚合值时显示
- `progress`：有明确流程阶段时显示
- `timeline`：有审批流、处理日志、履历记录时显示
- `charts`：有趋势、构成、分布、对比分析时显示
- `special-tips`：有口径限制、人工复核结论、敏感说明时显示
- `modal`：有超长字段、展开详情、补充信息时显示

## 概览区互斥规则

`overview` 槽位默认使用 `detail-overview` 标准子组件（`detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-facts`、`detail-fact`、`detail-stats`）。只有用户明确指定 `overview-header` 时，才允许使用 `overview-header` 组件（`overview-header`、`overview-header__title`、`overview-header__desc`、`overview-header__period`）。两者**互斥，不可同时出现**。使用 `overview-header` 时，可以与 `overview-metrics`、`metrics-grid`、`metric-card`、`metric-label`、`metric-value` 配合使用；`detail-header` 区块也必须移除。

## 区块职责

| 槽位 | 职责 |
| --- | --- |
| `header` | 标题、编号摘要、申请人/发起方、更新时间 |
| `overview` | 单据类型、状态、对象、参与方、标签、事实信息、概览统计 |
| `conclusion` | 当前判断、审批结论、稽核结果、风险结果 |
| `scope` | 基础单据字段、参与方字段、口径信息 |
| `metrics` | 金额、数量、比例、风险数、周期等关键指标 |
| `records` | 主明细区，承载 1 组或多组明细 |
| `progress` | 流程阶段或处理阶段 |
| `timeline` | 审批流程、处理日志、履历信息 |
| `charts` | 统计增强区，图表只服务单据判断 |
| `summary` | 结果归纳、结算信息、动作摘要 |
| `special-tips` | 风险提醒、口径限制、人工复核说明 |
| `modal` | 展开详情、补充信息、敏感字段详情 |

## 主明细区规则

- 如果只有 1 组明细，直接输出 `table-wrap > table.table`
- 如果有 2 组及以上并列明细，启用 `tabs + tab-content + tab-panel`
- 常见页签组合：
  - 明细 / 账单 / 分摊
  - 基本信息 / 附件 / 流转记录
  - 条款 / 审批意见 / 关联单据

## 图表规则

- 业务单据最多默认放 1-2 张图
- 优先图表类型：
  - 构成类：环形图
  - 趋势类：折线图
  - 状态/耗时类：柱图或柱线组合
- 图表区继续使用 `chart-grid`、`chart-card`、`chart-shell*`
- 图表数量为 1 或末行只剩 1 张时，必须给该末卡加 `chart-card-fill` 或 `chart-card-wide` 跨满整行，禁止卡片只占左半列
- 每个图表容器必须有唯一 `id`
- 有图表时必须同时引入 `echarts.min.js` 和 `chart_runtime_v1_2.js`
- V1.2.3 mount 在容器尚未取得有效宽高时显示加载态并等待布局完成；数据或初始化失败时默认渲染同类型示例图并标注原因，禁止空白卡片
- 受支持的常见图表直接调用 V1.2.3 mount 入口；不得再手写 `echarts.init()`、`setOption()` 或自行绑定 resize
- 非固定扩展图才允许通过 `YonChartRuntimeV12.mountNative(dom, { chartType, option, theme })` 进入原生 ECharts，且 `chartType` 必须是固定 12 类之外的类型
- 图表容器禁止额外写 `style=""`

## 交互约定

允许的通用展示交互：

- 页签切换
- 弹窗打开/关闭
- 图表初始化与 resize

禁止项：

- 请求逻辑
- 异步业务状态
- 框架代码
- 真实组件实现

约定：

- tabs 使用 `data-tab` / `data-panel`
- modal 使用稳定 `id` 和触发按钮 `data-modal-trigger`
- close 元素使用 `data-modal-close`
- 图表容器命名为 `chart-{semantic}`
- 图表初始化与 resize 由 V1.2.3 mount 运行时负责；页面只在相关容器之后直接调用对应入口，不再额外包 `window.load` / `DOMContentLoaded`

## 特殊提示区规则

- `special-tips` 只放最终提醒，不承载审批记录页签或长表格
- 容器固定使用 `alert alert-warning`
- 内容容器固定使用 `alert-content`
- 头部固定使用 `space space-between space-md`
- 标题固定使用 `alert-title text-warning`
- 正文固定包一层 `space space-col space-sm`
- 正文固定使用 `analysis-card-text text-secondary`
- 正文中的局部强调只能使用 `text-warning`，不要使用 `analysis-hl`
- 审批记录放 `timeline`，稽核明细放 `records` 或 `modal`

## 敏感信息与数字规则

- 默认脱敏展示敏感字段
- 主页面与弹窗沿用同一脱敏策略
- 聚合主值优先落到 `detail-metric-value`
- 风险或异常强调优先落到 `analysis-hl` 或 `detail-summary-strong`
- 单号、流水号、发票号默认不高亮

## 完整渲染模板

```html
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css" />
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css" />
{{echarts_cdn_html}}

<main class="detail-page detail-page-embedded" data-template="domain-public-document" data-domain="{domain-name}">
  <div class="detail-stack">
    <section class="detail-header" data-slot="header">
      <h1 class="detail-title">{title}</h1>
      <p class="detail-meta">{meta}</p>
    </section>

    <section class="detail-overview" data-slot="overview">
      ...
    </section>

    {conclusionSectionHtml}

    <section class="detail-section" data-slot="scope">
      <div class="detail-section-head">
        <h2 class="detail-section-title">{scopeTitle}</h2>
        <span class="detail-section-note">{scopeNote}</span>
      </div>
      <div class="detail-fields">{scopeFieldsHtml}</div>
    </section>

    {metricsSectionHtml}

    <section class="detail-section" data-slot="records">
      <div class="detail-section-head">
        <h2 class="detail-section-title">{recordsTitle}</h2>
        <span class="detail-section-note">{recordsNote}</span>
      </div>
      {recordsBodyHtml}
    </section>

    {progressSectionHtml}
    {timelineSectionHtml}
    {chartsSectionHtml}

    <section class="detail-section" data-slot="summary">
      <div class="detail-section-head">
        <h2 class="detail-section-title">{summaryTitle}</h2>
        <span class="detail-section-note">{summaryNote}</span>
      </div>
      {summaryBodyHtml}
    </section>

    {specialTipsSectionHtml}
    {modalHtml}
  </div>
</main>
<script>
  // 允许 tabs / modal / chart 的通用展示交互，不承载业务逻辑
</script>
```

## 输出要求

- 正式模板名统一使用 `domain-public-document`
- `domain-public-detail` 只做兼容别名说明，不再作为独立模板体系
- 必须输出完整 HTML，不只给骨架
- 只使用 `yondesign.css` 中已有的公共结构类
- 不输出 `<style>`、`style=""`、临时视觉类
- 图表存在时补 ECharts CDN 和初始化脚本
- 单据交互只允许 tabs / modal / charts 这类通用展示交互
