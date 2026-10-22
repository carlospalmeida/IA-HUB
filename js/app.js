import { exportConversation, loadWorkspace, saveWorkspace } from "./storage.js";
import { requestOpenAI } from "./providers/openai.js";
import { providerErrorMessage } from "./providers/provider-interface.js";

const providers = {
  openai: { name: "OpenAI", model: "gpt-5.5", logo: "✳", logoClass: "provider-logo--openai", description: "Raciocínio e código" },
  claude: { name: "Claude", model: "Claude Sonnet", logo: "A", logoClass: "provider-logo--claude", description: "Análise cuidadosa" },
  gemini: { name: "Gemini", model: "Gemini Pro", logo: "✦", logoClass: "provider-logo--gemini", description: "Multimodal e pesquisa" },
  deepseek: { name: "DeepSeek", model: "DeepSeek Chat", logo: "D", logoClass: "provider-logo--deepseek", description: "Código e matemática" },
  manus: { name: "Manus", model: "Manus AI", logo: "M", logoClass: "provider-logo--manus", description: "Agente geral" }
};

const seedConversations = [
  { id: "auth", title: "Mapeando o fluxo de autenticação", provider: "openai", time: "10:42", preview: "O que devemos observar primeiro?", messages: [
    { role: "user", time: "10:42", content: "Estou começando uma análise autorizada de um aplicativo próprio. Como devo mapear o fluxo de autenticação sem perder o contexto?" },
    { role: "assistant", provider: "openai", time: "10:42", content: "Comece identificando os pontos de entrada e os estados da sessão. Separe o que é observado no código do que é inferido a partir do comportamento.\n\nUma sequência segura é: listar as telas e endpoints usados pelo seu ambiente de teste, localizar as funções que criam ou validam o estado de sessão, registrar as transições e confirmar cada hipótese com logs controlados.\n\nNeste workspace de demonstração, a resposta é apenas um exemplo visual. Na próxima fase, o histórico será salvo localmente e, depois, um adaptador poderá encaminhar a mensagem para o provedor selecionado." }
  ]},
  { id: "android", title: "Primeira análise de um APK", provider: "claude", time: "Ontem", preview: "Manifesto, DEX e bibliotecas nativas", messages: [
    { role: "user", time: "Ontem", content: "Quais são os primeiros artefatos que devo analisar em um APK de laboratório?" },
    { role: "assistant", provider: "claude", time: "Ontem", content: "Preserve o hash original, examine o AndroidManifest.xml, permissões, componentes exportados, strings e a presença de bibliotecas .so. Depois compare a visão Java/DEX com smali e confirme pontos importantes em um emulador isolado." }
  ]},
  { id: "prompts", title: "Prompts para análise estática", provider: "gemini", time: "Seg", preview: "Separar fato, inferência e pergunta", messages: [
    { role: "user", time: "Seg", content: "Quero prompts que façam a IA indicar evidências e limitações." },
    { role: "assistant", provider: "gemini", time: "Seg", content: "Peça sempre três blocos: fatos observáveis, hipóteses com confiança e verificações que ainda precisam ser feitas. Inclua arquitetura, callers, callees, xrefs, assembly e logs relevantes." }
  ]}
];

const workspace = loadWorkspace({
  conversations: seedConversations,
  preferences: { theme: "dark", selectedProvider: "openai", selectedConversation: "auth", temperature: 0.7, maxTokens: 4000, providerConfigs: {} }
});
let conversations = workspace.conversations;
let preferences = workspace.preferences;
let state = { selectedConversation: preferences.selectedConversation, selectedProvider: preferences.selectedProvider, draft: "" };
let persistenceWarningShown = false;
const runtimeKeys = Object.create(null);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function getConversation() { return conversations.find((conversation) => conversation.id === state.selectedConversation) ?? conversations[0]; }
function providerOf(key) { return providers[key] ?? providers.openai; }
function getProviderConfig(key = state.selectedProvider) { return preferences.providerConfigs?.[key] ?? {}; }
function providerName(key) { return getProviderConfig(key).customName?.trim() || providerOf(key).name; }
function providerModel(key) { return getProviderConfig(key).model?.trim() || providerOf(key).model; }
function providerLogo(providerKey, extraClass = "") { const provider = providerOf(providerKey); return `<span class="provider-logo ${provider.logoClass} ${extraClass}">${provider.logo}</span>`; }
function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function formatContent(content) { return escapeHtml(content).split(/\n\n/).map((paragraph) => `<p>${paragraph.replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`).join(""); }

function saveWorkspaceState() {
  preferences.theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  preferences.selectedConversation = state.selectedConversation;
  preferences.selectedProvider = state.selectedProvider;
  const saved = saveWorkspace({ conversations, preferences });
  if (!saved && !persistenceWarningShown) {
    persistenceWarningShown = true;
    setTimeout(() => showToast("Não foi possível salvar no navegador. Verifique o modo privado ou o espaço disponível."), 0);
  }
  return saved;
}

function renderConversations(filter = "") {
  const query = filter.trim().toLowerCase();
  const visible = conversations.filter((conversation) => {
    const searchable = [conversation.title, conversation.preview, ...conversation.messages.map((message) => message.content)].join(" ").toLowerCase();
    return searchable.includes(query);
  });
  $("#conversation-count").textContent = String(visible.length);
  $("#conversation-list").innerHTML = visible.length ? visible.map((conversation) => `
    <div class="conversation-item-row">
      <button class="conversation-item ${conversation.id === state.selectedConversation ? "conversation-item--active" : ""}" data-conversation="${escapeHtml(conversation.id)}" type="button">
        ${providerLogo(conversation.provider)}
        <span class="conversation-item__copy"><strong>${escapeHtml(conversation.title)}</strong><small>${escapeHtml(conversation.preview)}</small></span>
        <span class="conversation-item__time">${escapeHtml(conversation.time)}</span>
      </button>
      <div class="conversation-item-actions"><button class="conversation-item-action" data-rename="${escapeHtml(conversation.id)}" type="button" aria-label="Renomear ${escapeHtml(conversation.title)}">✎</button><button class="conversation-item-action" data-delete="${escapeHtml(conversation.id)}" type="button" aria-label="Excluir ${escapeHtml(conversation.title)}">×</button></div>
    </div>`).join("") : `<div class="empty-search">Nenhuma conversa encontrada.</div>`;
  $$("[data-conversation]").forEach((button) => button.addEventListener("click", () => selectConversation(button.dataset.conversation)));
  $$("[data-rename]").forEach((button) => button.addEventListener("click", () => renameConversation(button.dataset.rename)));
  $$("[data-delete]").forEach((button) => button.addEventListener("click", () => deleteConversation(button.dataset.delete)));
}

function renderProviderMenu() {
  $("#provider-menu").innerHTML = Object.entries(providers).map(([key, provider]) => `
    <button class="provider-option ${key === state.selectedProvider ? "provider-option--active" : ""}" data-provider="${key}" role="option" aria-selected="${key === state.selectedProvider}" type="button">
      ${providerLogo(key)}<span class="provider-option__copy"><strong>${escapeHtml(providerName(key))}</strong><small>${escapeHtml(providerModel(key))} · ${provider.description}</small></span>${key === state.selectedProvider ? "<span class=\"status-dot\"></span>" : ""}
    </button>`).join("");
  $$("[data-provider]").forEach((button) => button.addEventListener("click", () => { state.selectedProvider = button.dataset.provider; saveWorkspaceState(); updateProviderContext(); syncSettingsModal(); closeProviderMenu(); }));
}

function renderMessages() {
  const conversation = getConversation();
  $("#message-list").innerHTML = conversation.messages.map((message, index) => {
    const providerKey = message.provider ?? "user";
    const avatar = message.role === "user" ? `<span class="avatar avatar--user">CP</span>` : providerLogo(providerKey, "avatar");
    const label = message.role === "user" ? "Você" : providerName(providerKey);
    const actions = message.role === "assistant" ? `<div class="message__actions"><button type="button" data-copy="${index}">Copiar</button><button type="button" data-regenerate="${index}">Regenerar</button></div>` : "";
    return `<article class="message message--${message.role}">${avatar}<div class="message__body"><div class="message__meta"><strong>${escapeHtml(label)}</strong><time>${escapeHtml(message.time)}</time></div><div class="message__content">${formatContent(message.content)}</div>${actions}</div></article>`;
  }).join("");
  $$("[data-copy]").forEach((button) => button.addEventListener("click", () => copyMessage(Number(button.dataset.copy))));
  $$("[data-regenerate]").forEach((button) => button.addEventListener("click", () => simulateResponse(true)));
}

function updateProviderContext() {
  const provider = providerOf(state.selectedProvider);
  const name = providerName(state.selectedProvider);
  $("#provider-pill-name").textContent = name;
  $("#provider-pill .provider-logo").className = `provider-logo ${provider.logoClass}`;
  $("#provider-pill .provider-logo").textContent = provider.logo;
  $("#composer-provider").textContent = name;
  $("#typing-label").textContent = `${name} está analisando…`;
  $("#active-provider-card").innerHTML = `${providerLogo(state.selectedProvider)}<span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(providerModel(state.selectedProvider))} · demonstração</small></span><span class="status-dot status-dot--large"></span>`;
  renderProviderMenu();
}

function renderAll() {
  const conversation = getConversation();
  if (!conversation) return;
  $("#conversation-title").textContent = conversation.title;
  renderConversations($("#conversation-search").value);
  renderMessages();
  updateProviderContext();
  updateQuickSettingsUI();
}

function copyMessage(index) {
  const message = getConversation().messages[index];
  if (!message) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(message.content).then(() => showToast("Resposta copiada para a área de transferência.")).catch(() => showToast("Não foi possível copiar automaticamente."));
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = message.content;
  helper.setAttribute("readonly", "true");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.append(helper);
  helper.select();
  try { document.execCommand("copy"); showToast("Resposta copiada para a área de transferência."); } catch { showToast("Copie a resposta manualmente."); }
  helper.remove();
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add("toast--visible"));
  setTimeout(() => { toast.classList.remove("toast--visible"); setTimeout(() => toast.remove(), 220); }, 2400);
}

function submitMessage(event) {
  event.preventDefault();
  const input = $("#message-input");
  const value = input.value.trim();
  if (!value) return;
  const conversation = getConversation();
  conversation.provider = state.selectedProvider;
  conversation.messages.push({ role: "user", time: "agora", content: value });
  conversation.preview = value.slice(0, 180);
  conversation.time = "agora";
  input.value = "";
  updateDraftCount();
  saveWorkspaceState();
  renderMessages();
  renderConversations($("#conversation-search").value);
  simulateResponse();
}

function simulateResponse(regenerate = false) {
  const provider = providerOf(state.selectedProvider);
  $("#typing-row").hidden = false;
  $("#typing-row .avatar").className = `avatar ${provider.logoClass}`;
  $("#typing-row .avatar").textContent = provider.logo;
  $(".send-button").disabled = true;
  if (state.selectedProvider === "openai" && runtimeKeys.openai) {
    requestLiveOpenAI();
    return;
  }
  setTimeout(() => {
    const conversation = getConversation();
    conversation.messages.push({ role: "assistant", provider: state.selectedProvider, time: "agora", content: regenerate ? "Esta é uma nova tentativa de resposta na interface de demonstração. O adaptador real será conectado em uma fase posterior." : `Recebi sua mensagem no modo de demonstração. Quando o adaptador de ${providerName(state.selectedProvider)} estiver configurado, esta resposta virá da API selecionada e será registrada com seus metadados de uso.` });
    conversation.preview = conversation.messages.at(-1).content.slice(0, 180);
    conversation.time = "agora";
    $("#typing-row").hidden = true;
    $(".send-button").disabled = false;
    saveWorkspaceState();
    renderMessages();
    renderConversations($("#conversation-search").value);
  }, 850);
}

async function requestLiveOpenAI() {
  const conversation = getConversation();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const result = await requestOpenAI({
      apiKey: runtimeKeys.openai,
      model: providerModel("openai"),
      messages: conversation.messages,
      instructions: getProviderConfig("openai").systemPrompt || "",
      temperature: preferences.temperature,
      maxTokens: preferences.maxTokens,
      signal: controller.signal
    });
    conversation.messages.push({ role: "assistant", provider: "openai", time: "agora", content: result.text });
    conversation.usage = result.usage ?? conversation.usage;
    conversation.preview = result.text.slice(0, 180);
    conversation.time = "agora";
  } catch (error) {
    conversation.messages.push({ role: "assistant", provider: "openai", time: "agora", content: `OpenAI não respondeu. ${providerErrorMessage(error)}` });
  } finally {
    clearTimeout(timeout);
    $("#typing-row").hidden = true;
    $(".send-button").disabled = false;
    saveWorkspaceState();
    renderMessages();
    renderConversations($("#conversation-search").value);
  }
}

function updateDraftCount() {
  const input = $("#message-input");
  $("#draft-count").textContent = `${input.value.length.toLocaleString("pt-BR")} / 4.000`;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
}

function updateQuickSettingsUI() {
  const temperature = Number(preferences.temperature ?? 0.7);
  const maxTokens = String(preferences.maxTokens ?? 4000);
  $("#temperature-input").value = String(temperature);
  $("#temperature-value").textContent = temperature.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  $("#max-tokens-input").value = maxTokens;
}

function syncSettingsModal() {
  const config = getProviderConfig();
  $("#provider-model-input").value = config.model || providerOf(state.selectedProvider).model;
  $("#provider-name-input").value = config.customName || "";
  $("#system-prompt-input").value = config.systemPrompt || "";
  $("#provider-api-key-input").value = runtimeKeys[state.selectedProvider] || "";
  $("#provider-api-key-input").disabled = state.selectedProvider !== "openai";
}

function saveProviderSettings() {
  preferences.providerConfigs ??= {};
  preferences.providerConfigs[state.selectedProvider] = {
    model: $("#provider-model-input").value,
    customName: $("#provider-name-input").value.trim().slice(0, 120),
    systemPrompt: $("#system-prompt-input").value.slice(0, 10000)
  };
  saveWorkspaceState();
  updateProviderContext();
}

function updateRuntimeKey() {
  if (state.selectedProvider !== "openai") return;
  runtimeKeys.openai = $("#provider-api-key-input").value.trim();
}

function closeProviderMenu() { $("#provider-menu").classList.remove("provider-menu--open"); $("#provider-pill").setAttribute("aria-expanded", "false"); }
function closeExportMenu() { $("#export-menu").hidden = true; $("#export-toggle").setAttribute("aria-expanded", "false"); }
function closeSidebar() { $("#sidebar").classList.remove("sidebar--open"); }
function setTheme(theme, persist = true) { document.documentElement.dataset.theme = theme; $$("[data-setting-theme]").forEach((button) => button.classList.toggle("segmented__button--active", button.dataset.settingTheme === theme)); if (persist) saveWorkspaceState(); }

function selectConversation(id) {
  const conversation = conversations.find((item) => item.id === id);
  if (!conversation) return;
  state.selectedConversation = id;
  state.selectedProvider = conversation.provider;
  saveWorkspaceState();
  renderAll();
  closeSidebar();
}

function renameConversation(id) {
  const conversation = conversations.find((item) => item.id === id);
  if (!conversation) return;
  const nextTitle = window.prompt("Novo nome para a conversa:", conversation.title)?.trim();
  if (!nextTitle || nextTitle === conversation.title) return;
  conversation.title = nextTitle.slice(0, 120);
  saveWorkspaceState();
  renderAll();
  showToast("Conversa renomeada.");
}

function deleteConversation(id) {
  const conversation = conversations.find((item) => item.id === id);
  if (!conversation || !window.confirm(`Excluir a conversa “${conversation.title}”?`)) return;
  conversations = conversations.filter((item) => item.id !== id);
  if (!conversations.length) conversations.push({ id: `draft-${Date.now()}`, title: "Nova conversa", provider: state.selectedProvider, time: "agora", preview: "Conversa vazia", messages: [] });
  if (state.selectedConversation === id) {
    state.selectedConversation = conversations[0].id;
    state.selectedProvider = conversations[0].provider;
  }
  saveWorkspaceState();
  renderAll();
  showToast("Conversa excluída localmente.");
}

function exportCurrentConversation(format) {
  const conversation = getConversation();
  if (!conversation) return;
  const providerNames = Object.fromEntries(Object.keys(providers).map((key) => [key, providerName(key)]));
  exportConversation(conversation, format, providerNames);
  closeExportMenu();
  showToast(`Conversa exportada em ${format === "text" ? "texto" : format.toUpperCase()}.`);
}

$("#conversation-search").addEventListener("input", (event) => renderConversations(event.target.value));
$("#composer-form").addEventListener("submit", submitMessage);
$("#message-input").addEventListener("input", updateDraftCount);
$("#clear-draft").addEventListener("click", () => { $("#message-input").value = ""; updateDraftCount(); $("#message-input").focus(); });
$("#provider-pill").addEventListener("click", () => { const menu = $("#provider-menu"); const isOpen = menu.classList.toggle("provider-menu--open"); $("#provider-pill").setAttribute("aria-expanded", String(isOpen)); closeExportMenu(); });
$("#export-toggle").addEventListener("click", () => { const menu = $("#export-menu"); menu.hidden = !menu.hidden; $("#export-toggle").setAttribute("aria-expanded", String(!menu.hidden)); closeProviderMenu(); });
$$('[data-export-format]').forEach((button) => button.addEventListener("click", () => exportCurrentConversation(button.dataset.exportFormat)));
document.addEventListener("click", (event) => { if (!event.target.closest(".topbar__actions")) { closeProviderMenu(); closeExportMenu(); } });
$("#toggle-theme").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
$("#new-chat").addEventListener("click", () => { const id = `draft-${Date.now()}`; conversations.unshift({ id, title: "Nova conversa", provider: state.selectedProvider, time: "agora", preview: "Conversa vazia", messages: [] }); state.selectedConversation = id; saveWorkspaceState(); $("#message-input").value = ""; updateDraftCount(); showToast("Nova conversa criada e salva localmente."); renderAll(); closeSidebar(); });
$("#open-sidebar").addEventListener("click", () => $("#sidebar").classList.add("sidebar--open"));
$("#close-sidebar").addEventListener("click", closeSidebar);
$("#open-settings").addEventListener("click", () => { syncSettingsModal(); $("#settings-modal").hidden = false; $("#modal-backdrop").hidden = false; });
$("#close-settings").addEventListener("click", () => { updateRuntimeKey(); saveProviderSettings(); $("#settings-modal").hidden = true; $("#modal-backdrop").hidden = true; });
$("#cancel-settings").addEventListener("click", () => { $("#settings-modal").hidden = true; $("#modal-backdrop").hidden = true; });
$("#save-settings").addEventListener("click", () => { updateRuntimeKey(); saveProviderSettings(); $("#settings-modal").hidden = true; $("#modal-backdrop").hidden = true; showToast("Preferências salvas neste navegador. A chave fica apenas nesta sessão."); });
$("#modal-backdrop").addEventListener("click", () => { updateRuntimeKey(); saveProviderSettings(); $("#settings-modal").hidden = true; $("#modal-backdrop").hidden = true; });
$$("[data-setting-theme]").forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.settingTheme)));
$("#temperature-input").addEventListener("input", (event) => { preferences.temperature = Number(event.target.value); $("#temperature-value").textContent = Number(event.target.value).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); saveWorkspaceState(); });
$("#max-tokens-input").addEventListener("change", (event) => { preferences.maxTokens = Number(event.target.value); saveWorkspaceState(); });
$("#provider-api-key-input").addEventListener("input", updateRuntimeKey);
document.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#new-chat").click(); } if (event.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { event.preventDefault(); $("#conversation-search").focus(); } if (event.key === "Escape") { closeProviderMenu(); closeExportMenu(); $("#settings-modal").hidden = true; $("#modal-backdrop").hidden = true; closeSidebar(); } });

setTheme(preferences.theme, false);
renderAll();
syncSettingsModal();
