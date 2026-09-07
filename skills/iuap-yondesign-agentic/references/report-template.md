# Report Template

## 适用场景

- 报告详情
- 分析报告
- 专项报告
- 经营简报
- 问数结果
- 结论页
- 带指标摘要、证据图表和动作闭环的右侧预览页面

## 模板 ID

- `report-detail`
- `metric-cluster`
- `domain-public-report`

## 最终结构

报告模板以 `final-template-reference.md` 和 `assets/final-template-reference/optimized_index.html` 为最终参考。

报告 / 问数 / 分析结论场景使用以下顺序：

1. `header`：报告标题、周期、版本、更新时间
2. `overview`：回答对象、摘要说明、标签、核心事实、概览统计
3. `conclusion`：核心结论和分析发现
4. `scope`：统计范围、对象范围、计算规则、可信说明
5. `metrics`：关键指标
6. `progress`：处理进度
7. `timeline`：履历信息或关键节点
8. `insights`：关键发现
9. `charts`：证据图表
10. `records`：明细与动作
11. `summary`：结论与建议
12. `special-tips`：特殊提示

## 概览区互斥规则

`overview` 槽位默认使用方式 A。只有用户明确指定使用 `overview-header` 时，才允许使用方式 B。两种呈现方式互斥，**不可同时使用**。方式 B 可按需与 `overview-metrics` 指标卡片区在同一个 `detail-overview` 内配合使用：

**方式 A：标准 `detail-overview` 子组件**
```html
<section class="detail-overview" data-slot="overview">
  <div class="detail-overview-head">
    <div class="detail-overview-avatar">析</div>
    <div class="detail-overview-body">
      <div class="detail-overview-title-row">
        <span class="detail-overview-title">分析结果预览</span>
      </div>
      <p class="detail-overview-subtitle">摘要说明文字</p>
    </div>
  </div>
  <div class="detail-facts">
    <div class="detail-fact">...</div>
  </div>
</section>
```

**方式 B：`overview-header` 组件（来自 analytics.css，仅用户明确指定 `overview-header` 时使用）**

本节不是在默认报告骨架中替换 overview 区块，而是替换整个 `detail-header + detail-overview` 组合；使用本节时必须删除默认骨架中的 `detail-header`。

```html
<!-- 使用方式B时，不再需要 detail-header 区块，因为 overview-header 自身已包含标题和meta信息 -->
<section class="detail-overview" data-slot="overview">
  <div class="overview-header">
    <h1 class="overview-header__title">本月支付效率分析</h1>
    <p class="overview-header__desc">摘要说明文字，说明本次分析对象、关键结论与需要关注的异常。</p>
    <div class="overview-header__period">统计周期：2026-07-01 至 2026-07-31 ｜ 生成时间：2026-08-13 12:59:59</div>
  </div>

  <div class="overview-metrics">
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">已明确状态笔数（笔）</div>
        <div class="metric-value">1,279</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">已明确状态总耗时（min）</div>
        <div class="metric-value">912</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">已明确状态平均耗时（s/笔）</div>
        <div class="metric-value">42.6</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">支付中超时笔数（笔）</div>
        <div class="metric-value is-danger">3</div>
      </div>
    </div>
  </div>
</section>
```

**规则：**
- 默认使用方式 A，包括报告、问数、分析结论等页面；不要因为页面是报告类就主动切换到方式 B
- 只有用户明确指定 `overview-header` 时，才使用方式 B
- 使用方式 B 时，`detail-overview` 内禁止出现 `detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-facts`、`detail-fact`、`detail-stats` 等标准子结构
- 使用方式 B 时，`overview-header` 可以与 `overview-metrics`、`metrics-grid`、`metric-card`、`metric-label`、`metric-value` 配合使用，用于呈现概览标题下方的核心指标；卡片内部建议先写 `metric-label`，再写 `metric-value`
- **使用方式 B 时，`detail-header` 区块也必须移除**，因为 `overview-header__title` 和 `overview-header__period` 已覆盖标题和meta信息，两种标题区不能同时存在
- 反之亦然，使用方式 A 时不得出现 `overview-header` 组件

## 报告骨架

```html
<main class="detail-page detail-page-embedded" data-template="report-detail">
  <div class="detail-stack">
    <section class="detail-header" data-slot="header"></section>
    <section class="detail-overview" data-slot="overview"></section>
    <section class="detail-section" data-slot="conclusion"></section>
    <section class="detail-section" data-slot="scope"></section>
    <section class="detail-section" data-slot="metrics"></section>
    <section class="detail-section" data-slot="progress"></section>
    <section class="detail-section" data-slot="timeline"></section>
    <section class="detail-section" data-slot="insights"></section>
    <section class="detail-section" data-slot="charts"></section>
    <section class="detail-section" data-slot="records"></section>
    <section class="detail-section" data-slot="summary"></section>
    <section class="detail-section" data-slot="special-tips"></section>
  </div>
</main>
```

## 结论与正文高亮

报告首屏必须优先回答用户问题，而不是先堆字段。

推荐结构：

```html
<div class="analysis-card">
  <div class="analysis-card-head">
    <h3 class="analysis-card-title">当前判断</h3>
  </div>
  <p class="analysis-card-text">
    本次分析对象整体处于 <span class="detail-summary-strong">稳定可推进</span> 状态。
  </p>
</div>

<div class="analysis-card">
  <div class="analysis-card-head">
    <h3 class="analysis-card-title">分析发现</h3>
  </div>
  <p class="analysis-card-text">
    需重点关注 <span class="analysis-hl">结构差异</span> 与 <span class="analysis-hl">异常波动</span>。
  </p>
</div>
```

使用规则：

- 核心判断用 `analysis-card`，并与“分析发现”保持同底色同边框
- 结论中的重点词用 `detail-summary-strong`
- 长文解读用 `analysis-card`
- 正文关键数字、对象、短语用 `analysis-hl`
- 同一段正文不要把所有数字都高亮，只保留真正支撑结论的重点

## 指标卡规则

最终模板中的指标卡使用 `detail-metric` 体系，不再优先使用 `card + bg-*` 组合。

```html
<div class="detail-metrics">
  <div class="detail-metric detail-metric--blue">
    <span class="detail-metric-label">目标达成率</span>
    <span class="detail-metric-value">92<span class="detail-metric-unit">%</span></span>
    <div class="detail-metric-trend detail-metric-trend-positive">
      <span class="detail-metric-trend-item"><span class="detail-metric-trend-marker">↑</span>环比 +3.2pp</span>
    </div>
  </div>
</div>
```

指标色调：

| 指标语义 | 推荐类 |
| --- | --- |
| 主指标、完成率、目标达成 | `detail-metric detail-metric--blue` |
| 样本数、数量、覆盖量 | `detail-metric detail-metric--info` |
| 待关注、临界、异常关注 | `detail-metric detail-metric--warning` |
| 风险、周期、损失、逾期 | `detail-metric detail-metric--danger` |

趋势色调：

| 趋势语义 | 推荐类 |
| --- | --- |
| 正向、改善、达成、耗时下降 | `detail-metric-trend detail-metric-trend-positive` |
| 负向、风险、异常扩大、完成率下降 | `detail-metric-trend detail-metric-trend-negative` |
| 持平、说明、样本变化 | `detail-metric-trend detail-metric-trend-neutral` |

## 特殊数字规则

报告里的数字不按“字段类型”着色，而按“阅读判断意图”着色。

| 数字语义 | 推荐表达 |
| --- | --- |
| 核心主值 | 放在 `detail-metric-value`，或正文中用 `analysis-hl` |
| 正向变化 | `detail-metric-trend-positive` |
| 负向变化 | `detail-metric-trend-negative` |
| 中性说明 | `detail-metric-trend-neutral` |
| 结论重点词 | `detail-summary-strong` |

判定细则：

1. 一个数字同时具备“主值”和“趋势”时，主值放 `detail-metric-value`，趋势单独放 `detail-metric-trend-*`。
2. “耗时下降、成本下降、缺陷下降”视为改善，用 `detail-metric-trend-positive`。
3. “完成率下降、收入下降、转化下降”视为负向，用 `detail-metric-trend-negative`。
4. 纯编号、流水号、记录条数默认不高亮。
5. 正文里的关键数字优先用 `analysis-hl`，不要再额外写颜色类。

## 特殊提示区

报告类页面的 `special-tips` 固定承载最终提醒、口径限制和风险说明，不承载表格、页签或弹窗主体内容。

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
        <p class="analysis-card-text text-secondary">
          当前异常记录中仍有 <span class="text-warning">人工补证阶段</span> 的事项，最终结果可能在复核后回落。
        </p>
        <p class="analysis-card-text text-secondary">
          因此本页结论更适合作为 <span class="text-warning">预警和跟进依据</span>，不建议直接作为最终考核口径。
        </p>
      </div>
    </div>
  </div>
</section>
```

使用规则：

- 固定使用 `alert alert-warning`
- 内容容器固定使用 `alert-content`
- 头部固定使用 `space space-between space-md`
- 标题固定使用 `alert-title text-warning`
- 正文固定包一层 `space space-col space-sm`
- 正文固定使用 `analysis-card-text text-secondary`
- 正文中的局部强调只能使用 `text-warning`，不要使用 `analysis-hl`
- 禁止用 `detail-fields`、`tabs`、`analysis-card bg-warning-soft` 替代

## 图表区规则

报告页若存在趋势、对比、占比或诊断图，优先使用独立的“证据图表”区块。

```html
<section class="detail-section" data-slot="charts">
  <div class="detail-section-head">
    <h2 class="detail-section-title">证据图表</h2>
    <span class="detail-section-note">图表只服务本次结论</span>
  </div>
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
</section>
```

图表类型路由：

- 趋势分析：折线图 / 面积折线图
- 结构证据：环形图 / 饼图
- 排行证据：横向柱图
- 多维验证：雷达图
- 达成度：仪表盘
- 关联分析：散点图
- 组合证据：柱线组合
- 转化漏斗：漏斗图
- 热点分布：热力图
- 层级占比：矩形树图
- 构成趋势：堆叠柱图

运行时固定使用：

```html
<script src="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/echarts.min.js"></script>
<script src="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js"></script>
```

图表颜色和结构统一复用 `yondesign.css` 的现成定义。

固定 12 类图表优先使用 V1.2.3 一键 mount；原生 `echarts.init()` 仅保留给非固定扩展图。

初始化脚本固定写法（脚本放在相关容器之后，V1.2.3 自行等待有效尺寸）：

```html
<script>
  if (typeof echarts === "undefined") throw new Error("ECharts runtime is missing");
  if (typeof YonChartRuntimeV12 === "undefined") throw new Error("YonDesign V1.2.3 chart runtime is missing");
  YonChartRuntimeV12.mountVerticalBar(document.getElementById("chart-category"), barConfig);
  YonChartRuntimeV12.mountRadar(document.getElementById("chart-radar"), radarConfig);
</script>
```

## 明细与动作

明细和动作统一落在同一个 `table-wrap > table.table` 内，避免结论、风险、动作分散。

```html
<div class="table-wrap">
  <table class="table">
    <thead>
      <tr>
        <th>事项</th>
        <th>证据说明</th>
        <th>状态</th>
        <th>下一步动作</th>
      </tr>
    </thead>
    <tbody>{recordsRowsHtml}</tbody>
  </table>
</div>
```

状态标签使用 `tag tag-success`、`tag tag-info`、`tag tag-warning`、`tag tag-danger`。

## 使用禁令

- 不输出 `common.css`
- 不自造 `detail-*`、`analysis-*`、`chart-*`、`insight-*`、`table-*`、`tag-*` 类
- 不在模板层写颜色、背景、边框、阴影、间距数值
- 不输出 React / Vue / 真实组件代码
- 不把图表做成组件展示台，图表必须服务本次结论
