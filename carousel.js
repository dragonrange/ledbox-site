// Carrossel das capturas: setas nas laterais, bolinhas de LED embaixo (só a da imagem atual acesa), arrastar no
// celular e setas do teclado. Sem troca automática (quem olha decide o ritmo).
(function () {
  const root = document.querySelector(".carousel");
  if (!root) return;
  const track = root.querySelector(".track");
  const slides = [...root.querySelectorAll(".slide")];
  const leds = root.querySelector(".leds");
  let index = 0;

  const dots = slides.map((slide, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "led";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Screenshot " + (i + 1) + " of " + slides.length);
    b.addEventListener("click", () => go(i));
    leds.appendChild(b);
    return b;
  });

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-100 * index) + "%)";
    dots.forEach((d, n) => { d.classList.toggle("on", n === index); d.setAttribute("aria-selected", n === index); });
    slides.forEach((s, n) => s.setAttribute("aria-hidden", n !== index));
  }

  root.querySelector(".prev").addEventListener("click", () => go(index - 1));
  root.querySelector(".next").addEventListener("click", () => go(index + 1));
  root.tabIndex = 0;
  root.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  });

  // Arrastar com o dedo
  let startX = null;
  track.addEventListener("pointerdown", e => { startX = e.clientX; });
  window.addEventListener("pointerup", e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  });

  go(0);
})();
