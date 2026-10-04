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

// ---- 9.c1 コラム: グラフの用語 ----
(function registerGraphTerms() {
  const n = 6;
  const edgeList = [[1, 2], [1, 3], [2, 3], [2, 4], [2, 5], [4, 5], [5, 6], [4, 6]];
  const pos = {
    1: { x: 0.5, y: 0.15 }, 2: { x: 0.8, y: 0.33 }, 3: { x: 0.8, y: 0.68 },
    4: { x: 0.5, y: 0.85 }, 5: { x: 0.2, y: 0.68 }, 6: { x: 0.2, y: 0.33 },
  };
  const nodes = () => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id) }));
  const edges = () => edgeList.map(([a, b]) => ({ from: a, to: b }));
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edgeList) { adj[a].push(b); adj[b].push(a); }

  const steps = [];
  steps.push({
    line: 4, vars: { n, m: edgeList.length },
    graph: { label: '元のグラフ（無向グラフ）', nodes: nodes(), edges: edges() },
    note: '頂点（点）と辺（つながり）でできた構造がグラフ。辺に向きがあるものは有向グラフ、辺に重みが付くものは重み付きグラフと呼ぶ（この図は無向・重みなし）。',
  });
  steps.push({
    line: 9, vars: {},
    graph: { label: '隣接リストを作り終えた状態', nodes: nodes(), edges: edges() },
    note: '9.0 と同じ要領で、各頂点の隣接リスト adj[v] を作り終えたとする。',
  });

  const visited = Array(n + 1).fill(false);
  const queue = [1];
  visited[1] = true;
  const treeEdges = [];
  steps.push({
    line: 14, vars: { queue: `[${queue.join(', ')}]` },
    graph: { label: '始点を調べ始める', nodes: nodes(), edges: edges(), hlNodes: { 1: 'current' } },
    note: '始点の頂点1をキューに入れて訪問済みにする。頂点から頂点へ辺をたどってできる道筋を「経路（パス）」という。',
  });

  const done = [];
  while (queue.length) {
    const v = queue.shift();
    done.push(v);
    for (const u of adj[v]) {
      if (!visited[u]) {
        visited[u] = true;
        queue.push(u);
        treeEdges.push({ from: v, to: u, kind: 'tree' });
      }
    }
    const hlNodes = {};
    for (const d of done) hlNodes[d] = 'done';
    hlNodes[v] = 'current';
    for (const q of queue) hlNodes[q] = 'frontier';
    steps.push({
      line: 17, vars: { v, queue: `[${queue.join(', ')}]` },
      graph: { label: '幅優先で全頂点を訪ねる', nodes: nodes(), edges: edges(), hlNodes, hlEdges: treeEdges.slice() },
      note: `頂点${v}から調べ、まだ訪問していない隣の頂点をキューに入れる。キューが空になるまで続ける。`,
    });
  }

  const connected = done.length === n;
  const isTree = connected && edgeList.length === n - 1;
  const hlNodesFinal = Object.fromEntries(done.map((d) => [d, 'done']));
  steps.push({
    line: 26, vars: { connected, m: edgeList.length, 'n-1': n - 1, isTree },
    graph: {
      label: '連結・木・閉路の判定', nodes: nodes(), edges: edges(), hlNodes: hlNodesFinal,
      hlEdges: [{ from: 1, to: 2, kind: 'used' }, { from: 2, to: 3, kind: 'used' }, { from: 3, to: 1, kind: 'used' }],
    },
    note: `全頂点を訪問できたので「連結」。辺の数 ${edgeList.length} は 頂点数-1 = ${n - 1} より多いので、どこかに「閉路（同じ頂点に戻ってくる経路）」がある（例: 1→2→3→1）。ちょうど n-1 本で閉路がなければ「木」と呼ぶ。`,
  });

  registerTopic('9.c1', {
    title: 'コラム: グラフの用語',
    explain: [
      'グラフでよく使う言葉を整理する。「次数」（頂点につながる辺の本数）は 9.0 で見た。',
      '経路（パス）: 辺をたどって頂点から頂点へ移動する道筋。閉路（サイクル）: 経路の始点と終点が同じになるもの。1→2→3→1 のように同じ頂点に戻ってくる道があれば、そのグラフには閉路がある。',
      '連結: どの頂点からどの頂点へも経路があること（1つのかたまりになっている）。木: 連結でかつ閉路がない無向グラフ。頂点数を n とすると、木の辺の数はちょうど n-1 本になる。',
      '辺に向きがあるものを有向グラフ、ないものを無向グラフという。辺に数値（コストや距離）が付くものを重み付きグラフという（9.4 のダイクストラ法で使う）。',
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
      '  vector<bool> visited(n + 1, false);',
      '  queue<int> q;',
      '  q.push(1);',
      '  visited[1] = true;',
      '  int seen = 1;',
      '  while (!q.empty()) {',
      '    int v = q.front(); q.pop();',
      '    for (int u : adj[v]) {',
      '      if (!visited[u]) {',
      '        visited[u] = true;',
      '        seen++;',
      '        q.push(u);',
      '      }',
      '    }',
      '  }',
      '  bool connected = (seen == n);',
      '  bool isTree = connected && (m == n - 1);',
      '  if (!connected) cout << "DISCONNECTED" << endl;',
      '  else if (isTree) cout << "TREE" << endl;',
      '  else cout << "HAS_CYCLE" << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の島と M 本の橋からなる無向グラフが与えられる。すべての島が橋だけで行き来できなければ DISCONNECTED を出力せよ。すべて行き来でき、かつ橋の本数がちょうど N-1 本なら TREE（木）を、それより多ければ HAS_CYCLE（閉路がある）を出力せよ。',
      constraints: ['1 ≤ N ≤ 1000', '0 ≤ M ≤ 2000', '同じ橋が重複することはない'],
      samples: [
        { input: '6 8\n1 2\n1 3\n2 3\n2 4\n2 5\n4 5\n5 6\n4 6', output: 'HAS_CYCLE' },
        { input: '4 3\n1 2\n2 3\n3 4', output: 'TREE' },
        { input: '4 1\n1 2', output: 'DISCONNECTED' },
      ],
    },
    solution: {
      idea: '幅優先探索（または深さ優先探索）で頂点1から行ける島をすべて数える。数えた島の数が N と一致すれば連結。連結なら、橋の本数が N-1 なら木、それより多ければ必ずどこかに閉路がある（連結な無向グラフで辺が N-1 本より多いと、木に余分な辺を足すことになり必ず輪ができる）。',
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
        '  vector<bool> visited(n + 1, false);',
        '  queue<int> q;',
        '  q.push(1);',
        '  visited[1] = true;',
        '  int seen = 1;',
        '  while (!q.empty()) {',
        '    int v = q.front(); q.pop();',
        '    for (int u : adj[v]) {',
        '      if (!visited[u]) {',
        '        visited[u] = true;',
        '        seen++;',
        '        q.push(u);',
        '      }',
        '    }',
        '  }',
        '  bool connected = (seen == n);',
        '  bool isTree = connected && (m == n - 1);',
        '  if (!connected) cout << "DISCONNECTED" << endl;',
        '  else if (isTree) cout << "TREE" << endl;',
        '  else cout << "HAS_CYCLE" << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.1 グラフの実装方法（隣接行列と隣接リスト） ----
(function registerGraphImpl() {
  const n = 5;
  const edgeList = [[1, 2], [1, 3], [2, 4], [3, 4], [4, 5]];
  const pos = {
    1: { x: 0.5, y: 0.08 }, 2: { x: 0.92, y: 0.4 }, 3: { x: 0.08, y: 0.4 },
    4: { x: 0.72, y: 0.9 }, 5: { x: 0.28, y: 0.9 },
  };
  const nodes = (builtEdges) => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id) }));
  const cols = [1, 2, 3, 4, 5];

  const mat = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const adj = Array.from({ length: n + 1 }, () => []);
  const steps = [];

  function matTable(hl) {
    return { label: '隣接行列 mat', rows: cols, cols, data: cols.map((r) => cols.map((c) => mat[r][c])), hl: hl || [] };
  }
  function builtEdges(upTo) {
    return edgeList.slice(0, upTo).map(([a, b]) => ({ from: a, to: b }));
  }

  steps.push({
    line: 4, vars: { n, m: edgeList.length },
    graph: { label: 'まだ辺を読んでいない', nodes: nodes(), edges: [] },
    table: matTable(),
    note: '隣接行列は mat[a][b] で「a と b に辺があるか」を直接記録する表。隣接リストは adj[v] に「v とつながる頂点」を並べて持つ。',
  });

  edgeList.forEach(([a, b], i) => {
    mat[a][b] = 1; mat[b][a] = 1;
    adj[a].push(b); adj[b].push(a);
    steps.push({
      line: 9, vars: { a, b, [`adj[${a}]`]: `{${adj[a].join(', ')}}`, [`adj[${b}]`]: `{${adj[b].join(', ')}}` },
      graph: { label: `辺 (${a}, ${b}) を読む`, nodes: nodes(), edges: builtEdges(i + 1), hlEdges: [{ from: a, to: b, kind: 'current' }] },
      table: matTable([[a, b], [b, a]]),
      note: `mat[${a}][${b}] と mat[${b}][${a}] を 1 にし（隣接行列）、adj[${a}] に ${b} を、adj[${b}] に ${a} を加える（隣接リスト）。`,
    });
  });

  steps.push({
    line: 13, vars: { 'mat[1][2]': mat[1][2], 'adj[1]のサイズ': adj[1].length },
    graph: { label: '完成したグラフ', nodes: nodes(), edges: builtEdges(edgeList.length) },
    table: matTable(),
    note: '隣接行列は「a,bに辺があるか」を mat[a][b] を見るだけで O(1) で答えられるが、n×n マスのメモリが要る。隣接リストはメモリが辺の数ぶんで済むが、a,b に辺があるか調べるには adj[a] を順に見る必要がある。n が小さいときは隣接行列、大きいときは隣接リストが向く。',
  });

  registerTopic('9.1', {
    title: 'グラフの実装方法（隣接行列と隣接リスト）',
    explain: [
      '隣接行列は n×n の表 mat で、mat[a][b] が 1（または true）なら a-b に辺がある、という持ち方。「a と b に辺があるか」を一瞬（O(1)）で答えられるのが強み。',
      '隣接リストは各頂点 v について、v とつながる頂点の一覧を adj[v] に持つ。使うメモリが辺の数ぶんで済み、「v から出ている辺をすべて見る」処理（深さ優先探索・幅優先探索など）が速い。',
      'n（頂点数）が小さい（数百程度）なら隣接行列、大きい・辺がまばらなら隣接リストを選ぶのが基本。両方同時に持ってもよい。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<vector<bool>> mat(n + 1, vector<bool>(n + 1, false));',
      '  vector<vector<int>> adj(n + 1);',
      '  for (int i = 0; i < m; i++) {',
      '    int a, b; cin >> a >> b;',
      '    mat[a][b] = mat[b][a] = true;',
      '    adj[a].push_back(b);',
      '    adj[b].push_back(a);',
      '  }',
      '  cout << "edge 1-2: " << mat[1][2] << endl;',
      '  cout << "adj[1] size: " << adj[1].size() << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 人の間に M 組の友だち関係がある（友だち関係は双方向）。Q 個の質問が与えられるので、それぞれ指定された 2 人が友だちかどうかを Yes/No で答えよ。N は小さいので隣接行列で持ってよい。',
      constraints: ['2 ≤ N ≤ 500', '0 ≤ M ≤ 2000', '1 ≤ Q ≤ 2000'],
      samples: [
        { input: '5 5 3\n1 2\n1 3\n2 4\n3 4\n4 5\n2 3\n1 2\n4 5', output: 'No\nYes\nYes' },
      ],
    },
    solution: {
      idea: '友だち関係の数も質問の数も多いので、mat[a][b] に関係の有無を入れておけば、各質問に O(1) で答えられる。N が 500 以下なので mat は 501×501 で十分メモリに収まる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, m, q; cin >> n >> m >> q;',
        '  vector<vector<bool>> mat(n + 1, vector<bool>(n + 1, false));',
        '  for (int i = 0; i < m; i++) {',
        '    int a, b; cin >> a >> b;',
        '    mat[a][b] = mat[b][a] = true;',
        '  }',
        '  for (int i = 0; i < q; i++) {',
        '    int x, y; cin >> x >> y;',
        '    cout << (mat[x][y] ? "Yes" : "No") << "\\n";',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.2 深さ優先探索（連結判定） ----
(function registerDFS() {
  const n = 6;
  const edgeList = [[1, 2], [1, 3], [2, 3], [2, 4], [2, 5], [4, 5], [5, 6], [4, 6]];
  const pos = {
    1: { x: 0.5, y: 0.15 }, 2: { x: 0.8, y: 0.33 }, 3: { x: 0.8, y: 0.68 },
    4: { x: 0.5, y: 0.85 }, 5: { x: 0.2, y: 0.68 }, 6: { x: 0.2, y: 0.33 },
  };
  const nodes = () => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id) }));
  const edges = () => edgeList.map(([a, b]) => ({ from: a, to: b }));
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edgeList) { adj[a].push(b); adj[b].push(a); }

  const steps = [];
  const visited = Array(n + 1).fill(false);
  const st = [1];
  let count = 0;
  const treeEdges = [];

  steps.push({
    line: 13, vars: { st: `[${st.join(', ')}]` },
    array: { label: 'スタック st（右端が top）', values: st.slice() },
    graph: { label: '始点をスタックに積む', nodes: nodes(), edges: edges() },
    note: '始点の頂点1をスタックに積む。深さ優先探索は「今いる頂点から行けるところへどんどん深く進み、行き止まったら戻る」探索。',
  });

  while (st.length) {
    const v = st.pop();
    let note;
    if (visited[v]) {
      note = `頂点${v}はスタックに積まれた時点ですでに訪問済みだった（別の経路から先に訪れていた）ので、何もせず次へ進む。`;
    } else {
      visited[v] = true;
      count++;
      const pushed = [];
      for (const u of adj[v]) {
        if (!visited[u]) { st.push(u); pushed.push(u); treeEdges.push({ from: v, to: u, kind: 'tree' }); }
      }
      note = `頂点${v}を訪問済みにする（${count}個目）。まだ訪問していない隣の頂点${pushed.length ? pushed.join(', ') : 'はない'}をスタックに積む。`;
    }
    const hlNodes = {};
    for (let i = 1; i <= n; i++) if (visited[i]) hlNodes[i] = 'done';
    hlNodes[v] = 'current';
    steps.push({
      line: 16, vars: { v, st: `[${st.join(', ')}]`, count },
      array: { label: 'スタック st（右端が top）', values: st.slice() },
      graph: { label: 'スタックから取り出して調べる', nodes: nodes(), edges: edges(), hlNodes, hlEdges: treeEdges.slice() },
      note,
    });
  }

  const connected = count === n;
  steps.push({
    line: 24, vars: { count, n, connected },
    graph: {
      label: '結果', nodes: nodes(), edges: edges(),
      hlNodes: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, 'done'])),
      hlEdges: treeEdges,
    },
    note: `訪問できた頂点の数 ${count} が n = ${n} と一致するので、すべての頂点が頂点1から行き来できる＝連結。`,
  });

  registerTopic('9.2', {
    title: '深さ優先探索（連結判定）',
    explain: [
      '深さ優先探索（DFS）は、今いる頂点から行ける頂点へどんどん深く進み、行き止まったら一つ前に戻ってまだ見ていない道を試す探索。「戻る」処理はスタック（後入れ先出し）か、再帰呼び出し（関数の呼び出し自体がスタックになる）で書ける。',
      '頂点1から深さ優先探索をして訪問できた頂点の数を数え、全頂点数と一致すれば「頂点1からすべての頂点に行ける＝グラフは連結」と判定できる。',
      'スタックを使う実装では、1つの頂点が複数回スタックに積まれることがある（ある頂点へ複数の経路から到達できるため）。取り出したときに「訪問済みなら何もしない」というチェックを忘れないこと。',
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
      '  vector<bool> visited(n + 1, false);',
      '  stack<int> st;',
      '  st.push(1);',
      '  int count = 0;',
      '  while (!st.empty()) {',
      '    int v = st.top(); st.pop();',
      '    if (visited[v]) continue;',
      '    visited[v] = true;',
      '    count++;',
      '    for (int u : adj[v]) {',
      '      if (!visited[u]) st.push(u);',
      '    }',
      '  }',
      '  cout << (count == n ? "YES" : "NO") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の部屋と M 本の通路がある（通路は双方向に通れる）。部屋1から通路をたどって、すべての部屋へ行けるなら YES を、1つでも行けない部屋があれば NO を出力せよ。',
      constraints: ['1 ≤ N ≤ 1000', '0 ≤ M ≤ 2000'],
      samples: [
        { input: '6 8\n1 2\n1 3\n2 3\n2 4\n2 5\n4 5\n5 6\n4 6', output: 'YES' },
        { input: '4 1\n1 2', output: 'NO' },
      ],
    },
    solution: {
      idea: '部屋1から深さ優先探索（スタック）で行ける部屋をすべて訪問し、訪問できた部屋数を数える。それが N と一致すれば全部屋に行ける。',
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
        '  vector<bool> visited(n + 1, false);',
        '  stack<int> st;',
        '  st.push(1);',
        '  int count = 0;',
        '  while (!st.empty()) {',
        '    int v = st.top(); st.pop();',
        '    if (visited[v]) continue;',
        '    visited[v] = true;',
        '    count++;',
        '    for (int u : adj[v]) {',
        '      if (!visited[u]) st.push(u);',
        '    }',
        '  }',
        '  cout << (count == n ? "YES" : "NO") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.3 幅優先探索（最短手数） ----
(function registerBFS() {
  const n = 6;
  const edgeList = [[1, 2], [1, 3], [2, 3], [2, 4], [2, 5], [4, 5], [5, 6], [4, 6]];
  const pos = {
    1: { x: 0.5, y: 0.15 }, 2: { x: 0.8, y: 0.33 }, 3: { x: 0.8, y: 0.68 },
    4: { x: 0.5, y: 0.85 }, 5: { x: 0.2, y: 0.68 }, 6: { x: 0.2, y: 0.33 },
  };
  const nodes = (dist) => Object.keys(pos).map((id) => ({
    id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id),
    sub: dist[id] != null && dist[id] !== -1 ? `d=${dist[id]}` : undefined,
  }));
  const edges = () => edgeList.map(([a, b]) => ({ from: a, to: b }));
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edgeList) { adj[a].push(b); adj[b].push(a); }

  const steps = [];
  const dist = Array(n + 1).fill(-1);
  const q = [];
  const s = 1;
  dist[s] = 0;
  q.push(s);
  const treeEdges = [];

  steps.push({
    line: 14, vars: { s, [`dist[${s}]`]: 0 },
    array: { label: 'キュー q', values: q.slice() },
    graph: { label: '始点の距離を0にする', nodes: nodes(dist), edges: edges(), hlNodes: { [s]: 'current' } },
    note: '始点の距離を0にしてキューに入れる。幅優先探索は「近い頂点から順に」調べるので、初めてたどり着いたときの手数がそのまま最短手数になる。',
  });

  while (q.length) {
    const v = q.shift();
    const newly = [];
    for (const u of adj[v]) {
      if (dist[u] === -1) {
        dist[u] = dist[v] + 1;
        q.push(u);
        newly.push(u);
        treeEdges.push({ from: v, to: u, kind: 'tree' });
      }
    }
    const hlNodes = {};
    for (let i = 1; i <= n; i++) if (dist[i] !== -1 && i !== v) hlNodes[i] = 'done';
    for (const u of q) if (hlNodes[u] !== 'done' || u === v) hlNodes[u] = 'frontier';
    hlNodes[v] = 'current';
    steps.push({
      line: 16, vars: { v, [`dist[${v}]`]: dist[v], q: `[${q.join(', ')}]` },
      array: { label: 'キュー q', values: q.slice() },
      graph: { label: '近い頂点から順に調べる', nodes: nodes(dist), edges: edges(), hlNodes, hlEdges: treeEdges.slice() },
      note: newly.length
        ? `頂点${v}（距離${dist[v]}）の隣で、まだ距離が決まっていない頂点${newly.join(', ')}の距離を ${dist[v]} + 1 = ${dist[v] + 1} にする。`
        : `頂点${v}（距離${dist[v]}）の隣はすでに全部距離が決まっている。`,
    });
  }

  steps.push({
    line: 24, vars: Object.fromEntries(Array.from({ length: n }, (_, i) => [`dist[${i + 1}]`, dist[i + 1]])),
    array: { label: '答え dist', values: dist.slice(1) },
    graph: { label: '完成した最短距離', nodes: nodes(dist), edges: edges(), hlNodes: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, 'done'])), hlEdges: treeEdges },
    note: '全頂点の距離が確定した。頂点1から各頂点へ最小何本の辺を通ればたどり着けるかが dist に入っている。',
  });

  registerTopic('9.3', {
    title: '幅優先探索（最短手数）',
    explain: [
      '幅優先探索（BFS）は、始点から「距離0の頂点」「距離1の頂点」「距離2の頂点」…の順にキュー（先入れ先出し）を使って調べていく探索。',
      'ある頂点に初めてたどり着いたときの手数（辺の本数）が、その頂点までの最短手数になる。これは近い頂点から順に調べるキューの性質（先に入れたものから先に取り出す）による。',
      '深さ優先探索とちがい、使うデータ構造がスタックではなくキューになる点に注意（見た目の処理はよく似ている）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, m, s; cin >> n >> m >> s;',
      '  vector<vector<int>> adj(n + 1);',
      '  for (int i = 0; i < m; i++) {',
      '    int a, b; cin >> a >> b;',
      '    adj[a].push_back(b);',
      '    adj[b].push_back(a);',
      '  }',
      '  vector<int> dist(n + 1, -1);',
      '  queue<int> q;',
      '  dist[s] = 0;',
      '  q.push(s);',
      '  while (!q.empty()) {',
      '    int v = q.front(); q.pop();',
      '    for (int u : adj[v]) {',
      '      if (dist[u] == -1) {',
      '        dist[u] = dist[v] + 1;',
      '        q.push(u);',
      '      }',
      '    }',
      '  }',
      '  for (int v = 1; v <= n; v++) cout << dist[v] << " ";',
      '  cout << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 人からなる交友関係（M 組の双方向の友だち関係）が与えられる。人 S を起点として、各人が S から何人を介せばたどり着けるか（直接の友だちなら1人、友だちの友だちなら2人、…）を、1 から N の全員分出力せよ。たどり着けない場合は -1 とせよ。',
      constraints: ['1 ≤ N ≤ 1000', '0 ≤ M ≤ 2000', '1 ≤ S ≤ N'],
      samples: [
        { input: '6 8 1\n1 2\n1 3\n2 3\n2 4\n2 5\n4 5\n5 6\n4 6', output: '0 1 1 2 2 3' },
      ],
    },
    solution: {
      idea: '人 S を起点に幅優先探索をすると、初めてたどり着いたときの手数が最小の「介する人数」に一致する。訪れない人は -1 のまま残る。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, m, s; cin >> n >> m >> s;',
        '  vector<vector<int>> adj(n + 1);',
        '  for (int i = 0; i < m; i++) {',
        '    int a, b; cin >> a >> b;',
        '    adj[a].push_back(b);',
        '    adj[b].push_back(a);',
        '  }',
        '  vector<int> dist(n + 1, -1);',
        '  queue<int> q;',
        '  dist[s] = 0;',
        '  q.push(s);',
        '  while (!q.empty()) {',
        '    int v = q.front(); q.pop();',
        '    for (int u : adj[v]) {',
        '      if (dist[u] == -1) {',
        '        dist[u] = dist[v] + 1;',
        '        q.push(u);',
        '      }',
        '    }',
        '  }',
        '  for (int v = 1; v <= n; v++) cout << dist[v] << " ";',
        '  cout << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.4 ダイクストラ法（priority_queue） ----
(function registerDijkstra() {
  const n = 6;
  const edgeList = [[1, 2, 4], [1, 3, 1], [2, 3, 2], [2, 4, 5], [3, 4, 8], [3, 5, 10], [4, 5, 2], [4, 6, 6], [5, 6, 3]];
  const pos = {
    1: { x: 0.5, y: 0.15 }, 2: { x: 0.8, y: 0.33 }, 3: { x: 0.8, y: 0.68 },
    4: { x: 0.5, y: 0.85 }, 5: { x: 0.2, y: 0.68 }, 6: { x: 0.2, y: 0.33 },
  };
  const nodes = (dist) => Object.keys(pos).map((id) => ({
    id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id),
    sub: `d=${dist[id] === Infinity ? '∞' : dist[id]}`,
  }));
  const edges = () => edgeList.map(([a, b, w]) => ({ from: a, to: b, w }));
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b, w] of edgeList) { adj[a].push([b, w]); adj[b].push([a, w]); }

  const steps = [];
  const dist = Array(n + 1).fill(Infinity);
  const parent = Array(n + 1).fill(0);
  let pq = []; // { d, v }
  dist[1] = 0;
  pq.push({ d: 0, v: 1 });

  function treeEdges() {
    const es = [];
    for (let v = 1; v <= n; v++) if (parent[v]) es.push({ from: parent[v], to: v, kind: 'tree' });
    return es;
  }
  function pqText() { return pq.map((p) => `(${p.d},${p.v})`).join(' '); }

  steps.push({
    line: 13, vars: { 'dist[1]': 0 },
    array: { label: '優先度つきキュー pq（(距離,頂点)）', values: pq.map((p) => `(${p.d},${p.v})`) },
    graph: { label: '始点の距離を0にする', nodes: nodes(dist), edges: edges(), hlNodes: { 1: 'current' } },
    note: '始点の距離を0にして pq に入れる。ダイクストラ法は、まだ確定していない頂点の中で距離が最小のものから順に確定させていく。',
  });

  while (pq.length) {
    // 最小の d を持つ要素を取り出す（priority_queue の pop 相当）
    let bi = 0;
    for (let i = 1; i < pq.length; i++) if (pq[i].d < pq[bi].d) bi = i;
    const { d, v } = pq[bi];
    pq.splice(bi, 1);

    if (d > dist[v]) {
      steps.push({
        line: 17, vars: { d, v, [`dist[${v}]`]: dist[v] },
        array: { label: '優先度つきキュー pq（(距離,頂点)）', values: pq.map((p) => `(${p.d},${p.v})`) },
        graph: { label: '古い情報は捨てる', nodes: nodes(dist), edges: edges(), hlNodes: { [v]: 'current' }, hlEdges: treeEdges() },
        note: `(${d}, ${v}) を取り出したが、頂点${v}の距離はすでに ${dist[v]} に更新済み（もっと良い経路が見つかっていた）。この古い情報は無視する。`,
      });
      continue;
    }

    const updated = [];
    for (const [u, w] of adj[v]) {
      if (dist[v] + w < dist[u]) {
        dist[u] = dist[v] + w;
        parent[u] = v;
        pq.push({ d: dist[u], v: u });
        updated.push(u);
      }
    }
    steps.push({
      line: 19, vars: { d, v, [`dist[${v}]`]: dist[v] },
      array: { label: '優先度つきキュー pq（(距離,頂点)）', values: pq.map((p) => `(${p.d},${p.v})`) },
      graph: { label: '確定した頂点から隣を緩和する', nodes: nodes(dist), edges: edges(), hlNodes: { [v]: 'current' }, hlEdges: treeEdges() },
      note: updated.length
        ? `頂点${v}の距離 ${dist[v]} が確定。隣の頂点${updated.join(', ')}は、頂点${v}を経由した方が近いと分かったので距離を更新する。`
        : `頂点${v}の距離 ${dist[v]} が確定。隣にこれより良い経路はなかった。`,
    });
  }

  steps.push({
    line: 25, vars: Object.fromEntries(Array.from({ length: n }, (_, i) => [`dist[${i + 1}]`, dist[i + 1]])),
    array: { label: '答え dist', values: dist.slice(1) },
    graph: { label: '完成した最短距離木', nodes: nodes(dist), edges: edges(), hlNodes: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, 'done'])), hlEdges: treeEdges() },
    note: '全頂点の最短距離が確定した。太い矢印が「最短経路木」（各頂点への最短経路をたどった辺）。',
  });

  registerTopic('9.4', {
    title: 'ダイクストラ法（priority_queue）',
    explain: [
      '辺に重み（コスト）が付いたグラフで、始点から各頂点への最短距離を求める代表的な方法がダイクストラ法。「まだ確定していない頂点の中で距離が最小のもの」を次々確定させていく。',
      '「距離が最小のものを取り出す」処理を高速に行うため、優先度つきキュー（priority_queue。中身は常に最小値がすぐ取り出せるデータ構造）を使う。C++ では既定が最大値を先に取り出すので、最小値を先に取り出すには greater<> を指定する。',
      '優先度つきキューには同じ頂点の情報が複数回入ることがある（距離が更新されるたび新しい情報を追加するため）。取り出したときに「すでにもっと良い距離が確定していないか」を確認し、古い情報は捨てる（これを怠ると答えが壊れる）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<vector<pair<int,int>>> adj(n + 1);',
      '  for (int i = 0; i < m; i++) {',
      '    int a, b, w; cin >> a >> b >> w;',
      '    adj[a].push_back({b, w});',
      '    adj[b].push_back({a, w});',
      '  }',
      '  vector<long long> dist(n + 1, LLONG_MAX);',
      '  priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;',
      '  dist[1] = 0;',
      '  pq.push({0, 1});',
      '  while (!pq.empty()) {',
      '    auto [d, v] = pq.top(); pq.pop();',
      '    if (d > dist[v]) continue;',
      '    for (auto [u, w] : adj[v]) {',
      '      if (dist[v] + w < dist[u]) {',
      '        dist[u] = dist[v] + w;',
      '        pq.push({dist[u], u});',
      '      }',
      '    }',
      '  }',
      '  for (int v = 1; v <= n; v++) cout << dist[v] << " ";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の町と M 本の道がある（道は双方向に通れ、それぞれ移動にかかるコストが決まっている）。町1から各町まで移動する最小の合計コストを、1 から N の全町分出力せよ（すべての町へ行けるものとする）。',
      constraints: ['2 ≤ N ≤ 1000', '1 ≤ M ≤ 2000', '1 ≤ コスト ≤ 1000'],
      samples: [
        { input: '6 9\n1 2 4\n1 3 1\n2 3 2\n2 4 5\n3 4 8\n3 5 10\n4 5 2\n4 6 6\n5 6 3', output: '0 3 1 8 10 13' },
      ],
    },
    solution: {
      idea: '重み付き最短路なのでダイクストラ法を使う。優先度つきキューに (現在の距離, 頂点) を入れ、距離が最小のものから確定させる。取り出した距離が現在の確定距離より大きければ古い情報として無視する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, m; cin >> n >> m;',
        '  vector<vector<pair<int,int>>> adj(n + 1);',
        '  for (int i = 0; i < m; i++) {',
        '    int a, b, w; cin >> a >> b >> w;',
        '    adj[a].push_back({b, w});',
        '    adj[b].push_back({a, w});',
        '  }',
        '  vector<long long> dist(n + 1, LLONG_MAX);',
        '  priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;',
        '  dist[1] = 0;',
        '  pq.push({0, 1});',
        '  while (!pq.empty()) {',
        '    auto [d, v] = pq.top(); pq.pop();',
        '    if (d > dist[v]) continue;',
        '    for (auto [u, w] : adj[v]) {',
        '      if (dist[v] + w < dist[u]) {',
        '        dist[u] = dist[v] + w;',
        '        pq.push({dist[u], u});',
        '      }',
        '    }',
        '  }',
        '  for (int v = 1; v <= n; v++) cout << dist[v] << " ";',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.5 木に対する動的計画法（部分木の大きさ） ----
(function registerTreeDP() {
  const n = 7;
  const edgeList = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7]];
  const pos = {
    1: { x: 0.5, y: 0.1 }, 2: { x: 0.25, y: 0.42 }, 3: { x: 0.75, y: 0.42 },
    4: { x: 0.08, y: 0.85 }, 5: { x: 0.38, y: 0.85 }, 6: { x: 0.62, y: 0.85 }, 7: { x: 0.92, y: 0.85 },
  };
  const nodes = (sz) => Object.keys(pos).map((id) => ({
    id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id),
    sub: sz[id] ? `sz=${sz[id]}` : undefined,
  }));
  const edges = () => edgeList.map(([a, b]) => ({ from: a, to: b }));
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edgeList) { adj[a].push(b); adj[b].push(a); }

  const steps = [];
  const sz = Array(n + 1).fill(0);
  const active = []; // 現在呼び出し中の頂点のスタック（現在地）
  const doneSet = new Set();

  function frame(line, v, note) {
    const hlNodes = {};
    for (const d of doneSet) hlNodes[d] = 'done';
    for (const a of active) hlNodes[a] = 'current';
    const treeEdges = [];
    for (let i = 1; i <= n; i++) {
      // active な辺（親から今の経路）を tree として見せる
    }
    for (let i = 0; i + 1 < active.length; i++) treeEdges.push({ from: active[i], to: active[i + 1], kind: 'tree' });
    steps.push({
      line, vars: { v, 呼び出し中: `[${active.join(' → ')}]` },
      graph: { label: '部分木の大きさを求める', nodes: nodes(sz), edges: edges(), hlNodes, hlEdges: treeEdges },
      note,
    });
  }

  function dfs(v, p) {
    active.push(v);
    sz[v] = 1;
    frame(6, v, `頂点${v}に入る。まず自分1人ぶん（sz[${v}] = 1）を数える。`);
    for (const u of adj[v]) {
      if (u === p) continue;
      frame(9, v, `頂点${v}からまだ訪ねていない子${u}へ dfs(${u}, ${v}) を呼ぶ。`);
      dfs(u, v);
      sz[v] += sz[u];
      frame(10, v, `子${u}から戻ってきた。子の部分木の大きさ sz[${u}] = ${sz[u]} を sz[${v}] に加え、sz[${v}] = ${sz[v]} にする。`);
    }
    doneSet.add(v);
    active.pop();
    frame(11, v, `頂点${v}の子をすべて処理し終えた。sz[${v}] = ${sz[v]} が確定（自分の部分木にある頂点の総数）。`);
  }

  steps.push({
    line: 22, vars: { n },
    graph: { label: '頂点1を根とする木', nodes: nodes(sz), edges: edges() },
    note: '木（閉路のない連結グラフ）を頂点1を根にして見る。各頂点 v の部分木の大きさ（v 自身とその子孫の個数）を、子から先に求めて足し上げる動的計画法で求める。',
  });
  dfs(1, 0);

  registerTopic('9.5', {
    title: '木に対する動的計画法（部分木の大きさ）',
    explain: [
      '木を1つの頂点（根）から見ると、各頂点 v の「部分木」（v とその子孫すべて）が決まる。部分木の大きさ（頂点数）は、v 自身の1個に、各子の部分木の大きさを足したものになる。',
      'これは「子の答えが分かってから親の答えが決まる」という dp の関係になっている。深さ優先探索で葉（子のない頂点）側から順に答えを確定させ、戻りながら親に足し上げていく。',
      '同じやり方で、部分木の頂点数だけでなく、部分木内の合計コスト・最大値など、いろいろな値を木の上の dp で求められる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'vector<vector<int>> adj;',
      'vector<int> sz;',
      'void dfs(int v, int p) {',
      '  sz[v] = 1;',
      '  for (int u : adj[v]) {',
      '    if (u == p) continue;',
      '    dfs(u, v);',
      '    sz[v] += sz[u];',
      '  }',
      '}',
      'int main() {',
      '  int n; cin >> n;',
      '  adj.assign(n + 1, {});',
      '  for (int i = 0; i < n - 1; i++) {',
      '    int a, b; cin >> a >> b;',
      '    adj[a].push_back(b);',
      '    adj[b].push_back(a);',
      '  }',
      '  sz.assign(n + 1, 0);',
      '  dfs(1, 0);',
      '  for (int v = 1; v <= n; v++) cout << sz[v] << " ";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 人の社員からなる会社の組織図が木構造で与えられる（社員1が社長で、N-1 本の「上司-部下」の関係がある）。各社員について、自分とその部下（部下の部下も含む）の人数の合計を、社員1から社員Nまで順に出力せよ。',
      constraints: ['1 ≤ N ≤ 1000'],
      samples: [
        { input: '7\n1 2\n1 3\n2 4\n2 5\n3 6\n3 7', output: '7 3 3 1 1 1 1' },
      ],
    },
    solution: {
      idea: '組織図は社員1を根とする木になる。各社員 v の部分木の大きさ（v 自身を含む、v の下にいる全員の人数）を、子から先に求めて足し上げる深さ優先探索で計算する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'vector<vector<int>> adj;',
        'vector<int> sz;',
        'void dfs(int v, int p) {',
        '  sz[v] = 1;',
        '  for (int u : adj[v]) {',
        '    if (u == p) continue;',
        '    dfs(u, v);',
        '    sz[v] += sz[u];',
        '  }',
        '}',
        'int main() {',
        '  int n; cin >> n;',
        '  adj.assign(n + 1, {});',
        '  for (int i = 0; i < n - 1; i++) {',
        '    int a, b; cin >> a >> b;',
        '    adj[a].push_back(b);',
        '    adj[b].push_back(a);',
        '  }',
        '  sz.assign(n + 1, 0);',
        '  dfs(1, 0);',
        '  for (int v = 1; v <= n; v++) cout << sz[v] << " ";',
        '}',
      ].join('\n'),
    },
  });
})();
