// Carrossel das capturas: setas nas laterais, bolinhas de LED embaixo (só a da imagem atual acesa), arrastar no
// celular e setas do teclado. Clicar numa imagem abre ela grande num popup na própria página (lightbox), com as mesmas
// setas, bolinhas e arrastar; Esc, o X ou tocar fora fecha. Sem troca automática (quem olha decide o ritmo).
(function () {
  const root = document.querySelector(".carousel");
  if (!root) return;
  const track = root.querySelector(".track");
  const slides = [...root.querySelectorAll(".slide")];
  const count = slides.length;
  let index = 0;

  // Bolinhas de LED (uma por imagem)
  function makeLeds(holder, onPick) {
    return slides.map((slide, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "led";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Screenshot " + (i + 1) + " of " + count);
      b.addEventListener("click", e => { e.stopPropagation(); onPick(i); });
      holder.appendChild(b);
      return b;
    });
  }
  const light = (dots, i) => dots.forEach((d, n) => { d.classList.toggle("on", n === i); d.setAttribute("aria-selected", n === i); });

  // Arrastar: devolve true se foi um arrasto (aí o toque não conta como clique)
  function swipe(area, onSwipe) {
    let startX = null, moved = false;
    area.addEventListener("pointerdown", e => { startX = e.clientX; moved = false; });
    area.addEventListener("pointermove", e => { if (startX !== null && Math.abs(e.clientX - startX) > 10) moved = true; });
    window.addEventListener("pointerup", e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) onSwipe(dx < 0 ? 1 : -1);
    });
    return () => moved;
  }

  // ---------- Carrossel ----------
  const dots = makeLeds(root.querySelector(".leds"), i => go(i));

  function go(i) {
    index = (i + count) % count;
    track.style.transform = "translateX(" + (-100 * index) + "%)";
    light(dots, index);
    slides.forEach((s, n) => s.setAttribute("aria-hidden", n !== index));
  }

  root.querySelector(".prev").addEventListener("click", () => go(index - 1));
  root.querySelector(".next").addEventListener("click", () => go(index + 1));
  root.tabIndex = 0;
  root.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "Enter") open();
  });
  const dragged = swipe(track, step => go(index + step));
  slides.forEach(slide => {
    slide.querySelector("img").addEventListener("click", () => { if (!dragged()) open(); });
  });

  // ---------- Popup (lightbox) ----------
  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Screenshot viewer");
  box.hidden = true;
  box.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="arrow prev" type="button" aria-label="Previous screenshot">&#8249;</button>' +
    '<figure class="lb-frame"><img alt=""><figcaption></figcaption></figure>' +
    '<button class="arrow next" type="button" aria-label="Next screenshot">&#8250;</button>' +
    '<div class="leds"></div>';
  document.body.appendChild(box);
  const bigImg = box.querySelector("img");
  const bigCaption = box.querySelector("figcaption");
  const bigDots = makeLeds(box.querySelector(".leds"), i => show(i));
  let lastFocus = null;

  function show(i) {
    go(i); // o carrossel acompanha: ao fechar, fica na mesma imagem
    const img = slides[index].querySelector("img");
    bigImg.src = img.currentSrc || img.src;
    bigImg.alt = img.alt;
    bigCaption.textContent = slides[index].querySelector("figcaption")?.textContent || "";
    light(bigDots, index);
  }

  // As capturas do carrossel só baixam quando aparecem (lazy): no popup, baixa todas logo, para a troca não mostrar a
  // imagem anterior enquanto a próxima carrega
  let preloaded = false;
  function preload() {
    if (preloaded) return;
    preloaded = true;
    slides.forEach(s => { const img = s.querySelector("img"); img.loading = "eager"; new Image().src = img.src; });
  }

  function open() {
    preload();
    lastFocus = document.activeElement;
    show(index);
    box.hidden = false;
    document.body.classList.add("no-scroll");
    box.querySelector(".lb-close").focus();
  }

  function close() {
    box.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".prev").addEventListener("click", e => { e.stopPropagation(); show(index - 1); });
  box.querySelector(".next").addEventListener("click", e => { e.stopPropagation(); show(index + 1); });
  const lbDragged = swipe(box, step => show(index + step));
  // Tocar fora da imagem (no fundo escuro) fecha
  box.addEventListener("click", e => { if (e.target === box && !lbDragged()) close(); });
  document.addEventListener("keydown", e => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  go(0);
})();
