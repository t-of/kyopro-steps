'use strict';
// 9章 グラフアルゴリズム
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* 関数で動かして作る（手計算のミスを防ぐため）。

// ---- 9.0 グラフとは ----
(function registerGraphIntro() {
  // 6 頂点・8 辺の無向グラフを隣接リストで読み込み、各頂点の次数（つながっている辺の本数）を数える。
  const n = 6;
  const edgeList = [[1, 2], [1, 3], [2, 3], [2, 4], [2, 5], [4, 5], [5, 6], [4, 6]];
  const pos = {
    1: { x: 0.5, y: 0.15 },
    2: { x: 0.8, y: 0.33 },
    3: { x: 0.8, y: 0.68 },
    4: { x: 0.5, y: 0.85 },
    5: { x: 0.2, y: 0.68 },
    6: { x: 0.2, y: 0.33 },
  };
  const nodes = () => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id) }));
  const edges = () => edgeList.map(([a, b]) => ({ from: a, to: b }));

  const adj = Array.from({ length: n + 1 }, () => []);
  const steps = [];

  steps.push({
    line: 4, vars: { n, m: edgeList.length },
    graph: { label: '元のグラフ', nodes: nodes(), edges: edges() },
    note: `頂点数 n = ${n}、辺数 m = ${edgeList.length} のグラフを読み込む。`,
  });

  for (const [a, b] of edgeList) {
    adj[a].push(b);
    adj[b].push(a);
    steps.push({
      line: 8, vars: { 読んでいる辺: `${a} - ${b}` },
      graph: {
        label: '隣接リストを作る',
        nodes: nodes(),
        edges: edges(),
        hlEdges: [{ from: a, to: b, kind: 'current' }],
      },
      note: `辺 (${a}, ${b}) を読み、adj[${a}] に ${b} を、adj[${b}] に ${a} を加える（無向グラフなので両方向）。`,
    });
  }

  const degrees = [];
  for (let v = 1; v <= n; v++) {
    degrees.push(adj[v].length);
    const incident = edgeList.filter(([a, b]) => a === v || b === v).map(([a, b]) => ({ from: a, to: b, kind: 'current' }));
    const hlNodes = {};
    for (let u = 1; u < v; u++) hlNodes[u] = 'done';
    hlNodes[v] = 'current';
    steps.push({
      line: 13, vars: { v, [`adj[${v}]`]: `{${adj[v].join(', ')}}`, deg: adj[v].length },
      graph: { label: '次数を数える', nodes: nodes().map((nd) => ({ ...nd, sub: degrees[nd.id - 1] != null ? `deg=${degrees[nd.id - 1]}` : undefined })), edges: edges(), hlNodes, hlEdges: incident },
      note: `頂点 ${v} の次数は adj[${v}] の要素数 = ${adj[v].length}。`,
    });
  }

  let maxV = 1;
  for (let v = 2; v <= n; v++) if (degrees[v - 1] > degrees[maxV - 1]) maxV = v;
  steps.push({
    line: 16, vars: { 次数最大の頂点: maxV, 次数: degrees[maxV - 1] },
    graph: {
      label: '答え',
      nodes: nodes().map((nd) => ({ ...nd, sub: `deg=${degrees[nd.id - 1]}` })),
      edges: edges(),
      hlNodes: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, i + 1 === maxV ? 'current' : 'done'])),
    },
    note: `次数が最大なのは頂点 ${maxV}（次数 ${degrees[maxV - 1]}）。`,
  });

  registerTopic('9.0', {
    title: 'グラフとは',
    explain: [
      'グラフは「頂点（点）」と「辺（頂点どうしのつながり）」でできた構造。友達関係・路線図・プログラムの依存関係など、何かと何かのつながりはたいていグラフで表せる。',
      '辺に向きがないものを無向グラフ、向きがあるものを有向グラフと呼ぶ。この項目では無向グラフを使う。',
      'プログラムでグラフを扱うときは、各頂点について「つながっている頂点の一覧」を持つ隣接リスト（adjacency list）で持つのが基本。頂点 v につながる辺の本数を v の次数という。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<vector<int>> adj(n + 1);',
      '  for (int i = 0; i < m; i++) {',
      '    int a, b; cin >> a >> b;',
      '    adj[a].push_back(b);',
      '    adj[b].push_back(a);',
      '  }',
      '  int best = 1;',
      '  for (int v = 1; v <= n; v++) {',
      '    if (adj[v].size() > adj[best].size()) best = v;',
      '    cout << "deg(" << v << ") = " << adj[v].size() << endl;',
      '  }',
      '  cout << "max: " << best << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 頂点 M 辺の無向グラフが与えられる（頂点は 1 から N）。各辺は 2 つの頂点を結ぶ。次数（つながっている辺の本数）が最大の頂点の番号を 1 つ出力せよ（複数あれば番号が最も小さいもの）。',
      constraints: ['2 ≤ N ≤ 1000', '1 ≤ M ≤ 2000', '同じ辺が重複することはない'],
      samples: [
        { input: '6 8\n1 2\n1 3\n2 3\n2 4\n2 5\n4 5\n5 6\n4 6', output: '2' },
      ],
    },
    solution: {
      idea: '隣接リストに両方向を記録し、各頂点の adj[v].size() が次数になる。番号の小さい順に見て、より大きい次数が出たときだけ更新すれば、同率のときに番号が最小のものが残る。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, m; cin >> n >> m;',
        '  vector<vector<int>> adj(n + 1);',
        '  for (int i = 0; i < m; i++) {',
        '    int a, b; cin >> a >> b;',
        '    adj[a].push_back(b);',
        '    adj[b].push_back(a);',
        '  }',
        '  int best = 1;',
        '  for (int v = 2; v <= n; v++) {',
        '    if (adj[v].size() > adj[best].size()) best = v;',
        '  }',
        '  cout << best << endl;',
        '}',
      ].join('\n'),
    },
  });
})();
