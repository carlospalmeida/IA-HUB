import { normalizeMessages, ProviderError, requestJson } from "./provider-interface.js";

const MANUS_API_ROOT = "https://api.manus.ai/v2";
const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24;

function buildTaskPrompt(messages, instructions) {
  const history = normalizeMessages(messages).slice(-12).map((message) => `${message.role === "assistant" ? "Manus" : "Usuário"}: ${message.content}`).join("\n\n");
  return [instructions.trim() ? `Instruções do workspace:\n${instructions.trim()}` : "", "Histórico recente:", history].filter(Boolean).join("\n\n");
}

function latestStatus(messages) {
  return messages.find((event) => event?.type === "status_update")?.status_update?.agent_status;
}

function latestAssistant(messages) {
  return messages.find((event) => event?.type === "assistant_message" && typeof event?.assistant_message?.content === "string")?.assistant_message?.content?.trim();
}

async function pollManus(apiKey, taskId, signal) {
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    const { payload } = await requestJson(`${MANUS_API_ROOT}/task.listMessages?task_id=${encodeURIComponent(taskId)}&order=desc&limit=50`, { method: "GET", headers: { "x-manus-api-key": apiKey.trim() }, signal, provider: "manus" });
    const events = payload?.messages ?? [];
    const status = latestStatus(events);
    const assistantText = latestAssistant(events);
    if (status === "error") throw new ProviderError("Manus task failed", { code: "http_error", status: 502 });
    if (status === "waiting") {
      if (assistantText) return { text: `${assistantText}\n\nManus aguarda sua próxima mensagem para continuar.`, taskId, usage: null, waiting: true };
      throw new ProviderError("Manus is waiting for user input", { code: "awaiting_user" });
    }
    if (assistantText && status === "stopped") return { text: assistantText, taskId, usage: null };
    await new Promise((resolve, reject) => { const timer = setTimeout(resolve, POLL_INTERVAL_MS); signal?.addEventListener("abort", () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); }, { once: true }); });
  }
  throw new ProviderError("Manus polling deadline exceeded", { code: "timeout" });
}

export async function requestManus({ apiKey, model = "standard", messages, instructions = "", taskId = "", signal } = {}) {
  if (!apiKey?.trim()) throw new ProviderError("missing_api_key", { code: "missing_api_key" });
  const lastUserMessage = [...normalizeMessages(messages)].reverse().find((message) => message.role === "user")?.content || "";
  let currentTaskId = taskId;
  if (currentTaskId) {
    await requestJson(`${MANUS_API_ROOT}/task.sendMessage`, { headers: { "x-manus-api-key": apiKey.trim() }, body: { task_id: currentTaskId, message: { content: lastUserMessage }, agent_profile: model || "standard" }, signal, provider: "manus" });
  } else {
    const created = await requestJson(`${MANUS_API_ROOT}/task.create`, { headers: { "x-manus-api-key": apiKey.trim() }, body: { message: { content: buildTaskPrompt(messages, instructions) }, locale: "pt-BR", interactive_mode: false, share_visibility: "private", agent_profile: model || "standard" }, signal, provider: "manus" });
    currentTaskId = created.payload?.task_id;
    if (!currentTaskId) throw new ProviderError("Manus did not return a task id", { code: "http_error", status: 502 });
  }
  return pollManus(apiKey, currentTaskId, signal);
}

export { MANUS_API_ROOT };
