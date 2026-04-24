<div align="center">
  <img src="./assets/logo.svg" alt="OmeTV Translator Bridge Logo" width="104" />
  <h1>OmeTV Translator Bridge</h1>
  <p>一个使用用户自定义 AI 接口配置、用于翻译 OmeTV 聊天内容的浏览器插件原型。</p>
  <p><strong>简体中文</strong> | <a href="./README.en.md">English</a></p>
  <p>
    <img src="https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square" alt="Chrome Manifest V3" />
    <img src="https://img.shields.io/badge/status-prototype-F59E0B?style=flat-square" alt="Prototype status" />
    <img src="https://img.shields.io/badge/testing-not%20tested%20yet-E11D48?style=flat-square" alt="Not tested yet" />
    <img src="https://img.shields.io/github/issues/xiaohaowen21/ometv-translator-bridge?style=flat-square" alt="GitHub issues" />
    <img src="https://img.shields.io/github/stars/xiaohaowen21/ometv-translator-bridge?style=flat-square" alt="GitHub stars" />
    <img src="https://img.shields.io/github/forks/xiaohaowen21/ometv-translator-bridge?style=flat-square" alt="GitHub forks" />
  </p>
</div>

---

> [!WARNING]
> 这个仓库目前还没有在真实 OmeTV 对话环境中完成测试。
> 当前代码应被视为早期原型，而不是可直接投入生产使用的插件。

## 项目说明

`OmeTV Translator Bridge` 是一个开源的 Chrome 插件原型，目标是在 OmeTV 文字聊天中降低语言沟通障碍。

这个项目不内置付费后端，而是围绕“用户自带配置”的方式设计：

- 用户自己填写 `API Base URL`
- 用户自己填写 `API Key`
- 用户自己选择兼容的模型
- 配置通过 `chrome.storage.sync` 保存在本地

## 项目目标

- 自动识别对方来信的语言
- 将对方消息翻译成用户设置的母语
- 从持续对话中推断对方语言
- 在发送前把用户输入草稿翻译成对方语言
- 为后续语音相关实验预留扩展空间

## 当前状态

已实现：

- Chrome Manifest V3 插件基础结构
- API 配置设置页
- 基础状态弹窗
- 面向 OpenAI 兼容接口的后台翻译请求服务
- OmeTV 页面注入状态面板
- 来信消息监听与译文插入
- 在识别对方语言后，对待发送草稿进行翻译
- API 连通性测试按钮

尚未验证：

- 与真实 OmeTV 页面结构的兼容性
- 各种输入状态下发送行为的可靠性
- 对方语言推断的稳定性
- 长时间使用时的可靠性
- 语音输入与语音播报链路

## 快速开始

1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 点击 `加载已解压的扩展程序`
4. 选择当前仓库目录

## 配置方法

打开插件设置页后，填写以下内容：

- `API Base URL`
- `API Key`
- `Model`
- `你的母语`

建议在打开 OmeTV 前先使用 `Test API` 按钮测试接口是否可用。

## 项目结构

- `manifest.json`：插件清单
- `src/background.js`：后台服务与 API 桥接逻辑
- `src/content.js`：OmeTV 页面监听与翻译注入逻辑
- `src/options.*`：设置页
- `src/popup.*`：弹窗界面
- `assets/logo.svg`：README 使用的仓库图标

## 已知限制

- 当前 DOM 定位仍然是启发式方案，后续大概率需要继续调整选择器
- 为兼容 OpenAI 风格接口，目前 host 权限设置得比较宽
- 错误处理仍然比较基础
- 目前还没有自动化测试
- 目前还没有完成真实 OmeTV 场景验证

## 计划路线

- 在真实 OmeTV 页面上完成联调
- 加固页面选择器与消息分类逻辑
- 提高发送前翻译的兼容性
- 增加 API 提供商预设和更强的配置校验
- 评估可选的语音输入与播报方案
