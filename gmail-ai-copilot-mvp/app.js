const seedThreads = [
  {
    id: "t-101",
    sender: "Laura Medina",
    subject: "Confirmacion de reunion para el jueves",
    receivedAt: "09:12",
    classification: "draft",
    read: true,
    label: "AI / Draft Ready",
    summary:
      "Laura pide confirmacion para mantener la reunion del jueves a las 11:00 y quiere saber si debe invitar tambien a Operaciones.",
    agreements: "La reunion sigue propuesta para el jueves a las 11:00.",
    nextSteps:
      "Depende de ti confirmar asistencia e indicar si Operaciones debe participar.",
    draft:
      "Hola Laura,\n\nGracias por confirmarlo. El jueves a las 11:00 me encaja bien. Por favor, invita tambien a Operaciones para que puedan aportar contexto desde el inicio.\n\nUn saludo,",
  },
  {
    id: "t-102",
    sender: "Equipo Legal",
    subject: "Revision del contrato marco",
    receivedAt: "10:04",
    classification: "summary",
    read: true,
    label: "AI / Summary",
    summary:
      "Legal informa de que ya esta revisando el contrato marco y compartira comentarios consolidados esta semana.",
    agreements:
      "Legal enviara una version con comentarios antes del viernes.",
    nextSteps:
      "No hay accion pendiente por tu parte hasta recibir la version comentada.",
    draft: "",
  },
  {
    id: "t-103",
    sender: "Sales Tools Weekly",
    subject: "Nuevas funciones para cerrar mas oportunidades",
    receivedAt: "10:27",
    classification: "spam",
    read: true,
    label: "AI / Spam",
    summary:
      "Newsletter promocional sin relacion directa con conversaciones activas.",
    agreements: "No aplica.",
    nextSteps: "Archivado automaticamente como irrelevante.",
    draft: "",
  },
  {
    id: "t-104",
    sender: "Nicolas Ruiz",
    subject: "Datos para preparar el forecast",
    receivedAt: "11:15",
    classification: "draft",
    read: true,
    label: "AI / Draft Ready",
    summary:
      "Nicolas solicita que confirmes que version del forecast debe usar para cerrar el paquete de direccion.",
    agreements:
      "El equipo quiere cerrar el paquete antes del final del dia.",
    nextSteps:
      "Depende de ti indicar la version correcta y cualquier salvedad relevante.",
    draft:
      "Hola Nicolas,\n\nUsa la ultima version del forecast compartida esta manana. La unica salvedad es que todavia estamos revisando el impacto de los ajustes de septiembre, asi que dejaria esa parte marcada como pendiente de confirmacion.\n\nGracias,",
  },
  {
    id: "t-105",
    sender: "Ana Torres",
    subject: "Actualizacion: propuesta enviada al cliente",
    receivedAt: "12:02",
    classification: "summary",
    read: true,
    label: "AI / Summary",
    summary:
      "Ana confirma que la propuesta ya fue enviada al cliente y que esperara feedback antes de mover el siguiente paso.",
    agreements:
      "El equipo no hara cambios adicionales hasta recibir respuesta del cliente.",
    nextSteps:
      "No requiere respuesta tuya. Ana avisara cuando tenga feedback.",
    draft: "",
  },
];

const state = {
  activeView: "drafts",
  selectedId: null,
  processed: 0,
  reviewed: 0,
  threads: [],
};

const views = {
  drafts: {
    title: "Borradores IA",
    label: "AI / Draft Ready",
    hint: "Borradores pendientes de revisar antes de enviar.",
    filter: (thread) => thread.classification === "draft",
  },
  summaries: {
    title: "Resúmenes",
    label: "AI / Summary",
    hint: "Briefing secuencial de hilos que no requieren respuesta tuya.",
    filter: (thread) => thread.classification === "summary",
  },
  spam: {
    title: "Archivados spam",
    label: "AI / Spam",
    hint: "Hilos marcados como irrelevantes y fuera de Inbox.",
    filter: (thread) => thread.classification === "spam",
  },
};

const selectors = {
  draftCount: document.querySelector("#draftCount"),
  summaryCount: document.querySelector("#summaryCount"),
  spamCount: document.querySelector("#spamCount"),
  processedCount: document.querySelector("#processedCount"),
  readCount: document.querySelector("#readCount"),
  reviewedCount: document.querySelector("#reviewedCount"),
  processButton: document.querySelector("#processButton"),
  viewTitle: document.querySelector("#viewTitle"),
  listTitle: document.querySelector("#listTitle"),
  listHint: document.querySelector("#listHint"),
  threadList: document.querySelector("#threadList"),
  emptyPanel: document.querySelector("#emptyPanel"),
  reviewCard: document.querySelector("#reviewCard"),
  cardMeta: document.querySelector("#cardMeta"),
  cardSubject: document.querySelector("#cardSubject"),
  cardLabel: document.querySelector("#cardLabel"),
  cardSender: document.querySelector("#cardSender"),
  cardReadState: document.querySelector("#cardReadState"),
  cardSummary: document.querySelector("#cardSummary"),
  cardAgreements: document.querySelector("#cardAgreements"),
  cardNextSteps: document.querySelector("#cardNextSteps"),
  draftBlock: document.querySelector("#draftBlock"),
  draftText: document.querySelector("#draftText"),
  promptBlock: document.querySelector("#promptBlock"),
  promptInput: document.querySelector("#promptInput"),
  actionRow: document.querySelector("#actionRow"),
  toast: document.querySelector("#toast"),
};

function initialize() {
  state.threads = structuredClone(seedThreads);
  state.processed = state.threads.length;
  state.selectedId = state.threads.find(views.drafts.filter)?.id ?? null;

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      const firstThread = getVisibleThreads()[0];
      state.selectedId = firstThread?.id ?? null;
      render();
    });
  });

  selectors.processButton.addEventListener("click", processNewEmails);
  render();
}

function getVisibleThreads() {
  return state.threads.filter(views[state.activeView].filter);
}

function getSelectedThread() {
  return state.threads.find((thread) => thread.id === state.selectedId);
}

function render() {
  renderNavigation();
  renderMetrics();
  renderList();
  renderPanel();
}

function renderNavigation() {
  const counts = getCounts();
  selectors.draftCount.textContent = counts.draft;
  selectors.summaryCount.textContent = counts.summary;
  selectors.spamCount.textContent = counts.spam;

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.activeView);
  });
}

function renderMetrics() {
  selectors.processedCount.textContent = state.processed;
  selectors.readCount.textContent = state.threads.filter((thread) => thread.read).length;
  selectors.reviewedCount.textContent = state.reviewed;
}

function renderList() {
  const view = views[state.activeView];
  const threads = getVisibleThreads();

  selectors.viewTitle.textContent = view.title;
  selectors.listTitle.textContent = view.label;
  selectors.listHint.textContent = view.hint;
  selectors.threadList.innerHTML = "";

  if (threads.length === 0) {
    const empty = document.createElement("div");
    empty.className = "thread-item";
    empty.innerHTML = `<p class="thread-preview">No hay hilos en esta cola.</p>`;
    selectors.threadList.append(empty);
    return;
  }

  threads.forEach((thread) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `thread-item ${thread.id === state.selectedId ? "active" : ""}`;
    button.innerHTML = `
      <span class="thread-title">
        <strong>${thread.subject}</strong>
        <span>${thread.receivedAt}</span>
      </span>
      <span class="thread-preview">${thread.sender} - ${thread.summary}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedId = thread.id;
      render();
    });
    selectors.threadList.append(button);
  });
}

function renderPanel() {
  const thread = getSelectedThread();

  if (!thread) {
    selectors.emptyPanel.classList.remove("hidden");
    selectors.reviewCard.classList.add("hidden");
    return;
  }

  selectors.emptyPanel.classList.add("hidden");
  selectors.reviewCard.classList.remove("hidden");
  selectors.cardMeta.textContent = `${thread.sender} - ${thread.receivedAt}`;
  selectors.cardSubject.textContent = thread.subject;
  selectors.cardLabel.textContent = thread.label;
  selectors.cardLabel.className = `status-label ${thread.classification}`;
  selectors.cardSender.textContent = thread.sender;
  selectors.cardReadState.textContent = thread.read ? "Leido por IA" : "No leido";
  selectors.cardSummary.textContent = thread.summary;
  selectors.cardAgreements.textContent = thread.agreements;
  selectors.cardNextSteps.textContent = thread.nextSteps;

  const isDraft = thread.classification === "draft";
  selectors.draftBlock.classList.toggle("hidden", !isDraft);
  selectors.promptBlock.classList.toggle("hidden", !isDraft);
  selectors.draftText.value = thread.draft;
  selectors.promptInput.value = "";

  renderActions(thread);
}

function renderActions(thread) {
  selectors.actionRow.innerHTML = "";

  if (thread.classification === "draft") {
    addAction("Enviar", () => closeThread(thread, "Borrador enviado manualmente."));
    addAction("No contestar", () => closeThread(thread, "Borrador descartado."));
    addAction("Responder con prompt", () => rewriteDraft(thread), "secondary");
    addAction("Abrir email", () => showToast("En la version Gmail abriria el hilo original."), "secondary");
    return;
  }

  if (thread.classification === "summary") {
    addAction("Entendido", () => closeThread(thread, "Resumen marcado como revisado."));
    addAction("Contestar", () => convertSummaryToDraft(thread), "secondary");
    addAction("Abrir email", () => showToast("En la version Gmail abriria el hilo original."), "secondary");
    return;
  }

  addAction("Restaurar como resumen", () => restoreSpam(thread), "secondary");
}

function addAction(label, onClick, variant = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (variant) button.className = variant;
  button.addEventListener("click", onClick);
  selectors.actionRow.append(button);
}

function closeThread(thread, message) {
  state.threads = state.threads.filter((item) => item.id !== thread.id);
  state.reviewed += 1;
  selectNextThread();
  showToast(message);
  render();
}

function rewriteDraft(thread) {
  const prompt = selectors.promptInput.value.trim();
  if (!prompt) {
    showToast("Escribe una guia antes de pedir una nueva version.");
    return;
  }

  thread.draft = buildPromptedDraft(thread, prompt);
  selectors.draftText.value = thread.draft;
  showToast("Borrador actualizado con tu prompt.");
}

function convertSummaryToDraft(thread) {
  thread.classification = "draft";
  thread.label = "AI / Draft Ready";
  thread.draft = `Hola ${getFirstName(thread.sender)},\n\nGracias por la actualizacion. Queria responder sobre este punto: ${thread.summary}\n\nQuedo pendiente de cualquier detalle adicional.\n\nUn saludo,`;
  state.activeView = "drafts";
  state.selectedId = thread.id;
  showToast("El hilo entro en el flujo de Requiere respuesta mia.");
  render();
}

function restoreSpam(thread) {
  thread.classification = "summary";
  thread.label = "AI / Summary";
  state.activeView = "summaries";
  state.selectedId = thread.id;
  showToast("Restaurado a la cola de resumen.");
  render();
}

function processNewEmails() {
  const newThreads = [
    {
      id: `t-${Date.now()}`,
      sender: "Miguel Santos",
      subject: "Decision sobre prioridades de septiembre",
      receivedAt: "Ahora",
      classification: "draft",
      read: true,
      label: "AI / Draft Ready",
      summary:
        "Miguel pide que confirmes que iniciativas deben ir primero durante septiembre.",
      agreements: "Todavia no hay acuerdo; espera tu criterio.",
      nextSteps: "Debes priorizar o pedir mas contexto antes de decidir.",
      draft:
        "Hola Miguel,\n\nGracias por el resumen. Daria prioridad primero a las iniciativas con impacto directo en cierre de mes y dejaria las mejoras internas para el siguiente bloque, salvo que haya alguna dependencia critica que no este viendo.\n\nUn saludo,",
    },
    {
      id: `t-${Date.now() + 1}`,
      sender: "People Team",
      subject: "Calendario de festivos actualizado",
      receivedAt: "Ahora",
      classification: "summary",
      read: true,
      label: "AI / Summary",
      summary:
        "People comparte el calendario actualizado de festivos y confirma que ya esta disponible para consulta.",
      agreements: "El nuevo calendario sustituye la version anterior.",
      nextSteps: "No requiere respuesta tuya.",
      draft: "",
    },
  ];

  state.threads = [...newThreads, ...state.threads];
  state.processed += newThreads.length;
  state.activeView = "drafts";
  state.selectedId = newThreads[0].id;
  showToast("IA leyo emails nuevos, marco leidos y actualizo las colas.");
  render();
}

function selectNextThread() {
  const nextThread = getVisibleThreads().find((thread) => thread.id !== state.selectedId);
  state.selectedId = nextThread?.id ?? null;
}

function getCounts() {
  return state.threads.reduce(
    (counts, thread) => {
      counts[thread.classification] += 1;
      return counts;
    },
    { draft: 0, summary: 0, spam: 0 },
  );
}

function getFirstName(sender) {
  return sender.split(" ")[0] ?? "";
}

function buildPromptedDraft(thread, prompt) {
  const instruction = promptToEmailSentence(prompt, thread);
  const contextSentence = buildContextSentence(thread);

  return `Hola ${getFirstName(thread.sender)},\n\n${contextSentence}\n\n${instruction}\n\nGracias,\n\nUn saludo,`;
}

function buildContextSentence(thread) {
  if (thread.subject.toLowerCase().includes("contrato")) {
    return "Gracias por la actualizacion sobre la revision del contrato.";
  }

  if (thread.subject.toLowerCase().includes("forecast")) {
    return "Gracias por el seguimiento del forecast.";
  }

  if (thread.subject.toLowerCase().includes("reunion")) {
    return "Gracias por coordinar la reunion.";
  }

  return "Gracias por tu mensaje.";
}

function promptToEmailSentence(prompt, thread) {
  const cleanPrompt = prompt.trim().replace(/\s+/g, " ");
  const { intent, tone } = extractPromptIntent(cleanPrompt);
  const lowerIntent = intent.toLowerCase();
  const subject = thread.subject.toLowerCase();

  if (lowerIntent.includes("withholding tax")) {
    return "Por favor, tened en cuenta el withholding tax aplicable en el pais correspondiente e incluidlo como importe adicional cuando proceda.";
  }

  if (lowerIntent.includes("version") && lowerIntent.includes("no es la ultima")) {
    return buildVersionCorrectionSentence(intent, tone);
  }

  if (lowerIntent.includes("versión") && lowerIntent.includes("no es la última")) {
    return buildVersionCorrectionSentence(intent, tone);
  }

  if (lowerIntent.includes("usar v2") || lowerIntent.includes("use v2") || lowerIntent.includes("utilizar v2")) {
    return buildVersionCorrectionSentence(intent, tone);
  }

  if (lowerIntent.includes("fees") && lowerIntent.includes("impuesto")) {
    return "Por favor, incluid el desglose de fees junto con los impuestos correspondientes para que podamos revisar el importe total correctamente.";
  }

  if (subject.includes("reunion") && isTimeInstruction(lowerIntent)) {
    return `La reunion a las ${formatTimeInstruction(intent)} me encaja.`;
  }

  if (subject.includes("reunion") && lowerIntent.includes("no puedo")) {
    return `No voy a poder asistir en ese horario. ${buildAlternativeIfPresent(intent)}`;
  }

  if (lowerIntent.startsWith("recordar ") || lowerIntent.startsWith("tened en cuenta ")) {
    return buildReminderSentence(intent);
  }

  if (lowerIntent.startsWith("pedir ") || lowerIntent.startsWith("solicitar ")) {
    return buildRequestSentence(intent);
  }

  return buildNaturalSentence(intent, thread, tone);
}

function buildReminderSentence(text) {
  const content = normalizeInstructionContent(text);
  return `Por favor, tened en cuenta ${content}.`;
}

function buildRequestSentence(text) {
  const content = normalizeInstructionContent(text);
  return `Os agradeceria que pudierais ${content}.`;
}

function buildStatementSentence(text) {
  const content = normalizeInstructionContent(text);
  return `Queria comentaros ${content}.`;
}

function buildNaturalSentence(text, thread, tone) {
  const content = normalizeInstructionContent(text);
  const lowerContent = content.toLowerCase();

  if (thread.subject.toLowerCase().includes("reunion")) {
    return `Confirmo ${content}.`;
  }

  if (lowerContent.startsWith("no puedo") || lowerContent.startsWith("no podemos")) {
    return `${capitalizeFirst(content)}.`;
  }

  if (lowerContent.startsWith("si ") || lowerContent.startsWith("sí ")) {
    return `${capitalizeFirst(content)}.`;
  }

  if (tone === "polite") {
    return `Queria comentaros que ${content}.`;
  }

  return `Queria trasladaros este punto: ${content}.`;
}

function extractPromptIntent(prompt) {
  let normalizedPrompt = prompt.trim();
  let tone = "neutral";

  const tonePatterns = [
    /,?\s*cont[eé]stale de manera educada\.?$/i,
    /,?\s*cont[eé]stales de manera educada\.?$/i,
    /,?\s*responde de manera educada\.?$/i,
    /,?\s*de forma educada\.?$/i,
    /,?\s*en tono educado\.?$/i,
  ];

  tonePatterns.forEach((pattern) => {
    if (pattern.test(normalizedPrompt)) {
      tone = "polite";
      normalizedPrompt = normalizedPrompt.replace(pattern, "").trim();
    }
  });

  const prefixes = [
    "dile que ",
    "diles que ",
    "di que ",
    "contesta que ",
    "responde que ",
    "recuerdales que ",
    "recuérdales que ",
    "recuerda que ",
    "recuerda ",
    "pide que ",
    "pideles que ",
    "pídeles que ",
  ];
  const lowerPrompt = normalizedPrompt.toLowerCase();
  const prefix = prefixes.find((item) => lowerPrompt.startsWith(item));

  if (!prefix) return { intent: normalizedPrompt, tone };

  const stripped = normalizedPrompt.slice(prefix.length).trim();

  if (prefix.startsWith("recuerda") || prefix.startsWith("recuerd") || prefix.startsWith("recuérd")) {
    return { intent: `recordar ${stripped}`, tone };
  }

  if (prefix.startsWith("pide") || prefix.startsWith("pidele") || prefix.startsWith("pídele")) {
    return { intent: `pedir ${stripped}`, tone };
  }

  return { intent: stripped, tone };
}

function buildVersionCorrectionSentence(text, tone) {
  const targetVersion = extractTargetVersion(text);
  const opener =
    tone === "polite"
      ? "Creo que no estas trabajando sobre la ultima version."
      : "No estas trabajando sobre la ultima version.";
  const request = targetVersion
    ? `Por favor, utiliza la ${targetVersion} para continuar.`
    : "Por favor, utiliza la version mas reciente para continuar.";

  return `${opener} ${request}`;
}

function extractTargetVersion(text) {
  const match = text.match(/\bV\d+\b/i);
  return match ? match[0].toUpperCase() : "";
}

function isTimeInstruction(text) {
  return /^a las \d{1,2}([:.]\d{2})?$/.test(text.trim());
}

function formatTimeInstruction(text) {
  const match = text.match(/\d{1,2}([:.]\d{2})?/);
  if (!match) return text;

  const value = match[0].replace(".", ":");
  return value.includes(":") ? value : `${value}:00`;
}

function buildAlternativeIfPresent(text) {
  return text.toLowerCase().includes("prop")
    ? "Podemos buscar una alternativa que encaje mejor."
    : "Podemos buscar otro horario si os parece bien.";
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeInstructionContent(text) {
  let content = text.trim();
  const lowerContent = content.toLowerCase();

  if (lowerContent.startsWith("el ")) {
    return content;
  }

  if (lowerContent.startsWith("la ")) {
    return content;
  }

  if (lowerContent.startsWith("los ")) {
    return content;
  }

  if (lowerContent.startsWith("las ")) {
    return content;
  }

  if (lowerContent.startsWith("incluyan ")) {
    return `incluir ${content.slice(8).trim()}`;
  }

  if (lowerContent.startsWith("envien ") || lowerContent.startsWith("envíen ")) {
    return `enviar ${content.slice(7).trim()}`;
  }

  if (lowerContent.startsWith("confirmen ")) {
    return `confirmar ${content.slice(10).trim()}`;
  }

  if (lowerContent.startsWith("que ")) {
    content = content.slice(4).trim();
  }

  return content;
}

function showToast(message) {
  selectors.toast.textContent = message;
  selectors.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    selectors.toast.classList.remove("show");
  }, 2600);
}

initialize();
