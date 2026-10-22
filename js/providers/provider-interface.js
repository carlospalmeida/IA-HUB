export class ProviderError extends Error {
  constructor(message, { code = "provider_error", status = null, cause = null } = {}) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

export function normalizeMessages(messages = []) {
  return messages.filter((message) => typeof message?.content === "string" && message.content.trim()).map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content
  }));
}

export function providerErrorMessage(error) {
  if (error?.name === "AbortError") return "A solicitação demorou demais e foi cancelada. Tente novamente.";
  if (error?.code === "timeout") return "O provedor excedeu o tempo limite local. Tente novamente.";
  if (error?.code === "awaiting_user") return "Manus está aguardando uma resposta ou confirmação para continuar.";
  if (error?.code === "missing_api_key") return "Configure uma chave de sessão nas configurações para usar este provedor.";
  if (error?.code === "cors_or_network") return "A chamada não pôde sair do navegador. Verifique CORS, sua rede ou use um proxy/backend autorizado.";
  if (error?.status === 401 || error?.status === 403) return "A chave foi rejeitada ou não tem permissão para este projeto.";
  if (error?.status === 429) return "O provedor informou limite de uso. Aguarde ou revise os limites da conta.";
  if (error?.status >= 500) return "O provedor está indisponível no momento. Tente novamente mais tarde.";
  return "Não foi possível obter uma resposta deste provedor. Consulte o console apenas em desenvolvimento local.";
}

export function createClientRequestId(prefix = "iahub") {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function requestJson(url, { method = "POST", headers = {}, body, signal, provider = "provider" } = {}) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ProviderError("network_error", { code: "cors_or_network", cause: error });
  }
  let payload = null;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok || payload?.ok === false) {
    const providerMessage = payload?.error?.message || payload?.error?.type || `${provider} HTTP ${response.status}`;
    throw new ProviderError(providerMessage, { code: "http_error", status: response.status });
  }
  return { payload, response };
}
