import { getSettings, saveSettings } from "./storage.js";

const form = document.querySelector("#settings-form");
const status = document.querySelector("#status");
const testApiButton = document.querySelector("#test-api");
const nativeLanguageSelect = document.querySelector("#nativeLanguage");
const uiLanguageInput = document.querySelector("#uiLanguage");
const localeButtons = Array.from(document.querySelectorAll(".locale-button"));

const FIELDS = [
  "uiLanguage",
  "enabled",
  "apiBaseUrl",
  "apiKey",
  "model",
  "nativeLanguage",
  "translateIncoming",
  "translateOutgoing",
  "showOriginalText",
  "autoPlayTranslatedSpeech",
  "debugMode"
];

const SUPPORTED_NATIVE_LANGUAGES = [
  { value: "Chinese (Simplified)", zh: "简体中文", en: "Chinese (Simplified)" },
  { value: "Chinese (Traditional)", zh: "繁體中文", en: "Chinese (Traditional)" },
  { value: "English", zh: "英语", en: "English" },
  { value: "Japanese", zh: "日语", en: "Japanese" },
  { value: "Korean", zh: "韩语", en: "Korean" },
  { value: "Spanish", zh: "西班牙语", en: "Spanish" },
  { value: "French", zh: "法语", en: "French" },
  { value: "German", zh: "德语", en: "German" },
  { value: "Russian", zh: "俄语", en: "Russian" },
  { value: "Portuguese", zh: "葡萄牙语", en: "Portuguese" },
  { value: "Arabic", zh: "阿拉伯语", en: "Arabic" },
  { value: "Hindi", zh: "印地语", en: "Hindi" },
  { value: "Turkish", zh: "土耳其语", en: "Turkish" },
  { value: "Vietnamese", zh: "越南语", en: "Vietnamese" },
  { value: "Thai", zh: "泰语", en: "Thai" },
  { value: "Indonesian", zh: "印度尼西亚语", en: "Indonesian" },
  { value: "Italian", zh: "意大利语", en: "Italian" }
];

const UI_COPY = {
  "zh-CN": {
    documentTitle: "OmeTV Translator Bridge 设置",
    eyebrow: "OMETV 翻译桥接",
    pageTitle: "扩展设置",
    intro: "该项目面向开源自托管使用。每位用户都需要提供自己的兼容 AI API。",
    enabled: "启用扩展",
    apiBaseUrl: "API 基础 URL",
    apiKey: "API 密钥",
    model: "模型",
    nativeLanguage: "你的母语",
    translateIncoming: "把收到的信息翻译成我的语言",
    translateOutgoing: "发送前翻译我的消息",
    showOriginalText: "在翻译旁边显示原文",
    autoPlayTranslatedSpeech: "将语音播报模式保留给未来版本",
    debugMode: "在 OmeTV 页面启用调试日志",
    save: "保存设置",
    testApi: "测试 API",
    saveStatus: "设置已保存。如果 OmeTV 页面已经打开，请刷新标签页。",
    testingStatus: "正在测试 API 连接...",
    testFailed: "API 测试失败：",
    testPassedPrefix: "API 测试通过。",
    detectedPrefix: "检测到：",
    samplePrefix: "示例："
  },
  en: {
    documentTitle: "OmeTV Translator Bridge Settings",
    eyebrow: "OMETV Translator Bridge",
    pageTitle: "Extension Settings",
    intro: "This project is designed for open-source self-hosted usage. Every user brings their own compatible AI API.",
    enabled: "Enable extension",
    apiBaseUrl: "API base URL",
    apiKey: "API key",
    model: "Model",
    nativeLanguage: "Your native language",
    translateIncoming: "Translate incoming messages into my language",
    translateOutgoing: "Translate my messages before sending",
    showOriginalText: "Show original text next to translations",
    autoPlayTranslatedSpeech: "Reserve speech playback mode for a future version",
    debugMode: "Enable debug logs on the OmeTV page",
    save: "Save Settings",
    testApi: "Test API",
    saveStatus: "Saved. Reload the OmeTV tab if it is already open.",
    testingStatus: "Testing API connection...",
    testFailed: "API test failed:",
    testPassedPrefix: "API test passed.",
    detectedPrefix: "Detected:",
    samplePrefix: "Sample:"
  }
};

bootstrap();

async function bootstrap() {
  const settings = await getSettings();
  renderLocalizedPage(settings.uiLanguage, settings.nativeLanguage);
  applyToForm(settings);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nextSettings = collectFromForm();
  await saveSettings(nextSettings);

  status.textContent = getCopy(nextSettings.uiLanguage).saveStatus;
  setTimeout(() => {
    status.textContent = "";
  }, 2500);
});

testApiButton.addEventListener("click", async () => {
  const nextSettings = collectFromForm();
  const copy = getCopy(nextSettings.uiLanguage);

  status.textContent = copy.testingStatus;
  await saveSettings(nextSettings);

  const response = await chrome.runtime.sendMessage({ type: "settings:test-api" });

  if (!response?.ok) {
    status.textContent = `${copy.testFailed} ${response?.error || "Unknown error."}`;
    return;
  }

  status.textContent = [
    copy.testPassedPrefix,
    `${copy.detectedPrefix} ${response.result.detectedLanguage}.`,
    `${copy.samplePrefix} ${response.result.translation}`
  ].join(" ");
});

localeButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const nextLanguage = button.dataset.locale || "zh-CN";
    const draftSettings = collectFromForm();

    draftSettings.uiLanguage = nextLanguage;
    uiLanguageInput.value = nextLanguage;

    renderLocalizedPage(nextLanguage, draftSettings.nativeLanguage);
    applyToForm(draftSettings);
    status.textContent = "";

    await saveSettings(draftSettings);
  });
});

function applyToForm(settings) {
  for (const fieldName of FIELDS) {
    const field = document.querySelector(`#${fieldName}`);

    if (!field) {
      continue;
    }

    if (field.type === "checkbox") {
      field.checked = Boolean(settings[fieldName]);
    } else {
      field.value = settings[fieldName] ?? "";
    }
  }
}

function collectFromForm() {
  return FIELDS.reduce((accumulator, fieldName) => {
    const field = document.querySelector(`#${fieldName}`);

    if (!field) {
      return accumulator;
    }

    accumulator[fieldName] = field.type === "checkbox" ? field.checked : field.value.trim();
    return accumulator;
  }, {});
}

function renderLocalizedPage(uiLanguage, currentNativeLanguage) {
  const copy = getCopy(uiLanguage);

  document.documentElement.lang = uiLanguage;
  document.title = copy.documentTitle;

  setText("#eyebrow", copy.eyebrow);
  setText("#page-title", copy.pageTitle);
  setText("#intro", copy.intro);
  setText("#label-enabled", copy.enabled);
  setText("#label-apiBaseUrl", copy.apiBaseUrl);
  setText("#label-apiKey", copy.apiKey);
  setText("#label-model", copy.model);
  setText("#label-nativeLanguage", copy.nativeLanguage);
  setText("#label-translateIncoming", copy.translateIncoming);
  setText("#label-translateOutgoing", copy.translateOutgoing);
  setText("#label-showOriginalText", copy.showOriginalText);
  setText("#label-autoPlayTranslatedSpeech", copy.autoPlayTranslatedSpeech);
  setText("#label-debugMode", copy.debugMode);
  setText("#save-button", copy.save);
  setText("#test-api", copy.testApi);

  renderNativeLanguageOptions(uiLanguage, currentNativeLanguage);
  updateLocaleButtons(uiLanguage);
}

function renderNativeLanguageOptions(uiLanguage, selectedValue) {
  const labelKey = uiLanguage === "en" ? "en" : "zh";

  nativeLanguageSelect.replaceChildren();

  for (const item of SUPPORTED_NATIVE_LANGUAGES) {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item[labelKey];
    nativeLanguageSelect.append(option);
  }

  if (selectedValue && !SUPPORTED_NATIVE_LANGUAGES.some((item) => item.value === selectedValue)) {
    const customOption = document.createElement("option");
    customOption.value = selectedValue;
    customOption.textContent = selectedValue;
    nativeLanguageSelect.append(customOption);
  }
}

function updateLocaleButtons(uiLanguage) {
  for (const button of localeButtons) {
    const isActive = button.dataset.locale === uiLanguage;
    button.classList.toggle("is-active", isActive);
  }
}

function getCopy(uiLanguage) {
  return UI_COPY[uiLanguage] || UI_COPY["zh-CN"];
}

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}
