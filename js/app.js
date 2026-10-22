const providers = {
  openai: { name: "OpenAI", model: "GPT-5.5", logo: "✳", logoClass: "provider-logo--openai", description: "Raciocínio e código" },
  claude: { name: "Claude", model: "Claude Sonnet", logo: "A", logoClass: "provider-logo--claude", description: "Análise cuidadosa" },
  gemini: { name: "Gemini", model: "Gemini Pro", logo: "✦", logoClass: "provider-logo--gemini", description: "Multimodal e pesquisa" },
  deepseek: { name: "DeepSeek", model: "DeepSeek Chat", logo: "D", logoClass: "provider-logo--deepseek", description: "Código e matemática" },
  manus: { name: "Manus", model: "Manus AI", logo: "M", logoClass: "provider-logo--manus", description: "Agente geral" }
};

const conversations = [
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

let state = { selectedConversation: "auth", selectedProvider: "openai", draft: "" };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function getConversation() { return conversations.find((conversation) => conversation.id === state.selectedConversation) ?? conversations[0]; }
function providerOf(key) { return providers[key] ?? providers.openai; }
function providerLogo(providerKey, extraClass = "") { const provider = providerOf(providerKey); return `<span class="provider-logo ${provider.logoClass} ${extraClass}">${provider.logo}</span>`; }
function escapeHtml(text) { return text.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function formatContent(content) { return escapeHtml(content).split(/\n\n/).map((paragraph) => `<p>${paragraph.replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`).join(""); }

function renderConversations(filter = "") {
  const query = filter.trim().toLowerCase();
  const visible = conversations.filter((conversation) => `${conversation.title} ${conversation.preview}`.toLowerCase().includes(query));
  $("#conversation-count").textContent = String(visible.length);
  $("#conversation-list").innerHTML = visible.length ? visible.map((conversation) => `
    <button class="conversation-item ${conversation.id === state.selectedConversation ? "conversation-item--active" : ""}" data-conversation="${conversation.id}" type="button">
      ${providerLogo(conversation.provider)}
      <span class="conversation-item__copy"><strong>${escapeHtml(conversation.title)}</strong><small>${escapeHtml(conversation.preview)}</small></span>
      <span class="conversation-item__time">${escapeHtml(conversation.time)}</span>
    </button>`).join("") : `<div class="empty-search">Nenhuma conversa encontrada.</div>`;
  $$("[data-conversation]").forEach((button) => button.addEventListener("click", () => { state.selectedConversation = button.dataset.conversation; state.selectedProvider = getConversation().provider; renderAll(); closeSidebar(); }));
}

function renderProviderMenu() {
  $("#provider-menu").innerHTML = Object.entries(providers).map(([key, provider]) => `
    <button class="provider-option ${key === state.selectedProvider ? "provider-option--active" : ""}" data-provider="${key}" role="option" aria-selected="${key === state.selectedProvider}" type="button">
      ${providerLogo(key)}<span class="provider-option__copy"><strong>${provider.name}</strong><small>${provider.model} · ${provider.description}</small></span>${key === state.selectedProvider ? "<span class=\"status-dot\"></span>" : ""}
    </button>`).join("");
  $$("[data-provider]").forEach((button) => button.addEventListener("click", () => { state.selectedProvider = button.dataset.provider; updateProviderContext(); closeProviderMenu(); }));
}

function renderMessages() {
  const conversation = getConversation();
  $("#message-list").innerHTML = conversation.messages.map((message, index) => {
    const providerKey = message.provider ?? "user";
    const avatar = message.role === "user" ? `<span class="avatar avatar--user">CP</span>` : providerLogo(providerKey, "avatar");
    const label = message.role === "user" ? "Você" : providerOf(providerKey).name;
    const actions = message.role === "assistant" ? `<div class="message__actions"><button type="button" data-copy="${index}">Copiar</button><button type="button" data-regenerate="${index}">Regenerar</button></div>` : "";
    return `<article class="message message--${message.role}">${avatar}<div class="message__body"><div class="message__meta"><strong>${label}</strong><time>${escapeHtml(message.time)}</time></div><div class="message__content">${formatContent(message.content)}</div>${actions}</div></article>`;
  }).join("");
  $$("[data-copy]").forEach((button) => button.addEventListener("click", () => copyMessage(Number(button.dataset.copy))));
  $$("[data-regenerate]").forEach((button) => button.addEventListener("click", () => simulateResponse(true)));
}

function updateProviderContext() {
  const provider = providerOf(state.selectedProvider);
  $("#provider-pill-name").textContent = provider.name;
  $("#provider-pill .provider-logo").className = `provider-logo ${provider.logoClass}`;
  $("#provider-pill .provider-logo").textContent = provider.logo;
  $("#composer-provider").textContent = provider.name;
  $("#typing-label").textContent = `${provider.name} está analisando…`;
  $("#active-provider-card").innerHTML = `${providerLogo(state.selectedProvider)}<span><strong>${provider.name}</strong><small>${provider.model} · demonstração</small></span><span class="status-dot status-dot--large"></span>`;
  renderProviderMenu();
}

function renderAll() {
  const conversation = getConversation();
  $("#conversation-title").textContent = conversation.title;
  renderConversations($("#conversation-search").value);
  renderMessages();
  updateProviderContext();
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
  conversation.messages.push({ role: "user", time: "agora", content: value });
  conversation.preview = value;
  input.value = "";
  updateDraftCount();
  renderMessages();
  simulateResponse();
}

function simulateResponse(regenerate = false) {
  const provider = providerOf(state.selectedProvider);
  $("#typing-row").hidden = false;
  $("#typing-row .avatar").className = `avatar ${provider.logoClass}`;
  $("#typing-row .avatar").textContent = provider.logo;
  $(".send-button").disabled = true;
  setTimeout(() => {
    const conversation = getConversation();
    conversation.messages.push({ role: "assistant", provider: state.selectedProvider, time: "agora", content: regenerate ? "Esta é uma nova tentativa de resposta na interface de demonstração. O adaptador real será conectado em uma fase posterior." : `Recebi sua mensagem no modo de demonstração. Quando o adaptador de ${provider.name} estiver configurado, esta resposta virá da API selecionada e será registrada com seus metadados de uso.` });
    $("#typing-row").hidden = true;
    $(".send-button").disabled = false;
    renderMessages();
  }, 850);
}

function updateDraftCount() { const input = $("#message-input"); $("#draft-count").textContent = `${input.value.length.toLocaleString("pt-BR")} / 4.000`; input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 150)}px`; }
function closeProviderMenu() { $("#provider-menu").classList.remove("provider-menu--open"); $("#provider-pill").setAttribute("aria-expanded", "false"); }
function closeSidebar() { $("#sidebar").classList.remove("sidebar--open"); }
function setTheme(theme) { document.documentElement.dataset.theme = theme; $$("[data-setting-theme]").forEach((button) => button.classList.toggle("segmented__button--active", button.dataset.settingTheme === theme)); }
function openSettings() { $("#settings-modal").hidden = false; $("#modal-backdrop").hidden = false; }
function closeSettings() { $("#settings-modal").hidden = true; $("#modal-backdrop").hidden = true; }

$("#conversation-search").addEventListener("input", (event) => renderConversations(event.target.value));
$("#composer-form").addEventListener("submit", submitMessage);
$("#message-input").addEventListener("input", updateDraftCount);
$("#clear-draft").addEventListener("click", () => { $("#message-input").value = ""; updateDraftCount(); $("#message-input").focus(); });
$("#provider-pill").addEventListener("click", () => { const menu = $("#provider-menu"); const isOpen = menu.classList.toggle("provider-menu--open"); $("#provider-pill").setAttribute("aria-expanded", String(isOpen)); });
document.addEventListener("click", (event) => { if (!event.target.closest(".topbar__actions")) closeProviderMenu(); });
$("#toggle-theme").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
$("#new-chat").addEventListener("click", () => { const id = `draft-${Date.now()}`; conversations.unshift({ id, title: "Nova conversa", provider: state.selectedProvider, time: "agora", preview: "Conversa vazia", messages: [] }); state.selectedConversation = id; $("#message-input").value = ""; updateDraftCount(); showToast("Nova conversa criada em memória. A persistência entra na Fase 2."); renderAll(); });
$("#open-sidebar").addEventListener("click", () => $("#sidebar").classList.add("sidebar--open"));
$("#close-sidebar").addEventListener("click", closeSidebar);
$("#open-settings").addEventListener("click", openSettings);
$("#close-settings").addEventListener("click", closeSettings);
$("#cancel-settings").addEventListener("click", closeSettings);
$("#save-settings").addEventListener("click", closeSettings);
$("#modal-backdrop").addEventListener("click", closeSettings);
$$("[data-setting-theme]").forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.settingTheme)));
document.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#new-chat").click(); } if (event.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { event.preventDefault(); $("#conversation-search").focus(); } if (event.key === "Escape") { closeProviderMenu(); closeSettings(); closeSidebar(); } });

renderAll();
