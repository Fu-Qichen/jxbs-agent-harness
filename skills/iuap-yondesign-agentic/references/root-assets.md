# Root Assets

本 skill 当前负责两类输出链路：**会话区**（Markdown 格式化文本）和**右侧预览区**（可渲染 HTML），共涵盖结构层规则、会话区格式化规范、右侧渲染协议、通用详情模板、报告模板、业务单据模板、ECharts 图表模板。

全局来源约束：

- 会话区格式化规范来自 `references/shared-output-standards/shared_format_rules.md` 和 `scripts/shared_formatter.py`
- 领域改造模板来自 `references/domain-formatter-template.md`
- 运行时样式与组件统一引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 分析增强场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 图表底层统一引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/echarts.min.js`
- 固定 12 类图表额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js`
- `final-template-reference` 只保留结构归档参考，不再作为运行时依赖

## 核心文件

### 会话区文件（优先读取）

| 文件 | 作用 | 何时读取 |
| --- | --- | --- |
| `shared-output-standards/shared_format_rules.md` | 会话区格式化规范：概览统计格式、分页提示格式、异常表格格式、Emoji 基础规范（仅 ⚠️/✅）、安全合规底线 | 需要会话区 Markdown 输出时优先读取 |
| `scripts/shared_formatter.py` | 会话区 schema 驱动渲染引擎，`render_schema()` 为新领域技能推荐入口，`render_by_schema()` 为 po 域向后兼容入口 | 需要 schema 驱动渲染或查看渲染逻辑时读取 |
| `scripts/demo_usage.py` | 会话区渲染引擎用法演示 | 需要查看调用示例时读取 |
| `domain-formatter-template.md` | 领域 skill 会话区改造模板（可直接扔给大模型） | 需要改造领域 skill 的会话区输出时读取 |

### 右侧预览区文件

| 文件 | 作用 | 何时读取 |
| --- | --- | --- |
| `usage-rules.md` | 强制规则、语义约束、输出边界（含双区规则） | 命中本 skill 后优先读取 |
| `final-template-reference.md` | 样式统一归档版的最终结构参考 | 用户提到最终模板、样式统一、问数右侧预览时读取 |
| `invocation-guide.md` | 本 skill 的使用说明、调用方式、输出约定 | 需要查看如何使用时读取 |
| `domain-skill-simple-template.md` | 给上游领域沉淀极简 `SKILL.md` 规范 | 用户问"给领域哪个文件"或"没特殊要求时用什么模板"时读取 |
| `domain-skill-template.md` | 给上游领域沉淀完整 `SKILL.md` 规范和结构化载荷契约 | 需要完整领域 skill 模板时读取 |
| `domain-invocation-simple-template.md` | 发给领域的极简调用模板 | 需要一句话或最短模板时读取 |
| `fast-hit-assembly.md` | 最快速度命中和拼装逻辑 | 用户强调快速搭建、快速拼装时读取 |
| `domain-hit-script-template.md` | 发给领域的命中话术模板和调用声明 | 需要复制给领域时读取 |
| `render-output.md` | 右侧区域渲染输出协议和完整 HTML 约束 | 需要完整效果时读取 |
| `domain-public-template.md` | 给各业务领域直接套用的统一公共报告模板 | 用户需要报告型公共模板时读取 |
| `domain-document-template.md` | 给各业务领域直接套用的统一业务单据模板 | 用户需要业务单据公共模板时读取 |
| `echarts-template.md` | ECharts 图表结构、图表卡和运行时约束 | 页面包含图表时读取 |
| `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/chart_runtime_v1_2.js` | 十二类常见图表的字段归一化、布局、系列色、底部图例、示例数据兜底与 resize，以及原生扩展图表的统一挂载生命周期 | 页面包含任意 ECharts 图表时必须加载；固定 12 类优先调用对应入口，特殊图类调用 `mountNative` |
| `detail-template.md` | 从详情预览页抽出的通用详情模板骨架 | 页面是详情、资料、主体信息时读取 |
| `report-template.md` | 报告领域模板、特殊数字、指标卡色调和证据图表规则 | 页面是报告、分析结论、经营简报时读取 |

## 读取顺序

### 第 0 步：判断输出区域

1. 先判断用户需要的是**会话区 Markdown 输出**还是**右侧预览区 HTML 渲染**，还是两者都需要。
2. 会话区场景（列表查询结果、操作结果、单据信息、审核详情等 Markdown 格式化）→ 进入会话区读取顺序。
3. 右侧预览区场景（报告、详情、单据、图表、dashboard 等页面级渲染）→ 进入右侧预览区读取顺序。
4. 两者都需要 → 先走会话区，再走右侧预览区。

### 会话区读取顺序（优先）

1. 先读 `usage-rules.md` 确认会话区输出规则
2. 读 `shared-output-standards/shared_format_rules.md` 确认概览/分页/异常表格格式、Emoji 基础规范（仅 ⚠️/✅）、安全合规底线
3. 如需给领域可扔给大模型的改造模板，读 `domain-formatter-template.md`
4. 如需 schema 驱动渲染，读 `scripts/shared_formatter.py`
5. 如需查看用法示例，读 `scripts/demo_usage.py`
6. 输出完整 Markdown 格式化文本

### 右侧预览区读取顺序

1. 先读 `usage-rules.md`
2. 若用户提到最终模板、样式统一归档、问数右侧预览，读 `final-template-reference.md`
3. 若用户在问"给领域哪个文件""没有特殊要求时领域 skill 用什么模板""不要写报告结构"，优先读 `domain-skill-simple-template.md`
4. 若用户需要给上游领域沉淀完整 `SKILL.md` 规范或结构化载荷契约，读 `domain-skill-template.md`
5. 若只需要极简模板，先读 `domain-invocation-simple-template.md`
6. 若用户强调快速搭建、快速命中、快速拼装，读 `fast-hit-assembly.md`
7. 若需要发给领域的完整调用话术，再读 `domain-hit-script-template.md`
8. 若输出目标是右侧区域渲染，必读 `render-output.md`
9. 若用户要统一公共报告模板，读 `domain-public-template.md`
10. 若用户要统一业务单据模板，读 `domain-document-template.md`
11. 若页面包含趋势图、柱图、饼图、图表卡、dashboard，继续读 `echarts-template.md`
12. 再判断页面是否属于"详情类""报告类"还是"业务单据类"
13. 详情类读取 `detail-template.md`
14. 报告类读取 `report-template.md`
15. 若用户只问颜色或背景规则，仍以 `report-template.md` 为真源

## 领域路由

### 会话区路由

| 领域表达 | 命中规范 |
| --- | --- |
| 列表查询结果、操作结果、单据信息、审核详情、失败详情 | `shared-output-standards/shared_format_rules.md` + `scripts/shared_formatter.py` |
| 概览统计、分页提示、异常表格、Emoji 基础规范 | `shared-output-standards/shared_format_rules.md` |
| schema 驱动渲染（`render_by_schema` / `render_schema`） | `scripts/shared_formatter.py` |
| 领域 skill 会话区改造（给大模型执行） | `domain-formatter-template.md` |

### 右侧预览区路由

| 领域表达 | 命中模板 |
| --- | --- |
| 公共模板、领域模板、通用骨架、统一模板、问数右侧预览 | `domain-public-report` |
| 单据、审批单、申请单、报销、付款、采购、合同、请假、结算、发票、工单 | `domain-public-document` |
| echarts、趋势图、柱状图、环形图、图表卡、看板、驾驶舱 | `domain-echarts-cluster` |
| 主体详情、信息页、资料页、档案页、实体页 | `detail-generic` |
| 报告、报告详情、分析报告、专项报告、经营简报、结论页 | `report-detail` |
| 指标总览、指标摘要、KPI 总结区 | `metric-cluster` |

## 当前边界

- 不包含真实组件
- 通用页面结构不承诺额外响应式策略；V1.2.3 全部受支持图表的窄屏与 resize 适配由固定统一运行时负责
- 不包含业务请求逻辑
- 不包含 CSS 数值真源
- 不包含 normal 组件实现
