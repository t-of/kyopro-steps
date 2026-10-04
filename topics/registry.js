'use strict';
// 各章ファイル（topics/chNN.js）が項目の中身をここに登録する。
//
//   registerTopic('1.4', {
//     title: '2進法',
//     explain: ['段落1', '段落2'],
//     code: `#include <bits/stdc++.h>\n...`,   // ステップ図の左（上）に出すコード
//     steps: [ { line, vars, array, note }, ... ],  // 1 行ずつの状態（viz.js が描く）
//     example: { statement, constraints: [...], samples: [{input, output}] },
//     solution: { idea, code: `...` },           // <details> で開く解答
//   });
//
// フレーム（steps の要素）の形は README.md と viz.js を見る。
const KYOPRO_TOPICS = {};

function registerTopic(id, data) {
  KYOPRO_TOPICS[id] = data;
}
