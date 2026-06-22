/* =====================================================================
   app.js — Render + interacciones (mismo comportamiento que el sitio
   Figma de referencia) con datos ACHS. Sin dependencias.
   ===================================================================== */
(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const asArr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

  const profileById = (id) => DATA.profiles.find((p) => p.id === id);
  const stateById   = (id) => DATA.states.find((e) => e.id === id);
  const notifById   = (id) => DATA.notifications.find((n) => n.id.split(".")[0] === id || n.id === id);
  const stateName   = (id) => { const e = stateById(id); return e ? e.name : id; };

  /* ----------------------------- badges -------------------------- */
  function profileBadge(id, withName) {
    const p = profileById(id);
    if (!p) return `<span class="pbadge">${esc(id)}</span>`;
    return `<span class="pbadge" title="${esc(p.name)}"><span class="pdot" style="background:${p.color}"></span>${esc(id)}${withName ? ` <span class="pbadge-name">${esc(p.name)}</span>` : ""}</span>`;
  }
  const profileBadges = (ids, withName) => `<span class="pbadge-row">${asArr(ids).map((i) => profileBadge(i, withName)).join("")}</span>`;

  function stateBadge(id, filled) {
    const e = stateById(id);
    if (!e) return `<span class="sbadge">${esc(id)}</span>`;
    if (filled) return `<span class="sbadge filled" style="background:${e.hex};color:${e.textHex};border-color:${e.hex}">${esc(id)}</span>`;
    return `<span class="sbadge" style="border-color:${e.hex};color:${e.hex}">${esc(id)}</span>`;
  }
  const stateBadges = (ids, filled) => asArr(ids).map((i) => stateBadge(i, filled)).join(" ");

  /* =========================== SUMMARY ========================== */
  function renderSummary() {
    const r = DATA.resumen;
    $("#summary-bar").innerHTML = `
      <div class="sum-item"><span class="sum-k">Estados:</span><span class="sum-v">${r.nEstados} (E1–E9)</span></div>
      <span class="sum-sep"></span>
      <div class="sum-item"><span class="sum-k">Perfiles:</span><span class="sum-v">${r.nPerfiles} Perfiles</span></div>
      <span class="sum-sep"></span>
      <div class="sum-item"><span class="sum-k">Notificaciones:</span><span class="sum-v">${r.nNotificaciones} Automatizadas</span></div>`;
  }

  function renderProfiles() {
    const all = [...DATA.mainSteps, ...DATA.additionalTransitions];
    $("#perfiles-body").innerHTML = `<div class="profiles-grid">` + DATA.profiles.map((p) => {
      const acciones = all.filter((t) => asArr(t.profiles).includes(p.id));
      const recibe   = DATA.notifications.filter((n) => n.recipient === p.id);

      const accHTML = acciones.length
        ? `<ul class="pc-list">${acciones.map((t) => {
            const route = t.toState
              ? `${esc(asArr(t.fromState).join("/"))} → ${esc(t.toState)}`
              : `${Array.isArray(t.fromState) ? "cualquier estado" : esc(t.fromState)} · sin cambio`;
            return `<li><span class="sbadge">${esc(t.code)}</span> <span class="pc-act">${esc(t.activity)}</span> <span class="pc-route">${route}</span></li>`;
          }).join("")}</ul>`
        : `<p class="muted-i">Sin acciones registradas en el flujo.</p>`;

      const recHTML = recibe.length
        ? `<div class="pc-recv-list">${recibe.map((n) => `<div class="pc-recv"><span class="nchip">${esc(n.id.split(".")[0])}</span><span class="pc-recv-desc">${esc(n.description)}</span></div>`).join("")}</div>`
        : `<p class="muted-i">No recibe notificaciones en este flujo.</p>`;

      return `<article class="profile-card">
        <div class="pc-head">
          <span class="pc-dot" style="background:${p.color}"></span>
          <span class="sbadge">${esc(p.id)}</span>
          <h3>${esc(p.name)}</h3>
        </div>
        <p class="pc-desc">${esc(p.description)}</p>
        <div class="pc-cols">
          <div class="pc-col">
            <div class="block-label">▸ Acciones que ejecuta (${acciones.length})</div>
            ${accHTML}
          </div>
          <div class="pc-col">
            <div class="block-label">🔔 Notificaciones que recibe (${recibe.length})</div>
            ${recHTML}
          </div>
        </div>
      </article>`;
    }).join("") + `</div>`;
  }

  /* =========================== DIAGRAMA ========================= */
  let selectedState = null;

  function wrapName(name, max) {
    const words = name.split(" ");
    const lines = []; let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > max && cur) { lines.push(cur.trim()); cur = w; }
      else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }

  function renderDiagram() {
    const nodes = DATA.diagramLayout.map((n) => ({ ...n, ...stateById(n.id) }));
    const half = 50;

    // marcadores de flecha
    let svg = `<svg viewBox="${DATA.diagramViewBox || "-90 -40 1330 800"}" class="flow-svg" role="img" aria-label="Diagrama de flujo de estados">
      <defs>
        <marker id="arw" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/></marker>
        <marker id="arw-b" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#0E9436"/></marker>
      </defs>`;

    // 1) aristas (solo líneas)
    DATA.diagramEdges.forEach((ed) => {
      const branch = ed.kind === "branch";
      const stroke = branch ? "#0E9436" : "#94a3b8";
      const dash = branch ? ` stroke-dasharray="6 5"` : "";
      const pts = ed.pts.map((p) => p.join(",")).join(" ");
      svg += `<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="2"${dash} marker-end="url(#${branch ? "arw-b" : "arw"})"/>`;
    });

    // 2) nodos
    nodes.forEach((n) => {
      const lines = wrapName(n.name, 13);
      const nameTspans = lines.map((ln, i) =>
        `<tspan x="${n.x}" dy="${i === 0 ? 0 : 11}">${esc(ln)}</tspan>`).join("");
      const nameStartY = n.y + 6;
      svg += `<g class="node-g" data-node="${esc(n.id)}" style="cursor:pointer">
        <rect class="sel-ring" x="${n.x - half - 4}" y="${n.y - half - 4}" width="${100 + 8}" height="${100 + 8}" rx="11" fill="none" stroke="#3b82f6" stroke-width="3"/>
        <rect class="node-box" x="${n.x - half}" y="${n.y - half}" width="100" height="100" rx="9" fill="${n.hex}" stroke="#475569" stroke-width="1.5"/>
        <text x="${n.x}" y="${n.y - 18}" fill="${n.textHex}" font-size="17" font-weight="800" text-anchor="middle">${esc(n.id)}</text>
        <text x="${n.x}" y="${nameStartY}" fill="${n.textHex}" font-size="8.6" font-weight="700" text-anchor="middle" opacity="0.96">${nameTspans}</text>
      </g>`;
    });

    // 3) etiquetas de aristas — al final, con fondo blanco (pill) para que SIEMPRE sean legibles
    DATA.diagramEdges.forEach((ed) => {
      const branch = ed.kind === "branch";
      const fs = branch ? 10.5 : 11;
      const cw = branch ? 5.9 : 6.2;             // ancho aprox. por carácter
      const [lx, ly] = ed.labelAt;
      const anchor = ed.anchor || "middle";
      const w = ed.label.length * cw + 12;
      const h = fs + 7;
      let rx = lx - w / 2;
      if (anchor === "start") rx = lx - 6;
      else if (anchor === "end") rx = lx - w + 6;
      const ry = ly - fs * 0.78 - 3;
      const rot = ed.rotate ? ` transform="rotate(${ed.rotate} ${lx} ${ly})"` : "";
      const fill = branch ? "#0E9436" : "#334155";
      svg += `<g${rot}>
        <rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="5" fill="#ffffff" stroke="${branch ? "#cfe9d6" : "#e4e9f1"}" stroke-width="1"/>
        <text x="${lx}" y="${ly}" font-size="${fs}" font-weight="600" text-anchor="${anchor}" fill="${fill}">${esc(ed.label)}</text>
      </g>`;
    });

    svg += `</svg>`;
    $("#diagram-svg-wrap").innerHTML = svg;

    $$("#diagram-svg-wrap [data-node]").forEach((g) =>
      g.addEventListener("click", () => selectState(g.dataset.node)));

    if (selectedState) markSelected(selectedState); else renderDetailEmpty();
  }

  function markSelected(id) {
    $$("#diagram-svg-wrap .node-g").forEach((g) => g.classList.toggle("is-selected", g.dataset.node === id));
  }

  function renderDetailEmpty() {
    $("#state-detail").innerHTML = `
      <div class="card-head"><h2>Detalles del Estado</h2><p>Selecciona un estado en el diagrama</p></div>
      <div class="card-body detail-empty">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M6.5 10v4M17.5 10v4M10 17.5h4"/>
        </svg>
        <p>Haz clic en un estado</p>
      </div>`;
  }

  const startsFrom = (stateId, t) => asArr(t.fromState).includes(stateId);
  const arrivesAt  = (stateId, t) => t.toState === stateId || asArr(t.intermediateState).includes(stateId);

  function actionCard(name, profile, toState, intermediate, notifs, variant) {
    const notifChips = asArr(notifs).length
      ? `<div class="notif-chips">${asArr(notifs).map((nc) => { const n = notifById(nc.split(".")[0]); return `<span class="nchip" title="${n ? esc(n.description) : ""}">${esc(nc.split(".")[0])}</span>`; }).join("")}</div>` : "";
    const dest = toState ? `Hacia ${stateBadge(toState, true)}` : `<span class="muted-i">Sin cambio</span>`;
    const interm = intermediate ? `<div class="ac-line">Intermedio ${stateBadge(intermediate)}</div>` : "";
    return `<div class="action-card ${variant}">
      <div class="ac-top">${profileBadges(profile)}<span class="ac-name ${variant === "branch" ? "i" : ""}">${esc(name)}</span></div>
      ${interm}<div class="ac-line">${dest}</div>${notifChips}
    </div>`;
  }

  // helpers para agrupar acciones (no duplicar una acción que solo cambia
  // de notificación o de perfil ejecutor → una sola tarjeta)
  const uniq = (arr) => arr.filter((v, i) => arr.indexOf(v) === i);
  const baseName = (s) => s.split(" (")[0].trim();
  function groupBy(list, keyFn) {
    const m = new Map();
    list.forEach((x) => { const k = keyFn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
    return Array.from(m.values());
  }

  function selectState(id) {
    selectedState = id;
    markSelected(id);
    const e = stateById(id);

    const all = [
      ...DATA.mainSteps.map((s) => ({ ...s, _variant: "main" })),
      ...DATA.additionalTransitions.map((t) => ({ ...t, _variant: "branch" }))
    ];

    // ---- salientes (agrupadas por acción base + destino) ----
    // se excluyen las acciones "sin cambio de estado" (p. ej. O2 Supervisión
    // General), que no son transiciones reales y aplican a cualquier cama.
    const outGroups = groupBy(all.filter((t) => startsFrom(id, t) && t.toState != null), (t) => `${baseName(t.activity)}|${t.toState}`);
    const outHTML = outGroups.length
      ? outGroups.map((g) => {
          const profiles = uniq(g.flatMap((t) => asArr(t.profiles)));
          const notifs   = uniq(g.flatMap((t) => asArr(t.notifications)));
          const variant  = g.some((t) => t._variant === "main") ? "main" : "branch";
          const name     = g.length > 1 ? baseName(g[0].activity) : g[0].activity;
          const interm   = g.map((t) => t.intermediateState).find(Boolean) || null;
          return actionCard(name, profiles, g[0].toState, interm, notifs, variant);
        }).join("")
      : `<p class="muted-i">Sin acciones salientes registradas.</p>`;

    // ---- entrantes (agrupadas por acción base + origen) ----
    const inGroups = groupBy(all.filter((t) => arrivesAt(id, t)), (t) => `${baseName(t.activity)}|${asArr(t.fromState).join(",")}`);
    const inHTML = inGroups.length
      ? inGroups.map((g) => {
          const profiles = uniq(g.flatMap((t) => asArr(t.profiles)));
          const variant  = g.some((t) => t._variant === "main") ? "main" : "branch";
          const name     = g.length > 1 ? baseName(g[0].activity) : g[0].activity;
          const isInterm = g.some((t) => asArr(t.intermediateState).includes(id));
          return `<div class="arrive-card ${variant === "branch" ? "branch" : ""}">
            <div class="ac-top">${profileBadges(profiles)}<span class="ac-name ${variant === "branch" ? "i" : ""}">${esc(name)}</span></div>
            <div class="ac-line">Desde ${stateBadges(g[0].fromState)}${isInterm ? ' <span class="interm-tag">(intermedio)</span>' : ""}</div>
          </div>`;
        }).join("")
      : `<p class="muted-i">Estado de entrada del ciclo.</p>`;

    $("#state-detail").innerHTML = `
      <div class="card-head detail-head">
        <span class="sbadge filled" style="background:${e.hex};color:${e.textHex};border-color:${e.hex}">${esc(e.id)}</span>
        <h2>${esc(e.name)}</h2>
      </div>
      <div class="card-body">
        <p class="detail-desc">${esc(e.description)}</p>
        <div class="detail-sec">
          <h4 class="sec-out">▸ Acciones disponibles</h4>
          ${outHTML}
        </div>
        <div class="detail-sec">
          <h4 class="sec-in">◂ Cómo llegar a este estado</h4>
          ${inHTML}
        </div>
      </div>`;
  }

  /* ============================ PASOS =========================== */
  function dataCapturedBlock(arr) {
    if (!arr || !arr.length) return "";
    return `<div class="step-block"><div class="block-label">📋 Datos Capturados</div><ul class="bullets">${arr.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`;
  }
  function notifBlock(ids) {
    if (!ids || !ids.length) return "";
    const cards = ids.map((nid) => {
      const n = notifById(nid.split(".")[0]); if (!n) return "";
      const rp = profileById(n.recipient);
      return `<div class="notif-card"><div class="nc-head"><span class="nchip">${esc(n.id.split(".")[0])}</span><span class="nc-arrow">→</span><span class="nc-to">${esc(rp ? rp.name : n.recipient)}</span></div><p class="nc-desc">${esc(n.description)}</p></div>`;
    }).join("");
    return `<div class="step-block"><div class="block-label">🔔 Notificaciones WhatsApp</div><div class="notif-cards">${cards}</div></div>`;
  }
  function transBlock(from, intermediate, to) {
    const interm = intermediate ? `<span class="ti-arrow">→</span>${stateBadge(intermediate, true)}` : "";
    const dest = to ? `${stateBadge(to, true)}` : `<span class="muted-i">Sin cambio</span>`;
    return `<div class="step-block"><div class="block-label">Transición de Estado</div><div class="trans-line">${stateBadges(from)}<span class="ti-arrow">→</span>${interm}${dest}</div></div>`;
  }

  // Una sola caja para pasos principales y opciones adicionales:
  // mismo esquema de datos → misma estructura visual (ver data.js).
  function stepCard(s, variant) {
    return `<article class="step-card ${variant === "optional" ? "optional" : ""}">
      <div class="step-top">
        <div class="step-head">
          ${s.step ? `<span class="step-num">${esc(s.step)}</span>` : ""}
          <span class="step-title">${esc(s.title)}</span>
        </div>
        ${profileBadges(s.profiles)}
      </div>
      ${s.description ? `<p class="step-desc">${esc(s.description)}</p>` : ""}
      <div class="step-grid">
        <div class="step-field"><div class="block-label">Actividad</div><div class="af"><span class="sbadge">${esc(s.code)}</span> <span>${esc(s.activity)}</span></div></div>
        <div class="step-field"><div class="block-label">Trigger</div><div class="af">⚡ ${esc(s.trigger)}</div></div>
      </div>
      ${transBlock(s.fromState, s.intermediateState, s.toState)}
      ${dataCapturedBlock(s.dataCaptured)}
      ${notifBlock(s.notifications)}
    </article>`;
  }

  function renderSteps() {
    // Las variantes (variantOf = nº de paso) se muestran junto a su paso;
    // las opciones reales (variantOf null) quedan abajo en "Opciones Adicionales".
    const variantsByStep = {};
    const extras = [];
    DATA.additionalTransitions.forEach((t) => {
      if (t.variantOf != null) (variantsByStep[t.variantOf] = variantsByStep[t.variantOf] || []).push(t);
      else extras.push(t);
    });

    const steps = DATA.mainSteps.map((s) => {
      const variants = variantsByStep[s.step] || [];
      const variantsHTML = variants.length
        ? `<div class="variant-wrap">
             <div class="variant-lead">${variants.length > 1 ? "Variantes de este paso" : "Variante de este paso"}</div>
             ${variants.map((v) => stepCard(v, "optional")).join("")}
           </div>`
        : "";
      return `<div class="step-group">${stepCard(s, "main")}${variantsHTML}</div>`;
    }).join("");

    const extrasHTML = extras.map((t) => stepCard(t, "optional")).join("");

    $("#steps-body").innerHTML = `
      <div class="steps-list">${steps}</div>
      ${extras.length ? `<div class="opts-sep"><span class="opts-tag">Opciones Adicionales</span></div>
      <div class="steps-list">${extrasHTML}</div>` : ""}`;
  }

  /* ======================= NOTIFICACIONES ====================== */
  let matrixFilter = "all";
  function renderMatrixControls() {
    const f = [["all", "Todas"], ["cluster", "Exclusivas de cluster"], ["nocluster", "No cluster"]];
    $("#matrix-controls").innerHTML = `<span class="ctl-label">Filtrar:</span>` +
      f.map(([k, l]) => `<button class="chip-filter ${k === matrixFilter ? "active" : ""}" data-filter="${k}">${esc(l)}</button>`).join("");
    $$("#matrix-controls .chip-filter").forEach((b) => b.addEventListener("click", () => { matrixFilter = b.dataset.filter; renderMatrixControls(); renderMatrix(); }));
  }
  function renderMatrix() {
    let rows = DATA.notifications;
    if (matrixFilter === "cluster") rows = rows.filter((n) => n.exclusivoCluster);
    if (matrixFilter === "nocluster") rows = rows.filter((n) => !n.exclusivoCluster);
    $("#matrix-body").innerHTML = rows.map((n) => `
      <div class="ncard">
        <div class="ncard-top">
          <div class="nf"><span class="nf-k">ID</span><span class="sbadge">${esc(n.id.split(".")[0])}</span></div>
          <div class="nf"><span class="nf-k">Emisor</span>${profileBadges(n.emitter, true)}</div>
          <span class="nf-arrow">→</span>
          <div class="nf"><span class="nf-k">Actividad</span><span class="nf-act">${esc(n.activity)}</span></div>
          <span class="nf-arrow">→</span>
          <div class="nf"><span class="nf-k">Estado Resultante</span><span class="nf-state">${stateBadge(n.state, true)} <span class="nf-state-name">${esc(stateName(n.state))}</span></span></div>
        </div>
        <div class="ncard-bot">
          <div class="nf"><span class="nf-k">Destinatario</span>${profileBadges(n.recipient, true)}</div>
          <div class="nf grow"><span class="nf-k">Descripción</span><span class="nf-desc">${esc(n.description)}</span></div>
          <div class="nf"><span class="nf-k">Exclusivo Cluster</span><span class="cluster-badge ${n.exclusivoCluster ? "yes" : "no"}">${n.exclusivoCluster ? "Sí" : "No"}</span></div>
        </div>
      </div>`).join("");
  }

  /* ============================= TABS ========================== */
  function setupTabs() {
    $$(".tab").forEach((tab) => tab.addEventListener("click", () => {
      const t = tab.dataset.tab;
      $$(".tab").forEach((x) => x.setAttribute("aria-selected", x === tab ? "true" : "false"));
      $$(".tab-panel").forEach((p) => { const on = p.id === `panel-${t}`; p.hidden = !on; p.classList.toggle("is-active", on); });
    }));
  }

  function init() {
    renderSummary();
    renderDiagram();
    renderSteps();
    renderMatrixControls();
    renderMatrix();
    renderProfiles();
    setupTabs();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
