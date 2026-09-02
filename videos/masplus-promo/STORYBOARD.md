---
format: 1080x1920
duration: 20s
message: "Que tus clientes siempre regresen: tarjeta de lealtad digital en su Wallet"
arc: PAS compacto — hook/dolor → solución → mecanismo → oferta → CTA
audience: dueños de negocios locales (cafeterías, barberías, estéticas), México, viendo Facebook/IG en el celular con el audio apagado
mode: autonomous
music: none
---

## Video direction

- palette system: frame.md (broadside remixado a marca) — canvas claro como fondo dominante, tinta #18181B para el texto principal, naranja de marca (accent) racionado a la palabra-remate de cada frame + pills de CTA; verde ok solo para el check de "sin tarjeta". Nunca inventar colores fuera del pack.
- motion grammar: eases long-tail (power3, suave sobre rebotón); spring-pop solo en los dos momentos "juguetones" (entrada de la tarjeta héroe en F2, logo en F5). Video SILENCIOSO: las revelaciones se pacen a beats visuales de lectura (~0.8–1.2s por línea corta), nunca todo a t=0.
- rhythm / held frames: F1 y F4 terminan en lectura quieta (held read) — son los golpes; F3 es el frame "ocupado" (cascada de pasos); F5 cierra quieto con un solo pulso en la pill de URL. Alternar golpe→demo→golpe evita monotonía.
- zona segura vertical (Facebook Reels): todo el contenido vive en el centro — nada importante en el 12% superior ni el 20% inferior del lienzo (la banda de captions de abajo queda libre por la misma regla).
- negative list: sin fades genéricos de PowerPoint, sin front-load-then-freeze, sin screensaver (elementos flotando sin motivo), sin bokeh/gradientes morados "IA", sin chrome de navegador, sin recolorear el botón de Apple Wallet.

## Frame 1 — El dolor

- scene: Tipografía gigante a beats sobre lienzo crema; "¿Te compran UNA VEZ…" y el remate "…y NUNCA vuelven?" aterriza en naranja
- voiceover: ""
- duration: 3.5s
- transition_in: cut
- status: animated
- src: compositions/frames/01-dolor.html
- type: hook
- persuasion: Pain validation
- beat: frustración → curiosidad
- blueprint: kinetic-type-beats
- asset_candidates:

narrativeRole: Detener el pulgar en <2s validando el dolor #1 del dueño de negocio local: clientes que no regresan. Todo en texto grande — el ad corre en silencio.
keyMessage: Tus clientes no están regresando.

- focal: (tipografía pura)
- roles: —

Reproduce (kinetic-type-beats): la moción ES el texto cambiando; el remate llega en el último beat, nunca a t=0.
Scene 1 (0.0–1.0s): lienzo canvas del pack, limpio; "¿Te compran" + "UNA VEZ…" aterrizan con kinetic beat-slam en dos beats (display del pack, enorme, centrado, ~60% del ancho, tinta) — Centered, jerarquía por tamaño 3:1. Nada más en pantalla.
Scene 2 (1.0–2.2s): hard-cut word-swap del bloque completo: "…y NUNCA" (tinta) + "vuelven?" — "NUNCA" recibe highlight sweep en accent naranja (css-marker-patterns) justo al aterrizar. Centered, mismo eje.
Scene 3 (2.2–3.5s): held read — todo quieto; subtle jitter de baja amplitud solo en "NUNCA" para mantenerlo vivo. Sin cámara, sin breathing.

## Frame 2 — La solución

- scene: La tarjeta de lealtad real (captura del producto) entra con spring y se planta como héroe; arriba el claim "Dales una tarjeta que vive en su celular"; botón oficial "Agregar a Apple Wallet" debajo
- voiceover: ""
- duration: 4.5s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-solucion.html
- type: product_intro
- persuasion: Show-don't-tell proof
- beat: alivio + intriga
- blueprint: kinetic-type-beats
- asset_candidates: assets/ejemplo1.webp — tarjeta real de la plataforma (sellos + QR, vertical); assets/add-to-apple-wallet-logo.png — botón oficial Apple Wallet

narrativeRole: El mensaje del brief aterriza en el beat 2 (reverse iceberg): la tarjeta digital ES la promesa, mostrada con el producto real, no un mockup inventado.
keyMessage: Existe una tarjeta de lealtad digital que vive en el Wallet de tu cliente.

- focal: assets/ejemplo1.webp
- roles: ejemplo1 = cutout (héroe) · add-to-apple-wallet-logo = supporting

Adapt (kinetic-type-beats): keep — beats de texto que reparten la revelación; change — el payoff del último beat no es texto sino el producto real entrando con spring-pop. Signature move (in-place beats con payoff final) intacto.
Scene 1 (0.0–1.1s): claim superior en dos beats per-word staggered: "Dales una tarjeta" / "que vive en su celular" — upper-third dorado, display del pack, tinta con "celular" en accent. Asymmetric 60/40 vertical: el 60 inferior aún vacío (tensión).
Scene 2 (1.1–2.6s): spring-pop entrance de la tarjeta real (ejemplo1, cutout, ligera rotación -4°, sombra profunda del pack) ocupando ~55% del alto, centro-bajo del área segura; motion-blur streak vertical sutil en la entrada. 3 capas de profundidad: canvas → glow naranja ambient detrás (ambient-glow-bloom) → tarjeta.
Scene 3 (2.6–3.6s): el botón "Agregar a Apple Wallet" (supporting, tamaño real, sin recolorear) desliza bajo la tarjeta con settle largo; keyword glow suave en "celular" del claim.
Scene 4 (3.6–4.5s): held read; live SVG internals no aplica — subtle jitter solo en la tarjeta (amplitud mínima).

## Frame 3 — Cómo funciona

- scene: Tres pasos como tarjetas apiladas que se auto-ensamblan en cascada — "1 Escanea el QR", "2 Junta sellos" (una fila de sellos se va llenando), "3 Premio gratis" — cada una con ícono grande
- voiceover: ""
- duration: 5s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/03-como-funciona.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: claridad + control
- blueprint: grid-card-assemble
- asset_candidates:

narrativeRole: Bajar la fricción percibida: tres pasos, cero apps, cero cartón. El llenado de sellos en vivo es la micro-demo del producto dentro del paso 2.
keyMessage: Es tan simple que mis clientes sí lo van a usar.

- focal: (tarjetas de pasos dibujadas con el sistema del pack)
- roles: —

Reproduce (grid-card-assemble): lista vertical que se auto-ensambla en cascada; signature move = la cascada escalonada con settle. Micro-demo dentro del paso 2.
Scene 1 (0.0–0.8s): título corto "Así de fácil:" spring-pop centrado upper-third (display, tinta). Canvas limpio debajo.
Scene 2 (0.8–2.0s): tarjeta paso 1 entra en cascada desde abajo con settle power3 — pill grande del pack, borde tinta: número "1" enorme en accent + "Escanea el QR" + ícono QR dibujándose con SVG self-draw. Full-width strip centrado, ~26% del alto.
Scene 3 (2.0–3.4s): tarjeta paso 2 se apila debajo: "2 Junta sellos" — dentro, una fila de 5 círculos de sello se llena uno a uno (stat-bars-and-fills, versión sellos) con stagger; el 5º recibe highlight burst naranja. La micro-demo es el centro de gravedad del frame.
Scene 4 (3.4–4.3s): tarjeta paso 3: "3 Premio GRATIS" — "GRATIS" en accent con highlight sweep. Las tres tarjetas quedan en columna, jerarquía por posición+peso.
Scene 5 (4.3–5.0s): held read de la columna completa; subtle jitter solo en el sello #5.

## Frame 4 — La oferta

- scene: "14 DÍAS GRATIS" con el número contando hacia arriba y reventando en tamaño; pill debajo "Sin tarjeta de crédito"; segunda pill "Y un plan gratis para siempre"
- voiceover: ""
- duration: 3.5s
- transition_in: squeeze
- status: animated
- src: compositions/frames/04-oferta.html
- type: benefit_highlight
- persuasion: Risk reversal
- beat: FOMO → confianza
- blueprint: dataviz-countup
- asset_candidates:

narrativeRole: Quitar el último freno con la oferta real del producto (14 días de Plan Pro sin tarjeta; plan Gratis para siempre). El número es el héroe.
keyMessage: Probarlo no me cuesta nada ni me ata.

- focal: (el número 14, tipográfico)
- roles: —

Adapt (dataviz-countup): keep — el count-up con escala creciente ES el frame (value-scaled counter, signature move); change — sin ring ni chart: el número es tipografía display gigante, y el "push-through" se sustituye por el aterrizaje de las pills (formato 9:16 corto). 
Scene 1 (0.0–1.4s): sobre canvas limpio, un contador "14" cuenta 0→14 con counting-dynamic-scale — crece de ~20% a ~55% del ancho mientras sube, display en accent naranja, centrado óptico (golden upper-third); "DÍAS GRATIS" aterriza debajo en tinta al llegar a 14 (kinetic beat-slam, un beat).
Scene 2 (1.4–2.4s): pill 1 "✓ Sin tarjeta de crédito" desliza desde abajo con settle largo (check en verde ok del pack). Centered, bajo el titular.
Scene 3 (2.4–3.5s): pill 2 "✓ Plan gratis para siempre" se apila con el mismo movimiento; luego held read total — el número queda quieto (la quietud remata contra el count-up inicial).

## Frame 5 — CTA

- scene: Cierre de marca — el logo más+ se planta con spring, "Crea tu primera tarjeta GRATIS" en beats y el sello final maspluss.com en una pill naranja que pulsa una vez
- voiceover: ""
- duration: 3.5s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-cta.html
- type: cta
- persuasion: Friction reduction + urgency-to-act
- beat: motivación → urgencia de actuar
- blueprint: kinetic-type-beats
- asset_candidates: assets/masplus_logo_wide.png — logotipo horizontal más+; assets/masplus_icon.png — ícono de marca

narrativeRole: Una sola acción pedida, alineada con el botón del ad ("Más información" / "Enviar mensaje"): crear la primera tarjeta gratis en maspluss.com.
keyMessage: Entra a maspluss.com y crea tu tarjeta gratis hoy.

- focal: assets/masplus_logo_wide.png
- roles: masplus_logo_wide = cutout (héroe del cierre) · masplus_icon = supporting (no usar si satura; el wide basta)

Reproduce (kinetic-type-beats, cierre CTA): línea de cierre en beats que remata sobre el logo/URL; signature move = el snap beat-a-beat hacia el lockup final.
Scene 1 (0.0–1.0s): "Crea tu primera tarjeta" aterriza en per-word staggered reveal, display tinta, centrado en el tercio medio; "GRATIS" llega como beat propio en accent con highlight sweep.
Scene 2 (1.0–2.0s): el logo más+ (wide, cutout) entra con spring-pop bajo el texto (~40% del ancho), glow naranja ambient sutil detrás. 3 capas: canvas → glow → logo.
Scene 3 (2.0–3.5s): pill naranja "maspluss.com" (texto blanco, display) desliza y se asienta bajo el logo; UN pulso de button press (press-release-spring, sin cursor) y held read hasta el corte final. Nada más se mueve.
