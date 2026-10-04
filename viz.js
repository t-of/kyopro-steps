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
//     note: 'この行で i 番目を足す',
//   }
//
// 外部ライブラリなし。SVG は使わず DOM + CSS で組む。

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
