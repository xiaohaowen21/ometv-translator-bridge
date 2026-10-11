export const DEFAULT_SETTINGS = {
  uiLanguage: "zh-CN",
  enabled: true,
  apiBaseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4.1-mini",
  nativeLanguage: "Chinese (Simplified)",
  translateIncoming: true,
  translateOutgoing: true,
  showOriginalText: true,
  autoPlayTranslatedSpeech: false,
  debugMode: false
};

// API 密钥只保存在本机（storage.local），不随浏览器账号同步到其他设备
export async function getSettings() {
  const { apiKey: _syncedKeyDefault, ...syncDefaults } = DEFAULT_SETTINGS;
  const [stored, local] = await Promise.all([
    chrome.storage.sync.get({ ...syncDefaults, apiKey: "" }),
    chrome.storage.local.get({ apiKey: "" })
  ]);

  let apiKey = local.apiKey;

  // 旧版本把密钥存在 sync 里：迁移到 local 并清掉同步副本
  if (stored.apiKey) {
    if (!apiKey) {
      apiKey = stored.apiKey;
      await chrome.storage.local.set({ apiKey });
    }
    await chrome.storage.sync.remove("apiKey");
  }

  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    apiKey
  };
}

export async function saveSettings(nextSettings) {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...nextSettings
  };
  const { apiKey, ...syncable } = merged;

  await Promise.all([
    chrome.storage.sync.set(syncable),
    chrome.storage.local.set({ apiKey: apiKey || "" }),
    chrome.storage.sync.remove("apiKey")
  ]);
  return merged;
}
