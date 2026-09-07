# Final Template Reference

## 来源

最终参考来自 `归档_样式统一.zip`，已归档到：

- `assets/final-template-reference/optimized_index.html`
- `assets/final-template-reference/designtoken.css`
- `assets/final-template-reference/normal.css`

后续若旧预览页、旧模板文档和本文件冲突，以本文件和 `optimized_index.html` 为准。

## 样式入口

当前运行时统一走 CDN，不再依赖本地样式文件：

```html
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css" />
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css" />
<script src="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/echarts.min.js"></script>
<script src="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js"></script>
```

- 本地 `designtoken.css` / `normal.css` 只保留为归档参考，不再作为运行时依赖
- 运行时样式、组件结构类、原子类统一来自 `yondesign.css`，分析类页面额外引用 `analytics.css`
- 固定 12 类图表通过 `chart_runtime_v1_2.js` 统一初始化，`echarts.min.js` 只作为底层运行依赖；非固定扩展图才直接走原生 `echarts.init()`

## 主体骨架

右侧区域最终骨架以 `detail-page detail-page-embedded > div.detail-stack` 为准：

```html
<main class="detail-page detail-page-embedded" data-template="domain-public-report">
  <div class="detail-stack">
    ...
  </div>
</main>
```

## 概览区互斥规则（重要）

`overview-header` 组件（`overview-header`、`overview-header__title`、`overview-header__desc`、`overview-header__period`）与 `detail-overview` 的标准子组件结构（`detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-overview-title-row`、`detail-overview-title`、`detail-overview-subtitle`、`detail-overview-badges`、`detail-facts`、`detail-fact`、`detail-stats`）**互斥，不可同时出现**。`overview-header` 可与 `overview-metrics` 指标区同级配合使用。

- 默认使用标准 `detail-overview` 子组件结构，包括报告、问数、分析结论、详情、单据等页面
- 只有用户明确指定 `overview-header` 时，才允许使用 `overview-header`
- 使用 `overview-header` 时，`<section class="detail-overview">` 内不得再出现 `detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-facts`、`detail-fact`、`detail-stats` 等标准子结构
- 使用 `overview-header` 时，可以在同一个 `detail-overview` 内追加 `overview-metrics > metrics-grid > metric-card`，用于展示核心指标；指标卡内部建议先写 `metric-label` 再写 `metric-value`
- **使用 `overview-header` 时，`<section class="detail-header">` 也必须移除**，因为 `overview-header__title` 和 `overview-header__period` 已覆盖标题和meta信息
- 使用标准 `detail-overview` 子组件时，不得再出现 `overview-header`、`overview-header__title`、`overview-header__desc`、`overview-header__period` 类
- 一个页面只能选择一种概览区呈现方式

## 推荐区块顺序

问数、报告、专项分析、右侧预览命中时，优先采用下面的顺序：

1. `detail-header`：标题、适用场景、更新时间
2. `detail-overview`：回答对象、摘要说明、标签、事实、统计
3. `detail-section` 核心结论：`analysis-card` + `analysis-card`
4. `detail-section` 分析口径：`detail-fields`
5. `detail-section` 关键指标：`detail-metrics`
6. `detail-section` 处理进度：`detail-progress`
7. `detail-section` 履历信息：`detail-timeline`
8. `detail-section` 关键发现：`insight-list`
9. `detail-section` 证据图表：`chart-grid` + `chart-card`
10. `detail-section` 明细与动作：`table-wrap > table.table`
11. `detail-section` 结论与建议：`detail-summary`
12. `detail-section` 特殊提示：`alert alert-warning`

如果用户只要普通详情页，可以保留 8 槽详情骨架；如果用户命中报告、问数、分析结论或右侧预览，以上最终参考顺序优先。

## 指标卡规则

最终模板中的指标卡使用 `detail-metric` 体系，不再优先使用 `card + bg-*` 组合。

| 指标语义 | 推荐类 |
| --- | --- |
| 主指标、完成率、目标达成 | `detail-metric detail-metric--blue` |
| 样本数、数量、覆盖量 | `detail-metric detail-metric--info` |
| 待关注、临界、异常关注 | `detail-metric detail-metric--warning` |
| 风险、周期、损失、逾期 | `detail-metric detail-metric--danger` |

趋势使用：

- 正向或改善：`detail-metric-trend detail-metric-trend-positive`
- 负向或风险：`detail-metric-trend detail-metric-trend-negative`
- 中性或说明：`detail-metric-trend detail-metric-trend-neutral`

## 报告文字高亮

- 当前判断卡使用 `analysis-card`
- 结论内重点词使用 `detail-summary-strong`
- 正文分析卡使用 `analysis-card`
- 正文重点数字、关键对象和高价值短语使用 `analysis-hl`

## 特殊提示区规则

最终模板中的 `special-tips` 只承载收尾提醒、口径限制和风险说明，不承载明细表或页签切换。

```html
<section class="detail-section" data-slot="special-tips">
  <div class="detail-section-head">
    <h2 class="detail-section-title">特殊提示</h2>
    <span class="detail-section-note">作为所有模块最后的规则提醒区</span>
  </div>
  <div class="alert alert-warning">
    <div class="alert-content">
      <div class="space space-between space-md">
        <div class="alert-title text-warning">重点提醒</div>
        <span class="detail-chip detail-chip-warning">需人工复核</span>
      </div>
      <div class="space space-col space-sm">
        <p class="analysis-card-text text-secondary">当前异常单据中仍有 <span class="text-warning">人工补证阶段</span> 的记录，最终金额和周期可能在复核后回落。</p>
        <p class="analysis-card-text text-secondary">因此本页结论更适合作为 <span class="text-warning">预警和跟进依据</span>，不建议直接作为最终考核口径。</p>
      </div>
    </div>
  </div>
</section>
```

## 图表规则

最终模板的图表区使用 `chart-grid` 和 `chart-card` 体系：

```html
<div class="chart-grid">
  <article class="chart-card chart-card-wide">
    <div class="chart-card-head">
      <div>
        <h3 class="chart-card-title">趋势证据</h3>
        <p class="chart-card-note">用于说明关键指标在周期内的变化方向和波动点。</p>
      </div>
    </div>
    <div id="chart-trend" class="chart-shell-wide"></div>
  </article>
</div>
```

图表运行时使用：

```html
<script src="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/echarts.min.js"></script>
<script src="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js"></script>
```

图表颜色和结构统一复用 `yondesign.css` 的现成定义。

归档文件中的 `optimized_index.html` 保留了历史尺寸写法；新生成模板时优先把唯一 `id` 直接挂在 `chart-shell*` 容器上，图表高度统一走 `yondesign.css` 默认值，禁止再输出 `style=""`。

## 生成禁令

- 不输出 `common.css`
- 不自造 `detail-*`、`analysis-*`、`chart-*`、`insight-*`、`table-*`、`tag-*` 类
- 不把样式数值写在模板层
- 不输出 `<style>` 或 `style=""`
- 不输出 React / Vue / 真实组件代码
- 不处理适配逻辑
