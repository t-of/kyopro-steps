'use strict';
// 9章 グラフアルゴリズム（後半: 9.6〜9.10、コラム2本）
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* で動かして作る（手計算のミスを防ぐため）。

// ---- 9.6 Union-Find木 ----
(function registerUnionFind() {
  const n = 6;
  const pos = {
    1: { x: 0.5, y: 0.1 }, 2: { x: 0.85, y: 0.3 }, 3: { x: 0.85, y: 0.7 },
    4: { x: 0.5, y: 0.9 }, 5: { x: 0.15, y: 0.7 }, 6: { x: 0.15, y: 0.3 },
  };
  const nodesFrame = () => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id) }));
  const edgesFrame = (par) => {
    const es = [];
    for (let v = 1; v <= n; v++) if (par[v] !== v) es.push({ from: v, to: par[v], directed: true });
    return es;
  };
  const colorMap = (par) => {
    const roots = [];
    const hl = {};
    for (let v = 1; v <= n; v++) {
      let r = v;
      while (par[r] !== r) r = par[r];
      let gi = roots.indexOf(r);
      if (gi < 0) { gi = roots.length; roots.push(r); }
      hl[v] = `group${gi}`;
    }
    return hl;
  };

  const par = []; const sz = [];
  for (let i = 0; i <= n; i++) { par[i] = i; sz[i] = 1; }
  const steps = [];

  const pushFrame = (line, vars, note, hlEdges) => steps.push({
    line, vars,
    graph: { label: 'Union-Find 木（矢印は親への辺）', nodes: nodesFrame(), edges: edgesFrame(par), hlNodes: colorMap(par), hlEdges },
    note,
  });

  pushFrame(18, { par: `[${par.slice(1).join(', ')}]` }, '最初は 6 人全員が別グループ。par[v] = v（自分自身が親 = 自分が根）。');

  function unite(a, b, line) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return;
    let x = ra, y = rb;
    if (sz[x] < sz[y]) { const t = x; x = y; y = t; }
    par[y] = x;
    sz[x] += sz[y];
  }
  function find(x) {
    let r = x;
    while (par[r] !== r) r = par[r];
    return r;
  }

  const queries = [['u', 1, 2], ['u', 3, 4], ['u', 1, 3], ['u', 5, 6], ['u', 1, 5], ['f', 4, 6]];
  for (const [t, a, b] of queries) {
    if (t === 'u') {
      const ra = find(a), rb = find(b);
      unite(a, b);
      // どちらの根が子になったかは par を見れば分かる（同じ根なら辺は増えない）
      const child = par[ra] !== ra ? ra : (par[rb] !== rb ? rb : null);
      const edge = child != null ? [{ from: child, to: par[child], kind: 'current' }] : [];
      pushFrame(21, { 'unite(a,b)': `(${a}, ${b})` }, child != null
        ? `find(${a})=${ra}, find(${b})=${rb}。サイズが大きい方（同じなら a 側）の根 ${par[child]} を根のままにし、もう一方の根 ${child} をその子にする: par[${child}] = ${par[child]}。`
        : `find(${a})=${ra}, find(${b})=${rb}。すでに同じグループなので何もしない。`, edge);
    } else {
      // find(a) の経路圧縮前
      const pathA = [a];
      let r = a;
      while (par[r] !== r) { r = par[r]; pathA.push(r); }
      const edgesPathA = [];
      for (let i = 0; i + 1 < pathA.length; i++) edgesPathA.push({ from: pathA[i], to: pathA[i + 1], kind: 'current' });
      pushFrame(7, { 'find(a)': a, 根: r }, `find(${a}) を再帰でたどる: ${pathA.join(' → ')}（根 = ${r}）。まだ圧縮していない。`, edgesPathA);
      for (const v of pathA) par[v] = r; // 経路圧縮: 通ったノードを全部根に直結
      pushFrame(7, { 'find(a)': a, 根: r }, `再帰から戻るとき、通ったノード全部の親を根 ${r} に直結する（経路圧縮）。次に find(${a}) を呼ぶと 1 回で根に着く。`, []);

      const pathB = [b];
      r = b;
      while (par[r] !== r) { r = par[r]; pathB.push(r); }
      const edgesPathB = [];
      for (let i = 0; i + 1 < pathB.length; i++) edgesPathB.push({ from: pathB[i], to: pathB[i + 1], kind: 'current' });
      pushFrame(7, { 'find(b)': b, 根: r }, `find(${b}) を同じようにたどる: ${pathB.join(' → ')}（根 = ${r}）。`, edgesPathB);
      for (const v of pathB) par[v] = r;
      const same = find(a) === find(b);
      pushFrame(22, { 'find(a)==find(b)': same ? 'true' : 'false' }, `find(${a}) と find(${b}) が同じ根かどうかで判定: ${same ? 'Yes' : 'No'} を出力。`, []);
    }
  }

  registerTopic('9.6', {
    title: 'Union-Find木',
    explain: [
      'Union-Find木（素集合データ構造）は「グループ分け」を高速に扱うためのデータ構造。各要素は親へのポインタ par[v] を持ち、親をたどって行き着く先（根）が同じなら同じグループ。',
      'find(x) は x から親をたどって根を探す。unite(a, b) は a の根と b の根が違えば、どちらかをもう一方の子にしてグループを合体する。',
      '工夫その1「経路圧縮」: find で根を見つけたら、たどった全部のノードの親を根に直結し直す。次に find するときに一瞬で根に着く。',
      '工夫その2「union by size」: 合体するとき要素数が少ない方の根を多い方の子にする。木の高さが低く保たれ、find が速くなる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'vector<int> par, sz;',
      'int find(int x) {',
      '  if (par[x] == x) return x;',
      '  return par[x] = find(par[x]);',
      '}',
      'void unite(int a, int b) {',
      '  a = find(a); b = find(b);',
      '  if (a == b) return;',
      '  if (sz[a] < sz[b]) swap(a, b);',
      '  par[b] = a;',
      '  sz[a] += sz[b];',
      '}',
      'int main() {',
      '  int n, q; cin >> n >> q;',
      '  par.resize(n + 1); sz.assign(n + 1, 1);',
      '  for (int i = 1; i <= n; i++) par[i] = i;',
      '  for (int i = 0; i < q; i++) {',
      '    char t; int a, b; cin >> t >> a >> b;',
      '    if (t == \'u\') unite(a, b);',
      '    else cout << (find(a) == find(b) ? "Yes" : "No") << endl;',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 人を管理している。最初、全員が別々のグループにいる。Q 個のクエリを順に処理してください。i 番目のクエリでは整数 T_i, A_i, B_i が与えられる。T_i = 1 のとき、A_i と B_i を同じグループにする。T_i = 2 のとき、A_i と B_i が同じグループかどうかを判定し、同じなら Yes、違うなら No を出力する。',
      constraints: ['2 ≤ N ≤ 100000', '1 ≤ Q ≤ 100000', '1 ≤ A_i, B_i ≤ N', 'T_i は 1 または 2', '入力はすべて整数'],
      input: 'N Q\nT_1 A_1 B_1\n⋮\nT_Q A_Q B_Q',
      output: 'T_i = 2 のクエリについて、Yes か No を 1 行ずつ出力してください。',
      samples: [
        { input: '6 6\n1 1 2\n1 3 4\n1 1 3\n1 5 6\n1 1 5\n2 4 6', output: 'Yes' },
        { input: '2 1\n2 1 2', output: 'No', note: '一度も合体させていない 2 人を判定する場合。' },
      ],
    },
    solution: {
      idea: 'par[v] = v で初期化し、unite では find で根を求めてから小さい方の根を大きい方につなぐ（union by size）。find は再帰の帰りがけに par[x] を根へ直結する（経路圧縮）。この 2 つの工夫で、ほぼ定数時間で find/unite ができる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'vector<int> par, sz;',
        'int find(int x) {',
        '  if (par[x] == x) return x;',
        '  return par[x] = find(par[x]);',
        '}',
        'void unite(int a, int b) {',
        '  a = find(a); b = find(b);',
        '  if (a == b) return;',
        '  if (sz[a] < sz[b]) swap(a, b);',
        '  par[b] = a;',
        '  sz[a] += sz[b];',
        '}',
        'int main() {',
        '  int n, q; cin >> n >> q;',
        '  par.resize(n + 1); sz.assign(n + 1, 1);',
        '  for (int i = 1; i <= n; i++) par[i] = i;',
        '  for (int i = 0; i < q; i++) {',
        '    int t, a, b; cin >> t >> a >> b;',
        '    if (t == 1) unite(a, b);',
        '    else cout << (find(a) == find(b) ? "Yes" : "No") << endl;',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.7 最小全域木（クラスカル法） ----
(function registerKruskal() {
  const n = 6;
  const pos = {
    1: { x: 0.5, y: 0.08 }, 2: { x: 0.85, y: 0.3 }, 3: { x: 0.85, y: 0.7 },
    4: { x: 0.5, y: 0.92 }, 5: { x: 0.15, y: 0.7 }, 6: { x: 0.15, y: 0.3 },
  };
  const edgeList = [[1, 2, 4], [1, 3, 2], [2, 3, 1], [2, 4, 5], [3, 4, 8], [3, 5, 10], [4, 5, 2], [4, 6, 6], [5, 6, 3]];
  const nodesFrame = () => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id) }));
  const allEdges = () => edgeList.map(([a, b, w]) => ({ from: a, to: b, w }));

  const par = []; const sz = [];
  for (let i = 0; i <= n; i++) { par[i] = i; sz[i] = 1; }
  function find(x) { while (par[x] !== x) x = par[x]; return x; }
  function unite(a, b) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    let x = ra, y = rb;
    if (sz[x] < sz[y]) { const t = x; x = y; y = t; }
    par[y] = x; sz[x] += sz[y];
    return true;
  }

  const sorted = [...edgeList].sort((e1, e2) => e1[2] - e2[2]);
  const used = []; // used エッジのリスト（元の [a,b,w]）
  const steps = [];

  steps.push({
    line: 18, vars: { n, m: edgeList.length },
    graph: { label: '候補の辺（ソート前）', nodes: nodesFrame(), edges: allEdges() },
    note: '辺をコストの昇順にソートする。候補の辺は全部で 9 本。',
  });

  let total = 0, usedCount = 0;
  for (const [a, b, w] of sorted) {
    const willUse = find(a) !== find(b);
    const hlUsed = used.map(([ua, ub]) => ({ from: ua, to: ub, kind: 'used' }));
    const current = { from: a, to: b, kind: 'current' };
    steps.push({
      line: 22, vars: { 辺: `${a}-${b} (w=${w})`, 'find(a)': find(a), 'find(b)': find(b) },
      graph: { label: '検討中', nodes: nodesFrame(), edges: allEdges(), hlEdges: [...hlUsed, current] },
      note: willUse
        ? `${a} と ${b} は別のグループ → 採用して合体する。`
        : `${a} と ${b} はすでに同じグループ → 採用すると閉路になるので却下。`,
    });
    if (willUse) {
      unite(a, b);
      used.push([a, b, w]);
      total += w; usedCount++;
    }
    if (usedCount === n - 1) break;
  }

  steps.push({
    line: 24, vars: { 総コスト: total },
    graph: { label: '最小全域木', nodes: nodesFrame(), edges: allEdges(), hlEdges: used.map(([a, b]) => ({ from: a, to: b, kind: 'used' })) },
    note: `採用した辺は ${n - 1} 本、総コストは ${total}。`,
  });

  registerTopic('9.7', {
    title: '最小全域木',
    explain: [
      '全頂点を連結にする辺の選び方のうち、辺の重みの合計が最小になるものを最小全域木（MST）という。',
      'クラスカル法は、辺をコストの昇順に並べ、「採用しても閉路にならない」辺だけを順に採用していく貪欲法。閉路になるかどうかは Union-Find で「両端がすでに同じグループか」を調べれば分かる。',
      '採用した辺が n-1 本になったら全頂点が連結になっているので終了してよい。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'struct Edge { int a, b, w; };',
      'int par[16], sz[16];',
      'int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }',
      'bool unite(int a, int b) {',
      '  a = find(a); b = find(b);',
      '  if (a == b) return false;',
      '  if (sz[a] < sz[b]) swap(a, b);',
      '  par[b] = a; sz[a] += sz[b];',
      '  return true;',
      '}',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<Edge> es(m);',
      '  for (auto &e : es) cin >> e.a >> e.b >> e.w;',
      '  sort(es.begin(), es.end(), [](auto &x, auto &y) { return x.w < y.w; });',
      '  for (int i = 1; i <= n; i++) { par[i] = i; sz[i] = 1; }',
      '  long long total = 0; int used = 0;',
      '  for (auto &e : es) {',
      '    if (used == n - 1) break;',
      '    if (unite(e.a, e.b)) { total += e.w; used++; }',
      '  }',
      '  cout << total << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の島を結ぶ M 本の橋の候補を持っている。i 番目の候補は島 U_i と島 V_i を結び、建設費 W_i がかかる。\n\n全部の島を橋だけで行き来できるようにしたい。建設費の合計を最小にするとき、その合計値を求めてください。',
      constraints: ['2 ≤ N ≤ 1000', 'N-1 ≤ M ≤ 2000', '1 ≤ U_i, V_i ≤ N', '1 ≤ W_i ≤ 1000', 'グラフは連結にできる（答えが必ず存在する）', '入力はすべて整数'],
      input: 'N M\nU_1 V_1 W_1\n⋮\nU_M V_M W_M',
      output: '建設費の合計の最小値を出力してください。',
      samples: [
        { input: '6 9\n1 2 4\n1 3 2\n2 3 1\n2 4 5\n3 4 8\n3 5 10\n4 5 2\n4 6 6\n5 6 3', output: '13' },
        { input: '2 1\n1 2 5', output: '5', note: '橋の候補がちょうど N-1 本しかない場合、すべて採用するしかない。' },
      ],
    },
    solution: {
      idea: '辺をコストの昇順にソートし、Union-Find で閉路判定をしながら貪欲に採用するクラスカル法。採用した辺が n-1 本になった時点で最小全域木が完成する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'struct Edge { int a, b, w; };',
        'int par[16], sz[16];',
        'int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }',
        'bool unite(int a, int b) {',
        '  a = find(a); b = find(b);',
        '  if (a == b) return false;',
        '  if (sz[a] < sz[b]) swap(a, b);',
        '  par[b] = a; sz[a] += sz[b];',
        '  return true;',
        '}',
        'int main() {',
        '  int n, m; cin >> n >> m;',
        '  vector<Edge> es(m);',
        '  for (auto &e : es) cin >> e.a >> e.b >> e.w;',
        '  sort(es.begin(), es.end(), [](auto &x, auto &y) { return x.w < y.w; });',
        '  for (int i = 1; i <= n; i++) { par[i] = i; sz[i] = 1; }',
        '  long long total = 0; int used = 0;',
        '  for (auto &e : es) {',
        '    if (used == n - 1) break;',
        '    if (unite(e.a, e.b)) { total += e.w; used++; }',
        '  }',
        '  cout << total << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.8 最大フロー（フォード・ファルカーソン法） ----
(function registerMaxFlow() {
  const n = 6;
  const pos = {
    1: { x: 0.05, y: 0.5 }, 2: { x: 0.35, y: 0.2 }, 3: { x: 0.35, y: 0.8 },
    4: { x: 0.65, y: 0.2 }, 5: { x: 0.65, y: 0.8 }, 6: { x: 0.95, y: 0.5 },
  };
  const capList = [[1, 2, 3], [1, 3, 2], [2, 4, 2], [2, 5, 2], [3, 5, 2], [4, 6, 2], [5, 6, 3]];
  const nodesFrame = () => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id) }));

  const cap = {}; // cap[a][b]
  for (const [a, b, c] of capList) { (cap[a] = cap[a] || {})[b] = c; }
  const rc = {}; // 残余容量
  for (let i = 1; i <= n; i++) rc[i] = {};
  for (const [a, b, c] of capList) rc[a][b] = (rc[a][b] || 0) + c;
  const flow = {}; // 元の辺の流量（表示用）
  for (let i = 1; i <= n; i++) flow[i] = {};

  const origEdges = () => capList.map(([a, b, c]) => ({ from: a, to: b, directed: true, label: `${flow[a][b] || 0}/${c}` }));
  const residEdges = () => {
    const es = [];
    for (let u = 1; u <= n; u++) for (const v in rc[u]) if (rc[u][v] > 0) es.push({ from: u, to: Number(v), directed: true, w: rc[u][v] });
    return es;
  };

  const steps = [];
  steps.push({
    line: 22, vars: { n, m: capList.length },
    graphs: [
      { label: '元のグラフ（流量/容量）', nodes: nodesFrame(), edges: origEdges() },
      { label: '残余グラフ', nodes: nodesFrame(), edges: residEdges() },
    ],
    note: '頂点1(始点)から頂点6(終点)へ送れる最大量を求める。最初は残余容量 = 容量、流量は全部 0。',
  });

  function dfs(u, t, f, visited, path) {
    if (u === t) return f;
    visited[u] = true;
    path.push(u);
    for (let v = 1; v <= n; v++) {
      if (!visited[v] && (rc[u][v] || 0) > 0) {
        const d = dfs(v, t, Math.min(f, rc[u][v]), visited, path);
        if (d > 0) return d;
      }
    }
    path.pop();
    return 0;
  }

  let total = 0;
  while (true) {
    const visited = {};
    const path = [];
    const d = dfs(1, n, Infinity, visited, path);
    if (d === 0) break;
    path.push(n);
    // 見つけた増加パスをハイライトして見せる
    const pathEdges = [];
    for (let i = 0; i + 1 < path.length; i++) pathEdges.push({ from: path[i], to: path[i + 1], kind: 'current' });
    steps.push({
      line: 7, vars: { 増加パス: path.join(' → '), ボトルネック: d },
      graphs: [
        { label: '元のグラフ（流量/容量）', nodes: nodesFrame(), edges: origEdges() },
        { label: '残余グラフ', nodes: nodesFrame(), edges: residEdges(), hlEdges: pathEdges },
      ],
      note: `DFS で 1 から 6 へ、残余容量が正の辺だけをたどって増加パス ${path.join('→')} を見つけた。パス上の最小残余容量（ボトルネック）は ${d}。`,
    });
    for (let i = 0; i + 1 < path.length; i++) {
      const u = path[i], v = path[i + 1];
      rc[u][v] -= d;
      rc[v][u] = (rc[v][u] || 0) + d;
      if (cap[u] && cap[u][v] != null) flow[u][v] = (flow[u][v] || 0) + d;
      else if (cap[v] && cap[v][u] != null) flow[v][u] = (flow[v][u] || 0) - d;
    }
    total += d;
    steps.push({
      line: 14, vars: { total },
      graphs: [
        { label: '元のグラフ（流量/容量）', nodes: nodesFrame(), edges: origEdges() },
        { label: '残余グラフ', nodes: nodesFrame(), edges: residEdges() },
      ],
      note: `パス上の全部の辺に ${d} を流す: 順方向の残余容量を ${d} 減らし、逆方向の残余容量を ${d} 増やす（戻せるようにしておく）。ここまでの合計流量は ${total}。`,
    });
  }

  steps.push({
    line: 34, vars: { 最大フロー: total },
    graphs: [
      { label: '元のグラフ（流量/容量）', nodes: nodesFrame(), edges: origEdges() },
      { label: '残余グラフ', nodes: nodesFrame(), edges: residEdges() },
    ],
    note: `1 から 6 へ、残余容量が正の辺だけをたどる経路がもう無い（残余グラフで 6 に届かない）ので終了。最大フローは ${total}。`,
  });

  registerTopic('9.8', {
    title: '最大フロー',
    explain: [
      '各辺に「容量（流せる上限）」があるグラフで、始点から終点へ同時に流せる量の最大値を最大フローという。水道管のネットワークをイメージすると分かりやすい。',
      'フォード・ファルカーソン法は、始点から終点へ「まだ流せる辺（残余容量が正の辺）」だけをたどる経路（増加パス）を見つけ、そのパスの最小残余容量ぶんだけ流す、を繰り返す。',
      '流した辺には同時に逆向きの残余容量を増やしておく（流しすぎた分を後で「戻す」ための仕組み）。これにより一度選んだ経路が最善でなくても修正できる。増加パスが見つからなくなったら終了。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int rc[16][16];',
      'int n;',
      'bool visited[16];',
      'int dfs(int u, int t, int f) {',
      '  if (u == t) return f;',
      '  visited[u] = true;',
      '  for (int v = 1; v <= n; v++) {',
      '    if (!visited[v] && rc[u][v] > 0) {',
      '      int d = dfs(v, t, min(f, rc[u][v]));',
      '      if (d > 0) {',
      '        rc[u][v] -= d;',
      '        rc[v][u] += d;',
      '        return d;',
      '      }',
      '    }',
      '  }',
      '  return 0;',
      '}',
      'int main() {',
      '  int m; cin >> n >> m;',
      '  for (int i = 0; i < m; i++) {',
      '    int a, b, c; cin >> a >> b >> c;',
      '    rc[a][b] += c;',
      '  }',
      '  long long total = 0;',
      '  while (true) {',
      '    fill(visited, visited + n + 1, false);',
      '    int f = dfs(1, n, INT_MAX);',
      '    if (f == 0) break;',
      '    total += f;',
      '  }',
      '  cout << total << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の中継地点を結ぶ M 本の有向パイプを持っている。i 番目のパイプは地点 U_i から地点 V_i へ向かい、1 秒あたり C_i まで流せる。\n\n地点 1 から地点 N へ、1 秒あたりに送れる量の最大値を求めてください（経由する地点ではパイプの容量以外に制限はない）。',
      constraints: ['2 ≤ N ≤ 6', '1 ≤ M ≤ 10', '1 ≤ U_i, V_i ≤ N', '1 ≤ C_i ≤ 10', '入力はすべて整数'],
      input: 'N M\nU_1 V_1 C_1\n⋮\nU_M V_M C_M',
      output: '地点1から地点Nへ送れる量の最大値を出力してください。',
      samples: [
        { input: '6 7\n1 2 3\n1 3 2\n2 4 2\n2 5 2\n3 5 2\n4 6 2\n5 6 3', output: '5' },
        { input: '2 1\n2 1 5', output: '0', note: 'パイプが逆向きで、地点1から地点Nへ流す経路がない場合。' },
      ],
    },
    solution: {
      idea: '残余容量 rc[u][v] を隣接行列で持ち、DFS で始点から終点へ残余容量が正の辺だけをたどる経路を探す。見つかれば経路上の最小残余容量ぶんを流し、逆辺の残余容量を増やす。経路が見つからなくなるまで繰り返す（フォード・ファルカーソン法）。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int rc[16][16];',
        'int n;',
        'bool visited[16];',
        'int dfs(int u, int t, int f) {',
        '  if (u == t) return f;',
        '  visited[u] = true;',
        '  for (int v = 1; v <= n; v++) {',
        '    if (!visited[v] && rc[u][v] > 0) {',
        '      int d = dfs(v, t, min(f, rc[u][v]));',
        '      if (d > 0) {',
        '        rc[u][v] -= d;',
        '        rc[v][u] += d;',
        '        return d;',
        '      }',
        '    }',
        '  }',
        '  return 0;',
        '}',
        'int main() {',
        '  int m; cin >> n >> m;',
        '  for (int i = 0; i < m; i++) {',
        '    int a, b, c; cin >> a >> b >> c;',
        '    rc[a][b] += c;',
        '  }',
        '  long long total = 0;',
        '  while (true) {',
        '    fill(visited, visited + n + 1, false);',
        '    int f = dfs(1, n, INT_MAX);',
        '    if (f == 0) break;',
        '    total += f;',
        '  }',
        '  cout << total << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.9 二部マッチング ----
(function registerBipartiteMatching() {
  const nl = 3, nr = 3;
  const pos = {
    L1: { x: 0.2, y: 0.15 }, L2: { x: 0.2, y: 0.5 }, L3: { x: 0.2, y: 0.85 },
    R1: { x: 0.8, y: 0.15 }, R2: { x: 0.8, y: 0.5 }, R3: { x: 0.8, y: 0.85 },
  };
  // 左 i は id = i（1,2,3）、右 j は id = 10 + j（11,12,13）で区別する
  const nodesFrame = (curVisited, cur) => [
    { id: 1, x: pos.L1.x, y: pos.L1.y, label: '左1' }, { id: 2, x: pos.L2.x, y: pos.L2.y, label: '左2' }, { id: 3, x: pos.L3.x, y: pos.L3.y, label: '左3' },
    { id: 11, x: pos.R1.x, y: pos.R1.y, label: '右1' }, { id: 12, x: pos.R2.x, y: pos.R2.y, label: '右2' }, { id: 13, x: pos.R3.x, y: pos.R3.y, label: '右3' },
  ];
  const adj = { 1: [11, 12], 2: [12, 13], 3: [11, 13] }; // 左→右の興味関係
  const allEdges = () => {
    const es = [];
    for (const a in adj) for (const b of adj[a]) es.push({ from: Number(a), to: b });
    return es;
  };

  const matchR = { 11: -1, 12: -1, 13: -1 };
  const steps = [];

  function groupHl(visited, cur) {
    const hl = { 1: 'group0', 2: 'group0', 3: 'group0', 11: 'group1', 12: 'group1', 13: 'group1' };
    if (visited) for (const v in visited) if (visited[v]) hl[v] = 'frontier';
    if (cur != null) hl[cur] = 'current';
    return hl;
  }
  function usedEdges() {
    const es = [];
    for (const r in matchR) if (matchR[r] !== -1) es.push({ from: Number(matchR[r]), to: Number(r), kind: 'used' });
    return es;
  }

  steps.push({
    line: 24, vars: { nl, nr },
    graph: { label: '興味関係(未マッチ)', nodes: nodesFrame(), edges: allEdges(), hlNodes: groupHl() },
    note: '左側 3 人、右側 3 つの部活。線は「興味がある」関係。1人1部活になるよう、できるだけ多くマッチさせたい。',
  });

  function tryKuhn(u, visited) {
    for (const v of adj[u]) {
      if (visited[v]) continue;
      visited[v] = true;
      steps.push({
        line: 10, vars: { u, v },
        graph: { label: '探索中', nodes: nodesFrame(), edges: allEdges(), hlNodes: groupHl(visited, v), hlEdges: usedEdges() },
        note: `左${u} から 興味先 右${v - 10} を見る。`,
      });
      if (matchR[v] === -1 || tryKuhn(matchR[v], visited)) {
        const old = matchR[v];
        matchR[v] = u;
        steps.push({
          line: 12, vars: { [`matchR[右${v - 10}]`]: `左${u}` },
          graph: { label: old === -1 ? 'マッチ成立' : '付け替え成立', nodes: nodesFrame(), edges: allEdges(), hlNodes: groupHl(visited, v), hlEdges: usedEdges() },
          note: old === -1
            ? `右${v - 10} はまだ誰ともマッチしていなかったので、左${u} とマッチさせる。`
            : `右${v - 10} は左${old} とマッチ中だったが、左${old} は他（右${matchR[v]}以外）に移れたので、右${v - 10} は左${u} に付け替える。`,
        });
        return true;
      }
    }
    return false;
  }

  let cnt = 0;
  for (let u = 1; u <= nl; u++) {
    const visited = {};
    if (tryKuhn(u, visited)) cnt++;
  }

  steps.push({
    line: 30, vars: { 最大マッチング数: cnt },
    graph: { label: '完成', nodes: nodesFrame(), edges: allEdges(), hlNodes: groupHl(), hlEdges: usedEdges() },
    note: `全員について試し終えた。最大マッチングは ${cnt} 組。`,
  });

  registerTopic('9.9', {
    title: '二部マッチング',
    explain: [
      '頂点を左右 2 グループに分け、左右の間にだけ辺があるグラフを二部グラフという。二部マッチングは、1 つの頂点が 1 本の辺にしか使われないように辺を選び、選ぶ辺の本数を最大にする問題。',
      'これは最大フローに帰着できる: 仮の始点 S から左の各頂点へ容量 1 の辺、左右の興味関係の辺に容量 1、右の各頂点から仮の終点 T へ容量 1 の辺を張ると、S-T 間の最大フローが最大マッチングの数に一致する（どの辺も容量 1 なので、1 単位の流れ = 1 組のマッチ）。',
      '実装では、各左頂点について「相手を探す」DFS（拡張パスを探す）を行う。相手がすでに別の左頂点とマッチしていても、その左頂点が別の相手に移れるなら付け替える。これは最大フローの増加パス探索と同じ考え方。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'vector<int> adj[16];',
      'int matchR[16];',
      'bool visited[16];',
      'int nl, nr;',
      'bool tryKuhn(int u) {',
      '  for (int v : adj[u]) {',
      '    if (visited[v]) continue;',
      '    visited[v] = true;',
      '    if (matchR[v] == -1 || tryKuhn(matchR[v])) {',
      '      matchR[v] = u;',
      '      return true;',
      '    }',
      '  }',
      '  return false;',
      '}',
      'int main() {',
      '  int m; cin >> nl >> nr >> m;',
      '  for (int i = 0; i < m; i++) {',
      '    int a, b; cin >> a >> b;',
      '    adj[a].push_back(b);',
      '  }',
      '  fill(matchR, matchR + nr + 1, -1);',
      '  int cnt = 0;',
      '  for (int u = 1; u <= nl; u++) {',
      '    fill(visited, visited + nr + 1, false);',
      '    if (tryKuhn(u)) cnt++;',
      '  }',
      '  cout << cnt << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君のクラスには生徒が NL 人、部活が NR 個ある。M 個の「生徒 A_i は部活 B_i に興味がある」が与えられる。1 人の生徒は 1 つの部活にしか入れず、1 つの部活には 1 人しか入れないとして、できるだけ多くの生徒を部活にマッチさせたい。マッチできる最大人数を求めてください。',
      constraints: ['1 ≤ NL, NR ≤ 100', '0 ≤ M ≤ 1000', '1 ≤ A_i ≤ NL', '1 ≤ B_i ≤ NR', '入力はすべて整数'],
      input: 'NL NR M\nA_1 B_1\n⋮\nA_M B_M',
      output: 'マッチできる最大人数を出力してください。',
      samples: [
        { input: '3 3 6\n1 1\n1 2\n2 2\n2 3\n3 1\n3 3', output: '3' },
        { input: '2 2 0', output: '0', note: '興味関係が 1 組もない場合。' },
      ],
    },
    solution: {
      idea: '各左頂点 u について、興味がある右頂点を順に見る。その右頂点がまだ誰とも組んでいないか、組んでいる相手（tryKuhn(matchR[v])）が別の候補に移れるなら、v を u と組ませる。全左頂点で試した回数の合計が最大マッチング数（クーン＝マンカスのアルゴリズム、最大フローの増加パス探索と同じ考え方）。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'vector<int> adj[16];',
        'int matchR[16];',
        'bool visited[16];',
        'int nl, nr;',
        'bool tryKuhn(int u) {',
        '  for (int v : adj[u]) {',
        '    if (visited[v]) continue;',
        '    visited[v] = true;',
        '    if (matchR[v] == -1 || tryKuhn(matchR[v])) {',
        '      matchR[v] = u;',
        '      return true;',
        '    }',
        '  }',
        '  return false;',
        '}',
        'int main() {',
        '  int m; cin >> nl >> nr >> m;',
        '  for (int i = 0; i < m; i++) {',
        '    int a, b; cin >> a >> b;',
        '    adj[a].push_back(b);',
        '  }',
        '  fill(matchR, matchR + nr + 1, -1);',
        '  int cnt = 0;',
        '  for (int u = 1; u <= nl; u++) {',
        '    fill(visited, visited + nr + 1, false);',
        '    if (tryKuhn(u)) cnt++;',
        '  }',
        '  cout << cnt << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 9.10 チャレンジ問題 ----
(function registerChallenge() {
  const n = 6;
  const pos = {
    1: { x: 0.2, y: 0.15 }, 2: { x: 0.45, y: 0.1 }, 3: { x: 0.2, y: 0.5 }, 4: { x: 0.45, y: 0.55 },
    5: { x: 0.8, y: 0.3 }, 6: { x: 0.8, y: 0.7 },
  };
  const edgeList = [[1, 3, 1], [3, 4, 2], [5, 6, 2], [1, 2, 3], [2, 4, 4], [2, 3, 5]];
  const nodesFrame = () => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id) }));
  const allEdges = () => edgeList.map(([a, b, w]) => ({ from: a, to: b, w }));

  const par = []; const sz = [];
  for (let i = 0; i <= n; i++) { par[i] = i; sz[i] = 1; }
  function find(x) { while (par[x] !== x) x = par[x]; return x; }
  function unite(a, b) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    let x = ra, y = rb;
    if (sz[x] < sz[y]) { const t = x; x = y; y = t; }
    par[y] = x; sz[x] += sz[y];
    return true;
  }

  const sorted = [...edgeList].sort((e1, e2) => e1[2] - e2[2]);
  const used = [];
  const steps = [];

  steps.push({
    line: 16, vars: { n, m: edgeList.length },
    graph: { label: '候補の辺', nodes: nodesFrame(), edges: allEdges() },
    note: '町 5, 6 は町 1〜4 のどの町ともつながっていない（非連結）。まず辺をコストの昇順にソートする。',
  });

  let total = 0;
  for (const [a, b, w] of sorted) {
    const willUse = find(a) !== find(b);
    const hlUsed = used.map(([ua, ub]) => ({ from: ua, to: ub, kind: 'used' }));
    steps.push({
      line: 19, vars: { 辺: `${a}-${b} (w=${w})` },
      graph: { label: '最小全域森', nodes: nodesFrame(), edges: allEdges(), hlEdges: [...hlUsed, { from: a, to: b, kind: 'current' }] },
      note: willUse ? `${a} と ${b} は別グループ → 採用。` : `${a} と ${b} はすでに同じグループ → 却下。`,
    });
    if (willUse) { unite(a, b); used.push([a, b, w]); total += w; }
  }
  steps.push({
    line: 20, vars: { 総コスト: total },
    graph: { label: '最小全域森が完成', nodes: nodesFrame(), edges: allEdges(), hlEdges: used.map(([a, b]) => ({ from: a, to: b, kind: 'used' })) },
    note: `道路を作る総コストは ${total}（非連結なグラフでは「成分ごとの最小全域木」＝最小全域森になる）。`,
  });

  const queries = [[1, 4], [1, 5], [5, 6]];
  for (const [a, b] of queries) {
    const ans = find(a) === find(b);
    steps.push({
      line: 24, vars: { a, b, 'find(a)==find(b)': ans ? 'true' : 'false' },
      graph: { label: '問い合わせ', nodes: nodesFrame(), edges: allEdges(), hlEdges: used.map(([x, y]) => ({ from: x, to: y, kind: 'used' })), hlNodes: { [a]: 'current', [b]: 'frontier' } },
      note: `町 ${a} と 町 ${b} は道路で行き来できるか: ${ans ? 'Yes' : 'No'}。`,
    });
  }

  registerTopic('9.10', {
    title: 'チャレンジ問題',
    explain: [
      '9 章のまとめ問題。「最小全域木（クラスカル法）」と「Union-Find木」を組み合わせて解く。',
      'グラフが連結とは限らない場合、全部の辺を見てクラスカル法を行うと、連結成分ごとに最小全域木ができる（これを最小全域森と呼ぶ）。採用される辺の本数は「頂点数 - 連結成分の数」になる。',
      '最小全域森を作るのに使った Union-Find はそのまま「2 頂点が連結か」の問い合わせにも使い回せる。1 つのデータ構造を 2 つの目的に使う典型例。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int par[16], sz[16];',
      'int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }',
      'bool unite(int a, int b) {',
      '  a = find(a); b = find(b);',
      '  if (a == b) return false;',
      '  if (sz[a] < sz[b]) swap(a, b);',
      '  par[b] = a; sz[a] += sz[b];',
      '  return true;',
      '}',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<array<int,3>> es(m);',
      '  for (auto &e : es) cin >> e[0] >> e[1] >> e[2];',
      '  sort(es.begin(), es.end(), [](auto &x, auto &y) { return x[2] < y[2]; });',
      '  for (int i = 1; i <= n; i++) { par[i] = i; sz[i] = 1; }',
      '  long long total = 0;',
      '  for (auto &e : es) if (unite(e[0], e[1])) total += e[2];',
      '  cout << total << endl;',
      '  int q; cin >> q;',
      '  while (q--) {',
      '    int a, b; cin >> a >> b;',
      '    cout << (find(a) == find(b) ? "Yes" : "No") << endl;',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の町を結ぶ M 本の道路候補を持っている。i 番目の候補は町 U_i と町 V_i を結び、建設費 W_i がかかる。必ずしも全部の町が道路でつながるとは限らない。\n\n各連結成分の中だけを最小のコストで連結にするときの建設費の合計（最小全域森の総コスト）を求めてください。続けて Q 個の問い合わせに答えてください。i 番目の問い合わせでは 2 つの町 A_i, B_i が与えられるので、道路（建設後のもの）で行き来できるかを判定してください。',
      constraints: ['1 ≤ N ≤ 1000', '0 ≤ M ≤ 2000', '1 ≤ Q ≤ 1000', '1 ≤ U_i, V_i ≤ N', '1 ≤ W_i ≤ 1000', '1 ≤ A_i, B_i ≤ N', '入力はすべて整数'],
      input: 'N M\nU_1 V_1 W_1\n⋮\nU_M V_M W_M\nQ\nA_1 B_1\n⋮\nA_Q B_Q',
      output: '建設費の合計を1行目に出力してください。続けて、各問い合わせについて Yes か No を1行ずつ出力してください。',
      samples: [
        { input: '6 6\n1 3 1\n3 4 2\n5 6 2\n1 2 3\n2 4 4\n2 3 5\n3\n1 4\n1 5\n5 6', output: '8\nYes\nNo\nYes' },
        { input: '1 0\n1\n1 1', output: '0\nYes', note: '町が 1 つだけで道路候補がない場合、建設費は 0、自分自身とは必ず行き来できる。' },
      ],
    },
    solution: {
      idea: 'クラスカル法で辺を昇順に見て Union-Find で閉路判定しながら採用する。グラフが非連結でも、各成分の中で木ができるだけでアルゴリズムはそのまま動く（全部のエッジを見終えればよい）。採用後も同じ Union-Find が残っているので、問い合わせには find(a) == find(b) で答える。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int par[16], sz[16];',
        'int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }',
        'bool unite(int a, int b) {',
        '  a = find(a); b = find(b);',
        '  if (a == b) return false;',
        '  if (sz[a] < sz[b]) swap(a, b);',
        '  par[b] = a; sz[a] += sz[b];',
        '  return true;',
        '}',
        'int main() {',
        '  int n, m; cin >> n >> m;',
        '  vector<array<int,3>> es(m);',
        '  for (auto &e : es) cin >> e[0] >> e[1] >> e[2];',
        '  sort(es.begin(), es.end(), [](auto &x, auto &y) { return x[2] < y[2]; });',
        '  for (int i = 1; i <= n; i++) { par[i] = i; sz[i] = 1; }',
        '  long long total = 0;',
        '  for (auto &e : es) if (unite(e[0], e[1])) total += e[2];',
        '  cout << total << endl;',
        '  int q; cin >> q;',
        '  while (q--) {',
        '    int a, b; cin >> a >> b;',
        '    cout << (find(a) == find(b) ? "Yes" : "No") << endl;',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- コラム: Bellman-Ford法 ----
(function registerBellmanFord() {
  const n = 5;
  const pos = {
    1: { x: 0.05, y: 0.5 }, 2: { x: 0.3, y: 0.1 }, 3: { x: 0.3, y: 0.9 }, 4: { x: 0.65, y: 0.5 }, 5: { x: 0.95, y: 0.5 },
  };
  const edgeList = [[1, 2, 4], [1, 3, 5], [2, 3, -3], [3, 4, 2], [2, 4, 6], [4, 5, 1], [3, 5, 7]];
  const nodesFrame = (dist) => Object.keys(pos).map((id) => ({ id: Number(id), x: pos[id].x, y: pos[id].y, label: String(id), sub: dist[id] === Infinity ? 'inf' : `d=${dist[id]}` }));
  const allEdges = () => edgeList.map(([a, b, w]) => ({ from: a, to: b, w, directed: true }));

  const INF = Infinity;
  const dist = {}; for (let i = 1; i <= n; i++) dist[i] = INF;
  dist[1] = 0;
  const steps = [];

  steps.push({
    line: 9, vars: { 'dist[1]': 0 },
    graph: { label: '初期状態', nodes: nodesFrame(dist), edges: allEdges() },
    note: '始点 1 の距離を 0、それ以外を無限大にする。',
  });

  for (let round = 1; round <= n - 1; round++) {
    let changed = false;
    for (const [a, b, w] of edgeList) {
      if (dist[a] === INF) continue;
      if (dist[a] + w < dist[b]) {
        dist[b] = dist[a] + w;
        changed = true;
        if (round === 1) {
          steps.push({
            line: 13, vars: { 辺: `${a}→${b} (w=${w})`, [`dist[${a}]+w`]: dist[a] + w, [`旧dist[${b}]`]: '更新前より小さい' },
            graph: { label: `1 周目`, nodes: nodesFrame(dist), edges: allEdges(), hlEdges: [{ from: a, to: b, kind: 'current' }] },
            note: `辺 ${a}→${b}（重み ${w}）を見る: dist[${a}] + ${w} = ${dist[b]} の方が小さいので dist[${b}] を更新する。`,
          });
        }
      }
    }
    if (round === 1) {
      steps.push({
        line: 10, vars: {},
        graph: { label: '1 周目が終わった状態', nodes: nodesFrame(dist), edges: allEdges() },
        note: `全辺を 1 回ずつ見終えた（1 周目）。dist = [${[1, 2, 3, 4, 5].map((i) => dist[i]).join(', ')}]。`,
      });
    } else if (!changed) {
      steps.push({
        line: 10, vars: { 周目: round },
        graph: { label: `${round} 周目`, nodes: nodesFrame(dist), edges: allEdges() },
        note: `${round} 周目は、どの辺を見ても更新が起きなかった（すでに最短距離に収束している）。`,
      });
      break;
    }
  }

  let negCycle = false;
  for (const [a, b, w] of edgeList) {
    if (dist[a] === INF) continue;
    if (dist[a] + w < dist[b]) negCycle = true;
  }
  steps.push({
    line: 19, vars: { negCycle: negCycle ? 'true' : 'false' },
    graph: { label: '負閉路チェック', nodes: nodesFrame(dist), edges: allEdges() },
    note: `N-1 周の緩和が終わったあと、もう 1 周だけ全辺を試す。それでも更新が起きるなら負の閉路がある。ここでは更新が起きなかったので負閉路は${negCycle ? 'ある' : 'ない'}。`,
  });

  registerTopic('9.c2', {
    title: 'コラム: Bellman-Ford法',
    explain: [
      'ダイクストラ法は負の重みの辺があると正しく動かないことがある。Bellman-Ford法は負の重みがあっても使える最短路アルゴリズム（ただし遅い: O(NM)）。',
      'やることは単純: 「全部の辺について、通ると距離が縮むなら更新する（緩和）」を N-1 回繰り返すだけ。N-1 回で十分な理由は、最短路は高々 N-1 本の辺でできているから（N 頂点のパスは辺が N-1 本以下）。',
      'おまけで、N-1 回のあとにもう 1 回全辺を緩和してみて、まだ更新が起きるなら「負の閉路」がある（ぐるぐる回るほど距離が縮み続けるので最短路が定義できない）、と判定できる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long INF = 1e18;',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<array<long long,3>> es(m);',
      '  for (auto &e : es) cin >> e[0] >> e[1] >> e[2];',
      '  vector<long long> dist(n + 1, INF);',
      '  dist[1] = 0;',
      '  for (int i = 0; i < n - 1; i++) {',
      '    for (auto &e : es) {',
      '      if (dist[e[0]] == INF) continue;',
      '      if (dist[e[0]] + e[2] < dist[e[1]]) dist[e[1]] = dist[e[0]] + e[2];',
      '    }',
      '  }',
      '  bool negCycle = false;',
      '  for (auto &e : es) {',
      '    if (dist[e[0]] == INF) continue;',
      '    if (dist[e[0]] + e[2] < dist[e[1]]) negCycle = true;',
      '  }',
      '  cout << (negCycle ? "Yes" : "No") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 頂点 M 辺の有向グラフを持っている。辺には負の重みを含むことがある。i 番目の辺は頂点 U_i から頂点 V_i へ向かい、重みは W_i である。\n\n頂点 1 を始点として全辺を N-1 回緩和したあと、もう 1 回緩和を試して、まだ距離が縮む辺があれば「負の閉路がある」と判定してください。負の閉路があれば Yes を、なければ No を出力してください。',
      constraints: ['2 ≤ N ≤ 100', '1 ≤ M ≤ 1000', '1 ≤ U_i, V_i ≤ N', '-1000 ≤ W_i ≤ 1000', '入力はすべて整数'],
      input: 'N M\nU_1 V_1 W_1\n⋮\nU_M V_M W_M',
      output: '負の閉路があれば Yes を、なければ No を出力してください。',
      samples: [
        { input: '5 7\n1 2 4\n1 3 5\n2 3 -3\n3 4 2\n2 4 6\n4 5 1\n3 5 7', output: 'No' },
        { input: '3 3\n1 2 1\n2 3 1\n3 1 -3', output: 'Yes', note: '1→2→3→1 と回るたびに距離が縮む負の閉路がある場合。' },
      ],
    },
    solution: {
      idea: 'dist[1] = 0、他は無限大から始め、全辺の緩和を N-1 回繰り返す。負の重みがあっても、縮むなら更新するだけなので正しく動く。N-1 回で収束しているはずなので、もう 1 回試して更新が起きれば負閉路ありと判定する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long INF = 1e18;',
        'int main() {',
        '  int n, m; cin >> n >> m;',
        '  vector<array<long long,3>> es(m);',
        '  for (auto &e : es) cin >> e[0] >> e[1] >> e[2];',
        '  vector<long long> dist(n + 1, INF);',
        '  dist[1] = 0;',
        '  for (int i = 0; i < n - 1; i++) {',
        '    for (auto &e : es) {',
        '      if (dist[e[0]] == INF) continue;',
        '      if (dist[e[0]] + e[2] < dist[e[1]]) dist[e[1]] = dist[e[0]] + e[2];',
        '    }',
        '  }',
        '  bool negCycle = false;',
        '  for (auto &e : es) {',
        '    if (dist[e[0]] == INF) continue;',
        '    if (dist[e[0]] + e[2] < dist[e[1]]) negCycle = true;',
        '  }',
        '  cout << (negCycle ? "Yes" : "No") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- コラム: Warshall-Floyd法 ----
(function registerWarshallFloyd() {
  const n = 4;
  const edgeList = [[1, 2, 3], [2, 3, 1], [3, 4, 2], [4, 1, 7], [1, 3, 8], [2, 4, 9]];
  const INF = Infinity;
  const d = [];
  for (let i = 0; i <= n; i++) { d[i] = []; for (let j = 0; j <= n; j++) d[i][j] = i === j ? 0 : INF; }
  for (const [a, b, w] of edgeList) d[a][b] = Math.min(d[a][b], w);

  const nodesFrame = () => [
    { id: 1, x: 0.1, y: 0.1, label: '1' }, { id: 2, x: 0.9, y: 0.1, label: '2' },
    { id: 3, x: 0.9, y: 0.9, label: '3' }, { id: 4, x: 0.1, y: 0.9, label: '4' },
  ];
  const allEdges = () => edgeList.map(([a, b, w]) => ({ from: a, to: b, w, directed: true }));

  function tableFrame(label) {
    return {
      label,
      rows: [1, 2, 3, 4],
      cols: [1, 2, 3, 4],
      data: [1, 2, 3, 4].map((i) => [1, 2, 3, 4].map((j) => (d[i][j] === INF ? null : d[i][j]))),
    };
  }

  const steps = [];
  steps.push({
    line: 10, vars: { n },
    graph: { label: '元のグラフ', nodes: nodesFrame(), edges: allEdges() },
    table: tableFrame('距離表 d（初期状態。空欄は無限大）'),
    note: '直接つながっている辺の重みだけを入れ、それ以外は無限大にしておく。',
  });

  for (let k = 1; k <= n; k++) {
    const hl = [];
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= n; j++) {
        if (d[i][k] === INF || d[k][j] === INF) continue;
        if (d[i][k] + d[k][j] < d[i][j]) {
          d[i][j] = d[i][k] + d[k][j];
          hl.push([i - 1, j - 1]);
        }
      }
    }
    const t = tableFrame(`距離表 d（k = ${k} を経由してよいことにした後）`);
    t.hl = hl;
    steps.push({
      line: 16, vars: { k },
      table: t,
      note: hl.length
        ? `頂点 ${k} を経由するともっと短くなるマス（${hl.map(([i, j]) => `d[${i + 1}][${j + 1}]`).join(', ')}）を更新した。`
        : `頂点 ${k} を経由しても短くなるマスはなかった。`,
    });
  }

  registerTopic('9.c3', {
    title: 'コラム: Warshall-Floyd法',
    explain: [
      '全頂点ペアの最短距離を一度に求めたいとき、ダイクストラ法を全頂点から N 回やるより簡単な方法がワーシャル・フロイド法。',
      '考え方は「経由してよい頂点を 1, 2, ..., N と 1 個ずつ増やしていく」。d[i][j] を「現時点で経由を許した頂点だけを使ったときの i→j の最短距離」とすると、頂点 k を新しく経由してよくなったとき d[i][j] = min(d[i][j], d[i][k] + d[k][j]) と更新すればよい。',
      '三重ループ（k, i, j）だけで書けるのが特徴で、負の重みの辺があっても使える（ただし負閉路があると壊れる）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long INF = 1e18;',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<vector<long long>> d(n + 1, vector<long long>(n + 1, INF));',
      '  for (int i = 1; i <= n; i++) d[i][i] = 0;',
      '  for (int i = 0; i < m; i++) {',
      '    int a, b; long long w; cin >> a >> b >> w;',
      '    d[a][b] = min(d[a][b], w);',
      '  }',
      '  for (int k = 1; k <= n; k++) {',
      '    for (int i = 1; i <= n; i++) {',
      '      for (int j = 1; j <= n; j++) {',
      '        if (d[i][k] == INF || d[k][j] == INF) continue;',
      '        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];',
      '      }',
      '    }',
      '  }',
      '  for (int i = 1; i <= n; i++) {',
      '    for (int j = 1; j <= n; j++) cout << (d[i][j] == INF ? -1 : d[i][j]) << " \\n"[j == n];',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 頂点 M 辺の有向グラフ（辺の重みは正）を持っている。i 番目の辺は頂点 U_i から頂点 V_i へ向かい、重みは W_i である。\n\n全頂点ペア (i, j) の最短距離を求めてください。',
      constraints: ['2 ≤ N ≤ 4', '1 ≤ M ≤ 8', '1 ≤ U_i, V_i ≤ N', '1 ≤ W_i ≤ 20', '入力はすべて整数'],
      input: 'N M\nU_1 V_1 W_1\n⋮\nU_M V_M W_M',
      output: 'N 行 N 列の表として出力してください。行 i 列 j には i から j への最短距離を（到達できなければ -1 を）、各行は空白区切りで出力してください。',
      samples: [
        { input: '4 6\n1 2 3\n2 3 1\n3 4 2\n4 1 7\n1 3 8\n2 4 9', output: '0 3 4 6\n10 0 1 3\n9 12 0 2\n7 10 11 0' },
        { input: '2 1\n1 2 5', output: '0 5\n-1 0', note: '頂点2から頂点1へは辺がなく、到達できない。' },
      ],
    },
    solution: {
      idea: '距離表 d を直接の辺の重みで初期化し（対角成分は 0）、k = 1..N の順に「k を経由してよい」として d[i][j] = min(d[i][j], d[i][k] + d[k][j]) を全ての i, j について更新する。三重ループで書けて、全頂点対の最短距離が一度に求まる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long INF = 1e18;',
        'int main() {',
        '  int n, m; cin >> n >> m;',
        '  vector<vector<long long>> d(n + 1, vector<long long>(n + 1, INF));',
        '  for (int i = 1; i <= n; i++) d[i][i] = 0;',
        '  for (int i = 0; i < m; i++) {',
        '    int a, b; long long w; cin >> a >> b >> w;',
        '    d[a][b] = min(d[a][b], w);',
        '  }',
        '  for (int k = 1; k <= n; k++) {',
        '    for (int i = 1; i <= n; i++) {',
        '      for (int j = 1; j <= n; j++) {',
        '        if (d[i][k] == INF || d[k][j] == INF) continue;',
        '        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];',
        '      }',
        '    }',
        '  }',
        '  for (int i = 1; i <= n; i++) {',
        '    for (int j = 1; j <= n; j++) cout << (d[i][j] == INF ? -1 : d[i][j]) << " \\n"[j == n];',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();
