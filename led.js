// Letreiro de LED do site, igual ao do jogo (LedSign): letras 5x7 de pontos, os apagados aparecem fracos ao fundo, os
// acesos com brilho neon e miolo branco. Acende numa onda da esquerda para a direita quando entra na tela (sem
// piscar). Uso: <canvas class="led-sign" data-text="LED BOX" data-color="#79feff" data-dot="14" data-box="O"></canvas>
// data-box: a letra que vira a caixa do player (como no título do jogo). data-dot: distância máxima entre os pontos.
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
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function layout(text, box) {
    // Colunas: letra 5, espaço 2, caixa 7, e 2 entre letras (como no jogo)
    const dots = []; let x = 0; let boxAt = null;
    [...text.toUpperCase()].forEach((c, i) => {
      if (box && c === box) { boxAt = x; x += 7; }
      else if (c === " ") { x += 2; }
      else if (G[c]) {
        G[c].forEach((row, r) => [...row].forEach((bit, col) => dots.push({ x: x + col, y: r, on: bit === "1" })));
        x += 5;
      }
      if (i < text.length - 1) x += 2;
    });
    return { dots, cols: x, boxAt };
  }

  function draw(sign, progress) {
    const { canvas, ctx, data, dot, color, scale } = sign;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pad = dot * 1.2, r = dot * 0.36;
    const width = data.cols * dot;
    for (const d of data.dots) {
      const cx = pad + d.x * dot + dot / 2, cy = pad + d.y * dot + dot / 2;
      // Onda: cada ponto acende quando a frente passa por ele (com um leve pulo de brilho)
      const t = d.on ? Math.min(1, Math.max(0, (progress * (width + dot * 8) - d.x * dot) / (dot * 6))) : 0;
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = color + "22"; // apagado, fraco ao fundo
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      if (t <= 0) continue;
      ctx.globalAlpha = t;
      ctx.shadowColor = color; ctx.shadowBlur = dot * 1.1 * scale;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy, r * (1 + 0.25 * (1 - t)), 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2); ctx.fill();
    }
    if (data.boxAt !== null) {
      // A caixa do player no lugar da letra (cor #79feff, com brilho)
      const t = Math.min(1, Math.max(0, progress * 1.4));
      const s = dot * 6.2, bx = pad + data.boxAt * dot + (7 * dot - s) / 2, by = pad + (7 * dot - s) / 2;
      ctx.globalAlpha = t;
      ctx.shadowColor = "#79feff"; ctx.shadowBlur = dot * 2.5 * scale;
      ctx.fillStyle = "#d8ffff";
      ctx.fillRect(bx, by, s, s);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  function size(sign) {
    const el = sign.canvas;
    const max = parseFloat(el.dataset.dot || "12");
    // Largura útil do pai (sem o recuo das laterais), medida com o letreiro encolhido para ele não alargar o pai: o
    // letreiro nunca passa da tela
    el.style.width = "0px";
    const parent = el.parentElement, style = getComputedStyle(parent);
    const avail = (parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)) * 0.98;
    const cols = sign.data.cols + 2.4;
    const dot = Math.max(3, Math.min(max, avail / cols));
    const ratio = window.devicePixelRatio || 1;
    const w = cols * dot, h = (7 + 2.4) * dot;
    el.style.width = w + "px"; el.style.height = h + "px";
    el.width = Math.round(w * ratio); el.height = Math.round(h * ratio);
    sign.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    sign.dot = dot; sign.scale = 1;
  }

  const signs = [...document.querySelectorAll("canvas.led-sign")].map(canvas => {
    const sign = {
      canvas, ctx: canvas.getContext("2d"),
      data: layout(canvas.dataset.text || "", canvas.dataset.box || null),
      color: canvas.dataset.color || "#79feff",
      progress: reduced ? 1 : 0, started: reduced
    };
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", canvas.dataset.text || "");
    size(sign); draw(sign, sign.progress);
    return sign;
  });

  function animate(sign) {
    const start = performance.now();
    const step = now => {
      sign.progress = Math.min(1, (now - start) / 900);
      draw(sign, sign.progress);
      if (sign.progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      const sign = signs.find(s => s.canvas === e.target);
      if (e.isIntersecting && sign && !sign.started) { sign.started = true; animate(sign); io.unobserve(e.target); }
    }), { threshold: 0.4 });
    signs.forEach(s => io.observe(s.canvas));
  } else signs.forEach(s => { s.progress = 1; draw(s, 1); });

  // Refaz quando a largura do bloco muda (girar a tela, barra de rolagem aparecendo, fonte carregando)
  const resize = sign => { size(sign); draw(sign, sign.progress); };
  if ("ResizeObserver" in window) {
    signs.forEach(sign => {
      let last = 0;
      new ResizeObserver(entries => {
        const w = Math.round(entries[0].contentRect.width);
        if (w !== last) { last = w; resize(sign); }
      }).observe(sign.canvas.parentElement);
    });
  } else {
    let timer;
    window.addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(() => signs.forEach(resize), 100); });
  }
})();
