const PANEL_ID = "ometv-translator-bridge-panel";
const PANEL_STATUS_ID = "ometv-translator-status";
const PANEL_HINT_ID = "ometv-translator-hint";
const PARTNER_MESSAGE_SELECTORS = [
  "[data-testid*='message']",
  "[class*='message']",
  "[class*='chat'] [class*='bubble']",
  "[class*='chat'] p",
  "[class*='chat'] div"
];
const INPUT_SELECTORS = [
  "textarea",
  "input[type='text']",
  "[contenteditable='true']"
];
const SEND_BUTTON_SELECTORS = [
  "button[type='submit']",
  "button[aria-label*='send' i]",
  "button[class*='send' i]"
];

let currentSettings = null;
let detectedPartnerLanguage = "";
let activeDraftLock = false;

bootstrap();

async function bootstrap() {
  const response = await chrome.runtime.sendMessage({ type: "settings:get" });

  if (!response?.ok || !response.settings?.enabled) {
    return;
  }

  currentSettings = response.settings;
  renderPanel(response.settings);
  observeChatSurface();
  installOutgoingTranslator();
  scanExistingMessages();
}

function renderPanel(settings) {
  if (document.getElementById(PANEL_ID)) {
    return;
  }

  const panel = document.createElement("section");
  panel.id = PANEL_ID;
  panel.className = "ometv-translator-panel";
  panel.innerHTML = `
    <strong>OmeTV Translator Bridge</strong>
    <p id="${PANEL_STATUS_ID}">Watching for messages and waiting for the chat UI to settle.</p>
    <p id="${PANEL_HINT_ID}">Partner language will be inferred from incoming text.</p>
    <span class="ometv-translator-badge">${settings.nativeLanguage}</span>
    <button type="button">Open extension settings</button>
  `;

  panel.querySelector("button")?.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  document.body.append(panel);
}

function observeChatSurface() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }

        processNodeTree(node);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function scanExistingMessages() {
  const roots = findMessageCandidates(document.body);

  for (const candidate of roots) {
    void maybeTranslateIncoming(candidate);
  }
}

function processNodeTree(node) {
  const candidates = findMessageCandidates(node);

  if (!candidates.length) {
    void maybeTranslateIncoming(node);
    return;
  }

  for (const candidate of candidates) {
    void maybeTranslateIncoming(candidate);
  }
}

function findMessageCandidates(root) {
  if (!(root instanceof HTMLElement)) {
    return [];
  }

  const directMatch = isLikelyPartnerMessage(root) ? [root] : [];
  const nestedMatches = PARTNER_MESSAGE_SELECTORS.flatMap((selector) =>
    Array.from(root.querySelectorAll(selector))
  ).filter((element) => isLikelyPartnerMessage(element));

  return uniqueElements([...directMatch, ...nestedMatches]);
}

async function maybeTranslateIncoming(node) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  if (!currentSettings?.translateIncoming) {
    return;
  }

  if (node.dataset.ometvTranslatorSeen === "true") {
    return;
  }

  const text = extractCandidateMessage(node);

  if (!text) {
    return;
  }

  node.dataset.ometvTranslatorSeen = "true";
  setPanelStatus(`Translating incoming message to ${currentSettings.nativeLanguage}...`);

  if (currentSettings.debugMode) {
    console.debug("[OmeTV Translator Bridge] Candidate message detected:", text);
  }

  const translation = document.createElement("div");
  translation.className = "ometv-translator-translation";
  translation.textContent = "Translating...";
  node.append(translation);

  try {
    const result = await chrome.runtime.sendMessage({
      type: "translation:run",
      payload: {
        direction: "incoming",
        targetLanguage: currentSettings.nativeLanguage,
        text
      }
    });

    if (!result?.ok) {
      throw new Error(result?.error || "Unknown translation failure.");
    }

    detectedPartnerLanguage = result.result.detectedLanguage || detectedPartnerLanguage;
    translation.textContent = result.result.translation;

    if (currentSettings.showOriginalText) {
      const original = document.createElement("div");
      original.className = "ometv-translator-original";
      original.textContent = `Original: ${text}`;
      node.append(original);
    }

    setPanelStatus("Incoming translation ready.");

    if (detectedPartnerLanguage) {
      setPanelHint(`Detected partner language: ${detectedPartnerLanguage}`);
    }
  } catch (error) {
    translation.classList.add("ometv-translator-error");
    translation.textContent = `Translation failed: ${getErrorMessage(error)}`;
    setPanelStatus("Incoming translation failed. Check API settings.");
  }
}

function extractCandidateMessage(node) {
  const text = node.innerText?.trim();

  if (!text) {
    return "";
  }

  if (node.closest(`#${PANEL_ID}`)) {
    return "";
  }

  if (text.length < 2 || text.length > 320) {
    return "";
  }

  if (text.includes("Translating...") || text.includes("Original:")) {
    return "";
  }

  return text;
}

function isLikelyPartnerMessage(node) {
  if (!(node instanceof HTMLElement)) {
    return false;
  }

  if (node.closest(`#${PANEL_ID}`)) {
    return false;
  }

  if (node.children.length > 8) {
    return false;
  }

  const text = node.innerText?.trim() || "";
  const className = typeof node.className === "string" ? node.className : "";
  const ariaLabel = node.getAttribute("aria-label") || "";
  const joinedMeta = `${className} ${ariaLabel}`.toLowerCase();

  if (
    joinedMeta.includes("button") ||
    joinedMeta.includes("toolbar") ||
    joinedMeta.includes("self") ||
    joinedMeta.includes("me") ||
    joinedMeta.includes("local") ||
    joinedMeta.includes("system")
  ) {
    return false;
  }

  if (text.length < 2 || text.length > 320) {
    return false;
  }

  return /\p{L}/u.test(text);
}

function uniqueElements(elements) {
  return [...new Set(elements)];
}

function installOutgoingTranslator() {
  document.addEventListener(
    "keydown",
    async (event) => {
      if (!currentSettings?.translateOutgoing || activeDraftLock) {
        return;
      }

      if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }

      const draft = findDraftElement(event.target);

      if (!draft) {
        return;
      }

      const originalText = readDraftText(draft);

      if (!originalText) {
        return;
      }

      if (!detectedPartnerLanguage) {
        setPanelHint("Send or receive one message first so the extension can infer the partner language.");
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      activeDraftLock = true;
      setPanelStatus(`Translating outgoing message to ${detectedPartnerLanguage}...`);

      try {
        const result = await chrome.runtime.sendMessage({
          type: "translation:run",
          payload: {
            direction: "outgoing",
            targetLanguage: detectedPartnerLanguage,
            text: originalText
          }
        });

        if (!result?.ok) {
          throw new Error(result?.error || "Unknown outgoing translation failure.");
        }

        writeDraftText(draft, result.result.translation);
        setPanelStatus(`Outgoing message translated to ${detectedPartnerLanguage}. Sending...`);
        submitDraft(draft);
      } catch (error) {
        setPanelStatus(`Outgoing translation failed: ${getErrorMessage(error)}`);
      } finally {
        window.setTimeout(() => {
          activeDraftLock = false;
        }, 250);
      }
    },
    true
  );
}

function findDraftElement(target) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  if (INPUT_SELECTORS.some((selector) => target.matches(selector))) {
    return target;
  }

  return target.closest(INPUT_SELECTORS.join(", "));
}

function readDraftText(element) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value.trim();
  }

  return element.innerText?.trim() || "";
}

function writeDraftText(element, text) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.value = text;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }

  element.textContent = text;

  try {
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: text,
        inputType: "insertText"
      })
    );
  } catch {
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function submitDraft(element) {
  const form = element.closest("form");

  if (form) {
    form.requestSubmit();
    return;
  }

  const sendButton =
    element.parentElement?.querySelector(SEND_BUTTON_SELECTORS.join(", ")) ||
    document.querySelector(SEND_BUTTON_SELECTORS.join(", "));

  if (sendButton instanceof HTMLElement) {
    sendButton.click();
    return;
  }

  ["keydown", "keypress", "keyup"].forEach((type) => {
    element.dispatchEvent(
      new KeyboardEvent(type, {
        key: "Enter",
        code: "Enter",
        bubbles: true
      })
    );
  });
}

function setPanelStatus(text) {
  document.getElementById(PANEL_STATUS_ID)?.replaceChildren(text);
}

function setPanelHint(text) {
  document.getElementById(PANEL_HINT_ID)?.replaceChildren(text);
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
