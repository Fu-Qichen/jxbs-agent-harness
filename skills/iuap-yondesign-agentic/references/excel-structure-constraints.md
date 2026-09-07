# 模板结构映射约束（Excel 补充约束）

> 来源：`yon-design-agentic-模板结构映射.xlsx`（报告类模板 Sheet + 单据类模板 Sheet）
> 所有约束均为有效约束（无红字/黄字/删除线标记）

---

## 一、报告类模板约束

### 1.1 模板结构映射

| 区块（一级） | 结构元素（二级） | CSS Class | 说明 / 约束 |
|-------------|----------------|-----------|------------|
| 标题区 | 🟢 [标题] | `detail-header > h1.detail-title` | 标题文字 |
| 标题区 | 🟢 [时间] | `detail-header > p.detail-meta` | 时间、周期、版本等辅助信息，必须使用 `<p>` 标签 |
| 概览区 | 🟢 [对象]/[状态]/[摘要] | `detail-overview` | 概览容器，必须使用 `detail-overview` |
| 概览区 | 头部容器 | `detail-overview-head` | — |
| 概览区 | 左侧对象标识 | `detail-overview-avatar` | 纯文字，不要套 `detail-chip` |
| 概览区 | 右侧正文容器 | `detail-overview-body` | — |
| 概览区 | 🟢 标题行 | `detail-overview-title-row > detail-overview-title` | 对象名称与状态 |
| 概览区 | 状态标签 | `detail-chip` | 放在标题行旁 |
| 概览区 | 🟢 摘要说明 | `detail-overview-subtitle` | `<p>` 标签 |
| 概览区 | 标签组 | `detail-overview-badges` | `<span class="tag tag-*">` |
| 概览区 | 事实字段 | `detail-facts` | `detail-fact` 子项 |
| 概览区 | 统计摘要 | `detail-stats` | `detail-summary-strong` + `detail-metric-trend-*` |
| 核心结论区 | 🟢 [一句结论] | `analysis-card`（第一张） | 当前判断 |
| 核心结论区 | 🟢 [补充解读] | `analysis-card`（第二张） | 分析发现，两张卡片同底色同边框 |
| 核心结论区 | 🟢 结论标题 | `analysis-card-title` | `h3` |
| 核心结论区 | 🟢 结论正文 | `analysis-card-text` | 关键词用 `detail-summary-strong` / `analysis-hl` |
| 指标区 | 🟢 [指标1][指标2][指标3] | `detail-metrics` | 指标组容器 |
| 指标区 | 指标卡 | `detail-metric` | 单个指标 |
| 指标区 | 指标语义色 | `detail-metric--blue / info / warning / danger` | `blue`=主指标, `info`=数量, `warning`=关注, `danger`=风险 |
| 指标区 | 趋势说明 | `detail-metric-trend` | `positive / negative / neutral` |
| 指标区 | 🟢 趋势标记 | `detail-metric-trend-marker` | ↑ → ↓ |
| 图表区 | 🟢 [图表1][图表2] | `chart-grid` | 图表网格容器 |
| 图表区 | 图表卡片 | `chart-card / chart-card-wide` | — |
| 图表区 | 图表容器 | `chart-shell-wide / chart-shell-square` | 唯一 id 必须挂在 `chart-shell*` 上，禁止写内联高度 |
| 图表区 | 🟢 图表标题 | `chart-card-title` | — |
| 图表区 | 🟢 图表备注 | `chart-card-note` | — |
| 明细区 | 🟢 [表格内容] | `table-wrap > table.table` | 明细表 |
| 明细区 | 🟢 状态标签 | `tag tag-*` | `tag-success / tag-info / tag-warning / tag-danger` |
| 结论建议区 | 🟢 [最终建议] | `detail-summary` | 总结容器 |
| 结论建议区 | 🟢 总结标题 | `detail-summary-label` | `h3` |
| 结论建议区 | 🟢 总结正文 | `detail-summary-text` | 关键词用 `detail-summary-strong` |
| 特殊提示区 | 🟢 [提示1][提示2] | `alert alert-warning` | 提示容器 |
| 特殊提示区 | 内容容器 | `alert-content` | — |
| 特殊提示区 | 头部 | `space space-between space-md` | 标题 + 警示标签 |
| 特殊提示区 | 🟢 提示标题 | `alert-title text-warning` | — |
| 特殊提示区 | 正文区域 | `space space-col space-sm` | — |
| 特殊提示区 | 🟢 正文 | `analysis-card-text text-secondary` | 局部强调只使用 `text-warning`，不使用 `analysis-hl` |
| 特殊提示区 | 警示标识 | `detail-chip detail-chip-warning` | 可选 |

### 1.2 报告类强结构约束

1. **overview 必须使用 `detail-overview`**
2. **overview 头部必须是 `detail-overview-head > detail-overview-avatar + detail-overview-body`**
3. **`detail-overview-body` 内必须包含：**
   - 标题行：`detail-overview-title-row > detail-overview-title`
   - 副标题：`detail-overview-subtitle`
   - 标签组：`detail-overview-badges`
   - 事实字段：`detail-facts`
   - 统计摘要：`detail-stats`
4. **avatar 内容必须是纯文字，不要套 `detail-chip`**
5. **overview 底部必须补：事实字段区(`detail-facts`) + 统计摘要区(`detail-stats`)**
6. **标题区的 `detail-meta` 必须使用 `<p>` 标签**
7. **不要把 overview 自己改写成自由排版的卡片容器**
8. **不使用 scope / progress / timeline / insights / special-tips 一次性全部补齐，只有上游明确给了内容再加**
9. **调用约束：请调用 yon-design-agentic，按 [领域名称] 场景输出龙虾右侧区域完整 HTML。**

### 1.3 报告类输出要求

- 输出完整 HTML
- 引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 分析增强场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 有图表时补 ECharts CDN 和初始化脚本
- **不输出组件代码**
- **不处理适配逻辑**

---

## 二、单据类模板约束

### 2.1 模板 ID 与路由

| 字段 | 值 |
|------|-----|
| 模板 ID | `domain-public-document` |
| `data-template` | `data-template="domain-public-document"` |
| 需求关键词 | `[单据] [审批] [申请] [报销说明] [明细] [结算] [流程]` |
| 命中规则 | 命中这些关键词时优先使用此模板 |

### 2.2 结构元素映射

| 区块（一级） | 结构元素（二级） | CSS Class | 说明 / 约束 |
|-------------|----------------|-----------|------------|
| 标题区 | 🟢 [标题内容/提单人/金额摘要/单据编号] | `detail-header > h1.detail-title` | 标题文字 |
| 标题区 | 🟢 [辅助信息] | `detail-header > p.detail-meta` | 编号、申请人、更新时间等，必须使用 `<p>` 标签 |
| 概览区 | [单据类型/状态/对象/参与方] | `detail-overview` | 概览容器 |
| 概览区 | 头部容器 | `detail-overview-head` | — |
| 概览区 | 左侧对象标识 | `detail-overview-avatar` | 纯文字标识，不要套 `detail-chip` |
| 概览区 | 右侧正文容器 | `detail-overview-body` | — |
| 概览区 | 🟢 标题行 | `detail-overview-title-row > detail-overview-title` | 单据名称 |
| 概览区 | 状态标签 | `detail-chip / detail-chip-warning / detail-chip-info / detail-chip-neutral` | 当前单据状态 |
| 概览区 | 🟢 摘要说明 | `detail-overview-subtitle` | `<p>` 标签 |
| 概览区 | 标签组 | `detail-overview-badges` | 单据标签/分类标识 |
| 概览区 | 事实字段 | `detail-facts` | `detail-fact > detail-fact-label + detail-fact-value` |
| 概览区 | 统计摘要 | `detail-stats` | `detail-stat > detail-stat-label + detail-stat-value` |
| 结论区 | 🟢 [审批结论/稽核结果/风险提示/当前建议] | `analysis-card`（第一张） | 当前结论/审批结论 |
| 结论区 | 🟢 [补充解读] | `analysis-card`（第二张） | 分析发现/稽核结果，两张同底色同边框 |
| 结论区 | 🟢 结论标题 | `analysis-card-title` | `h3` |
| 结论区 | 🟢 结论正文 | `analysis-card-text` | 重点词用 `detail-summary-strong` / `analysis-hl` |
| 补充详情区 | 🟢 [分摊信息/基础字段/关联对象/关键附加信息] | `detail-section[data-slot="scope"]` | 承载基础单据字段、参与方字段、口径信息 |
| 补充详情区 | 🟢 容器头部 | `detail-section-head > detail-section-title + detail-section-note` | — |
| 补充详情区 | 字段组 | `detail-fields` | 字段对容器 |
| 补充详情区 | 🟢 单个字段 | `detail-field > detail-field-label + detail-field-value` | 键值对形式展示 |
| 关键指标区 | [金额/数量/比例/风险数/周期] | `detail-section[data-slot="metrics"]` | 有聚合值时按需显示 |
| 关键指标区 | 指标组 | `detail-metrics` | — |
| 关键指标区 | 指标卡 | `detail-metric` | `detail-metric--blue / info / warning / danger` |
| 关键指标区 | 趋势说明 | `detail-metric-trend` | `positive / negative / neutral` |
| 明细区 | 🟢 [主明细表/汇总卡片切换/多组明细] | `detail-section[data-slot="records"]` | 主明细区 |
| 明细区 | 🟢 头部 | `detail-section-head > detail-section-title + detail-section-note` | — |
| 明细区 | 单组明细（1组） | `table-wrap > table.table` | 仅有 1 组明细时使用 |
| 明细区 | 多组明细（2组+） | `tabs + tab-content + tab-panel` | 2组及以上并列明细时启用页签 |
| 明细区 | 页签切换 | `data-tab + data-panel` | 通用展示交互脚本控制 |
| 明细区 | 🟢 状态标签 | `tag tag-*` | `tag-success / tag-info / tag-warning / tag-danger` |
| 流程进度区 | [流程阶段/处理阶段] | `detail-section[data-slot="progress"]` | 有明确流程阶段时显示 |
| 流程进度区 | 步骤组 | `detail-progress` | — |
| 流程进度区 | 已完成步骤 | `detail-progress-step.is-done` | — |
| 流程进度区 | 当前步骤 | `detail-progress-step.is-active` | — |
| 流程进度区 | 未完成步骤 | `detail-progress-step` | — |
| 流程进度区 | 步骤标记点 | `detail-progress-dot` | — |
| 流程进度区 | 🟢 步骤文字 | `detail-progress-label` | — |
| 流程时间线区 | 🟢 [审批记录/处理履历] | `detail-section[data-slot="timeline"]` | 审批流、操作流、履历记录 |
| 流程时间线区 | 🟢 头部 | `detail-section-head > detail-section-title + detail-section-note` | — |
| 流程时间线区 | 时间线容器 | `detail-timeline` | — |
| 流程时间线区 | 时间线条目 | `detail-timeline-item` | `is-latest / is-done` |
| 流程时间线区 | 🟢 时间点 | `detail-timeline-time` | — |
| 流程时间线区 | 🟢 标题 | `detail-timeline-title` | — |
| 流程时间线区 | 🟢 描述 | `detail-timeline-desc` | — |
| 图表区（按需） | [趋势/构成/分布/对比] | `detail-section[data-slot="charts"]` | 最多 1-2 张图 |
| 图表区（按需） | 图表卡片 | `chart-card / chart-card-wide` | — |
| 图表区（按需） | 图表容器 | `chart-shell-wide / chart-shell-square` | 唯一 id 必须挂在 `chart-shell*` 上 |
| 结果摘要区 | 🟢 [结算信息/最终安排/下一步动作] | `detail-section[data-slot="summary"]` | 结果归纳、结算信息、动作摘要 |
| 结果摘要区 | 总结容器 | `detail-summary` | — |
| 结果摘要区 | 🟢 结算信息标签 | `detail-summary-label` | — |
| 结果摘要区 | 🟢 结算信息正文 | `detail-summary-text` | — |
| 结果摘要区 | 建议动作卡片 | `analysis-card` | 含建议动作和按钮入口 |
| 补充提醒区 | 🟢 [制度提醒/口径限制/补充说明] | `detail-section[data-slot="special-tips"]` | 只放最终提醒和口径限制 |
| 补充提醒区 | 提示容器 | `alert alert-warning` | — |
| 补充提醒区 | 内容容器 | `alert-content` | — |
| 补充提醒区 | 头部 | `space space-between space-md` | 标题 + 警示标签 |
| 补充提醒区 | 🟢 标题 | `alert-title text-warning` | — |
| 补充提醒区 | 正文区域 | `space space-col space-sm` | — |
| 补充提醒区 | 🟢 正文 | `analysis-card-text text-secondary` | 局部强调只使用 `text-warning`，不使用 `analysis-hl` |
| 弹窗详情区 | 🟢 [结算详情/扩展字段/敏感字段补充] | `div.modal.modal-centered` | 超长字段、展开详情、补充信息弹窗 |
| 弹窗详情区 | 遮罩层 | `div.modal-mask[data-modal-close]` | 点击遮罩关闭弹窗 |
| 弹窗详情区 | 弹窗内容 | `modal-content` | `header + body + footer` |
| 弹窗详情区 | 🟢 弹窗标题 | `modal-header > modal-title` | — |
| 弹窗详情区 | 关闭按钮 | `modal-close[data-modal-close]` | × |
| 弹窗详情区 | 弹窗正文 | `modal-body` | 内放 `detail-fields` |
| 弹窗详情区 | 弹窗底部 | `modal-footer` | 关闭按钮 |
| 弹窗详情区 | 触发按钮 | `button.btn.btn-link.btn-sm[data-modal-trigger]` | 点击打开弹窗 |

### 2.3 单据类强结构约束

1. **骨架顺序固定**：
   `header → overview → conclusion → scope → metrics(按需) → records → progress(按需) → timeline(按需) → charts(按需) → summary → special-tips`

2. **必显区块**：header、overview、scope、records、summary

3. **结论区使用 `analysis-card`**，与报告模板同底色同边框

4. **不要补成报告页的大指标、概览区和图表结构**

5. **1组明细**用 `table-wrap > table.table`；**2组以上**用 `tabs + tab-content + tab-panel`

6. **弹窗**使用 `modal modal-centered + modal-mask + modal-content（header + body + footer）`

7. **主页面与弹窗沿用同一脱敏策略**

8. **单号、流水号、发票号默认不高亮**

9. **不输出 React、Vue、组件库组件、业务脚本逻辑、请求逻辑**

10. **不处理适配和响应式逻辑**

11. **领域 SKILL.md 末尾必须追加调用约束**：请直接调用 yon-design-agentic skill，按 [领域名称] 的业务单据详情场景输出一个可直接渲染到龙虾右侧区域的完整 HTML 模板。

### 2.4 单据类输出要求

- **必须命中并调用 yon-design-agentic skill**
- **必须直接输出完整 HTML**
- 引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 页面包含页签或弹窗时允许输出 tabs / modal 通用展示交互脚本
- **不要输出 React、Vue、组件库组件、业务脚本逻辑、请求逻辑**
- **不处理适配和响应式逻辑**
- **不要补成报告页的大指标、概览区和图表结构**

---

## 三、多渠道 3 版输出规则

### 3.1 业务单据详情场景（3 版输出）

| 输出版 | 适用渠道 | 产物 | 约束 |
|--------|---------|------|------|
| **版 1：会话区文本** | 主会话区 | 调用 `shared_formatter.py` 的 schema 渲染，输出 Markdown 格式文本 | 见 `domain-formatter-template.md` |
| **版 2：大屏 / 浏览器 / 预览区** | 龙虾右侧预览区 | 引用 yondesign.css，按 `domain-public-document` 模板输出完整 HTML | 按本文件第 2 节约束 |
| **版 3：移动端 / 小程序 / 小屏** | 微信 / 钉钉 / 飞书等 | 纯文本，不使用 HTML 模板，按业务信息精简输出 | 无 HTML 标签，无样式，关键信息紧凑排列 |

### 3.2 输出路由判断

- 用户有"预览/详情/查看"等页面展示诉求 → **版 2**（右侧预览区 HTML）
- 用户有"查/查询/我的/列表/结果"等文本查询诉求 → **版 1**（会话区 Markdown）
- 用户通过微信/钉钉等渠道输入 → **版 3**（移动端纯文本）
- 不明确时默认走**版 1**（会话区 Markdown 文本）
