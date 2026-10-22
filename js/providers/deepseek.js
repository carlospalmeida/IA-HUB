import { normalizeMessages, ProviderError, requestJson } from "./provider-interface.js";

const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";

export async function requestDeepSeek({ apiKey, model = "deepseek-flash", messages, instructions = "", temperature = 0.7, maxTokens = 4000, signal } = {}) {
  if (!apiKey?.trim()) throw new ProviderError("missing_api_key", { code: "missing_api_key" });
  const normalized = normalizeMessages(messages);
  const chatMessages = instructions.trim() ? [{ role: "system", content: instructions.trim() }, ...normalized] : normalized;
  const body = { model: model.trim() || "deepseek-flash", messages: chatMessages, max_tokens: maxTokens, temperature: Number(temperature), stream: false };
  const { payload, response } = await requestJson(DEEPSEEK_CHAT_URL, { headers: { Authorization: `Bearer ${apiKey.trim()}` }, body, signal, provider: "deepseek" });
  const text = payload?.choices?.[0]?.message?.content;
  return {
    text: typeof text === "string" && text.trim() ? text.trim() : "O DeepSeek retornou uma resposta sem texto exibível.",
    usage: payload?.usage ? { input_tokens: payload.usage.prompt_tokens, output_tokens: payload.usage.completion_tokens, total_tokens: payload.usage.total_tokens } : null,
    requestId: response.headers.get("x-request-id")
  };
}

export { DEEPSEEK_CHAT_URL };
