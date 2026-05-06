下面是一版**到目前为止最完整、适合直接发给 Codex 的中文 `PRD.md`**。

它已经包含：

* 最终目标：类似 Gemini Voyager 的用途
* 当前 V1：只实现 ChatGPT + DeepSeek 的 prompt timeline
* 多平台适配器思想
* 中文回复要求
* 不复制 Gemini Voyager 源码
* 不上传数据
* 后续 roadmap
* 第一轮 Codex Prompt

你可以直接新建：

```text
PRD.md
```

然后把下面内容完整复制进去。

````md
# PRD：AI Conversation Navigator

## 0. 产品愿景

本项目希望开发一个面向多个 AI 聊天网页的浏览器扩展，功能和用途上参考 Gemini Voyager。

长期目标是为 AI 聊天工具用户提供一个更高效的长对话管理工具，帮助用户在长对话中：

- 快速定位每一轮自己发送的 prompt
- 快速跳转到某一轮对话起点
- 搜索重要 prompt
- 固定重要 prompt
- 导出对话结构
- 保存和复用常用 prompt
- 按项目或主题组织 AI 对话
- 在多个 AI 聊天平台中获得尽量一致的长对话导航体验

当前优先支持的平台：

- ChatGPT
- DeepSeek

长期可扩展支持的平台：

- Gemini
- Claude
- Perplexity
- 其他网页端 AI 聊天工具

但是，当前阶段只实现最小可用版本：

**V1：Multi-platform Prompt Timeline Navigator**

V1 的目标是解决一个最核心的问题：

> 当 AI 聊天对话变得很长时，用户很难快速找到自己之前发送的某一轮 prompt。

因此，V1 只需要实现当前对话页面中的用户 prompt 时间轴导航功能。

---

## 1. 项目背景

在 ChatGPT、DeepSeek 等 AI 聊天网页中，用户经常会连续发送很多轮 prompt。

例如在编程项目、seminar 项目、论文写作、机器人控制项目、Codex 调试流程中，用户可能会连续进行几十轮甚至上百轮对话。

目前主流 AI 聊天网页通常缺少一个清晰的“每轮用户 prompt 导航时间轴”。

当用户想回到某一轮对话起点时，只能手动滚动页面查找，效率很低。

Gemini Voyager 提供了类似 timeline 的导航体验，可以帮助用户快速定位长对话中的每一轮输入。

本项目希望参考 Gemini Voyager 的产品结构和功能分层思路，但不复制其源码，开发一个新的多平台 AI 对话导航扩展。

---

## 2. 产品结构参考

本项目参考 Gemini Voyager 的产品结构和功能分层方式，但不会直接复刻其所有功能，也不会复制其源码。

Gemini Voyager 的核心产品结构可以理解为：

1. Timeline Navigation：帮助用户在长对话中快速定位消息
2. Folder Organization：帮助用户组织大量对话
3. Prompt Vault：帮助用户保存和复用常用 prompt
4. Chat Export：帮助用户导出和备份对话内容
5. Platform-specific Power Tools：针对特定平台提供增强功能

本项目将采用类似的产品结构，但按照以下优先级逐步实现：

### 第一层：Conversation Navigation

目标：解决长对话中找不到某一轮 prompt 的问题。

功能：

- Prompt 时间轴
- Prompt 编号
- 点击跳转
- 当前 prompt 高亮
- 搜索 prompt
- 固定重要 prompt

### 第二层：Conversation Export

目标：让用户可以保存和复用对话结构。

功能：

- 导出 prompt 时间轴为 Markdown
- 导出完整对话为 Markdown
- 导出 JSON
- 复制当前 prompt map

### 第三层：Prompt Vault

目标：让用户可以保存和复用常用 prompt。

功能：

- 保存选中的 prompt
- 给 prompt 添加标题
- 给 prompt 添加标签
- 搜索 prompt
- 一键复制 prompt

### 第四层：Conversation Organization

目标：让用户可以按项目或主题管理大量 AI 对话。

功能：

- 文件夹管理
- 对话归类
- 项目标签
- 本地保存组织信息

### 第五层：Multi-platform Adapter

目标：让扩展可以适配多个 AI 聊天网页。

优先支持：

- ChatGPT
- DeepSeek

后续可能支持：

- Gemini
- Claude
- Perplexity

不同平台通过 adapter 处理 DOM 差异，核心 UI 和数据结构保持统一。

---

## 3. 项目目标

## 3.1 长期目标

开发一个类似 Gemini Voyager 用途的多平台 AI 对话导航浏览器扩展。

长期功能包括：

- Prompt 时间轴导航
- 当前对话内 prompt 搜索
- 重要 prompt 固定
- 当前滚动位置高亮
- 对话结构导出
- Prompt Library / Prompt Vault
- 文件夹式对话管理
- 多平台适配
- 本地优先的数据保存方式
- 可选的备份与恢复功能

## 3.2 当前 V1 目标

当前阶段只实现：

**V1：Multi-platform Prompt Timeline Navigator**

V1 需要优先支持：

- ChatGPT：`https://chatgpt.com/*`
- DeepSeek：`https://chat.deepseek.com/*`

V1 需要完成以下目标：

- 在 ChatGPT 和 DeepSeek 对话页面右侧显示一个 prompt 导航栏
- 自动扫描当前页面中所有用户发送的消息
- 按顺序显示 Prompt 1、Prompt 2、Prompt 3 等编号
- 每条记录显示 prompt 的前 50 个字符作为预览
- 点击某条 prompt 后，页面平滑滚动到对应消息位置
- 当用户继续发送新 prompt 后，导航栏自动更新
- 所有处理都在本地浏览器中完成，不上传任何聊天内容
- 代码结构中需要体现平台适配器思想，方便后续继续适配 Gemini、Claude 等平台

---

## 4. 当前阶段不做的功能

V1 不实现以下功能：

- 不实现完整 Gemini Voyager 复刻
- 不复制 Gemini Voyager 的源码
- 不实现文件夹管理
- 不实现 Prompt Vault
- 不实现跨设备同步
- 不实现账号系统
- 不实现后端服务器
- 不读取用户所有历史 AI 对话
- 不修改 ChatGPT、DeepSeek 或其他平台的官方后端数据
- 不导出完整对话
- 不保存完整聊天内容
- 不依赖第三方库
- 不使用外部 API
- 不上传任何用户聊天内容
- 不使用外部分析工具
- 不使用远程脚本

这些功能可以在 V2、V3 或更后续版本中逐步实现。

---

## 5. 目标用户

本扩展主要面向经常使用 AI 聊天工具进行长对话的用户，例如：

- 编程项目用户
- Codex 用户
- 学生
- 研究人员
- 写论文或报告的用户
- 做 seminar / project 的用户
- 需要反复查找历史 prompt 的用户
- 经常通过 ChatGPT 或 DeepSeek 生成分阶段任务的用户
- 经常在长对话中调试代码、规划任务、整理文档的用户

---

## 6. 用户问题

## 6.1 核心问题

在长 AI 对话中，用户很难快速找到每一轮自己发送的 prompt 起点。

示例：

```text
Prompt 1
Prompt 2
Prompt 3
...
Prompt 12
````

当用户想回到 Prompt 4 或 Prompt 8 时，通常只能手动滚动页面查找。

如果中间有很长的回答、代码块、图片、表格或多轮调试记录，查找会非常低效。

## 6.2 痛点

* 长对话难以导航
* 页面中没有清晰的 prompt 时间轴
* 用户无法一键跳转到某一轮 prompt
* 不容易识别每个任务阶段的起点
* 手动滚动浪费时间
* 对话历史不按 prompt 轮次组织
* 跨平台体验不一致，例如 ChatGPT 和 DeepSeek 的页面结构不同

---

## 7. 典型使用路径

## 7.1 安装扩展

用户在 Chrome 或 Edge 浏览器中加载本地扩展。

## 7.2 打开 AI 聊天网页

用户访问已支持的平台：

```text
https://chatgpt.com/
```

或：

```text
https://chat.deepseek.com/
```

然后用户打开任意一个已有对话或新对话。

## 7.3 自动生成 Prompt 导航栏

扩展自动检测当前页面中的用户消息，并在页面右侧生成一个导航栏。

导航栏中的每一项类似：

```text
Prompt 1：帮我分析这个项目结构...
Prompt 2：现在我应该怎么让 Codex 修改...
Prompt 3：这个报错是什么意思...
```

## 7.4 点击跳转

用户点击某一条 prompt 记录后，页面自动滚动到该 prompt 所在位置。

## 7.5 新消息自动更新

当用户继续发送新 prompt 后，扩展自动更新导航栏，不需要刷新网页。

## 7.6 折叠侧边栏

当用户不需要查看 prompt 时间轴时，可以折叠右侧侧边栏。

---

## 8. V1 功能需求

## 8.1 浏览器扩展

项目必须实现为浏览器扩展。

要求：

* 使用 Manifest V3
* 支持 Chrome
* 支持 Microsoft Edge
* 只在已支持的 AI 聊天页面运行
* 不依赖任何外部库
* 不使用后端服务器

允许运行的 URL：

```text
https://chatgpt.com/*
https://chat.deepseek.com/*
```

---

## 8.2 右侧 Prompt Timeline 侧边栏

扩展需要在页面右侧注入一个固定侧边栏。

要求：

* 侧边栏固定在页面右侧
* 不遮挡主要聊天内容
* 不遮挡输入框
* 不严重影响原始页面布局
* 支持折叠和展开
* 默认展开
* 样式简洁，不需要复杂 UI

侧边栏标题建议：

```text
Prompt Navigator
```

或者：

```text
Prompts
```

每个 prompt item 显示格式：

```text
Prompt 1：preview text...
Prompt 2：preview text...
Prompt 3：preview text...
```

---

## 8.3 Prompt 扫描

扩展需要自动识别当前已支持平台页面中的用户消息。

V1 支持平台：

* ChatGPT
* DeepSeek

要求：

* 只识别用户自己发送的消息
* 不把 AI 回答加入导航栏
* 按页面出现顺序编号
* 编号格式为 Prompt 1、Prompt 2、Prompt 3
* 每条 prompt 显示内容包括 prompt 编号和前 50 个字符
* 如果超过 50 个字符，用省略号表示
* 支持中文、英文以及中英文混合 prompt
* 避免重复添加同一条 prompt

示例：

```text
Prompt 1：我现在想做一个类似 Gemini Voyager 的...
Prompt 2：我是否需要写一份简明的 PRD...
Prompt 3：帮我生成一份符合我需求的 prd.md...
```

---

## 8.4 统一 Prompt 数据结构

由于不同 AI 聊天网页的 DOM 结构不同，每个平台的用户消息识别逻辑可以不同。

但是，每个平台 adapter 输出结果必须统一为以下结构：

```js
{
  id: string,
  text: string,
  element: HTMLElement
}
```

字段说明：

* `id`：该 prompt 的临时唯一标识
* `text`：用户 prompt 文本
* `element`：对应页面中的 DOM 元素，用于点击跳转

---

## 8.5 点击跳转

用户点击侧边栏中的某条记录后，页面应滚动到对应的用户消息位置。

要求：

* 使用平滑滚动
* 滚动后该消息应尽量出现在页面中上部或中部
* 可以短暂高亮目标消息，方便用户确认跳转位置

建议实现方式：

```js
element.scrollIntoView({
  behavior: "smooth",
  block: "center"
});
```

---

## 8.6 实时更新

扩展需要监听页面变化。

要求：

* 使用 `MutationObserver`
* 当新用户消息出现时，自动刷新 prompt 列表
* 不需要用户手动刷新页面
* 避免重复添加同一条 prompt
* 避免过于频繁地重复渲染
* 如有必要，使用 debounce 机制

---

## 8.7 折叠与展开

侧边栏应支持折叠和展开。

要求：

* 展开时显示完整 prompt 列表
* 折叠时只显示一个小按钮或窄条
* 点击按钮可以重新展开
* 折叠状态可以暂时不持久化，V1 不强制保存用户偏好

---

## 8.8 多平台适配器设计

由于 ChatGPT 和 DeepSeek 的页面结构不同，本项目需要采用平台适配器设计。

核心逻辑应尽量保持通用：

* 创建侧边栏
* 渲染 prompt 列表
* 点击跳转
* 折叠 / 展开
* MutationObserver 自动更新
* 防止重复渲染

不同平台只负责提供各自的用户消息识别逻辑。

建议设计：

```text
platformAdapters = {
  chatgpt: {...},
  deepseek: {...}
}
```

每个平台适配器需要提供：

```js
{
  name: "ChatGPT",
  match: () => boolean,
  getUserMessages: () => Array<{ id, text, element }>
}
```

ChatGPT adapter 示例：

```js
{
  name: "ChatGPT",
  match: () => location.hostname.includes("chatgpt.com"),
  getUserMessages: () => [...]
}
```

DeepSeek adapter 示例：

```js
{
  name: "DeepSeek",
  match: () => location.hostname.includes("chat.deepseek.com"),
  getUserMessages: () => [...]
}
```

V1 阶段可以先不拆分成多个文件，但代码中必须保留清晰的平台适配结构，方便后续扩展。

---

## 8.9 隐私要求

隐私是本项目的核心要求之一。

V1 必须满足：

* 不上传任何聊天内容
* 不请求任何外部服务器
* 不使用第三方分析工具
* 不使用远程脚本
* 不收集用户数据
* 不保存完整聊天记录
* 所有处理都在本地浏览器中完成

浏览器权限应尽量最小化。

只允许在以下页面运行：

```text
https://chatgpt.com/*
https://chat.deepseek.com/*
```

---

## 9. 技术要求

## 9.1 浏览器扩展规范

使用：

```text
Manifest V3
```

目标浏览器：

* Chrome
* Microsoft Edge

## 9.2 不使用外部依赖

V1 不允许使用：

* React
* Vue
* Svelte
* jQuery
* npm 包
* 外部 CDN
* 后端服务
* 外部 API
* 数据库服务器

只使用原生：

* HTML
* CSS
* JavaScript
* Chrome Extension API

---

## 9.3 推荐文件结构

V1 推荐文件结构：

```text
ai-conversation-navigator/
├── PRD.md
├── README.md
├── manifest.json
├── content.js
└── styles.css
```

各文件作用：

```text
PRD.md：产品需求文档
README.md：安装、运行、测试说明
manifest.json：浏览器扩展配置文件
content.js：注入 AI 聊天网页并实现核心逻辑
styles.css：侧边栏样式
```

V1 稳定后，可以再重构为：

```text
ai-conversation-navigator/
├── PRD.md
├── README.md
├── manifest.json
├── content.js
├── styles.css
├── adapters/
│   ├── chatgpt.js
│   └── deepseek.js
├── core/
│   ├── sidebar.js
│   └── observer.js
└── docs/
    └── development-notes.md
```

第一阶段不要求立刻拆成复杂目录，优先保证功能可运行。

---

## 10. UI 要求

## 10.1 侧边栏布局

建议布局：

```text
+-----------------------------+
| Prompt Navigator        [<] |
+-----------------------------+
| Prompt 1                   |
| 帮我分析这个项目结构...       |
+-----------------------------+
| Prompt 2                   |
| 现在我应该怎么让 Codex...     |
+-----------------------------+
| Prompt 3                   |
| 这个报错是什么意思...         |
+-----------------------------+
```

## 10.2 样式要求

* 简洁
* 清晰
* 不花哨
* 与 ChatGPT / DeepSeek 页面风格不冲突
* 字体大小适中
* prompt item 可点击
* hover 时有轻微视觉反馈
* 折叠按钮明显可见

## 10.3 高亮要求

点击某个 prompt 后，可以短暂高亮对应的用户消息。

高亮时间建议：

```text
1 到 2 秒
```

高亮效果应轻量，不应破坏原网页布局。

---

## 11. 后续版本规划

## V1：Multi-platform Prompt Timeline Navigator

核心问题：

用户需要在长 AI 对话中快速跳转到任意一轮自己发送的 prompt。

支持平台：

* ChatGPT
* DeepSeek

功能：

* 右侧 prompt 时间轴
* Prompt 编号
* Prompt 内容预览
* 点击跳转
* 自动更新
* 折叠 / 展开侧边栏
* 平台适配器结构

---

## V2：搜索与固定

核心问题：

用户需要更快找到重要 prompt。

计划功能：

* 按关键词搜索 prompt
* 固定重要 prompt
* 高亮当前所在 prompt
* 手动刷新按钮
* 保存 pinned prompt 到本地浏览器存储

---

## V3：导出功能

核心问题：

用户需要保存或复用对话结构。

计划功能：

* 导出 prompt 时间轴为 Markdown
* 导出完整对话为 Markdown
* 导出 JSON
* 一键复制 prompt map

---

## V4：Prompt Library / Prompt Vault

核心问题：

用户需要保存和复用常用 prompt。

计划功能：

* 保存选中的 prompt 到 prompt library
* 添加标题
* 添加标签
* 搜索 prompt library
* 一键复制常用 prompt
* 导入 / 导出 prompt library

---

## V5：文件夹与对话管理

核心问题：

用户需要按项目或主题组织大量 AI 对话。

计划功能：

* 自定义文件夹
* 将对话加入文件夹
* 重命名文件夹
* 移动对话
* 本地保存对话组织信息

---

## V6：备份与可选同步

核心问题：

用户可能希望在不同设备之间迁移配置。

计划功能：

* 手动导出配置 JSON
* 手动导入配置 JSON
* 可选的未来同步机制
* 默认仍采用本地优先策略

---

## 12. 平台功能差异说明

不同平台的 DOM 结构、页面行为和对话历史加载机制可能不同。

因此，部分功能可能是平台通用的，部分功能可能是平台专属的。

| 功能              | ChatGPT | DeepSeek |
| --------------- | ------- | -------- |
| Prompt Timeline | V1 支持   | V1 支持    |
| 点击跳转            | V1 支持   | V1 支持    |
| 自动更新            | V1 支持   | V1 支持    |
| 搜索 prompt       | 后续支持    | 后续支持     |
| Pin prompt      | 后续支持    | 后续支持     |
| 导出对话            | 后续评估    | 后续评估     |
| 文件夹管理           | 后续评估    | 后续评估     |
| Prompt Vault    | 后续支持    | 后续支持     |

如果某个平台页面结构变化导致 prompt 识别失效，应优先修改该平台 adapter，而不是修改通用 UI 逻辑。

---

## 13. V1 验收标准

V1 完成后，需要满足以下条件：

* 打开 `https://chatgpt.com/*` 对话页面后，右侧出现 prompt 导航栏
* 打开 `https://chat.deepseek.com/*` 对话页面后，右侧出现 prompt 导航栏
* 两个平台都能列出当前页面中所有用户 prompt
* 不应把 AI 回答误识别为用户 prompt
* 每个 prompt 编号正确
* 每个 prompt 显示前 50 个字符
* prompt 超过 50 个字符时显示省略号
* 点击某个 prompt 后，页面能平滑滚动到对应用户消息
* 用户继续发送新消息后，导航栏自动更新
* 侧边栏可以折叠和展开
* 扩展只在指定页面运行
* 扩展不向外部服务器发送任何请求
* 扩展不使用第三方依赖
* 扩展不保存完整聊天内容
* 卸载或关闭扩展后，原网页恢复原状

---

## 14. 已知风险

## 14.1 页面 DOM 变化风险

ChatGPT 和 DeepSeek 的网页结构可能会更新。

如果平台更新 DOM，prompt 识别逻辑可能失效。

应对方式：

* 将平台相关逻辑放在 adapter 中
* 尽量避免过度依赖脆弱的 class name
* 使用多种选择器 fallback
* 在 README 中记录已知限制

## 14.2 多平台适配复杂度

不同 AI 平台的用户消息结构不同。

应对方式：

* V1 只支持 ChatGPT 和 DeepSeek
* 不要在 V1 中适配过多平台
* 保持通用 UI 和平台 adapter 分离

## 14.3 隐私风险

浏览器扩展可以读取网页内容，因此必须严格限制权限。

应对方式：

* 只申请必要页面权限
* 不上传数据
* 不引入远程脚本
* 不使用分析工具
* README 中明确隐私说明

## 14.4 功能范围膨胀风险

如果一开始就实现 folder、vault、export、sync，项目会快速变复杂。

应对方式：

* V1 只做 prompt timeline
* 后续功能按版本逐步实现
* 每轮 Codex 只处理一个小任务

---

## 15. 开发原则

本项目应采用小步迭代方式开发。

原则：

1. 先实现最小可用版本
2. 先跑通 ChatGPT + DeepSeek 的 prompt timeline
3. 优先保证本地可运行
4. 优先保证不上传数据
5. 优先保证代码可读、可维护
6. 不提前实现后续复杂功能
7. 平台相关逻辑和通用 UI 逻辑分离
8. 每次修改后都需要说明改了什么、如何测试

推荐顺序：

1. 根据 PRD 创建 V1 项目结构
2. 实现浏览器扩展基本加载
3. 注入右侧侧边栏
4. 实现 ChatGPT prompt 识别
5. 实现 DeepSeek prompt 识别
6. 实现点击跳转
7. 实现 MutationObserver 自动更新
8. 实现折叠 / 展开
9. 手动测试两个平台
10. 再考虑 V2 搜索与 pin 功能

---

## 16. 给 Codex 的开发要求

请 Codex 严格遵守以下要求：

1. 当前阶段只实现 V1。
2. 不要提前实现 V2、V3、V4、V5、V6。
3. 不要加入复杂架构。
4. 不要使用外部依赖。
5. 不要使用后端服务。
6. 不要上传任何聊天内容。
7. 不要引入账号系统。
8. 不要实现跨设备同步。
9. 不要复制 Gemini Voyager 的源码。
10. 可以参考 Gemini Voyager 的产品结构和功能分层思路。
11. 代码应尽量简单、清晰、可维护。
12. 代码结构中应体现平台适配器思想。
13. 每次修改后，请用中文解释：

    * 修改了哪些文件
    * 每个文件的作用
    * 如何加载扩展
    * 如何测试功能
    * 当前还存在什么限制

---

## 17. Codex 回答语言要求

Codex 在本项目中的所有回复都必须使用中文。

包括但不限于：

* 修改说明
* 测试步骤
* 报错分析
* 文件解释
* 后续建议
* Git 提交说明
* README 说明

代码中的变量名、函数名、文件名可以使用英文。

但是解释性文字必须使用中文。

---

## 18. 第一轮开发任务

请根据本 PRD 实现 V1：Multi-platform Prompt Timeline Navigator。

具体要求：

1. 创建 `manifest.json`
2. 创建 `content.js`
3. 创建 `styles.css`
4. 创建 `README.md`
5. 使用 Manifest V3
6. 只在以下页面运行：

   * `https://chatgpt.com/*`
   * `https://chat.deepseek.com/*`
7. 在页面右侧注入一个可折叠侧边栏
8. 自动识别当前页面中的用户 prompt
9. 支持 ChatGPT 用户 prompt 识别
10. 支持 DeepSeek 用户 prompt 识别
11. 显示 Prompt 1、Prompt 2、Prompt 3 等编号
12. 显示每条 prompt 的前 50 个字符
13. 点击 prompt 后平滑滚动到对应消息
14. 使用 `MutationObserver` 自动监听新 prompt
15. 不上传任何聊天内容
16. 不依赖外部库
17. 代码中体现平台 adapter 结构
18. 完成后用中文说明如何在 Chrome/Edge 中加载本地扩展并测试

---

## 19. 第一轮 Codex Prompt

你可以直接把下面这段发给 Codex：

```text
请先阅读项目根目录中的 PRD.md。

这个项目的长期目标是做一个类似 Gemini Voyager 用途的多平台 AI 对话导航浏览器扩展，但当前阶段只允许实现 V1。

请参考 Gemini Voyager 的产品结构和功能分层思路，但不要复制它的源码。

我希望我的项目最终也具备类似的用途：

- timeline navigation
- folder organization
- prompt vault
- chat export

但是当前阶段请严格只实现 V1：

- ChatGPT + DeepSeek prompt timeline
- 右侧侧边栏
- 点击 prompt 后跳转到对应消息
- 新 prompt 自动更新
- 本地运行
- 不上传数据
- 不使用后端
- 不使用外部依赖

请根据 PRD.md 实现 V1，并在代码结构中预留后续模块扩展位置。

具体要求：

1. 使用 Manifest V3。
2. 支持：
   - https://chatgpt.com/*
   - https://chat.deepseek.com/*
3. 在页面右侧注入一个可折叠侧边栏。
4. 自动识别当前页面中的用户 prompt。
5. 按顺序显示 Prompt 1、Prompt 2、Prompt 3。
6. 每个 prompt 显示前 50 个字符作为预览。
7. 点击某个 prompt 后，平滑滚动到对应用户消息。
8. 使用 MutationObserver 监听页面变化并自动更新 prompt 列表。
9. 代码中要体现平台适配器思想，例如 ChatGPT adapter 和 DeepSeek adapter，方便以后继续适配 Gemini、Claude 等平台。
10. 不要上传任何聊天内容。
11. 不要复制 Gemini Voyager 的源码。
12. 不要提前实现 folder、prompt vault、export、sync 等后续功能。

请创建或修改以下文件：

- manifest.json
- content.js
- styles.css
- README.md

非常重要：

后续所有解释、总结、测试步骤、报错分析都请使用中文。
代码中的变量名、函数名、文件名可以使用英文，但说明性文字必须是中文。

完成后请说明：

1. 创建或修改了哪些文件。
2. 每个文件的作用是什么。
3. 如何在 Chrome 或 Edge 中加载本地扩展。
4. 如何分别在 ChatGPT 和 DeepSeek 中测试。
5. 当前版本有哪些限制。
```

---

## 20. README 基本要求

Codex 生成的 `README.md` 至少应包含以下内容：

```md
# AI Conversation Navigator

## 项目简介

这是一个面向 ChatGPT 和 DeepSeek 的浏览器扩展，用于在长 AI 对话中快速定位用户 prompt。

## 当前功能

- Prompt 时间轴
- 点击跳转
- 自动更新
- 支持 ChatGPT
- 支持 DeepSeek
- 本地运行，不上传数据

## 安装方式

1. 打开 Chrome 或 Edge
2. 进入扩展管理页面
3. 开启开发者模式
4. 点击“加载已解压的扩展”
5. 选择本项目文件夹

## 测试方式

1. 打开 ChatGPT 对话页面
2. 检查右侧是否出现 Prompt Navigator
3. 检查是否列出所有用户 prompt
4. 点击某个 prompt，检查是否跳转到对应位置
5. 打开 DeepSeek 对话页面，重复以上测试

## 隐私说明

本扩展只读取当前网页中可见的用户 prompt，用于生成本地导航栏。
本扩展不会上传、保存或分析用户聊天内容。

## 当前限制

- 页面 DOM 变化可能导致识别失效
- V1 只支持 ChatGPT 和 DeepSeek
- V1 不支持搜索、pin、导出、文件夹管理
```

---

## 21. 开发策略总结

本项目不应一开始就复刻完整 Gemini Voyager。

正确策略是：

```text
第一步：实现 ChatGPT + DeepSeek 的 Prompt Timeline
第二步：修复两个平台的 DOM 识别稳定性
第三步：增加搜索和 pin
第四步：增加 Markdown / JSON 导出
第五步：增加 Prompt Vault
第六步：增加文件夹管理
第七步：考虑备份与可选同步
```

当前最重要的是：

```text
V1 = ChatGPT + DeepSeek 的 Prompt Timeline Navigator
```

只要 V1 稳定可用，后续功能可以逐步迭代。

````

你发给 Codex 时，建议先发一句：

```text
请先阅读 PRD.md，然后严格只实现第 18 和第 19 节描述的 V1。不要实现后续版本功能。
````
