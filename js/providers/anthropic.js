import { normalizeMessages, ProviderError, requestJson } from "./provider-interface.js";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";

export async function requestAnthropic({ apiKey, model = "claude-sonnet-5-5", messages, instructions = "", temperature = 0.7, maxTokens = 4000, signal } = {}) {
  if (!apiKey?.trim()) throw new ProviderError("missing_api_key", { code: "missing_api_key" });
  const body = { model: model.trim() || "claude-sonnet-5-5", max_tokens: maxTokens, temperature: Number(temperature), messages: normalizeMessages(messages) };
  if (instructions.trim()) body.system = instructions.trim();
  const { payload, response } = await requestJson(ANTHROPIC_MESSAGES_URL, {
    headers: { "x-api-key": apiKey.trim(), "anthropic-version": "2023-06-01" },
    body,
    signal,
    provider: "anthropic"
  });
  const text = (payload?.content ?? []).filter((block) => block?.type === "text" && typeof block.text === "string").map((block) => block.text).join("\n").trim();
  return {
    text: text || "O Claude retornou uma resposta sem texto exibível.",
    usage: payload?.usage ? { input_tokens: payload.usage.input_tokens, output_tokens: payload.usage.output_tokens, total_tokens: Number(payload.usage.input_tokens || 0) + Number(payload.usage.output_tokens || 0) } : null,
    requestId: response.headers.get("request-id")
  };
}

export { ANTHROPIC_MESSAGES_URL };
