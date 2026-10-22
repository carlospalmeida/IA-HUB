const STORAGE_KEY = "iahub.workspace.v1";
const STORAGE_VERSION = 1;
const MAX_CONVERSATIONS = 100;
const MAX_MESSAGES_PER_CONVERSATION = 500;

const defaultPreferences = {
  theme: "dark",
  selectedProvider: "openai",
  selectedConversation: "auth",
  temperature: 0.7,
  maxTokens: 4000,
  providerConfigs: {}
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== "object") return null;
  const input = Number(usage.input_tokens ?? usage.prompt_tokens);
  const output = Number(usage.output_tokens ?? usage.completion_tokens);
  const total = Number(usage.total_tokens);
  if (![input, output, total].some((value) => Number.isFinite(value))) return null;
  return {
    input_tokens: Number.isFinite(input) ? Math.max(0, input) : 0,
    output_tokens: Number.isFinite(output) ? Math.max(0, output) : 0,
    total_tokens: Number.isFinite(total) ? Math.max(0, total) : Math.max(0, input || 0) + Math.max(0, output || 0)
  };
}

function normalizeMessage(message = {}) {
  return {
    role: message.role === "assistant" ? "assistant" : "user",
    provider: typeof message.provider === "string" ? message.provider : undefined,
    time: typeof message.time === "string" ? message.time.slice(0, 40) : "agora",
    content: typeof message.content === "string" ? message.content.slice(0, 100000) : "",
    createdAt: Number.isFinite(Number(message.createdAt)) ? Number(message.createdAt) : null,
    usage: normalizeUsage(message.usage)
  };
}

function normalizeConversation(conversation = {}, index = 0) {
  const messages = Array.isArray(conversation.messages) ? conversation.messages.slice(0, MAX_MESSAGES_PER_CONVERSATION).map(normalizeMessage) : [];
  const fallbackTitle = messages.find((message) => message.role === "user")?.content.slice(0, 42) || "Nova conversa";
  const remoteTaskIds = conversation.remoteTaskIds && typeof conversation.remoteTaskIds === "object" ? Object.fromEntries(Object.entries(conversation.remoteTaskIds).filter(([key, value]) => typeof key === "string" && typeof value === "string").map(([key, value]) => [key.slice(0, 40), value.slice(0, 100)])) : {};
  if (typeof conversation.remoteTaskId === "string" && conversation.remoteTaskId && !remoteTaskIds.manus) remoteTaskIds.manus = conversation.remoteTaskId.slice(0, 100);
  return {
    id: typeof conversation.id === "string" && conversation.id ? conversation.id.slice(0, 120) : `conversation-${index + 1}`,
    title: typeof conversation.title === "string" && conversation.title.trim() ? conversation.title.trim().slice(0, 120) : fallbackTitle,
    provider: typeof conversation.provider === "string" ? conversation.provider : "openai",
    time: typeof conversation.time === "string" ? conversation.time.slice(0, 40) : "agora",
    preview: typeof conversation.preview === "string" ? conversation.preview.slice(0, 180) : "Conversa vazia",
    remoteTaskIds,
    usage: normalizeUsage(conversation.usage),
    messages
  };
}

function normalizePreferences(preferences = {}) {
  const configs = preferences.providerConfigs && typeof preferences.providerConfigs === "object" ? preferences.providerConfigs : {};
  const providerConfigs = Object.fromEntries(Object.entries(configs).map(([provider, config]) => [provider, {
    model: typeof config?.model === "string" ? config.model.slice(0, 120) : "",
    customName: typeof config?.customName === "string" ? config.customName.slice(0, 120) : "",
    systemPrompt: typeof config?.systemPrompt === "string" ? config.systemPrompt.slice(0, 10000) : "",
    temperature: Number.isFinite(Number(config?.temperature)) ? Math.min(2, Math.max(0, Number(config.temperature))) : null,
    maxTokens: Number.isFinite(Number(config?.maxTokens)) ? Math.min(128000, Math.max(256, Number(config.maxTokens))) : null
  }]));
  return {
    ...defaultPreferences,
    theme: preferences.theme === "light" ? "light" : "dark",
    selectedProvider: typeof preferences.selectedProvider === "string" ? preferences.selectedProvider : defaultPreferences.selectedProvider,
    selectedConversation: typeof preferences.selectedConversation === "string" ? preferences.selectedConversation : defaultPreferences.selectedConversation,
    temperature: Number.isFinite(Number(preferences.temperature)) ? Math.min(1, Math.max(0, Number(preferences.temperature))) : defaultPreferences.temperature,
    maxTokens: Number.isFinite(Number(preferences.maxTokens)) ? Math.min(128000, Math.max(256, Number(preferences.maxTokens))) : defaultPreferences.maxTokens,
    providerConfigs
  };
}

function normalizeWorkspace(workspace, fallback) {
  const conversations = Array.isArray(workspace?.conversations) && workspace.conversations.length
    ? workspace.conversations.slice(0, MAX_CONVERSATIONS).map(normalizeConversation)
    : clone(fallback.conversations).map(normalizeConversation);
  const preferences = normalizePreferences({ ...fallback.preferences, ...(workspace?.preferences ?? {}) });
  if (!conversations.some((conversation) => conversation.id === preferences.selectedConversation)) preferences.selectedConversation = conversations[0].id;
  return { version: STORAGE_VERSION, conversations, preferences };
}

export function loadWorkspace(seed) {
  const fallback = { version: STORAGE_VERSION, conversations: clone(seed.conversations), preferences: normalizePreferences(seed.preferences) };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return normalizeWorkspace(JSON.parse(raw), fallback);
  } catch {
    return fallback;
  }
}

export function saveWorkspace(workspace) {
  try {
    const safeWorkspace = normalizeWorkspace(workspace, workspace);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeWorkspace));
    return true;
  } catch {
    return false;
  }
}

export function clearWorkspace() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function conversationToMarkdown(conversation, providerNames = {}) {
  const nameFor = (key) => providerNames[key] ?? key ?? "IA";
  const lines = [`# ${conversation.title}`, "", `- Provedor principal: ${nameFor(conversation.provider)}`, `- Última atividade: ${conversation.time}`, "", "---", ""];
  conversation.messages.forEach((message) => {
    const author = message.role === "user" ? "Você" : nameFor(message.provider);
    lines.push(`## ${author} · ${message.time}`, "", message.content, "");
  });
  return lines.join("\n");
}

export function conversationToText(conversation, providerNames = {}) {
  const nameFor = (key) => providerNames[key] ?? key ?? "IA";
  return [conversation.title, `Provedor principal: ${nameFor(conversation.provider)}`, "", ...conversation.messages.flatMap((message) => {
    const author = message.role === "user" ? "Você" : nameFor(message.provider);
    return [`[${message.time}] ${author}:`, message.content, ""];
  })].join("\n");
}

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportConversation(conversation, format, providerNames = {}) {
  const safeBaseName = conversation.title.toLowerCase().replace(/[^a-z0-9áéíóúãõç]+/gi, "-").replace(/^-|-$/g, "") || "conversa-iahub";
  if (format === "json") {
    downloadFile(`${safeBaseName}.json`, JSON.stringify(conversation, null, 2), "application/json;charset=utf-8");
    return;
  }
  if (format === "markdown") {
    downloadFile(`${safeBaseName}.md`, conversationToMarkdown(conversation, providerNames), "text/markdown;charset=utf-8");
    return;
  }
  downloadFile(`${safeBaseName}.txt`, conversationToText(conversation, providerNames), "text/plain;charset=utf-8");
}

export { STORAGE_KEY, STORAGE_VERSION };
