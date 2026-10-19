// Formulário de suporte do LedBox.
// Envia direto para o e-mail de suporte pelo FormSubmit (formsubmit.co, gratuito, sem conta): a mensagem chega
// como e-mail normal na caixa do CONTACT_EMAIL, com "Responder" indo para o e-mail que o jogador digitou.
// Primeira vez: o FormSubmit manda um e-mail "Activate form" para o CONTACT_EMAIL; é preciso clicar para ativar.
// Se o envio falhar (sem internet, serviço fora), cai no plano B: abre o app de e-mail do jogador já preenchido.
const CONFIG = {
  ENDPOINT: "https://formsubmit.co/ajax/ledboxsupport@gmail.com",
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

  const subject = `[LedBox] ${data.topic}`;
  const mailBody = `Topic: ${data.topic}\nGoogle Play Games name: ${data.gamerName || "-"}\nPhone: ${data.device || "-"}\nReply to: ${data.email}\n\n${data.message}`;
  const openMailApp = () => {
    location.href = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
    finish(t.doneMail);
  };

  // Armadilha para robôs: campo escondido que gente não preenche
  if (form._honey && form._honey.value) return finish(t.done);

  button.disabled = true;
  button.textContent = t.sending;
  try {
    const res = await fetch(CONFIG.ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: subject,
        _replyto: data.email,
        _template: "table",
        _captcha: "false",
        Topic: data.topic,
        Email: data.email,
        "Google Play Games name": data.gamerName || "-",
        "Phone model": data.device || "-",
        Message: data.message || "-",
        Language: lang,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || String(json.success) === "false") throw new Error(json.message || res.status);
    finish(t.done);
  } catch (err) {
    console.warn("Envio pelo FormSubmit falhou, abrindo o app de e-mail:", err);
    openMailApp();
  }
});
