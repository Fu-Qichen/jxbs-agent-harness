# ECharts Template

## 适用场景

- 趋势图
- 柱状图
- 条形图
- 饼图 / 环形图
- 仪表盘
- 分析 dashboard
- 指标摘要区带图表

## 模板 ID

- `domain-echarts-cluster`

## 结构原则

- 普通详情图表可挂在 `metrics` 区块内部；报告 / 问数右侧预览优先使用独立的“证据图表”区块
- 图表统一落在图表卡片里，不直接裸放容器
- 图表卡统一复用 `yondesign.css` 中的 `chart-grid`、`chart-card`、`chart-card-head`、`chart-card-title`、`chart-card-note`
- 图表主体统一复用 `yondesign.css` 中的 `chart-shell`、`chart-shell-wide`、`chart-shell-square`
- 多图表场景统一复用 `yondesign.css` 中的 `chart-grid`
- 单张图、末行仅剩 1 张图使用 `chart-card chart-card-fill` 占满整行；宽图使用 `chart-card chart-card-wide`
- 三列布局下，普通卡默认每行 3 张；末行剩 2 张时两张各占半行，末行剩 1 张时占满整行，不能留下右侧空白。
- 图表卡已经生成但运行时暂时没有有效尺寸时显示加载态；公共运行时缺失时明确失败；数据契约或初始化失败时默认在原图表容器中显示同类型示例图并标注原因，不能留下无提示的空白卡片。
- 图表卡的边框、背景、间距、圆角等视觉统一复用 `yondesign.css`
- 图表容器的唯一 `id` 必须直接挂在 `chart-shell*` 上，禁止额外写 `style=""`

## 推荐结构

```html
<div class="chart-grid" data-template="domain-echarts-cluster">
  <article class="chart-card chart-card-wide">
    <div class="chart-card-head">
      <div>
        <h3 class="chart-card-title">趋势证据</h3>
        <p class="chart-card-note">用于说明关键指标在周期内的变化方向和波动点。</p>
      </div>
    </div>
    <div id="chart-trend" class="chart-shell-wide"></div>
  </article>

  <article class="chart-card">
    <div class="chart-card-head">
      <div>
        <h3 class="chart-card-title">结构证据</h3>
        <p class="chart-card-note">用于说明不同分类、来源或对象的占比关系。</p>
      </div>
    </div>
    <div id="chart-structure" class="chart-shell-square"></div>
  </article>
</div>
```

## 图表类型映射

| 诉求                 | 优先图表        |
| -------------------- | --------------- |
| 趋势、波动、时间序列 | 折线图          |
| 分类对比、达成对比   | 柱状图 / 条形图 |
| 占比、构成           | 饼图 / 环形图   |
| 单状态、目标完成度   | 仪表盘          |
| 多指标联动看板       | 图表卡矩阵      |

**CSS 变量读取（普通图表必须）**：普通图表的 `<script>` 块开头必须先读取 CSS 变量，构建统一的 `C` 对象，再在所有原生 option 的 `setOption` 内容中引用 `C.*`，**禁止在 `setOption` 里硬编码任何十六进制色值或 rgb 字符串**。固定 12 类只传业务数据给 V1.2.3 mount 入口；只有固定入口无法表达的扩展图表才传入明确的 `option`，并声明固定 12 类之外的 `chartType`，其生命周期仍由 `mountNative` 统一处理。固定类型不得为了传递自定义 option 而改用原生通道：

```js
 var style = getComputedStyle(document.documentElement);
  function tok(name) { return style.getPropertyValue(name).trim(); }

  var C = {
    blue:   tok('--adc-chart-blue')   || '#4f8df7',
    cyan:   tok('--adc-chart-cyan')   || '#3db9d3',
    green:  tok('--adc-chart-green')  || '#5cc66a',
    yellow: tok('--adc-chart-yellow') || '#f6c85f',
    orange: tok('--adc-chart-orange') || '#f59e55',
    purple: tok('--adc-chart-purple') || '#8b7cf6',
    success: tok('--adc-success') || '#16a34a',
    warning: tok('--adc-warning') || '#f59e0b',
    danger:  tok('--adc-danger')  || '#dc2626',
    textPrimary:  tok('--adc-text-primary')  || '#111827',
    textTertiary: tok('--adc-text-tertiary') || '#64748b',
    textMuted:    tok('--adc-text-muted')    || '#94a3b8',
    border:       tok('--adc-border-subtle') || 'rgba(15,23,42,0.07)',
    bgCard:       tok('--adc-bg-card')       || '#ffffff',
    font:         tok('--adc-font-family')   || '-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif',
  };

  var SERIES_COLORS = [C.blue, C.cyan, C.green, C.yellow, C.orange, C.purple];
```

颜色必须按数据中系列的声明顺序显式分配，禁止依赖 ECharts 自动色板。单系列固定使用 `C.blue`；只有输入数据或用户指令明确提供成功、预警、异常等语义、判定规则和颜色映射时才允许改用语义色，禁止根据系列或类别名称猜测颜色。

### 固定入口数据契约

- 固定 12 类优先生成运行时规范字段，不把完整 ECharts option 形状传给固定入口。
- 环图/饼图、漏斗图：使用 `data: [{ name, value }]` 顶层数组，禁止只输出 `series: [{ data }]`。V1.2.3 会兼容旧字段，但生成新页面必须使用规范字段。
- 雷达图：使用 `indicators` + `series[].values`，不要用 `indicator` + `series[].data`。
- 横向条形图：使用 `rows: [{ name, value, countText, ratioText }]`，不要用 `categories + series[0].data`。
- 笛卡尔图：使用 `categories` + `series[].data`；散点/气泡使用 `series[].data` 点位；仪表盘使用顶层 `value/min/max`。

## V1 图表问题修复规则

### 多图表排布

- 报告图表网格最大为桌面端三列，`1024px` 以下两列，`640px` 以下一列。
- 桌面端 1 张图占满整行；2 张图各占半行；3 张图三列均分；4 张图前三张三列均分、最后一张占满整行；5 张图前三张三列均分、末行两张各占半行；6 张图排成 `3 × 2`。两列模式下按 2 列换行，奇数最后一张必须占满整行，例如 5 张图为 `2 + 2 + 1`。更多图表按当前列数排列，末行按剩余数量自动均分或占满。
- 宽图和气泡矩阵始终使用 `chart-card-wide`。此规则只适用于 `chart-grid`，不得改动通用 `page-grid`。

### 横向条形图

V1.2.3 横向条形图必须调用 `YonChartRuntimeV12.mountHorizontalBar(dom, config)`。运行时按最长维度名称预留文字安全区，文字区与数值轴之间使用 `yondesign.css` 的 `--space-2`；维度名称与“指标值 · 占比”在对应条形上方保持同一行，文字与条形之间使用 `--space-4`。空间足够时指标组右对齐条形末端，空间不足时紧跟维度名称右侧左对齐。不得截断、重叠、串到相邻类别，且超过 6 项锁定 6 项窗口，滚动后按当前可见条形重算标签。

以下代码仅保留为历史规则说明，不作为生成入口：

```js
var barRows = [
  { name: '类别名称', value: 10, countText: '10条', ratioText: '20%' }
];
var visibleRows = 6;
function alignBarLabelsToPlotLeft(chartInstance) {
  return function (params) {
    var grid = chartInstance.getModel().getComponent('grid', 0);
    return {
      x: grid.coordinateSystem.getRect().x,
      y: params.rect.y - 6,
      align: 'left',
      verticalAlign: 'bottom'
    };
  };
}
var barOption = {
  color: SERIES_COLORS,
  grid: { left: 12, right: 12, top: 8, bottom: barRows.length > visibleRows ? 28 : 8, containLabel: true },
  xAxis: { type: 'value', axisLabel: { color: C.textTertiary }, splitLine: { lineStyle: { color: C.border } } },
  yAxis: { type: 'category', inverse: true, data: barRows.map(function (d) { return d.name; }), axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
  dataZoom: barRows.length > visibleRows ? [
    { type: 'inside', yAxisIndex: 0, startValue: 0, endValue: visibleRows - 1, zoomLock: true, minValueSpan: visibleRows - 1, maxValueSpan: visibleRows - 1 },
    { type: 'slider', yAxisIndex: 0, right: 0, width: 8, startValue: 0, endValue: visibleRows - 1, zoomLock: true, minValueSpan: visibleRows - 1, maxValueSpan: visibleRows - 1 }
  ] : [],
  tooltip: { trigger: 'axis', confine: true },
  series: [{
    type: 'bar', barWidth: 12, barCategoryGap: '62%', itemStyle: { color: C.blue, borderRadius: [0, 4, 4, 0] },
    data: barRows.map(function (d) { return { value: d.value, source: d }; }),
    label: {
      show: true, position: 'top', align: 'left', verticalAlign: 'bottom', color: C.textPrimary,
      width: '95%', overflow: 'break', lineHeight: 18,
      formatter: function (p) {
        var d = p.data.source;
        var detail = [d.countText, d.ratioText].filter(Boolean).join(' · ');
        return d.name + (detail ? '    ' + detail : '');
      }
    },
    labelLayout: alignBarLabelsToPlotLeft(barChart)
  }]
};
```

- `barChart` 指当前横向条形图的 ECharts 实例。标签 x 坐标固定在文字安全区；标签 y 坐标必须跟随当前可见条形，不能根据原始 `dataIndex` 重新换算。这样滚动 `dataZoom` 后标签仍跟随当前柱子。标签底边对齐，即使名称换行也只能向上扩展。
- 单行标签的类别行高不得低于 `48px`；名称换行时按每增加一行再增加 `18px`。图表容器高度按“可见类别数 × 行高＋上下留白”计算，不得把超过 6 项的数据挤进固定高度。
- 输入同时提供指标明细和占比时，标签默认必须全部显示，例如“24项 · 72%”；缺哪个才省略哪个，禁止反推、编造或为了简洁主动隐藏已有字段。
- 单系列不显示图例；多系列图例只承载系列名，类别名不得进入图例。
- 多系列在每个类别下并排或分行显示条形，tooltip 必须包含完整类别名、系列名、原始数值和单位。
- 1～6 项全部显示；超过 6 项使用锁定窗口的纵向 `dataZoom`，任何拖动位置都只显示 6 项，并且当前窗口中每一项的类别名、已有指标明细和占比都必须完整显示。`zoomLock`、`minValueSpan`、`maxValueSpan` 必须共同锁定窗口大小，只允许上下浏览，不允许拉伸为全量显示。

#### 自然语言语义分级条形图（No.9）

- 用户可以用日常业务语言说明“什么情况属于哪一档”，不要求使用“闭区间”“优先级”“未命中处理”等专业词，也不要求写 `<`、`≤` 等符号。系统先把“20%以上”“不到10%”“亏损的一律算C”“其他算B”等说法整理为明确的可执行规则，再生成图表。
- 语义分级只改变条形颜色并增加规则说明，不是新的布局变体。仍必须完整继承本节横向条形图规则：类别名称和已有指标明细在上、条形在下，文字从 grid 左边界开始，`barWidth: 12`、`barCategoryGap: '62%'`，超过6项锁定6项窗口；禁止回退为左侧类别名、右侧横条。
- 如果用户的自然语言已经覆盖边界、冲突和其余情况，直接执行，不要为了补成技术规格而追问。例如“亏损的一律算C”足以表达覆盖优先关系，“其他算B”足以表达未命中处理。只有“20%左右”、规则互相冲突但没有“一律/优先/其他”等线索、或确有数据区间无人归类时，才做一次最小化澄清。
- 内部归一化后的规则按覆盖关系和用户语序执行，第一条命中即停止；图下语义图例使用自然语言说明各档含义。tooltip 必须显示完整类别、条形指标、参与分级的原始字段、最终语义和命中规则。
- 用户明确指定颜色时照其映射；只说“用语义色”且已明确正向、关注、异常含义时，可映射 `C.success`、`C.warning`、`C.danger`。若只有 A/B/C 名称而没有含义或颜色，不得仅凭名称猜测。

### 雷达图

V1.2.3 强制入口：雷达图不得现场拼装普通 option，必须加载 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js`，只调用 `YonChartRuntimeV12.mountRadar(dom, config)` 一键入口。公共运行时缺失时明确失败，不得退回默认雷达图。只有无法匹配固定 12 类的特殊图表，才允许调用 `YonChartRuntimeV12.mountNative(dom, { chartType, option, theme })`，且必须显式填写固定 12 类之外的 `chartType`。

- 系列按声明顺序显式使用 `SERIES_COLORS`。无论系列数和维度数，每个数据点都必须在雷达图形内部、靠近对应点位展示真实值。
- 系列轮廓线默认 `1.5px`，雷达网格与轴线默认 `1px`；保持轻薄精致，不使用粗轮廓覆盖点位和数值标签。
- 多系列数值不得原位重叠。使用 `graphic` 或等效的自定义标签层，按每个维度的真实值分别排序：该维度数值最大的外圈点，标签沿径向放在点位外侧约 `12～14px`；数值最小的里圈点，标签沿径向放在点位内侧约 `12～14px`；三个及以上系列的中间值贴近点位。所有系列再按排序名次沿切线方向分配约 `8～12px` 的独立标签通道，而不是只在数值完全相同时才错开。排序必须按当前维度独立计算，不能固定某个系列永远在外或在内。
- 初始通道分配后必须对全部数值标签做矩形碰撞检测；只对发生冲突的标签沿该维度切线方向按约 `6px` 步进二次避让，直到标签矩形至少保留 `2px` 间距。二次避让不得改变最大值点外、最小值点内、中间值贴点的径向关系；若仍冲突，增加图表高度或改用其他图表，不得隐藏真实值。
- 数值文字使用对应系列颜色，直接显示纯文字，不添加白色或其他底色，不设置标签内边距、边框和圆角；图例说明颜色含义。双系列数值完全相同时分别沿切线两侧错开约 `8px`，三个及以上同值使用相邻间距约 `12～14px` 的稳定通道。
- 雷达主体不得缩成卡片中央的小图。2 系列×6 维的图表高度建议不低于 `460px`、默认半径约短边 `70%`；3 系列或 7～8 维建议不低于 `500px`、默认约 `64%`；窄屏约 `62%`。同时给维度名称和底部图例预留空间。维度名过长时使用语义完整的短名或主动换行，不能靠继续缩小半径腾空间。
- 网格、轴线和分区底色保持低对比；多系列填充透明度建议 `0.03～0.06`。除系列色外，再用实线/虚线、圆点/空心点/菱形等非颜色编码辅助区分，避免重叠区域混成一片。
- 自定义数值标签必须封装为可重复执行的布局函数；图表首次渲染、数据变化和 `resize()` 后都要按最新中心点、半径和画布尺寸重新计算，禁止复用旧坐标。
- 手工计算标签角度时必须与 ECharts `radar.startAngle` 和指标排列方向一致；默认从顶部开始按逆时针映射后续维度。真实维度名和数值必须做轴向对应检查，禁止只按标签数量判断通过。
- 维度名称只显示维度名，不承载整组系列值。雷达图有 2 个以上系列或超过 6 个维度时默认使用 `chart-card-wide`，必要时增加容器高度；不能通过隐藏指标值解决。若在目标宽度下仍不可读，应改用分组条形或小多图，而不是继续堆叠装饰。
- tooltip 固定 `trigger: 'item'`、`confine: true`，文本限制最大宽度并换行；图例固定放在底部独立空间，中心点和半径据此调整。
- 不根据“实际值”“建议值”等名称改变颜色，不内置领域评分规则。

### 气泡图

- 只有第三个数值字段会实质改变判断时才使用气泡图；否则使用普通散点图。x、y、气泡大小必须来自相同统计周期、对象粒度和筛选范围，并在副标题或 tooltip 中写明字段、单位、样本量或分母。
- 气泡矩阵使用 `chart-card-wide`。气泡直径采用平方根缩放并限制在 `12～48px`；全部大小值相同时统一为 `24px`。气泡使用约 `0.55～0.7` 的透明度及 `1.5～2px` 卡片底色描边，重叠时仍能分辨边界。
- 默认最多选择 5 个对象作为静态标签候选；输入提供明确的 `labelPriority` 时按其降序稳定选择，否则按气泡大小降序稳定选择，精确截取前 5 个，不能用阈值让并列项突破上限。少于 5 点时全部作为候选，再由 `labelLayout: { hideOverlap: true }` 隐藏实际冲突项。其余对象不显示静态文字，但 hover 必须展示完整字段。
- 静态标签默认放在气泡上方、与气泡保持约 `6px` 距离，使用深色纯文字，不把灰字压在半透明气泡内部。标签名称超过 8 个中文字符时可显示前 7 个字符加省略号；这只影响静态标签，hover 必须显示完整名称、x/y/大小字段、单位、分组和样本上下文。优先保留较大气泡和不冲突的标签。
- 坐标轴必须显示业务字段和单位，网格线保持低对比；数值范围按真实数据加合理留白，不为了铺满画布伪造阈值或扭曲点位。只有存在真实、可解释的分类字段时才使用分类色和图例；单系列不生成装饰性图例。
- x、y 或大小字段为 `null`、空字符串或非数值的对象不得绘制，也不得当作 `0`；应在数据准备阶段剔除并保留缺失说明。真实 `0` 值仍参与缩放并显示为最小气泡。
- 不内置 IE 矩阵分区线、业务阈值或业务颜色。

### 折线图

- 单系列的 `lineStyle.color`、`itemStyle.color`、点位和面积色必须全部使用 `C.blue`，不得依赖自动色板。

## 运行时规则

- 所有展示的图例强制放在图表下方，禁止放在卡片标题右侧或图表顶部；单系列无必要时可隐藏。

- 图表页必须在 CSS 之后补运行时 CDN：

```html
<script src="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/echarts.min.js"></script>
<script src="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js"></script>
```

- 每个图表容器必须有唯一 `id`，命名规则 `chart-{语义}`
- 竖向柱图必须使用 `YonChartRuntimeV12.mountVerticalBar(dom, config)`，禁止手写图例和 grid 底部间距；公共函数会为 x 轴标签和图例分配互不重叠的独立区域，并在 resize 后重算
- 页面脚本统一放在底部一个 `<script>` 块内；固定 12 类必须先调用 V1.2.3 固定入口，确认无法匹配或确需特殊能力时才调用 `mountNative`，并显式填写固定 12 类之外的 `chartType`，不得直接绕过公共运行时
- 原生 `echarts.init()` 只允许用于固定 12 类之外的扩展图表，并且必须放在自己的兜底通道里
- 页面只准备固定入口数据或原生 option；V1.2.3 mount 图表的 `init`、`setOption`、resize 和 dispose 均由运行时负责，页面不得重复监听
- 禁止把业务请求逻辑、筛选逻辑、状态管理塞进图表初始化脚本

## 边界

- 不定义复杂交互逻辑
- 不定义业务数据来源
- 不定义图表事件系统
- 只定义右侧区域完整效果所需的容器结构和初始化骨架
- 反馈 No.9 已支持“用户显式提供分级规则与语义”的专用条形图变体；这不授权模型内置任何领域状态、阈值、颜色含义或数据结构，也不改变普通横向条形图的默认上下布局。
