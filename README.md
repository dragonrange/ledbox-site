# LedBox — site público

Páginas públicas do jogo LedBox (GitHub Pages): página inicial com o selo do Google Play, política de privacidade, suporte e exclusão de dados.
O código do jogo fica em outro repositório (privado).

- `privacy.html` — política de privacidade (inglês e português). Link usado no Play Console.
- `delete.html` — como pedir a exclusão da conta e dos dados (exigência do Google Play).
- `support.html` + `support.js` — formulário de suporte. As mensagens chegam por e-mail
  pelo FormSubmit (direto no e-mail de suporte; na primeira vez, ativar pelo e-mail "Activate form"); se falhar, abre o e-mail já preenchido.

E-mail de contato: ledboxsupport@gmail.com (em `privacy.html`, `delete.html` e `support.js`).

## Página inicial (`index.html`)

- Selo **oficial** do Google Play (imagem do gerador do Google, sem alterações, em inglês como a página), com link para
  a página da loja e a frase de marca registrada no rodapé — regras de marca do Google.
- Imagens em `img/` (capturas do jogo em JPG, 1596x896), num carrossel (`carousel.js`) com moldura da loja, setas e bolinhas de LED; clicar abre um popup grande na própria página (mesmas setas e bolinhas, arrastar, Esc fecha).
- Trailer em `video/ledbox-trailer.mp4` (gravado no jogo: LedBox > Trailer > Gravar trailer), capa `img/trailer-poster.jpg`; `preload="none"`, só baixa quando dá play.
- Seção **Bosses**: o OHMEGA é o Boss 01 e os próximos aparecem trancados ("???", coming soon) — o jogo vai ter mais chefes.
- Títulos em letreiro de LED (`led.js`): as mesmas letras 5x7 do `LedSign` do jogo, desenhadas em SVG (sem filtro de desfoque, que quebrava no Brave) e acendendo em onda.
- Ao mudar `style.css`/`*.js`, subir o `?v=` nos links (o GitHub Pages guarda arquivos em cache por ~10 min).
- Enquanto o jogo está em teste fechado, a página da loja dá "Not Found" para o público (publicado assim mesmo, decisão do Felipe em 25/10).
