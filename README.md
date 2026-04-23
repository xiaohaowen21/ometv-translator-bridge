# OmeTV Translator Bridge

Open-source browser extension prototype for translating OmeTV chats with a user-provided AI API.

## Important Status / 重要状态

**This project has not been tested in real OmeTV conversations yet.**

**这个项目目前还没有在真实 OmeTV 对话环境中完成测试。**

That means the current implementation should be treated as an early prototype.
This means selectors, message detection, submit behavior, and API compatibility may still break in real usage.

这意味着当前实现仍然属于早期原型。
也就是说，页面选择器、消息识别、发送行为以及 API 兼容性在真实使用中都可能出现问题。

## English

### What this project is

`OmeTV Translator Bridge` is a Chrome Manifest V3 extension prototype.
Its goal is to help two users communicate on OmeTV when they speak different languages.

The extension is designed for open-source usage:

- It does not provide any built-in paid API service.
- Each user brings their own API key, base URL, and model.
- The extension stores those settings locally in `chrome.storage.sync`.

### Current goals

- Detect the partner's incoming message language automatically
- Translate incoming messages into the user's native language
- Infer the partner's language from translated messages
- Translate the user's outgoing draft into the partner's language before sending
- Keep the architecture open for future speech features

### What is already implemented

- Chrome MV3 extension scaffold
- Options page for API configuration
- Popup with basic readiness status
- Background service worker for OpenAI-compatible translation requests
- OmeTV page injection panel
- Incoming message observation and translation rendering
- Outgoing draft interception after partner language detection
- API connectivity test button in settings

### What is not proven yet

- Real OmeTV DOM compatibility
- Real submit behavior on all message input states
- Stable partner-language inference quality
- Long-session reliability
- Speech-to-text and text-to-speech routing

### Why speech is not included yet

Speech translation is the hardest part of this idea.
Text translation in a browser extension is relatively straightforward.
Sending translated speech into a live chat audio stream is much harder because it may require WebRTC interception, microphone replacement, or a desktop companion app.

### Local loading

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select this repository folder

### Configuration

Open the extension settings page and fill in:

- `API Base URL`
- `API Key`
- `Model`
- `Your native language`

Then use the `Test API` button before opening OmeTV.

### Current file structure

- `manifest.json`: extension manifest
- `src/background.js`: service worker and API bridge
- `src/content.js`: OmeTV DOM observer and translator injection logic
- `src/options.*`: settings page
- `src/popup.*`: popup UI

### Known limitations

- DOM targeting is heuristic and may require selector tuning
- Broad host permissions are currently enabled for OpenAI-compatible endpoints
- Error handling is still basic
- No automated tests exist yet
- No real-world OmeTV validation has been completed yet

### Roadmap

- Test against the live OmeTV interface
- Harden selectors and message classification
- Improve outgoing send compatibility
- Add provider presets and validation
- Explore optional speech input and playback modes

## 中文

### 这是什么项目

`OmeTV Translator Bridge` 是一个基于 Chrome Manifest V3 的浏览器插件原型。
它的目标是在 OmeTV 上帮助说不同语言的用户进行沟通。

这个项目按开源方式设计：

- 不内置任何收费 API 服务
- 每个用户自己填写 API Key、Base URL 和模型
- 这些配置会保存在本地 `chrome.storage.sync` 中

### 当前目标

- 自动识别对方发来消息的语言
- 将对方消息翻译成用户设置的母语
- 从来信中推断对方语言
- 在发送前把用户输入内容翻译成对方语言
- 为后续语音功能保留架构空间

### 目前已经实现

- Chrome MV3 插件基础结构
- API 配置设置页
- 基础状态弹窗
- 面向 OpenAI 兼容接口的后台翻译请求服务
- OmeTV 页面注入状态面板
- 来信消息监听与译文插入
- 在识别对方语言后，对待发送草稿进行翻译
- 设置页中的 API 连通性测试按钮

### 目前还没有验证的部分

- 与真实 OmeTV 页面结构的兼容性
- 各种输入框状态下的真实发送行为
- 对方语言推断的稳定性
- 长时间使用时的可靠性
- 语音识别与语音播报链路

### 为什么暂时没做语音

语音翻译是整个设想里最难的部分。
文字翻译作为浏览器插件相对容易实现。
但如果要把翻译后的语音真正送进实时聊天音频流，就可能涉及 WebRTC 劫持、虚拟麦克风、或者桌面辅助程序，这会复杂很多。

### 本地加载方法

1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 点击 `加载已解压的扩展程序`
4. 选择当前仓库目录

### 配置方法

进入插件设置页后，填写以下内容：

- `API Base URL`
- `API Key`
- `Model`
- `你的母语`

建议先点击 `Test API` 测试接口是否可用，再打开 OmeTV 页面。

### 当前目录结构

- `manifest.json`：插件清单
- `src/background.js`：后台服务与 API 转发逻辑
- `src/content.js`：OmeTV 页面监听与翻译注入逻辑
- `src/options.*`：设置页
- `src/popup.*`：弹窗界面

### 已知限制

- 当前 DOM 定位仍然是启发式方案，后续大概率需要继续调选择器
- 为了兼容不同 OpenAI 风格接口，目前开放了较宽的 host 权限
- 错误处理还比较基础
- 目前没有自动化测试
- 目前没有完成真实 OmeTV 场景测试

### 计划路线

- 在真实 OmeTV 页面上完成联调
- 加固页面选择器与消息分类逻辑
- 提高发送前翻译的兼容性
- 增加 API 提供商预设和更强的配置校验
- 评估可选的语音输入与播报方案
