// Formulário de suporte do LedBox.
// As respostas vão para um Google Forms (planilha + aviso por e-mail). Para ligar:
//   1. Crie o formulário com os campos abaixo (mesmos nomes de opção do assunto) e pegue o "link pré-preenchido".
//   2. Preencha FORM_ACTION (…/formResponse) e os entry.NNN de cada campo.
// Enquanto FORM_ACTION estiver vazio, o envio abre o app de e-mail do jogador já preenchido (CONTACT_EMAIL).
const CONFIG = {
  FORM_ACTION: "", // ex.: "https://docs.google.com/forms/d/e/XXXXXXXX/formResponse"
  FIELDS: {
    topic: "",     // ex.: "entry.111111111"
    email: "",
    gamerName: "",
    device: "",
    message: "",
  },
  CONTACT_EMAIL: "ledboxsupport@gmail.com",
};

const TEXT = {
  en: {
    navSupport: "Support", navPrivacy: "Privacy", navDelete: "Delete my data",
    title: "Support",
    intro: "Found a bug, have a question or want your data deleted? Send us a message and we'll answer by email.",
    topic: "Topic", topicBug: "Bug", topicQuestion: "Question", topicDelete: "Delete my account and data", topicOther: "Other",
    email: "Your email", gamer: "Google Play Games name", gamerHint: "(as shown on the leaderboard)",
    device: "Phone model", optional: "(optional)", message: "Message", send: "Send", sending: "Sending…",
    privacyNote: "What you send is used only to answer you. See the", privacyLink: "privacy policy",
    errEmail: "Please enter a valid email so we can answer you.",
    errMessage: "Please write a message.",
    errGamer: "To delete your data, tell us your Google Play Games name (or roughly when you last played).",
    errSend: "Couldn't send right now. Check your connection and try again.",
    done: "Thanks! Your message was sent. We'll answer by email.",
    doneMail: "Your email app opened with the message ready — just tap send there.",
  },
  pt: {
    navSupport: "Suporte", navPrivacy: "Privacidade", navDelete: "Apagar meus dados",
    title: "Suporte",
    intro: "Achou um bug, tem uma dúvida ou quer apagar seus dados? Mande uma mensagem e respondemos por e-mail.",
    topic: "Assunto", topicBug: "Bug", topicQuestion: "Dúvida", topicDelete: "Apagar minha conta e meus dados", topicOther: "Outro",
    email: "Seu e-mail", gamer: "Nome no Google Play Games", gamerHint: "(o que aparece no ranking)",
    device: "Modelo do celular", optional: "(opcional)", message: "Mensagem", send: "Enviar", sending: "Enviando…",
    privacyNote: "O que você enviar é usado só para te responder. Veja a", privacyLink: "política de privacidade",
    errEmail: "Coloque um e-mail válido para podermos te responder.",
    errMessage: "Escreva uma mensagem.",
    errGamer: "Para apagar seus dados, diga o seu nome no Google Play Games (ou mais ou menos quando jogou pela última vez).",
    errSend: "Não deu para enviar agora. Confira a internet e tente de novo.",
    done: "Valeu! Sua mensagem foi enviada. Respondemos por e-mail.",
    doneMail: "Seu app de e-mail abriu com a mensagem pronta — é só tocar em enviar lá.",
  },
};

const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "pt" || (!params.get("lang") && (navigator.language || "").toLowerCase().startsWith("pt")) ? "pt" : "en";
const t = TEXT[lang];

document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
document.querySelectorAll("[data-t]").forEach(el => { if (t[el.dataset.t]) el.textContent = t[el.dataset.t]; });
document.title = lang === "pt" ? "Suporte do LedBox" : "LedBox Support";

const form = document.getElementById("support");
const errorBox = document.getElementById("error");
const doneBox = document.getElementById("done");
const button = form.querySelector("button");

if (params.get("topic") === "delete") form.topic.value = "Delete my account and data";

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function finish(msg) {
  form.classList.add("hidden");
  doneBox.textContent = msg;
  doneBox.classList.remove("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.add("hidden");

  const data = {
    topic: form.topic.value,
    email: form.email.value.trim(),
    gamerName: form.gamerName.value.trim(),
    device: form.device.value.trim(),
    message: form.message.value.trim(),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return showError(t.errEmail);
  if (data.topic === "Delete my account and data" && !data.gamerName && !data.message) return showError(t.errGamer);
  if (!data.message && data.topic !== "Delete my account and data") return showError(t.errMessage);

  // Sem Google Forms configurado: abre o e-mail já preenchido
  if (!CONFIG.FORM_ACTION) {
    const body = `Topic: ${data.topic}\nGoogle Play Games name: ${data.gamerName || "-"}\nPhone: ${data.device || "-"}\nReply to: ${data.email}\n\n${data.message}`;
    location.href = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent("[LedBox] " + data.topic)}&body=${encodeURIComponent(body)}`;
    return finish(t.doneMail);
  }

  const body = new URLSearchParams();
  for (const key of Object.keys(CONFIG.FIELDS)) {
    if (CONFIG.FIELDS[key]) body.append(CONFIG.FIELDS[key], data[key]);
  }

  button.disabled = true;
  button.textContent = t.sending;
  try {
    // O Google Forms não devolve CORS: a resposta é opaca, mas o envio chega
    await fetch(CONFIG.FORM_ACTION, { method: "POST", mode: "no-cors", body });
    finish(t.done);
  } catch {
    showError(t.errSend);
    button.disabled = false;
    button.textContent = t.send;
  }
});
