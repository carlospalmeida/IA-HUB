import { normalizeMessages, ProviderError, requestJson } from "./provider-interface.js";

const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

function toGeminiContents(messages) {
  return normalizeMessages(messages).map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
}

export async function requestGemini({ apiKey, model = "gemini-3.8-flash", messages, instructions = "", temperature = 0.7, maxTokens = 4000, signal } = {}) {
  if (!apiKey?.trim()) throw new ProviderError("missing_api_key", { code: "missing_api_key" });
  const modelName = (model.trim() || "gemini-3.8-flash").replace(/^models\//, "");
  const body = { contents: toGeminiContents(messages), generationConfig: { temperature: Number(temperature), maxOutputTokens: maxTokens } };
  if (instructions.trim()) body.systemInstruction = { parts: [{ text: instructions.trim() }] };
  const { payload, response } = await requestJson(`${GEMINI_API_ROOT}/${encodeURIComponent(modelName)}:generateContent`, {
    headers: { "x-goog-api-key": apiKey.trim() },
    body,
    signal,
    provider: "gemini"
  });
  const text = (payload?.candidates ?? []).flatMap((candidate) => candidate?.content?.parts ?? []).filter((part) => typeof part.text === "string").map((part) => part.text).join("\n").trim();
  const usage = payload?.usageMetadata ? { input_tokens: payload.usageMetadata.promptTokenCount, output_tokens: payload.usageMetadata.candidatesTokenCount, total_tokens: payload.usageMetadata.totalTokenCount } : null;
  return { text: text || "O Gemini retornou uma resposta sem texto exibível.", usage, requestId: response.headers.get("x-request-id") };
}

export { GEMINI_API_ROOT };
