# kyopro-steps

T.OF... のアプリ。https://t-of.github.io/kyopro-steps/

競技プログラミングの技法を、章ごとにステップ実行の図で学べるサイト。

- ルールは本部の `~/GitHub/tof/t-of.github.io/RULES.md` に従う（全アプリ共通）。ブランドは `docs/BRAND.md`。
- 直したら本部で `npm run audit:browser -- kyopro-steps` を通す。
- 公開は本部の `docs/RELEASE.md` の手順。大きな作業は本部で Claude を起動すると、役割を分けて進められる。
- localStorage のキーは `kyopro-steps.` で始める。SW のキャッシュ名は `kyopro-steps-` で始める。

## 構成

- `toc.js` — 目次（全章・全項目の一覧。中身がなくても「準備中」として出る）
- `topics/registry.js` — `registerTopic(id, data)` の置き場。章ファイルがこれを呼んで項目を登録する
- `topics/chNN.js` — 章ごとの中身（1 章 1 ファイル）。`registerTopic('1.4', {...})` のように呼ぶだけ
- `viz.js` — ステップ図の汎用レンダラー（コード・変数・配列・表・操作ボタン）。中身は触らず、章ファイルから使う
- `main.js` — 一覧ページ・項目ページの描画とハッシュルーティング（`#/1.4` のような URL）
- `style.css` — 見た目（全章共通）

## 新しい章を足す手順

1. `toc.js` の配列に章と項目を足す（まだ中身がなくても、ここに入れておけば一覧に「準備中」として出る）。
2. `topics/chNN.js` を作り、`registerTopic('項目id', {...})` で項目ごとに登録する。1 項目の形:

```js
registerTopic('3.1', {
  title: '配列の二分探索',
  explain: ['段落ごとの短い文の配列。長い理屈は避ける。'],
  code: `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  // ここがステップ図に出るコード。行番号は steps[].line と対応\n}`,
  // steps はできるだけ「実際にそのアルゴリズムを JS で動かして」作る（手計算ミスを防ぐ）。
  // フレームの形は viz.js の先頭コメントを見る: { line, vars, array/arrays, table/grid, note }
  steps: [ { line: 4, vars: { lo: 0, hi: 7 }, array: { label: 'a', values: [...], hl: [3] }, note: '...' } ],
  example: { statement: 'オリジナルの問題文', constraints: ['...'], samples: [{ input: '...', output: '...' }] },
  solution: { idea: '考え方', code: `実際に g++ -std=c++17 でコンパイルして確かめた C++` },
});
```

3. `index.html` に `<script src="./topics/chNN.js"></script>` を足す（`viz.js` より前、`main.js` より前）。
4. `sw.js` の `SHELL` にも `./topics/chNN.js` を足す（オフラインで開けるように）。
5. 本部で `npm run audit -- kyopro-steps` を通す。解答の C++ は手元で `g++ -std=c++17` にかけ、例題の入出力と一致するか確かめる。

ステップ図のフレーム（`steps` の要素）は `viz.js` 冒頭のコメントに形がある。配列は `array`（1 つ）か `arrays`（複数）、
表・グリッドは `table` / `grid`（同じ形。二次元 DP でも二次元累積和でも使える）。

グラフ（頂点と辺）は `graph`（1 つ）か `graphs`（複数。残余グラフと元のグラフを並べる等）で渡す。SVG で描く。

```js
graph: {
  label: 'グラフ',
  nodes: [{ id: 1, x: 0.1, y: 0.5, label: '1', sub: 'd=0' }, ...], // x,y は 0〜1 の相対座標。sub は頂点の下に出す小さな値（距離・grundy 数など）
  edges: [{ from: 1, to: 2, w: 5, directed: false, label: '3/5' }, ...], // w か label を辺の中ほどに出す。同じ2頂点間に複数辺があれば自動で曲げる
  hlNodes: { 1: 'done', 2: 'current', 3: 'frontier' }, // 他に group0〜group5（Union-Find の組・二部グラフの色分けなど）
  hlEdges: [{ from: 1, to: 2, kind: 'current' | 'used' | 'tree' }], // used=採用（最小全域木・マッチング）、tree=探索木の辺
}
```
