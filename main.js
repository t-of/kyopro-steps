'use strict';

// localStorage はほかのアプリと共有される（同じ t-of.github.io のため）。
// このアプリは今のところ何も保存しないが、キーを使うなら 'kyopro-steps.' で始める。
const STORE = 'kyopro-steps.';

WebAppKit.init({ title: 'kyopro-steps', text: '競技プログラミングの技法を、コードを1行ずつ動かしながら学べるサイト。' });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

const stage = document.getElementById('stage');
let activeStepper = null;

// 全項目を目次の順に並べたもの（前へ／次へのナビゲーション用）
const FLAT = KYOPRO_TOC.flatMap((ch) => ch.items.map((it) => ({ ...it, chapterId: ch.id, chapterTitle: ch.title })));

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function route() {
  if (activeStepper) { activeStepper.stop(); activeStepper = null; }
  const hash = location.hash.replace(/^#\/?/, '');
  if (!hash) { renderList(); return; }
  renderTopic(decodeURIComponent(hash));
}

function renderList() {
  document.title = 'kyopro-steps — 競プロの技法をステップ実行で学ぶ';
  stage.innerHTML = `
    <div class="page page--list">
      <p class="lead">本の目次に沿って、技法を 1 行ずつのステップ実行で学べます。中身のある項目から見られます。</p>
      ${KYOPRO_TOC.map((ch) => `
        <section class="chapter">
          <h2>${escapeHtml(ch.title)}</h2>
          <ul class="topic-list">
            ${ch.items.map((it) => {
              const ready = !!KYOPRO_TOPICS[it.id];
              return `<li><a class="topic-link ${ready ? '' : 'is-pending'}" href="#/${encodeURIComponent(it.id)}">
                <span>${escapeHtml(it.title)}</span>
                ${ready ? '' : '<span class="badge">準備中</span>'}
              </a></li>`;
            }).join('')}
          </ul>
        </section>
      `).join('')}
    </div>`;
}

function renderTopic(id) {
  const meta = FLAT.find((it) => it.id === id);
  const data = KYOPRO_TOPICS[id];
  const idx = FLAT.findIndex((it) => it.id === id);
  const prev = idx > 0 ? FLAT[idx - 1] : null;
  const next = idx >= 0 && idx < FLAT.length - 1 ? FLAT[idx + 1] : null;

  if (!meta) { renderList(); return; }

  if (!data) {
    stage.innerHTML = `
      <div class="page page--topic">
        <p><a href="#/">← 目次へ</a></p>
        <h2>${escapeHtml(meta.chapterTitle)} / ${escapeHtml(meta.title)}</h2>
        <p class="pending">この項目はまだ準備中です。</p>
        ${navHtml(prev, next)}
      </div>`;
    return;
  }

  document.title = `${data.title} — kyopro-steps`;
  stage.innerHTML = `
    <div class="page page--topic">
      <p><a href="#/">← 目次へ</a></p>
      <h2>${escapeHtml(meta.chapterTitle)} / ${escapeHtml(data.title)}</h2>
      <div class="explain">${(data.explain || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>

      ${data.code ? '<h3>ステップ実行</h3><div class="stepper"></div>' : ''}

      ${(data.sheet || []).map((sec) => `
        <h3>${escapeHtml(sec.title)}</h3>
        <dl class="sheet">
          ${sec.rows.map(([code, desc]) => `<dt><pre class="code-block"><code>${escapeHtml(code)}</code></pre></dt><dd>${escapeHtml(desc)}</dd>`).join('')}
        </dl>`).join('')}

      ${data.example ? `
        <h3>例題</h3>
        <div class="example">
          <h4>問題文</h4>
          ${String(data.example.statement).split('\n\n').map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
          ${data.example.constraints ? `<h4>制約</h4><ul>${data.example.constraints.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>` : ''}
          ${data.example.input ? `<h4>入力</h4><p>入力は以下の形式で標準入力から与えられる。</p><pre>${escapeHtml(data.example.input)}</pre>` : ''}
          ${data.example.output ? `<h4>出力</h4><p>${escapeHtml(data.example.output)}</p>` : ''}
          ${(data.example.samples || []).map((s, i) => `
            <div class="sample">
              <div><h4>入力例 ${i + 1}</h4><pre>${escapeHtml(s.input)}</pre></div>
              <div><h4>出力例 ${i + 1}</h4><pre>${escapeHtml(s.output)}</pre></div>
            </div>
            ${s.note ? `<p>${escapeHtml(s.note)}</p>` : ''}`).join('')}
        </div>` : ''}

      ${data.solution ? `
        <details class="solution">
          <summary>解答を見る</summary>
          <p>${escapeHtml(data.solution.idea)}</p>
          <pre class="code-block"><code>${escapeHtml(data.solution.code)}</code></pre>
        </details>` : ''}

      ${navHtml(prev, next)}
    </div>`;

  if (data.code) activeStepper = renderStepper(stage.querySelector('.stepper'), data.code, data.steps);
}

function navHtml(prev, next) {
  return `<nav class="topic-nav">
    ${prev ? `<a href="#/${encodeURIComponent(prev.id)}">◀ ${escapeHtml(prev.title)}</a>` : '<span></span>'}
    ${next ? `<a href="#/${encodeURIComponent(next.id)}">${escapeHtml(next.title)} ▶</a>` : '<span></span>'}
  </nav>`;
}

window.addEventListener('hashchange', route);
route();
