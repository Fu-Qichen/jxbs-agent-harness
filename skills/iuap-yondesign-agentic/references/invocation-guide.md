# Domain Template Agentic Usage Guide

## 这是什么

`yondesign-agentic` 是一层“模板渲染 skill”。

它负责：

- 接住领域关键词或其他 skill 的路由
- 选择合适的公共报告模板 / 业务单据模板 / 详情模板 / 图表模板
- 直接输出可渲染到龙虾右侧区域的完整 HTML

它不负责：

- React / Vue 组件实现
- 业务请求逻辑
- 状态管理
- 响应式和适配逻辑

## 什么时候用

满足下面任一情况，就应该调用这个 skill：

- 需要详情页模板
- 需要报告页模板
- 需要业务单据模板
- 需要指标卡模板
- 需要 ECharts 图表区块
- 需要右侧区域直接渲染的完整 HTML

## 最小调用要求

调用时至少要明确这 4 件事：

1. 必须调用 `yondesign-agentic`
2. 输出目标是“龙虾右侧区域”
3. 输出结果必须是完整 HTML
4. 样式和组件统一来自 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`

## 标准调用模板

```text
请直接调用 `yondesign-agentic` skill。

我要一个可直接渲染到龙虾右侧区域的完整 HTML 模板。

领域：
[领域名称]

关键词：
[关键词1] / [关键词2] / [关键词3]

页面类型：
[详情页 / 报告页 / 业务单据页 / 指标摘要页 / 图表看板]

输出要求：
- 必须输出完整 HTML
- 必须引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css`
- 分析增强场景额外引用 `https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css`
- 如果包含图表，必须补 ECharts CDN 和统一初始化脚本
- 如果包含页签或弹窗，允许补 tabs / modal 的通用展示交互脚本
- 不允许输出组件代码
- 不允许输出业务脚本逻辑
- 不处理适配逻辑
```

## 模板命中规则

| 输入表达 | 默认命中 |
| --- | --- |
| 公共模板、统一模板、领域模板 | `domain-public-report` |
| 单据、审批单、申请单、报销、付款、采购、合同、请假、结算、发票、工单 | `domain-public-document` |
| 详情页、资料页、主体页 | `detail-generic` |
| 报告、分析报告、经营简报、结论页 | `report-detail` |
| 指标摘要、KPI、指标区 | `metric-cluster` |
| echarts、趋势图、柱图、占比图、dashboard | `domain-echarts-cluster` |

## 输出结果长什么样

```html
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/yondesign.css" />
<link rel="stylesheet" href="https://static-dc-core1.yonyoucloud.com/tinper-agentic/0.0.3/analytics.css" />
{{echarts_cdn_html}}
<main class="detail-page detail-page-embedded">
  <!-- 完整内容 HTML -->
</main>
<script>
  // 如果页面包含图表或单据交互，统一在这里初始化
</script>
```

## 常见用法

### 0. 领域没有特殊要求，不想写报告结构

- `domain-skill-simple-template.md`

### 1. 需要完整领域 skill 规范

- `domain-skill-template.md`

### 2. 只要最简领域调用模板

- `domain-invocation-simple-template.md`

### 3. 让领域直接提需求

- `domain-hit-script-template.md`

### 4. 查看公共报告模板

- `domain-public-template.md`

### 5. 查看业务单据公共模板

- `domain-document-template.md`

### 6. 查看图表模板

- `echarts-template.md`

## 推荐实践

- 如果用户问“给领域哪个文件”“没特殊要求时领域 skill 用什么模板”“不要写报告结构”，优先回答 `domain-skill-simple-template.md`。
- 先写明“请直接调用 `yondesign-agentic`”
- 再写明“输出到龙虾右侧区域的完整 HTML”
- 再写明页面类型和关键词
- 如果是审批单、申请单、报销单、付款单、合同流程单，显式写出“业务单据页”
