/* ============================================================
   Panel de administración — Tejidos Castañeda
   Se carga SOLO cuando abres la tienda con  #admin  al final:
       https://tejiendocastaneda-afk.github.io/tejidos-castaneda_je/#admin
   Usa las mismas funciones de index.html (PRODUCTOS, parseTodas, poner, aplicar...)
   y guarda lo oculto en Supabase. Aquí NO hay claves secretas:
   escribir en la base de datos exige iniciar sesión con tu correo y contraseña.
   ============================================================ */
(function () {
  "use strict";
  if (window.TCAdmin) return;

  const KS = "tc_admin_sesion";
  let ses = null, estado = new Set(), cola = Promise.resolve(), pend = 0;
  let filtro = "todos", texto = "", ov = null, cards = [], tt = 0;

  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const CSS = `
#adm{position:fixed;inset:0;z-index:100;background:var(--noche);overflow:auto;-webkit-overflow-scrolling:touch}
#adm *{box-sizing:border-box}
#adm .a-in{max-width:900px;margin:0 auto;padding:0 14px 60px}
#adm .a-top{position:sticky;top:0;z-index:5;background:var(--noche);border-bottom:1px solid var(--linea);padding:10px 14px}
#adm .a-top .a-in{padding:0}
#adm .a-fila{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
#adm h2{font-size:1.7rem;color:var(--oro2)}
#adm .a-mini{background:none;border:1px solid var(--linea);border-radius:999px;padding:6px 14px;font-size:.88rem}
#adm .a-mini:hover{border-color:var(--oro)}
#adm input[type=search],#adm input[type=email],#adm input[type=password]{width:100%;background:var(--pino);color:var(--crema);border:1px solid var(--linea);border-radius:6px;padding:11px 12px;font:inherit}
#adm input:focus-visible{outline:2px solid var(--oro)}
#adm .a-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#adm .a-chips button{background:none;border:1px solid var(--linea);border-radius:999px;padding:6px 13px;font-size:.88rem}
#adm .a-chips button[aria-pressed=true]{background:var(--oro);border-color:var(--oro);color:var(--noche);font-weight:700}
#adm .a-ayuda{color:var(--suave);font-size:.9rem;margin:14px 0}
#adm .a-card{background:var(--pino);border:1px solid var(--linea);border-radius:8px;padding:12px;margin-bottom:12px}
#adm .a-card[hidden]{display:none}
#adm .a-card.off{border-color:var(--vino)}
#adm .a-cab{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center}
#adm .a-th{width:56px;height:70px;border-radius:5px;object-fit:cover;background:#0a1712;display:block}
#adm .a-tit b{display:block;font-size:1.05rem;color:var(--crema)}
#adm .a-tit small{display:block;color:var(--suave)}
#adm .a-est{display:inline-block;margin-top:4px;border-radius:999px;padding:2px 10px;font-size:.74rem;font-weight:700;letter-spacing:.04em;background:#1f5a3f;color:#bff0d1}
#adm .off .a-est{background:var(--vino);color:#ffd9df}
#adm .a-btn{min-width:98px;min-height:44px;border:0;border-radius:6px;padding:10px 14px;font-weight:700;background:var(--vino);color:var(--crema)}
#adm .off .a-btn{background:var(--oro);color:var(--noche)}
#adm .a-btn:disabled{opacity:.6}
#adm .a-fotos{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
#adm .a-f{position:relative;width:64px;height:80px;padding:0;border:2px solid var(--linea);border-radius:6px;overflow:hidden;background:#0a1712}
#adm .a-f img{width:100%;height:100%;object-fit:cover;display:block}
#adm .a-f span{position:absolute;left:0;right:0;bottom:0;background:rgba(160,29,51,.92);color:#fff;font-size:.62rem;font-weight:700;text-align:center;padding:2px 0;display:none}
#adm .a-f.off{border-color:var(--vino)}
#adm .a-f.off img{opacity:.3;filter:grayscale(1)}
#adm .a-f.off span{display:block}
#adm .a-acc{margin-top:8px;display:flex;gap:8px;flex-wrap:wrap}
#adm .a-acc button{background:none;border:0;color:var(--oro2);text-decoration:underline;padding:4px 0;font-size:.88rem}
#adm .a-acc button[hidden]{display:none}
#adm .a-login{max-width:380px;margin:12vh auto 0;background:var(--pino);border:1px solid var(--oro);border-radius:8px;padding:22px}
#adm .a-login label{display:block;margin:12px 0 4px;color:var(--suave);font-size:.9rem}
#adm .a-login .a-btn{width:100%;margin-top:18px;background:var(--oro);color:var(--noche)}
#adm .a-err{color:#ff9aa8;margin:10px 0 0;font-size:.92rem;min-height:1.2em}
#adm .a-vacio{color:var(--suave);text-align:center;padding:40px 0}
#a-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:110;background:#1f5a3f;color:#fff;border-radius:999px;padding:10px 20px;font-weight:700;max-width:92vw;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.5)}
#a-toast.mal{background:var(--vino)}
#a-toast[hidden]{display:none}
@media(max-width:600px){#adm .a-top{position:static}}
@media(max-width:520px){#adm .a-cab{grid-template-columns:48px 1fr}#adm .a-th{width:48px;height:60px}#adm .a-cab .a-btn{grid-column:1/-1;width:100%}}`;

  /* ---------- sesión (Supabase Auth, sin librerías externas) ---------- */
  const authPost = async (ruta, cuerpo) => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/${ruta}`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
    let j = {}; try { j = await r.json(); } catch (e) {}
    return { r, j };
  };
  function guardarSes(j, email) {
    ses = { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 - 60000, email: (j.user && j.user.email) || email || (ses && ses.email) || "" };
    try { localStorage.setItem(KS, JSON.stringify(ses)); } catch (e) {}
  }
  function salirSes() { ses = null; try { localStorage.removeItem(KS); } catch (e) {} }
  async function token() {
    if (!ses) throw new Error("sesion");
    if (Date.now() > ses.exp) {
      const { r, j } = await authPost("token?grant_type=refresh_token", { refresh_token: ses.refresh });
      if (!r.ok) { salirSes(); throw new Error("sesion"); }
      guardarSes(j);
    }
    return ses.access;
  }
  async function entrar(email, clave) {
    const { r, j } = await authPost("token?grant_type=password", { email, password: clave });
    if (!r.ok) throw new Error(r.status === 400 || r.status === 401 ? "Correo o contraseña incorrectos." : "No se pudo entrar (" + r.status + "). Intenta de nuevo.");
    guardarSes(j, email);
  }

  /* ---------- escritura en la base de datos ---------- */
  async function rest(metodo, consulta, cuerpo, prefer) {
    const t = await token();
    const r = await fetch(`${SUPABASE_URL}/rest/v1/ocultos${consulta}`, {
      method: metodo,
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + t, "Content-Type": "application/json", Prefer: prefer || "return=minimal" },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    if (r.status === 401 || r.status === 403) throw new Error(r.status === 401 ? "sesion" : "permiso");
    if (!r.ok) throw new Error("HTTP " + r.status);
  }

  function aviso(txt, mal) {
    let t = document.getElementById("a-toast");
    if (!t) { t = el("div"); t.id = "a-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = txt; t.className = mal ? "mal" : ""; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(() => t.hidden = true, mal ? 6000 : 1800);
  }

  /* Cambia el estado de una o varias claves. Se ve al instante; luego se guarda y se verifica en el servidor. */
  function cambiar(claves, ocultar) {
    if (!claves.length) return;
    claves.forEach(k => ocultar ? estado.add(k) : estado.delete(k));
    refrescarUI(); pend++;
    cola = cola.then(async () => {
      let msg = null, mal = false;
      try {
        if (ocultar) await rest("POST", "?on_conflict=clave", claves.map(clave => ({ clave })), "resolution=ignore-duplicates,return=minimal");
        else await rest("DELETE", "?clave=in.(" + claves.map(k => encodeURIComponent('"' + k + '"')).join(",") + ")");
        const real = await traerOcultos();          // lo que de verdad quedó guardado
        if (!claves.every(k => real.has(k) === ocultar)) { msg = "No se guardó. Revisa que entraste con la cuenta administradora."; mal = true; }
        else msg = ocultar ? "Oculto ✓ (ya no lo ven los clientes)" : "Ahora se muestra ✓";
        if (pend === 1) estado = real;
      } catch (e) {
        mal = true;
        if (e.message === "sesion") { msg = "Tu sesión venció. Ingresa de nuevo."; pantallaLogin(); }
        else if (e.message === "permiso") msg = "Esta cuenta no tiene permiso para cambiar la tienda.";
        else msg = "No hay conexión o falló el guardado. Intenta de nuevo.";
        try { if (pend === 1) estado = await traerOcultos(); } catch (x) {}
      } finally { pend--; }
      if (document.getElementById("adm")) { if (!document.querySelector("#adm .a-login")) refrescarUI(); }
      aviso(msg, mal);
    });
  }

  /* ---------- pantallas ---------- */
  function base() {
    if (!ov) {
      const st = el("style", null, CSS); st.id = "adm-css"; document.head.appendChild(st);
      ov = el("div"); ov.id = "adm"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "Administrar tienda");
      document.body.appendChild(ov);
    }
    ov.hidden = false; document.body.style.overflow = "hidden";
  }
  function cerrar() {
    if (!ov) return;
    ov.hidden = true; document.body.style.overflow = "";
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    try { aplicar(new Set(estado)); } catch (e) {}   // la tienda se repinta con lo que acabas de cambiar
    window.scrollTo(0, 0);
  }

  function pantallaLogin(msgInicial) {
    base();
    ov.innerHTML = `<form class="a-login" id="a-form" novalidate><h2>Administrar tienda</h2>
      <label for="a-mail">Correo</label><input id="a-mail" type="email" autocomplete="username" required>
      <label for="a-pass">Contraseña</label><input id="a-pass" type="password" autocomplete="current-password" required>
      <p class="a-err" id="a-err" role="alert">${esc(msgInicial || "")}</p>
      <button class="a-btn" type="submit">Entrar</button>
      <p style="text-align:center;margin:14px 0 0"><button type="button" class="a-mini" id="a-ver">Volver a la tienda</button></p></form>`;
    ov.querySelector("#a-ver").onclick = cerrar;
    ov.querySelector("#a-form").onsubmit = async e => {
      e.preventDefault();
      const b = ov.querySelector(".a-btn"), er = ov.querySelector("#a-err");
      const mail = ov.querySelector("#a-mail").value.trim(), pass = ov.querySelector("#a-pass").value;
      if (!mail || !pass) { er.textContent = "Escribe tu correo y tu contraseña."; return; }
      b.disabled = true; er.textContent = "Entrando…";
      try { await entrar(mail, pass); await pantallaPanel(); }
      catch (x) { er.textContent = x.message; b.disabled = false; }
    };
    setTimeout(() => { const m = ov.querySelector("#a-mail"); if (m) m.focus(); }, 30);
  }

  const resumen = c => {
    const tot = c.fotos.length, of = c.fotos.filter(f => estado.has(f.k)).length;
    const prodOff = estado.has(kProd(c.p.id));
    return { tot, of, vis: tot - of, prodOff, oculto: prodOff || tot - of === 0 };
  };

  function refrescarUI() {
    if (!ov || !cards.length) return;
    let nPub = 0, nOc = 0, nFo = 0;
    cards.forEach(c => {
      const r = resumen(c);
      c.el.classList.toggle("off", r.oculto);
      c.est.textContent = r.prodOff ? "OCULTO" : (r.vis === 0 ? "OCULTO (sin diseños visibles)" : "PUBLICADO");
      c.sub.textContent = `${c.p.cat} · ${r.vis} de ${r.tot} diseños visibles`;
      c.btn.textContent = r.prodOff ? "Mostrar" : "Ocultar";
      c.btn.setAttribute("aria-label", (r.prodOff ? "Mostrar " : "Ocultar ") + c.p.nombre);
      c.fotos.forEach(f => { const o = estado.has(f.k); f.b.classList.toggle("off", o); f.b.setAttribute("aria-pressed", o); f.b.setAttribute("aria-label", `Diseño ${f.n}: ${o ? "oculto, tocar para mostrar" : "visible, tocar para ocultar"}`); });
      c.todas.hidden = r.of === 0;
      r.oculto ? nOc++ : nPub++;
      if (!r.oculto && r.of > 0) nFo++;
      c.r = r;
    });
    const set = (k, t) => { const b = ov.querySelector(`[data-f="${k}"]`); if (b) b.textContent = t; };
    set("todos", `Todos (${cards.length})`); set("pub", `Publicados (${nPub})`); set("oc", `Ocultos (${nOc})`); set("fotos", `Con diseños ocultos (${nFo})`);
    filtrar();
  }
  function filtrar() {
    const q = norm(texto.trim());
    let n = 0;
    cards.forEach(c => {
      const r = c.r || resumen(c);
      let ok = filtro === "todos" || (filtro === "pub" && !r.oculto) || (filtro === "oc" && r.oculto) || (filtro === "fotos" && !r.oculto && r.of > 0);
      if (ok && q) ok = norm(c.p.nombre + " " + c.p.cat + " " + c.p.id).includes(q);
      c.el.hidden = !ok; if (ok) n++;
    });
    const v = ov.querySelector("#a-vacio"); if (v) v.hidden = n > 0;
  }

  async function pantallaPanel() {
    base();
    ov.innerHTML = `<div class="a-top"><div class="a-in"><div class="a-fila"><h2>Administrar tienda</h2><div><button class="a-mini" id="a-tienda">Ver tienda</button> <button class="a-mini" id="a-salir">Salir</button></div></div>
      <input type="search" id="a-q" placeholder="Buscar producto o categoría…" aria-label="Buscar producto" autocomplete="off">
      <div class="a-chips" id="a-chips"></div></div></div>
      <div class="a-in"><p class="a-ayuda" id="a-ayuda">Cargando…</p><div id="a-lista"></div><p class="a-vacio" id="a-vacio" hidden>No hay productos con ese filtro.</p></div>`;
    ov.querySelector("#a-tienda").onclick = cerrar;
    ov.querySelector("#a-salir").onclick = () => { salirSes(); pantallaLogin("Sesión cerrada."); };
    try { estado = await traerOcultos(); }
    catch (e) { ov.querySelector("#a-ayuda").textContent = "No se pudo leer el estado de la tienda (revisa la conexión y la configuración de Supabase)."; return; }
    ov.querySelector("#a-ayuda").innerHTML = "Toca una <b>foto</b> para ocultar ese diseño (queda en rojo) y tócala otra vez para mostrarlo. El botón <b>Ocultar / Mostrar</b> controla el producto completo. Todo se guarda al instante.";
    const chipsEl = ov.querySelector("#a-chips");
    [["todos", "Todos"], ["pub", "Publicados"], ["oc", "Ocultos"], ["fotos", "Con diseños ocultos"]].forEach(([k, t]) => {
      const b = el("button", null, t); b.dataset.f = k; b.setAttribute("aria-pressed", k === filtro);
      b.onclick = () => { filtro = k; chipsEl.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); filtrar(); };
      chipsEl.appendChild(b);
    });
    const q = ov.querySelector("#a-q"); q.value = texto; q.oninput = () => { texto = q.value; filtrar(); };

    const lista = ov.querySelector("#a-lista"); cards = [];
    PRODUCTOS.forEach(p => {
      const fs = parseTodas(p.fotos);
      const art = el("article", "a-card");
      art.innerHTML = `<div class="a-cab"><img class="a-th" alt="" loading="lazy"><div class="a-tit"><b>${esc(p.nombre)}</b><small></small><span class="a-est"></span></div><button class="a-btn" type="button"></button></div><div class="a-fotos"></div><div class="a-acc"><button type="button">Mostrar todos los diseños</button></div>`;
      const c = { p, el: art, est: art.querySelector(".a-est"), sub: art.querySelector("small"), btn: art.querySelector(".a-btn"), todas: art.querySelector(".a-acc button"), fotos: [] };
      poner(art.querySelector(".a-th"), fs[0].th);
      const cont = art.querySelector(".a-fotos");
      fs.forEach((f, i) => {
        const b = el("button", "a-f", '<img alt="" loading="lazy"><span>AGOTADO</span>'); b.type = "button";
        poner(b.firstChild, f.th);
        b.onclick = () => cambiar([f.k], !estado.has(f.k));
        cont.appendChild(b); c.fotos.push({ k: f.k, b, n: i + 1 });
      });
      c.btn.onclick = () => cambiar([kProd(p.id)], !estado.has(kProd(p.id)));
      c.todas.onclick = () => cambiar(c.fotos.map(f => f.k).filter(k => estado.has(k)), false);
      lista.appendChild(art); cards.push(c);
    });
    refrescarUI();
  }

  async function abrir() {
    if (!REMOTO) {
      base();
      ov.innerHTML = `<div class="a-login"><h2>Falta configurar</h2><p class="a-ayuda">Para usar el panel, escribe SUPABASE_URL y SUPABASE_KEY al inicio del script de <b>index.html</b> (mira las instrucciones).</p><button class="a-btn" id="a-ok">Volver a la tienda</button></div>`;
      ov.querySelector("#a-ok").onclick = cerrar; return;
    }
    try { ses = JSON.parse(localStorage.getItem(KS) || "null"); } catch (e) { ses = null; }
    if (ses && ses.refresh) { try { await token(); await pantallaPanel(); return; } catch (e) {} }
    pantallaLogin();
  }

  window.TCAdmin = { abrir, cerrar };
})();
