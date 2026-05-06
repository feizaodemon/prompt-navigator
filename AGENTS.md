# 项目级 Codex 指令

## 语言要求

- 本项目的产品需求文档 `PRD.md` 使用中文。
- 请用中文理解需求，并用中文回答用户。
- 所有解释、总结、测试步骤、报错分析、README 说明、Git 提交说明都必须使用中文。
- 代码中的文件名、变量名、函数名可以使用英文。
- 代码注释优先使用简洁中文；如果技术名词用英文更清楚，可以保留英文。

## 开发范围

- 当前阶段只实现 V1：ChatGPT Prompt Timeline Navigator。
- DeepSeek support 暂缓：DeepSeek 页面存在懒加载 / 虚拟滚动问题，历史 prompt 不一定全部存在于 DOM 中。
- 不要提前实现 V2/V3/V4/V5/V6。
- 不要实现 folder、prompt vault、export、sync、账号系统或后端服务。
- 不要复制 Gemini Voyager 的源码，只参考其产品结构和功能分层思路。

## 技术要求

- 使用 Manifest V3。
- 当前只支持：
  - https://chatgpt.com/*
- 暂时不要在 manifest 中启用 https://chat.deepseek.com/*
- 不使用外部依赖。
- 不使用后端服务。
- 不上传任何聊天内容。
- 不使用远程脚本或外部分析工具。
- 代码结构中需要体现平台 adapter 思想，当前只启用 ChatGPT adapter，方便以后单独恢复 DeepSeek 或适配更多 AI 聊天平台。

## 回复要求

每次修改后，请用中文说明：

1. 修改了哪些文件
2. 每个文件的作用
3. 如何测试
4. 当前限制
5. 下一步建议
