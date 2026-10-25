// Letreiro de LED do site, igual ao do jogo (LedSign): letras 5x7 de pontos, os apagados aparecem fracos ao fundo, os
// acesos com brilho neon e miolo branco. Acende numa onda da esquerda para a direita quando entra na tela (sem piscar).
// Feito em SVG (escala sozinho com a largura e fica igual em qualquer navegador; em canvas o Brave borrava o desenho).
// Uso: <div class="led-sign" data-text="LED BOX" data-color="#79feff" data-dot="14" data-box="O"></div>
// data-box: a letra que vira a caixa do player (como no título do jogo). data-dot: tamanho máximo do ponto, em px.
(function () {
  const G = {
    A: ["01110","10001","10001","11111","10001","10001","10001"], B: ["11110","10001","10001","11110","10001","10001","11110"],
    C: ["01110","10001","10000","10000","10000","10001","01110"], D: ["11110","10001","10001","10001","10001","10001","11110"],
    E: ["11111","10000","10000","11110","10000","10000","11111"], F: ["11111","10000","10000","11110","10000","10000","10000"],
    G: ["01110","10001","10000","10111","10001","10001","01111"], H: ["10001","10001","10001","11111","10001","10001","10001"],
    I: ["01110","00100","00100","00100","00100","00100","01110"], J: ["00111","00010","00010","00010","00010","10010","01100"],
    K: ["10001","10010","10100","11000","10100","10010","10001"], L: ["10000","10000","10000","10000","10000","10000","11111"],
    M: ["10001","11011","10101","10101","10001","10001","10001"], N: ["10001","10001","11001","10101","10011","10001","10001"],
    O: ["01110","10001","10001","10001","10001","10001","01110"], P: ["11110","10001","10001","11110","10000","10000","10000"],
    Q: ["01110","10001","10001","10001","10101","10010","01101"], R: ["11110","10001","10001","11110","10100","10010","10001"],
    S: ["01111","10000","10000","01110","00001","00001","11110"], T: ["11111","00100","00100","00100","00100","00100","00100"],
    U: ["10001","10001","10001","10001","10001","10001","01110"], V: ["10001","10001","10001","10001","10001","01010","00100"],
    W: ["10001","10001","10001","10101","10101","10101","01010"], X: ["10001","10001","01010","00100","01010","10001","10001"],
    Y: ["10001","10001","01010","00100","00100","00100","00100"], Z: ["11111","00001","00010","00100","01000","10000","11111"],
    "0": ["01110","10001","10011","10101","11001","10001","01110"], "1": ["00100","01100","00100","00100","00100","00100","01110"],
    "2": ["01110","10001","00001","00010","00100","01000","11111"], "3": ["11111","00010","00100","00010","00001","10001","01110"],
    "4": ["00010","00110","01010","10010","11111","00010","00010"], "5": ["11111","10000","11110","00001","00001","10001","01110"],
    "6": ["00110","01000","10000","11110","10001","10001","01110"], "7": ["11111","00001","00010","00100","01000","01000","01000"],
    "8": ["01110","10001","10001","01110","10001","10001","01110"], "9": ["01110","10001","10001","01111","00001","00010","01100"],
    "+": ["00000","00100","00100","11111","00100","00100","00000"], "-": ["00000","00000","00000","11111","00000","00000","00000"],
    "?": ["01110","10001","00001","00010","00100","00000","00100"], "!": ["00100","00100","00100","00100","00100","00000","00100"]
  };
  const NS = "http://www.w3.org/2000/svg";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(name, attrs) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function build(host) {
    const text = (host.dataset.text || "").toUpperCase();
    const box = host.dataset.box || null;
    const color = host.dataset.color || "#79feff";
    const maxDot = parseFloat(host.dataset.dot || "12");

    // Colunas: letra 5, espaço 2, caixa 7, e 2 entre letras (como no jogo). Cada ponto ocupa 1 unidade do desenho
    const lit = [], off = []; let x = 0, boxAt = null;
    [...text].forEach((c, i) => {
      if (box && c === box) { boxAt = x; x += 7; }
      else if (c === " ") { x += 2; }
      else if (G[c]) {
        G[c].forEach((row, r) => [...row].forEach((bit, col) => (bit === "1" ? lit : off).push([x + col, r])));
        x += 5;
      }
      if (i < text.length - 1) x += 2;
    });
    const pad = 1.2, w = x + pad * 2, h = 7 + pad * 2;

    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": host.dataset.text || "" });
    svg.style.setProperty("--led", color);
    svg.style.maxWidth = (w * maxDot) + "px";
    const dot = ([px, py]) => [pad + px + 0.5, pad + py + 0.5];

    const back = el("g", { class: "off" });
    off.concat(lit).forEach(p => { const [cx, cy] = dot(p); back.appendChild(el("circle", { cx, cy, r: 0.36 })); });
    svg.appendChild(back);

    // Brilho neon SEM filtro: o desfoque SVG (feGaussianBlur) quebrava no Brave/Chromium (blocos brancos e listras).
    // Aqui o halo é um gradiente radial desenhado por ponto, que o navegador renderiza igual em qualquer GPU.
    const id = "led-glow-" + Math.random().toString(36).slice(2, 8);
    const defs = el("defs", {});
    const grad = el("radialGradient", { id });
    [["0", .75], [".35", .38], [".7", .1], ["1", 0]].forEach(([offset, op]) =>
      grad.appendChild(el("stop", { offset, "stop-color": color, "stop-opacity": op })));
    defs.appendChild(grad);
    svg.appendChild(defs);

    const delay = (gx, node) => { node.style.transitionDelay = (gx / Math.max(x, 1) * 0.7).toFixed(3) + "s"; return node; }; // onda da esquerda para a direita
    const halos = el("g", { class: "halos" });   // camada de baixo: brilho
    const dots = el("g", { class: "dots" });     // camada de cima: ponto colorido + miolo branco
    lit.forEach(p => {
      const [cx, cy] = dot(p);
      halos.appendChild(delay(p[0], el("circle", { cx, cy, r: 1.15, fill: `url(#${id})`, class: "px halo" })));
      const g = delay(p[0], el("g", { class: "px" }));
      g.appendChild(el("circle", { cx, cy, r: 0.38, class: "glow" }));
      g.appendChild(el("circle", { cx, cy, r: 0.17, class: "core" }));
      dots.appendChild(g);
    });
    svg.appendChild(halos);
    svg.appendChild(dots);
    if (boxAt !== null) {
      const s = 6.2, bx = pad + boxAt + (7 - s) / 2, by = pad + (7 - s) / 2;
      const g = delay(boxAt, el("g", { class: "px box" }));
      // halo da caixa: contornos largos e fracos empilhados (no lugar do desfoque)
      [[1.6, .06], [1.1, .09], [.65, .14], [.3, .22]].forEach(([sw, op]) =>
        g.appendChild(el("rect", { x: bx, y: by, width: s, height: s, rx: 0.3, class: "boxglow", "stroke-width": sw, "stroke-opacity": op })));
      g.appendChild(el("rect", { x: bx, y: by, width: s, height: s, rx: 0.3, class: "boxfill" }));
      svg.appendChild(g);
    }
    host.appendChild(svg);
    return host;
  }

  const hosts = [...document.querySelectorAll(".led-sign")].map(build);
  const light = host => host.classList.add("lit");
  if (reduced || !("IntersectionObserver" in window)) hosts.forEach(light);
  else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { light(e.target); io.unobserve(e.target); }
    }), { threshold: 0.3 });
    hosts.forEach(h => io.observe(h));
  }
})();
