---
name: iuap-yondesign-agentic
metadata: {"yonbip":{"version":"1.0.11"}}
description: 统一输出规范 skill（含 Excel 模板结构映射补充约束）。会话区提供概览统计、分页提示、异常表格、执行建议等 Markdown 格式化规范（shared-output-standards）；右侧预览区提供报告模板、业务单据模板、详情模板、指标卡模板、ECharts 图表模板等可直接渲染的 HTML 模板。路由优先级：先读取会话区规范（shared-output-standards），再读取右侧预览区规范（render-output）。命中报告结构、业务单据结构、详情结构、指标卡背景规则、特殊数字着色规则、领域直达模板、趋势图、柱状图、图表看板、右侧预览渲染、概览统计格式、分页提示格式，以及"给领域哪个文件""没有特殊要求时领域 skill 用什么模板""不要写报告结构""极简领域 skill 规范"等诉求时触发。硬规则：只要用户是在问"领域在 skill 里该用哪个文件"或"没有特殊要求时该用哪个模板"，默认回答 `references/domain-skill-simple-template.md`；`references/domain-invocation-simple-template.md` 仅用于"发给领域同学的一次性调用话术 / prompt 模板"，不能作为领域 skill 规范的默认答案。该层不产出真实组件，但必须输出完整效果的 HTML 内容或完整 Markdown 格式化文本；运行时样式与组件统一引用 https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css，分析类页面额外引用 https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css，图表运行时统一引用 https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/echarts.min.js。**新增硬规则：默认使用 detail-overview 标准子组件；只有用户明确指定 overview-header 时才使用 overview-header，且两者互斥。**
---
# iuap-yondesign-agentic 用友智能设计代理（自定义版）

> 基于 `iuap-yondesign-agentic` 的统一输出规范，覆盖 Excel 模板结构映射表中的完整约束（报告类 + 单据类结构映射、强结构约束、输出要求、多渠道 3 版输出规则）。**自定义版新增概览区规则：默认使用 detail-overview 标准子组件；只有用户明确指定 overview-header 时才使用 overview-header，且使用 overview-header 时 detail-header 区块也必须移除。**

## 定位

这是一个"统一输出规范" skill，覆盖两条输出链路：**会话区**和**右侧预览区**。不是组件层，也不是样式实现层。

### 双区输出模型

本 skill 同时管理两个输出区域，路由优先级为 **会话区优先，右侧预览区随后**：

| 输出区域   | 产物形态                                                                                  | 规范来源                                                                                        | 读取优先级         |
| ---------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------ |
| 会话区     | Markdown 格式化文本（概览统计、分页提示、异常表格、执行建议、安全合规规范、业务模板骨架） | `references/shared-output-standards/shared_format_rules.md` + `scripts/shared_formatter.py` | **优先读取** |
| 右侧预览区 | 完整 HTML（yondesign.css 驱动的页面骨架、指标卡、图表、表格、详情结构）                   | `references/render-output.md` 及下游模板                                                      | 会话区之后读取     |

路由判断规则：

- 用户需要**会话区文本输出**（列表查询结果、操作结果、单据信息、审核详情等 Markdown 格式化场景）→ 先读取 `references/shared-output-standards/shared_format_rules.md`
- 用户需要**右侧预览区 HTML 渲染**（报告、详情、单据、图表、dashboard 等页面级渲染场景）→ 读取 `references/render-output.md` 及对应模板
- 用户同时需要两边 → 先确定会话区格式，再确定右侧预览区 HTML 结构

回答"给领域哪个文件"时先分两类：

- 只要用户问"领域在 skill 里该用哪个文件""没特殊要求时该用哪个模板""不要写报告结构"，直接优先回答 `references/domain-skill-simple-template.md`
- 只有用户明确说"给领域同学一句话术""给一段 prompt""一次性提需求模板"时，才回答 `references/domain-invocation-simple-template.md`
- 会话区格式化规范：由 `shared-output-standards` 定义（概览/分页/异常表格格式、安全合规底线、整体业务规则、引言/核心结论规范、四种业务模板骨架、业务摘要/追问与建议/列表/标签/数据格式等细节规范）
- 右侧预览区模板结构：由本 skill 定义
- 完整 HTML 效果：由本 skill 输出
- 颜色、背景、边框、字号、间距、组件结构类、布局类、状态类、原子类：统一通过 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css` 获取
- 分析增强场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 真实组件、框架封装、适配逻辑：不在本 skill 中定义

## Always Read

- `references/usage-rules.md` - 本 skill 的强制规则和输出边界（含会话区 + 右侧预览区双区规则）
- `references/root-assets.md` - 模板目录、领域路由和读取顺序（会话区优先）
- `references/shared-output-standards/shared_format_rules.md` - 会话区格式化规范（概览统计、分页提示、异常表格、安全合规底线、整体业务规则、引言/核心结论、四种业务模板骨架、业务摘要/追问与建议/列表/标签/数据格式）
- `references/render-output.md` - 右侧区域渲染输出协议
- `references/excel-structure-constraints.md` - 【补充约束】Excel 模板结构映射表导出的完整约束（报告类 + 单据类结构映射、强结构约束、输出要求、3 版输出规则）

## 必用 class 速查表（不得自行发明）

生成 HTML 时只能组合 `yondesign.css` 已有 class，禁止自造 class，也禁止通过内联样式补视觉。

| 区块                                                      | 容器 class                                                | 子元素 class                                                                                                                                                                                                         |
| --------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 标题区                                                    | `detail-header`                                         | `detail-title`、`detail-meta`                                                                                                                                                                                    |
| 概览区（方式A）                                           | `detail-overview`                                       | `detail-overview-avatar`、`detail-chip`、`detail-facts`、`detail-fact`、`detail-overview-head`、`detail-overview-body`、`detail-overview-title`、`detail-overview-subtitle`                          |
| 概览区（方式B，仅用户明确指定`overview-header` 时使用） | `detail-overview`                                       | `overview-header`、`overview-header__title`、`overview-header__desc`、`overview-header__period`、`overview-metrics`、`metrics-grid`、`metric-card`、`metric-label`、`metric-value`                    |
| 核心结论                                                  | `analysis-card`                                         | `analysis-card-title`、`analysis-card-text`、`detail-summary-strong`、`analysis-hl`                                                                                                                          |
| 指标卡                                                    | `detail-metric detail-metric--blue/info/warning/danger` | `detail-metric-trend-positive/negative/neutral`                                                                                                                                                                    |
| 图表区                                                    | `chart-grid`、`chart-card`                            | `chart-shell-wide`、`chart-shell-square`                                                                                                                                                                         |
| 明细区                                                    | `table-wrap > table.table`                              | `detail-badge`、`tag`                                                                                                                                                                                            |
| 结论区                                                    | `detail-summary`                                        | `detail-summary-label`、`detail-summary-text`、`detail-summary-strong`                                                                                                                                         |
| 特殊提示区                                                | `detail-section[data-slot="special-tips"]`              | `alert alert-warning`、`alert-content`、`space space-between space-md`、`alert-title text-warning`、`analysis-card-text text-secondary`、`detail-chip detail-chip-warning`、`space space-col space-sm` |
| 页面骨架                                                  | `detail-page detail-page-embedded`                      | `div.detail-stack`                                                                                                                                                                                                 |

**⚠️ 概览区选择规则**：默认使用方式A（标准 `detail-overview` 子组件），包括报告、问数、分析结论、详情、单据等页面；只有用户明确指定使用 `overview-header` 时，才允许使用方式B。方式A与方式B**不可同时使用**。用了 `overview-header` 就不能再用 `detail-overview-head` / `detail-overview-avatar` / `detail-overview-body` / `detail-facts` / `detail-fact` 等标准子组件，**同时 `detail-header` 区块也必须移除**（因为 `overview-header` 自身已包含标题和meta信息）。`overview-header` 可以与 `overview-metrics`、`metrics-grid`、`metric-card`、`metric-label`、`metric-value` 配合使用，用于展示概览标题下方的核心指标。

**硬失败条件**：输出 HTML 中只要出现 `overview-header`，就绝对不能出现 `detail-header`。如果两者同时出现，必须删除完整 `detail-header` 区块后再输出；不得把该组合交付为最终答案。

禁止使用：`insight-card`、`detail-head`、`trend-up`、`checklist`、`alert` 等不在当前模板体系内的输出写法。即使个别类在历史资产中出现，也不要作为新模板默认答案。`metric-card` 仅允许在方式B的 `overview-metrics` 指标区中使用。

## 何时触发

### 会话区触发

- 需要统一会话区 Markdown 输出格式（概览统计、分页提示）
- 需要统一的异常关注表格格式
- 需要统一的分页提示格式
- 需要统一的执行建议 / 后续操作引导格式
- 需要 schema 驱动的会话区渲染引擎（`scripts/shared_formatter.py`）
- 需要改造/规范化/约束某个领域 skill 的会话区输出格式（如"改造采购skill""让XX领域的输出用统一格式""规范化XXskill的会话区"）→ 读取 `references/domain-formatter-template.md`
- 需要安全/合规底线规则（AI 状态区分、高风险动作确认、错误反馈脱敏、数据不足说明）
- 需要会话区业务模板骨架（单据/查询/分析/方案推荐四种场景的固定区块顺序）
- 需要引言/核心结论/业务摘要/追问与建议的标准化输出规范

### 右侧预览区触发

- 需要把页面模板单独抽成 skill
- 需要报告模板、业务单据模板、详情模板或指标卡模板
- 需要定义"特殊数字该用什么颜色"
- 需要定义"指标卡该用什么背景"
- 需要让业务领域通过模板结构直接命中页面骨架
- 需要回答"给领域哪个文件""没有特殊要求时领域 skill 用什么模板"
- 需要一份"极简领域 skill 规范"，且不想让领域自己写报告结构
- 需要吐出右侧区域可直接渲染的完整 HTML
- 需要在公共模板里补趋势图、柱图、饼图、图表卡或 dashboard
- 需要保留 tabs / modal / progress / timeline 这类通用展示能力

## 常用任务路由

### 会话区路由（优先）

| 用户意图                                                                              | 读取路径                                                                         |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 需要会话区格式化规范（概览统计、分页提示、异常表格、安全合规、业务模板、引言/结论等） | `references/shared-output-standards/shared_format_rules.md`                    |
| 需要会话区强制规则和输出边界（含安全/合规自检清单、业务模板路由）                     | `references/usage-rules.md` → 会话区输出规则                                  |
| 需要 schema 驱动的会话区渲染引擎（v2.2.0 含安全过滤、引言校验、千分符扩展）           | `scripts/shared_formatter.py`                                                  |
| 需要会话区渲染引擎用法演示                                                            | `scripts/demo_usage.py`                                                        |
| 需要改造/规范化/约束领域 skill 会话区输出、统一输出格式                               | `references/domain-formatter-template.md`                                      |
| 需要安全/合规底线规则（AI状态区分、高风险确认、错误脱敏、数据不足说明）               | `references/shared-output-standards/shared_format_rules.md` → 第九节          |
| 需要业务模板固定骨架（单据/查询/分析/方案推荐）                                       | `references/shared-output-standards/shared_format_rules.md` → 第十三节        |
| 需要引言/核心结论标准化格式                                                           | `references/shared-output-standards/shared_format_rules.md` → 第十一、十二节  |
| 需要业务摘要/追问与建议/列表/标签/数据格式细节规范                                    | `references/shared-output-standards/shared_format_rules.md` → 第十四~二十一节 |
| 需要 Excel 报告类/单据类模板结构映射约束                                              | `references/excel-structure-constraints.md`                                    |

### 右侧预览区路由

| 用户意图                                                                                  | 读取路径                                                 |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 需要这个 skill 的使用说明                                                                 | `references/invocation-guide.md`                       |
| 需要给上游领域一个"没有特殊要求时可直接复用"的极简`SKILL.md` 规范                       | `references/domain-skill-simple-template.md`           |
| 需要给上游领域沉淀完整`SKILL.md` 规范 / 结构化载荷契约                                  | `references/domain-skill-template.md`                  |
| 需要最终模板参考 / 样式统一归档版                                                         | `references/final-template-reference.md`               |
| 需要最快速度给领域一份可直接复制的模板                                                    | `references/domain-invocation-simple-template.md`      |
| 需要最快速度命中并拼装                                                                    | `references/fast-hit-assembly.md`                      |
| 需要评估生成效率                                                                          | `scripts/evaluate_generation_efficiency.sh`            |
| 需要发给领域的命中话术模板                                                                | `references/domain-hit-script-template.md`             |
| 需要完整渲染效果 / 右侧区域预览                                                           | `references/render-output.md`                          |
| 需要一个公共给领域直接套用的报告模板                                                      | `references/domain-public-template.md`                 |
| 需要一个公共给领域直接套用的业务单据模板                                                  | `references/domain-document-template.md`               |
| 需要 ECharts 图表区块 / 趋势图 / 柱图 / 图表卡                                            | `references/echarts-template.md`                       |
| 需要 Excel 模板结构映射补充约束（报告类/单据类结构映射、强结构约束、多渠道 3 版输出规则） | `references/excel-structure-constraints.md`            |
| 需要多渠道 3 版输出规则（会话区/预览区/移动端）                                           | `references/excel-structure-constraints.md` → 第 3 节 |
| 生成通用详情模板                                                                          | `references/detail-template.md`                        |
| 生成报告模板 / 报告详情模板                                                               | `references/report-template.md`                        |

## 执行流程

### 第 0 步：判断输出区域（会话区 vs 右侧预览区）

1. 先判断用户需要的是**会话区 Markdown 输出**还是**右侧预览区 HTML 渲染**，还是两者都需要。
2. 如果是会话区输出，进入会话区流程；如果是右侧预览区输出，进入右侧预览区流程；如果两者都需要，先走会话区流程，再走右侧预览区流程。

### 会话区流程（优先）

1. 先读取 `references/usage-rules.md`，确认会话区输出规则、安全/合规强制规则、业务模板路由规则。
2. 读取 `references/shared-output-standards/shared_format_rules.md`，确认概览/分页/异常表格格式、安全合规底线、整体业务规则、引言/核心结论规范、业务模板骨架、业务摘要/追问与建议等细节规范。
3. 根据业务场景命中对应的模板骨架（单据/查询/分析/方案推荐）。
4. 如需给领域可扔给大模型的改造模板，读取 `references/domain-formatter-template.md`。
5. 如需 schema 驱动渲染，读取 `scripts/shared_formatter.py`，按 `render_schema()` 入口组织输出（v2.2.0 含安全过滤和引言校验）。
6. 如需查看用法示例，读取 `scripts/demo_usage.py`。
7. 输出完整 Markdown 格式化文本，输出前执行安全/合规/结构/细节四层自检。

### 右侧预览区流程

1. 先读取 `references/usage-rules.md`，确认这次输出的是"可渲染 HTML"而不是组件实现。
2. 再读取 `references/root-assets.md`，确认命中的领域模板。
3. 如果用户在问"给领域哪个文件""没有特殊要求时领域 skill 用什么模板""不要写报告结构"，优先读取 `references/domain-skill-simple-template.md`。
4. 如果用户要给上游领域沉淀完整 `SKILL.md` 规范或结构化载荷契约，读取 `references/domain-skill-template.md`。
5. 如果用户只要最快可复制模板，先读取 `references/domain-invocation-simple-template.md`。
6. 如果用户强调快速搭建、快速命中、快速拼装，读取 `references/fast-hit-assembly.md`。
7. 读取 `references/render-output.md`，按右侧区域的输出协议组织 HTML。
8. 如果用户提到最终模板、样式统一归档、问数右侧预览，读取 `references/final-template-reference.md`。
9. 如果是统一公共报告模板，读取 `references/domain-public-template.md`。
10. 如果是统一业务单据模板，读取 `references/domain-document-template.md`。
11. 如果页面包含趋势、对比、分布、占比、仪表盘等图表诉求，读取 `references/echarts-template.md`。
12. 如果是详情页、资料页、实体页，读取 `references/detail-template.md`。
13. 如果是报告、分析结论、经营简报、专项报告，读取 `references/report-template.md`。
14. 输出时优先给"完整 HTML + 已命中的结构 + 语义规则"，不要只给抽象骨架。

## 当前真源

### 会话区真源

- 格式化规范来自 `references/shared-output-standards/shared_format_rules.md`（含安全合规底线、整体业务规则、引言/核心结论、四种业务模板骨架、业务摘要/追问与建议/列表/标签/数据格式等完整规范）
- 渲染引擎来自 `scripts/shared_formatter.py`（v2.2.0，schema 驱动，`render_by_schema()` 为主入口，含安全过滤、引言校验、千分符扩展、Emoji 白名单校验）
- 用法演示来自 `scripts/demo_usage.py`
- emoji 仅允许 ⚠️（风险/异常）与 ✅（已完成/成功）；白名单见 `shared_formatter.py` 的 `_ALLOWED_EMOJI` / `_validate_emoji`，完整规则见 `shared_format_rules.md` 第二十节 Emoji 基础规范
- 状态名称映射（仅中文名称，无彩色灯）在 schema 的 `status_lights` 字段中定义，`status_light()` 仅返回中文名称

### 右侧预览区真源

- 结构参考来自 `assets/final-template-reference/optimized_index.html`
- 运行时样式与组件统一来自 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 分析增强场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 图表底层依赖统一来自 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/echarts.min.js`
- 页面包含固定 12 类图表时必须额外加载 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js` 并从 `YonChartRuntimeV12` 选用固定入口：竖柱、横条、堆叠柱/条、折线、面积、饼/环、雷达、散点、气泡、双轴组合、漏斗和仪表盘。非固定图表在自己的图表容器内使用独立原生 ECharts 兜底 renderer；同一报告必须按图表卡片逐卡路由，不能因为存在一张特殊图而让固定图表改走兜底，也不能因为固定图表存在而让特殊图空白。公共运行时或 ECharts 依赖缺失时明确失败；数据契约错误或初始化失败时，固定图表默认渲染同类型示例图并在图内标注原因；容器尚未取得有效尺寸时显示加载态并等待布局完成；所有展示的图例强制位于图表下方。图表网格最大三列并按图表数量自动处理：末行 2 张均分，末行 1 张使用 `chart-card-fill` / `chart-card-wide` 跨满整行，禁止右侧大片空白
- 图表路由按单卡隔离：固定 12 类始终调用对应 `YonChartRuntimeV12` 入口；只有用户明确要求的非固定图类才允许进入独立兜底通道。兜底通道不得接管同一报告中的固定图表，也不得修改全局 ECharts 主题、色板、formatter、preprocessor、共享 `setOption()` 或固定图表的 CSS。固定图表失败时默认显示同类型示例图并标注原因，调试态 `strict: true` 才保留失败态。
- Excel 补充约束文档来自 `references/excel-structure-constraints.md`

## 输出边界

**输出：**

- 会话区 Markdown 格式化文本（概览统计、分页提示、异常表格、执行建议、安全合规标注、业务模板骨架）
- 领域可直接命中的完整 HTML 模板
- 可直接渲染到右侧区域的样式引用和内容 HTML
- ECharts 图表容器、图表卡片结构和统一初始化脚本
- tabs / modal / charts 的通用展示交互脚本
- 模板 ID、槽位顺序、区块职责
- 特殊数字着色规则
- 指标卡背景规则
- 右侧预览区表格中的数量、金额等数值字段使用 `text-right text-nowrap`，右对齐且数字不折行；需要省略号时再叠加 `truncate`
- 表格整体宽度最小 256px（领域），最大宽度不超过 1600px

**不输出：**

- React/Vue/组件库组件
- 真实业务组件实现
- 响应式 / 适配逻辑
- 请求逻辑、状态管理、脚本行为
- 手写 CSS、token 数值、组件 props 设计
- `<style>`、`style=""`、页面级 CSS、局部 CSS
