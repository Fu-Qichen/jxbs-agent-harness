# Domain Template Usage Rules

## 0. 双区输出模型

本 skill 同时管理两个输出区域,路由优先级为 **会话区优先,右侧预览区随后**:

| 输出区域 | 产物形态 | 规范来源 |
| --- | --- | --- |
| 会话区 | Markdown 格式化文本(概览统计、分页提示、异常表格、执行建议) | `shared-output-standards/shared_format_rules.md` + `scripts/shared_formatter.py` |
| 右侧预览区 | 完整 HTML(yondesign.css 驱动的页面骨架、指标卡、图表、表格、详情结构) | 本文件第 1~7 节 + `render-output.md` |

判断规则:

- 列表查询结果、操作结果、单据信息、审核详情等 Markdown 格式化场景 → 会话区
- 报告、详情、单据、图表、dashboard 等页面级渲染场景 → 右侧预览区
- 两者都需要 → 先确定会话区格式,再确定右侧预览区 HTML 结构

---

## A. 会话区输出规则

### A.1 会话区目标

会话区负责把业务数据格式化为统一的 Markdown 文本,输出到对话区域。最终目标是:

- 所有领域技能共用同一套概览/分页/异常表格格式
- 改一处映射表,所有引用技能同步生效
- 领域技能只需调用 `render_by_schema(schema_key, data)`,一切格式配置由 schema 驱动

### A.2 会话区格式来源

- 概览/分页/异常表格格式 → `shared-output-standards/shared_format_rules.md`
- schema 驱动渲染引擎 → `scripts/shared_formatter.py`
- 用法演示 → `scripts/demo_usage.py`

### A.3 会话区强制规则

**格式规则:**
- 生成内容中的 emoji 仅允许 ⚠️(风险/异常)与 ✅(已完成/成功),不得自行发明其他 emoji(见 shared_format_rules.md 第二十节 Emoji 基础规范)
- 状态名称必须来自 schema(仅中文名称,无彩色灯 emoji),不得自行发明
- 概览统计格式固定为"共 N 张订单,当前完工比例 X.X%,其中:..."的结构
- 分页提示格式固定为"> 共N条数据,每页20条,当前第X/Y页。可回复[继续加载]或[第X+1页]查看更多"
- 异常表格数量为 0 的类别不显示
- 执行建议中的统计数据必须用 `**加粗**` 标注
- 后续操作引导以"---"分隔,以"如需进一步推进后续处理..."开头

**安全/合规规则(P0):**
- AI 建议、草稿、待确认动作、已执行结果**必须明确区分**,不得把建议表述为已执行结果
- 写入/提交/发布/付款/删除/覆盖/授权/外发/关闭流程/批量变更等高风险动作**必须经用户确认**
- 错误反馈**绝对禁止**暴露堆栈、密钥、SQL、接口参数、内部服务名;不得归咎用户
- 数据不足时**必须**输出结构化说明(不足说明 + 缺失清单 + 影响范围 + 补充动作),不得强行输出确定性结论

**业务规则(P1):**
- 业务输出必须明确口径(时间范围、币种、单位、精度、组织范围)
- 涉及查询/统计/分析/推荐时必须说明数据来源、查询时间、数据范围
- 会话区只承载摘要/结论/风险/操作建议,完整明细引导至右侧预览区

**结构规则(P1):**
- 引言必须位于会话结果第一句,句式固定为 `状态/动作 + 来源或条件 + 对象 + 结果`
- 引言禁止使用"已完成处理,信息如下"等空泛句
- 核心结论必须区分正常结论和异常结论格式
- 四种业务场景必须遵循固定骨架顺序(单据/查询/分析/方案推荐)

**格式细节规则(P2):**
- 日期格式 `YYYY-MM-DD`,时间格式 `HH:MM:SS`(24小时制),范围用全角 `~`
- 空值统一显示 `--`,真零显示 `0`
- 列表统一使用 `•`(无序)和 `1. 2. 3.`(有序),禁止使用 `123` 等序号
- Emoji 仅允许 ⚠️(风险/异常)与 ✅(已完成/成功),详见第二十节 Emoji 基础规范
- 加粗仅用于关键词/关键数字,禁止整段加粗

### A.4 会话区 schema 驱动渲染

领域技能只需调用一个函数:

```python
from shared_formatter import render_by_schema
output = render_by_schema("query_progress", data)
```

schema 定义在 `shared_formatter.py` 的 `SCHEMAS` 字典中,包含:

- `status_lights`: 状态名称映射(仅中文名称,无彩色灯 emoji)
- `intro`: 引言模板
- `sections`: 章节列表(overview / alert / table / suggestion / action)

### A.5 会话区输出前自检

**格式自检:**
- [ ] 状态名称是否来自 schema 的 `status_lights` 字段(仅中文名称,无彩色灯)?
- [ ] 概览统计是否使用了统一的"共 N 张..."格式?
- [ ] 分页提示是否使用了统一的"> 共N条数据..."格式?
- [ ] 异常表格中数量为 0 的类别是否已隐藏?
- [ ] 执行建议中的统计数据是否已 `**加粗**`?
- [ ] 后续操作引导是否以"---"分隔并以"如需进一步推进后续处理..."开头?

**安全/合规自检(P0):**
- [ ] AI 建议是否已明确标注为"建议"/"草稿",而非"已完成"?
- [ ] 高风险动作(提交/付款/删除等)是否已要求用户确认?
- [ ] 错误反馈是否已脱敏(无密钥/SQL/堆栈/内部服务名)?
- [ ] 数据不足时是否已输出结构化说明而非强行给结论?

**结构自检(P1):**
- [ ] 引言是否位于会话第一句,句式是否为"状态+来源+对象+结果"?
- [ ] 引言是否避免了"已完成处理,信息如下"等空泛句?
- [ ] 核心结论是否区分了正常/异常格式?
- [ ] 输出是否匹配了对应业务模板的固定骨架顺序(单据/查询/分析/方案)?
- [ ] 会话区是否只承载摘要/结论/风险/建议,未堆砌完整明细?
- [ ] 输出是否明确了业务口径(时间范围/单位/精度/组织范围)和数据来源?

**细节自检(P2):**
- [ ] 日期是否为 `YYYY-MM-DD`,时间是否为 `HH:MM:SS`,范围连接符是否为 `~`?
- [ ] 空值是否为 `--`,真零是否为 `0`?
- [ ] 列表符号是否统一(无序 `•` / 有序 `1. 2. 3.`)?无 `123` 等禁用序号?
- [ ] Emoji 是否有重复或替代文字的情况?
- [ ] 是否有整段加粗的违规情况?

### A.6 业务模板路由规则

会话区输出必须根据业务场景命中对应模板骨架。模板选择规则:

| 场景关键词 | 模板 | 固定区块顺序 |
|-----------|------|-------------|
| 单据/查看/详情/申请单/审批单/报销/合同/工单 | 业务单据模板 | 引言 → 业务摘要 → 业务详情 → 建议与追问 |
| 查询/列表/搜索/我的/统计/汇总 | 业务查询模板 | 引言 → 核心结论 → 业务详情 → 建议与追问(风险前置) |
| 分析/趋势/对比/诊断/评估/预测 | 分析模板 | 引言 → 核心结论 → 分析详情 → 建议与追问 |
| 推荐/方案/建议/选型/对比选择 | 方案推荐模板 | 引言 → 推荐结论 → 判断依据 → 备选方案对比 → 业务风险 → 建议与追问 |

**路由优先级**:精确匹配 > 关键词匹配 > 默认走查询模板。

---

## B. 右侧预览区输出规则

## 1. 目标

右侧预览区负责把页面生成任务收敛成"领域可命中的完整 HTML 模板"。

最终目标是:

- 让领域先命中模板结构,再输出完整 HTML 给右侧区域渲染
- 所有运行时样式与组件统一引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 必须同时引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 页面包含图表时引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/echarts.min.js`
- 页面包含固定 12 类图表时额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js`
- 需加载至少前两个样式表才能进行右侧渲染
- 本层输出完整 HTML、结构、语义、规则,但不实现真实组件

## 2. 样式与结构来源

- `detail-*`、`table-*`、`btn-*`、`tag-*`、`chart-*`、`tabs`、`modal` 等结构类必须来自 `yondesign.css`
- 图表区统一使用 `chart-grid`、`chart-card`、`chart-shell*`
- 图表网格最大为三列；桌面端每行普通卡最多 3 张，`1024px` 以下按两列换行，`640px` 以下单列；末行剩 2 张时自动均分剩余空间，末行剩 1 张时跨满整行，例如两列模式下 5 张图必须是 `2 + 2 + 1`；`charts` 为空时跳过整个图表区，禁止输出空卡片或右侧空白。
- 本层不写本地 CSS、不写 token 数值、不发明新的视觉类
- 若需要表达额外语义,优先使用 `data-template`、`data-slot`、`data-role`、`data-tone`
- 特殊提示区只允许复用现有告警结构与 utility class:`alert alert-warning`、`alert-content`、`text-warning`、`text-secondary`

## 3. 强制规则

- 不输出真实组件名,不定义组件 API,不写 props
- 不输出 `<style>`、`style=""`、页面级 CSS、局部 CSS
- 不直接写颜色值、背景值、边框值、字号值、间距值
- 不在本层处理断点、响应式、适配逻辑
- 必须输出可直接渲染的 HTML 内容,不能只输出抽象 JSON、字段表或纯规则说明
- main 标签禁止添加 `max-w-*`、`w-*` 等宽度约束类
- 页面骨架固定为 `detail-page detail-page-embedded > div.detail-stack`
- 每个一级区块都必须带 `data-slot`
- 图表容器的唯一 `id` 必须直接挂在 `chart-shell*` 上,禁止补内联高度
- 所有受支持的常见图表只调用 `YonChartRuntimeV12` 对应固定入口（竖柱、横条、堆叠柱、折线、面积、饼/环、雷达、散点、气泡、双轴、漏斗、仪表盘）；依赖缺失时抛出明确错误，不得静默返回或输出普通 option。
- 图表路由必须按单卡隔离：固定 12 类始终使用对应固定入口；只有用户明确要求的非固定图表才可进入独立兜底通道。非固定图表必须在自己的容器内通过 `YonChartRuntimeV12.mountNative(dom, { chartType, option, theme })` 完成原生 ECharts 渲染，不能因为报告中存在固定图表而输出空白。非固定图表不得修改同一报告中固定图表的入口、option、主题、色板、formatter、preprocessor、共享 `setOption()`、共享 `graphic` 或 CSS。固定图表失败时默认显示同类型示例图并标注原因，调试态 `strict: true` 才保留失败态。
- 所有展示的图例强制位于图表下方；禁止放在卡片标题右侧或图表顶部。
- V1.2.3 mount 在容器尚未取得有效宽高时显示加载态并等待布局完成；数据或初始化失败时默认渲染同类型示例图并标注原因，禁止生成无提示的整块空白图表卡。
- 受支持的常见图表在对应容器之后直接调用 V1.2.3 mount 入口；V1.2.3 运行时自行等待有效尺寸，禁止再包裹 `window.load` / `DOMContentLoaded` 或自行轮询

允许的通用展示脚本只有两类:

- 图表初始化与 resize
- tabs / modal 的通用展示交互

上述脚本只负责展示交互,不得承载:

- 请求逻辑
- 异步业务状态
- 权限逻辑
- 框架代码
- 业务计算

### 概览区互斥规则

`detail-overview` 区块内,标准子组件结构(`detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-overview-title-row`、`detail-overview-title`、`detail-overview-subtitle`、`detail-overview-badges`、`detail-facts`、`detail-fact`、`detail-stats`)与 `overview-header` 组件体系(`overview-header`、`overview-header__title`、`overview-header__desc`、`overview-header__period`)**互斥,不可同时出现**。`overview-header` 可与 `overview-metrics` 指标区同级配合使用。

- 默认使用标准 `detail-overview` 子组件结构,包括报告、问数、分析结论、详情、单据等页面
- 只有用户明确指定 `overview-header` 时,才允许使用 `overview-header`
- 使用 `overview-header` 时,`<section class="detail-overview" data-slot="overview">` 内**不得**再出现 `detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-facts`、`detail-fact`、`detail-stats` 等标准子结构
- 使用 `overview-header` 时,允许在同一个 `detail-overview` 内追加 `overview-metrics > metrics-grid > metric-card`,指标卡内部建议先写 `metric-label` 再写 `metric-value`,异常数字可使用 `metric-value is-danger`
- **使用 `overview-header` 时,`<section class="detail-header" data-slot="header">` 也必须移除**,因为 `overview-header__title` 和 `overview-header__period` 已覆盖标题和meta信息
- 使用标准 `detail-overview` 子组件时,**不得**再出现 `overview-header`、`overview-header__title`、`overview-header__desc`、`overview-header__period` 类
- 一个页面只能选择一种概览区呈现方式,不能同时用两种

### 特殊提示区输出规则

- `data-slot` 固定为 `special-tips`
- 容器必须使用 `alert alert-warning`
- 内容容器固定使用 `alert-content`
- 头部固定使用 `space space-between space-md`
- 标题固定使用 `alert-title text-warning`
- 正文内容固定包一层 `space space-col space-sm`
- 正文固定使用 `analysis-card-text text-secondary`
- 如需附加警示标识,只能复用 `detail-chip detail-chip-warning`
- 正文中的局部强调只能使用 `text-warning`,禁止使用 `analysis-hl`
- 禁止使用 `detail-fields`、`tabs`、`analysis-card bg-warning-soft` 等不稳定写法替代 `alert alert-warning`
- 审批记录、稽核明细、长表格不要塞进 `special-tips`,应放到 `records`、`timeline` 或 `modal`

## 4. 模板路由原则

- 报告、分析、问数、结论页:优先命中 `domain-public-report`
- 单据、审批单、申请单、报销、付款、采购、合同、请假、结算、发票、工单:优先命中 `domain-public-document`
- 主体详情、资料、档案、实体信息:优先命中 `detail-generic`

边界:

- `detail-generic`:主体/对象静态资料
- `domain-public-document`:有状态流转、参与方、明细、审批/处理过程、风险/结论、扩展详情的业务单据

## 5. 推荐输出形式

```html
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css" />
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css" />
{{echarts_cdn_html}}
<main class="detail-page detail-page-embedded" data-template="{template-id}">
  <div class="detail-stack">
    ...
  </div>
</main>
<script>
  // 普通图表可在此初始化；任何 ECharts 图表只调用 V1.2.3 mount 入口
</script>
```

## 6. 统一语义词表

- 文字语义:`default`、`secondary`、`positive`、`negative`、`warning`、`emphasis`
- 背景语义:`surface`、`surface-subtle`、`brand-soft`、`info-soft`、`success-soft`、`warning-soft`、`danger-soft`
- 状态语义:`stable`、`risk`、`observe`、`done`、`archived`

报告型页面优先使用:

- `analysis-card`
- `detail-metric`
- `chart-grid`

业务单据页面优先使用:

- `detail-fields`
- `detail-metrics`
- `table-wrap > table.table`
- `tabs + tab-content + tab-panel`
- `detail-progress`
- `detail-timeline`
- `modal`

## 7. 输出前自检

- [ ] 是否输出了右侧区域可直接渲染的完整 HTML?
- [ ] 是否出现了真实组件实现或框架代码?
- [ ] 是否出现了硬编码颜色、背景、边框、间距,或任何 `style=""`?
- [ ] 是否已经写清模板 ID、槽位顺序和语义规则?
- [ ] 骨架是否使用了 `detail-page detail-page-embedded > div.detail-stack`?
- [ ] 每个一级 section 是否都有 `data-slot` 属性?
- [ ] 标题区用的是 `detail-header`,而不是 `detail-head`?
- [ ] 概览区用的是 `detail-overview` + `detail-facts`,不是自造类?
- [ ] **概览区选择规则**：是否默认使用了 `detail-overview` 标准子组件？只有用户明确指定 `overview-header` 时才使用 `overview-header`；如果使用了 `overview-header`，是否已移除 `detail-overview-head`、`detail-overview-avatar`、`detail-overview-body`、`detail-facts`、`detail-fact`、`detail-stats` 等标准子结构？**是否已移除 `detail-header` 区块？** 反之亦然？
- [ ] 核心结论里的"当前判断/当前结论"是否使用了 `analysis-card`,并且和"分析发现"保持同底色同边框?
- [ ] 指标卡用的是 `detail-metric--blue/info/warning/danger`?
- [ ] 特殊提示区用的是 `alert alert-warning` + `alert-content` + `space space-between space-md`?
- [ ] 特殊提示正文是否用了 `space space-col space-sm`,且局部强调只使用 `text-warning`,没有混入 `analysis-hl`?
- [ ] 若页面包含图表,是否已补 ECharts CDN、唯一图表容器 id,且图表容器只使用 `chart-shell*` 不写内联样式?
- [ ] 所有 V1.2.3 mount 调用是否位于对应容器之后并直接执行，未额外包裹 `window.load` / `DOMContentLoaded`？
- [ ] 若页面包含 tabs / modal,是否只使用了通用展示交互脚本?
