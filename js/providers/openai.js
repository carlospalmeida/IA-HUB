import { normalizeMessages, ProviderError } from "./provider-interface.js";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

function extractText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  const text = (payload?.output ?? []).flatMap((item) => item?.content ?? []).filter((content) => content?.type === "output_text" && typeof content.text === "string").map((content) => content.text).join("\n").trim();
  return text || "O provedor retornou uma resposta sem texto exibível.";
}

export async function requestOpenAI({ apiKey, model = "gpt-5.5", messages, instructions = "", temperature = 0.7, maxTokens = 4000, signal } = {}) {
  if (!apiKey?.trim()) throw new ProviderError("missing_api_key", { code: "missing_api_key" });
  const input = normalizeMessages(messages).map((message) => ({ role: message.role, content: [{ type: "input_text", text: message.content }] }));
  const body = { model: model.trim() || "gpt-5.5", input, max_output_tokens: maxTokens };
  if (instructions.trim()) body.instructions = instructions.trim();
  if (Number.isFinite(Number(temperature))) body.temperature = Number(temperature);
  const clientRequestId = globalThis.crypto?.randomUUID?.() ?? `iahub-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  let response;
  try {
    response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}`, "X-Client-Request-Id": clientRequestId },
      body: JSON.stringify(body),
      signal
    });
  } catch (error) {
    throw new ProviderError("network_error", { code: "cors_or_network", cause: error });
  }

  let payload = null;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    const providerMessage = payload?.error?.message;
    throw new ProviderError(providerMessage || `OpenAI HTTP ${response.status}`, { code: "http_error", status: response.status });
  }
  return {
    text: extractText(payload),
    usage: payload?.usage ?? null,
    requestId: response.headers.get("x-request-id")
  };
}

export { OPENAI_RESPONSES_URL };
