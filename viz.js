'use strict';
// ステップ実行の汎用レンダラー。topics/chNN.js が渡す「フレームの列」を描く。
//
// フレーム 1 個の形（全部省略可）:
//   {
//     line: 3,                                   // code の何行目をハイライトするか（1 始まり）
//     vars: { i: 2, sum: 5 },                     // 変数の値
//     array: { label: 'a', values: [1,2,3], hl: [1], ptr: { i: 1 } },
//     arrays: [ {..}, {..} ],                     // 配列が複数いるときは array の代わりにこちら
//     table: { label: 'dp', rows: [...], cols: [...], data: [[0,1],[1,2]], hl: [[0,1]] },
//     grid: { ... }                               // table と同じ形（二次元累積和などに使う）
//     graph: {                                     // 頂点と辺のグラフ（9章 グラフアルゴリズムで使う）
//       label: 'グラフ',
//       nodes: [{ id: 1, x: 0.1, y: 0.5, label: '1', sub: 'd=0' }, ...], // x,y は 0〜1 の相対座標。sub は頂点の下の小さな値（距離など）
//       edges: [{ from: 1, to: 2, w: 5, directed: false, label: '3/5' }, ...], // w か label を辺の中ほどに出す
//       hlNodes: { 1: 'done', 2: 'current', 3: 'frontier' },  // 他に group0〜group5（Union-Find の組・二部グラフの色分け）
//       hlEdges: [{ from: 1, to: 2, kind: 'current' | 'used' | 'tree' }],
//     },
//     graphs: [ {..}, {..} ],                     // グラフが複数いるときは graph の代わりにこちら（残余グラフと元のグラフなど）
//     note: 'この行で i 番目を足す',
//   }
//
// 外部ライブラリなし。配列・表は DOM + CSS、グラフだけ SVG で組む。

function renderStepper(container, code, steps) {
  const lines = code.replace(/\t/g, '  ').split('\n');
  let cur = 0;
  let timer = null;

  container.innerHTML = `
    <div class="viz">
      <pre class="viz__code"><code></code></pre>
      <div class="viz__state">
        <div class="viz__vars"></div>
        <div class="viz__arrays"></div>
        <div class="viz__tables"></div>
        <div class="viz__graphs"></div>
        <p class="viz__note"></p>
      </div>
    </div>
    <div class="viz__controls">
      <button type="button" data-act="reset">最初に戻す</button>
      <button type="button" data-act="prev">◀ 前へ</button>
      <button type="button" data-act="play">自動再生</button>
      <button type="button" data-act="next">次へ ▶</button>
      <span class="viz__pos"></span>
    </div>`;

  const codeEl = container.querySelector('.viz__code code');
  codeEl.innerHTML = lines.map((l, i) => `<span class="viz__line" data-n="${i + 1}">${escapeHtml(l) || ' '}</span>`).join('\n');

  const varsEl = container.querySelector('.viz__vars');
  const arraysEl = container.querySelector('.viz__arrays');
  const tablesEl = container.querySelector('.viz__tables');
  const graphsEl = container.querySelector('.viz__graphs');
  const noteEl = container.querySelector('.viz__note');
  const posEl = container.querySelector('.viz__pos');
  const playBtn = container.querySelector('[data-act="play"]');

  function draw() {
    const f = steps[cur] || {};
    for (const el of codeEl.querySelectorAll('.viz__line')) {
      el.classList.toggle('is-current', Number(el.dataset.n) === f.line);
    }
    if (f.line) {
      const el = codeEl.querySelector(`[data-n="${f.line}"]`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }

    varsEl.innerHTML = f.vars
      ? Object.entries(f.vars).map(([k, v]) => `<span class="viz__chip"><b>${escapeHtml(k)}</b> = ${escapeHtml(String(v))}</span>`).join('')
      : '';

    const arrs = f.arrays || (f.array ? [f.array] : []);
    arraysEl.innerHTML = arrs.map(drawArray).join('');

    const tables = [].concat(f.table || [], f.grid || []);
    tablesEl.innerHTML = tables.map(drawTable).join('');

    const graphs = f.graphs || (f.graph ? [f.graph] : []);
    graphsEl.innerHTML = graphs.map(drawGraph).join('');

    noteEl.textContent = f.note || '';
    posEl.textContent = steps.length ? `${cur + 1} / ${steps.length}` : '0 / 0';
  }

  function drawArray(a) {
    const hl = new Set(a.hl || []);
    const ptrs = a.ptr || {};
    const byIndex = {};
    for (const [name, i] of Object.entries(ptrs)) {
      (byIndex[i] = byIndex[i] || []).push(name);
    }
    const cells = a.values.map((v, i) => `
      <div class="viz__cell ${hl.has(i) ? 'is-hl' : ''}">
        <div class="viz__cellval">${escapeHtml(String(v))}</div>
        <div class="viz__cellidx">${i}</div>
        ${byIndex[i] ? `<div class="viz__cellptr">${byIndex[i].map((n) => '▲' + escapeHtml(n)).join(' ')}</div>` : ''}
      </div>`).join('');
    return `<div class="viz__array">${a.label ? `<div class="viz__arrlabel">${escapeHtml(a.label)}</div>` : ''}<div class="viz__row">${cells}</div></div>`;
  }

  function drawTable(t) {
    const hl = new Set((t.hl || []).map(([r, c]) => `${r},${c}`));
    const cols = t.cols || t.data[0].map((_, c) => c);
    const head = `<tr><th></th>${cols.map((c) => `<th>${escapeHtml(String(c))}</th>`).join('')}</tr>`;
    const body = t.data.map((row, r) => `<tr><th>${escapeHtml(String((t.rows || t.data.map((_, i) => i))[r]))}</th>${
      row.map((v, c) => `<td class="${hl.has(`${r},${c}`) ? 'is-hl' : ''}">${v == null ? '-' : escapeHtml(String(v))}</td>`).join('')
    }</tr>`).join('');
    return `<div class="viz__table">${t.label ? `<div class="viz__arrlabel">${escapeHtml(t.label)}</div>` : ''}<table>${head}${body}</table></div>`;
  }

  function drawGraph(g) {
    const W = 300, H = 180, PAD = 22, R = 13;
    const pos = {};
    for (const n of g.nodes) {
      pos[n.id] = { x: PAD + n.x * (W - 2 * PAD), y: PAD + n.y * (H - 2 * PAD) };
    }
    const hlNodes = g.hlNodes || {};
    const hlEdges = g.hlEdges || [];
    const markerId = `viz-arrow-${graphSeq++}`;

    // 同じ 2 頂点間に複数の辺があれば（残余グラフの往復など）、互い違いに曲げて重ならないようにする。
    const pairTotal = {};
    for (const e of g.edges || []) {
      const key = [e.from, e.to].sort().join('-');
      pairTotal[key] = (pairTotal[key] || 0) + 1;
    }
    const pairSeen = {};
    const edgesSvg = (g.edges || []).map((e) => {
      const a = pos[e.from], b = pos[e.to];
      if (!a || !b) return '';
      const key = [e.from, e.to].sort().join('-');
      const idx = pairSeen[key] = (pairSeen[key] || 0);
      pairSeen[key] += 1;
      const total = pairTotal[key];
      const curve = total > 1 ? (idx - (total - 1) / 2) * 16 : 0;

      const match = hlEdges.find((h) => (h.from === e.from && h.to === e.to) || (!e.directed && h.from === e.to && h.to === e.from));
      const cls = match ? `viz__edge is-${match.kind}` : 'viz__edge';

      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ctrl = { x: mid.x + (-dy / len) * curve, y: mid.y + (dx / len) * curve };
      const aEdge = pointTowards(a, curve ? ctrl : b, R);
      const bEdge = pointTowards(b, curve ? ctrl : a, R);
      const path = curve
        ? `M ${aEdge.x} ${aEdge.y} Q ${ctrl.x} ${ctrl.y} ${bEdge.x} ${bEdge.y}`
        : `M ${aEdge.x} ${aEdge.y} L ${bEdge.x} ${bEdge.y}`;

      const text = e.label != null ? e.label : e.w;
      const labelPos = curve ? ctrl : mid;
      return `<path class="${cls}" d="${path}" fill="none" ${e.directed ? `marker-end="url(#${markerId})"` : ''}/>` +
        (text != null ? `<text class="viz__edgelabel" x="${labelPos.x}" y="${labelPos.y}">${escapeHtml(String(text))}</text>` : '');
    }).join('');

    const nodesSvg = g.nodes.map((n) => {
      const p = pos[n.id];
      const state = hlNodes[n.id];
      const cls = state ? `viz__node is-${state}` : 'viz__node';
      return `<g class="${cls}">
        <circle cx="${p.x}" cy="${p.y}" r="${R}"/>
        <text class="viz__nodelabel" x="${p.x}" y="${p.y}">${escapeHtml(String(n.label != null ? n.label : n.id))}</text>
        ${n.sub != null ? `<text class="viz__nodesub" x="${p.x}" y="${p.y + R + 10}">${escapeHtml(String(n.sub))}</text>` : ''}
      </g>`;
    }).join('');

    return `<div class="viz__graph">
      ${g.label ? `<div class="viz__arrlabel">${escapeHtml(g.label)}</div>` : ''}
      <svg class="viz__graphsvg" viewBox="0 0 ${W} ${H}">
        <defs>
          <marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" class="viz__arrowhead"/>
          </marker>
        </defs>
        ${edgesSvg}
        ${nodesSvg}
      </svg>
    </div>`;
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; playBtn.textContent = '自動再生'; }
  }
  function go(delta) {
    stop();
    cur = Math.max(0, Math.min(steps.length - 1, cur + delta));
    draw();
  }

  container.querySelector('[data-act="reset"]').addEventListener('click', () => { stop(); cur = 0; draw(); });
  container.querySelector('[data-act="prev"]').addEventListener('click', () => go(-1));
  container.querySelector('[data-act="next"]').addEventListener('click', () => go(1));
  playBtn.addEventListener('click', () => {
    if (timer) { stop(); return; }
    playBtn.textContent = '停止';
    timer = setInterval(() => {
      if (cur >= steps.length - 1) { stop(); return; }
      cur += 1; draw();
    }, 900);
  });

  draw();
  return { stop };
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let graphSeq = 0; // <marker> の id を図ごとに別にするための連番

function pointTowards(from, to, dist) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / len) * dist, y: from.y + (dy / len) * dist };
}
