'use strict';
// 7章 ヒューリスティック
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* 関数で動かして作る（手計算のミスを防ぐため）。
// この章は通して「小さな巡回セールスマン問題（TSP）」を題材にする。N 個の点を 1 筆書きで全部まわり、
// 出発点に戻ってくる経路のうち、移動距離の合計（スコア）が小さいものを探す。
// 乱数は固定シードの自作 xorshift32 を使い、JS のシミュレートと C++ のコードで同じ手順・同じ値になるようにしている。

(function () {
  // ---- 共通の道具 ----
  // 7.1・7.2・7.4 で使う小さい例（5 点）。
  const PTS5 = [[0, 0], [3, 4], [6, 1], [5, 6], [1, 5]];
  // 7.3・7.5 で使う例（7 点）。2-opt だけだと局所最適で止まり、焼きなましで抜け出せるように選んだ。
  const PTS7 = [[19, 17], [10, 13], [16, 5], [3, 8], [7, 13], [12, 7], [0, 19]];

  function dist(pts, a, b) {
    const dx = pts[a][0] - pts[b][0];
    const dy = pts[a][1] - pts[b][1];
    return Math.sqrt(dx * dx + dy * dy);
  }
  function tourLength(pts, order) {
    let total = 0;
    for (let i = 0; i < order.length; i++) total += dist(pts, order[i], order[(i + 1) % order.length]);
    return total;
  }
  function r2(x) { return Math.round(x * 100) / 100; }

  // 固定シードの xorshift32。C++ 側も同じ式（符号なし32bit）で実装し、同じ乱数列にする。
  function makeRng(seed) {
    let x = seed >>> 0;
    return function next() {
      x ^= (x << 13); x >>>= 0;
      x ^= (x >>> 17); x >>>= 0;
      x ^= (x << 5); x >>>= 0;
      return x >>> 0;
    };
  }

  function greedyNearest(pts) {
    const n = pts.length;
    const visited = new Array(n).fill(false);
    visited[0] = true;
    const order = [0];
    for (let step = 0; step < n - 1; step++) {
      const cur = order[order.length - 1];
      let best = -1, bestD = Infinity;
      for (let cand = 0; cand < n; cand++) {
        if (visited[cand]) continue;
        const d = dist(pts, cur, cand);
        if (d < bestD) { bestD = d; best = cand; }
      }
      visited[best] = true;
      order.push(best);
    }
    return order;
  }

  function twoOptOnce(pts, initOrder) {
    // 改善が無くなるまで繰り返す 2-opt。局所最適（これ以上 2-opt では良くならない解）で止まる。
    let order = [...initOrder];
    const n = order.length;
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < n - 2; i++) {
        for (let j = i + 2; j < n; j++) {
          if (i === 0 && j === n - 1) continue; // 経路全体の反転は同じ経路なので飛ばす
          const a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];
          const delta = (dist(pts, a, c) + dist(pts, b, d)) - (dist(pts, a, b) + dist(pts, c, d));
          if (delta < -1e-9) {
            let lo = i + 1, hi = j;
            while (lo < hi) { const t = order[lo]; order[lo] = order[hi]; order[hi] = t; lo++; hi--; }
            improved = true;
          }
        }
      }
    }
    return order;
  }

  // ---- 7.0 ヒューリスティック系コンテストとは ----
  (function registerIntro() {
    const pts = PTS5;
    const order = [0, 1, 2, 3, 4];
    const steps = [];
    steps.push({ line: 9, vars: {}, array: { label: '訪問順 order', values: order, hl: [] }, note: '与えられた訪問順のまま、1 周の移動距離（スコア）を計算する。' });
    let score = 0;
    for (let i = 0; i < order.length; i++) {
      const a = order[i], b = order[(i + 1) % order.length];
      const d = dist(pts, a, b);
      score += d;
      steps.push({
        line: 12, vars: { a, b, 辺の長さ: r2(d), score: r2(score) },
        array: { label: '訪問順 order', values: order, hl: [i, (i + 1) % order.length] },
        note: `点${a}→点${b} の長さ ${r2(d)} を足す → score = ${r2(score)}`,
      });
    }
    steps.push({ line: 14, vars: { score: r2(score) }, array: { label: '訪問順 order', values: order, hl: [] }, note: `これがこの経路のスコア（小さいほど良い）。` });

    registerTopic('7.0', {
      title: 'ヒューリスティック系コンテストとは',
      explain: [
        'これまでの章の問題は「正しい答えがただ1つに決まる」ものだった。ヒューリスティック系コンテスト（AtCoder Heuristic Contest など）はそうではなく、制約を満たす出力ならどれでも提出でき、その出来の良さを数値（スコア）で競う。',
        'この章では、N 個の点を 1 筆書きで全部まわって出発点に戻る経路（巡回セールスマン問題、TSP）を題材にする。スコアは経路の総移動距離とし、小さいほど良い経路とする。',
        'まずはスコアの計算の仕方そのものを確かめる。訪問順が決まっているとき、隣り合う点どうしの距離を全部足せばよい。7.1 以降で「どうやって良い訪問順を作るか」を見ていく。',
      ],
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<double> x(n), y(n);',
        '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
        '  vector<int> order(n);',
        '  for (int i = 0; i < n; i++) cin >> order[i];',
        '  double score = 0;',
        '  for (int i = 0; i < n; i++) {',
        '    int a = order[i], b = order[(i + 1) % n];',
        '    score += hypot(x[a] - x[b], y[a] - y[b]);',
        '  }',
        '  printf("%.4f\\n", score);',
        '}',
      ].join('\n'),
      steps,
      example: {
        statement: '平面上の N 個の点の座標と、それを訪れる順番 P（0-indexed の順列）が与えられる。P[0]→P[1]→…→P[N-1]→P[0] の順に直線で移動するときの移動距離の合計（スコア）を求めよ。答えは真の値との誤差が 10^-4 以下なら正解とする。',
        constraints: ['2 ≤ N ≤ 1000', '0 ≤ x_i, y_i ≤ 1000', 'P は 0 〜 N-1 の順列'],
        samples: [
          { input: '5\n0 0\n3 4\n6 1\n5 6\n1 5\n0 1 2 3 4', output: '23.5638' },
        ],
      },
      solution: {
        idea: '隣り合う 2 点（最後は P[N-1] と P[0]）の距離を hypot で求めて足していくだけ。これがこの章で以後ずっと使う「スコア計算」そのもの。',
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          'int main() {',
          '  int n; cin >> n;',
          '  vector<double> x(n), y(n);',
          '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
          '  vector<int> order(n);',
          '  for (int i = 0; i < n; i++) cin >> order[i];',
          '  double score = 0;',
          '  for (int i = 0; i < n; i++) {',
          '    int a = order[i], b = order[(i + 1) % n];',
          '    score += hypot(x[a] - x[b], y[a] - y[b]);',
          '  }',
          '  printf("%.4f\\n", score);',
          '}',
        ].join('\n'),
      },
    });
  })();

  // ---- 7.1 貪欲法 ----
  (function registerGreedy() {
    const pts = PTS5;
    const n = pts.length;
    const visited = new Array(n).fill(false);
    visited[0] = true;
    const order = [0];
    const steps = [];
    steps.push({ line: 9, vars: { 出発点: 0 }, array: { label: '訪問順 order', values: [...order], hl: [0] }, note: '点0を出発点にして、訪問済みにする。' });
    for (let step = 0; step < n - 1; step++) {
      const cur = order[order.length - 1];
      let best = -1, bestD = Infinity;
      for (let cand = 0; cand < n; cand++) {
        if (visited[cand]) continue;
        const d = dist(pts, cur, cand);
        steps.push({
          line: 15, vars: { 現在地: cur, 候補: cand, 距離: r2(d), 今の最良: best === -1 ? '-' : best },
          array: { label: '訪問順 order', values: [...order], hl: [order.length - 1] },
          note: `現在地${cur}から点${cand}までの距離は${r2(d)}。`,
        });
        if (d < bestD) { bestD = d; best = cand; }
      }
      visited[best] = true;
      order.push(best);
      steps.push({
        line: 19, vars: { 選んだ点: best, 距離: r2(bestD) },
        array: { label: '訪問順 order', values: [...order], hl: [order.length - 1] },
        note: `一番近かった点${best}を選び、訪問順に加える。`,
      });
    }
    const total = tourLength(pts, order);
    steps.push({ line: 26, vars: { score: r2(total) }, array: { label: '訪問順（出発点に戻る）', values: [...order, 0] }, note: `全点をまわったので出発点に戻る。スコアは${r2(total)}。` });

    registerTopic('7.1', {
      title: '貪欲法',
      explain: [
        '良い経路を一気に見つけるのは難しいので、まずは「今その場でいちばん良さそうな選択」を繰り返す貪欲法（greedy）を考える。',
        '巡回セールスマン問題なら、「今いる点から、まだ訪れていない点のうち一番近いものへ進む」を全点訪れるまで繰り返す（最近傍法）。1 手ずつは最善でも、全体として最短になる保証はない。',
        '貪欲法は実装が簡単で速く（この例では O(N²)）、ヒューリスティックの出発点としてよく使われる。この後の節では、この結果をさらに良くしていく。',
      ],
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<double> x(n), y(n);',
        '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
        '  vector<bool> visited(n, false);',
        '  vector<int> order = {0};',
        '  visited[0] = true;',
        '  for (int step = 0; step < n - 1; step++) {',
        '    int cur = order.back();',
        '    int best = -1; double bestD = 1e18;',
        '    for (int cand = 0; cand < n; cand++) {',
        '      if (visited[cand]) continue;',
        '      double d = hypot(x[cur] - x[cand], y[cur] - y[cand]);',
        '      if (d < bestD) { bestD = d; best = cand; }',
        '    }',
        '    visited[best] = true;',
        '    order.push_back(best);',
        '  }',
        '  double total = 0;',
        '  for (int i = 0; i < n; i++)',
        '    total += hypot(x[order[i]] - x[order[(i + 1) % n]], y[order[i]] - y[order[(i + 1) % n]]);',
        '  for (int v : order) cout << v << " ";',
        '  cout << "\\n";',
        '  printf("%.4f\\n", total);',
        '}',
      ].join('\n'),
      steps,
      example: {
        statement: '平面上の N 個の点（点0が出発点）が与えられる。点0から出発し、最も近い未訪問の点へ進むことを繰り返して全点を訪れ、点0に戻る経路を求めよ（最近傍法。同距離の候補があれば番号が小さい方を選ぶ）。経路（訪問順）と、そのスコア（総移動距離。誤差1e-4まで許容）を出力せよ。',
        constraints: ['2 ≤ N ≤ 1000', '0 ≤ x_i, y_i ≤ 1000'],
        samples: [
          { input: '5\n0 0\n3 4\n6 1\n5 6\n1 5', output: '0 1 4 3 2\n22.5410' },
        ],
      },
      solution: {
        idea: '「現在地から最も近い未訪問点」を N-1 回選ぶ。各ステップで未訪問点を全部見るので O(N²)。',
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          'int main() {',
          '  int n; cin >> n;',
          '  vector<double> x(n), y(n);',
          '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
          '  vector<bool> visited(n, false);',
          '  vector<int> order = {0};',
          '  visited[0] = true;',
          '  for (int step = 0; step < n - 1; step++) {',
          '    int cur = order.back();',
          '    int best = -1; double bestD = 1e18;',
          '    for (int cand = 0; cand < n; cand++) {',
          '      if (visited[cand]) continue;',
          '      double d = hypot(x[cur] - x[cand], y[cur] - y[cand]);',
          '      if (d < bestD) { bestD = d; best = cand; }',
          '    }',
          '    visited[best] = true;',
          '    order.push_back(best);',
          '  }',
          '  double total = 0;',
          '  for (int i = 0; i < n; i++)',
          '    total += hypot(x[order[i]] - x[order[(i + 1) % n]], y[order[i]] - y[order[(i + 1) % n]]);',
          '  for (int v : order) cout << v << " ";',
          '  cout << "\\n";',
          '  printf("%.4f\\n", total);',
          '}',
        ].join('\n'),
      },
    });
  })();

  // ---- 7.2 局所探索法（山登り） ----
  (function registerLocalSearch() {
    const pts = PTS5;
    const initOrder = greedyNearest(pts); // [0,1,4,3,2]
    const n = initOrder.length;
    let order = [...initOrder];
    const steps = [];
    steps.push({ line: 12, vars: { score: r2(tourLength(pts, order)) }, array: { label: '経路 order', values: [...order], hl: [] }, note: `7.1 の貪欲法の結果（スコア ${r2(tourLength(pts, order))}）から改善を始める。` });
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < n - 2; i++) {
        for (let j = i + 2; j < n; j++) {
          if (i === 0 && j === n - 1) continue;
          const a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];
          const before = dist(pts, a, b) + dist(pts, c, d);
          const after = dist(pts, a, c) + dist(pts, b, d);
          const delta = after - before;
          const accept = delta < -1e-9;
          if (accept) {
            let lo = i + 1, hi = j;
            while (lo < hi) { const t = order[lo]; order[lo] = order[hi]; order[hi] = t; lo++; hi--; }
            improved = true;
          }
          steps.push({
            line: 19, vars: { i, j, 辺の組み替え: `(${a},${b})(${c},${d}) → (${a},${c})(${b},${d})`, 差: r2(delta) },
            array: { label: `経路 order（スコア ${r2(tourLength(pts, order))}）`, values: [...order], hl: [i, (i + 1) % n, j, (j + 1) % n] },
            note: accept ? `差が${r2(delta)}で短くなるので組み替えを採用。` : `差が${r2(delta)}で短くならないので不採用。`,
          });
        }
      }
    }
    steps.push({ line: 31, vars: { score: r2(tourLength(pts, order)) }, array: { label: '経路 order', values: [...order], hl: [] }, note: `どの組み替えでも改善しなくなったので終了。スコアは${r2(tourLength(pts, order))}。` });

    registerTopic('7.2', {
      title: '局所探索法',
      explain: [
        '貪欲法で作った経路を、少しずつ良くしていくのが局所探索法。「今の解にごく小さな変更（近傍操作）を加えて、良くなるなら採用、良くならないなら元に戻す」を繰り返す。これを山を登るように改善していくことから山登り法とも呼ぶ。',
        'TSP でよく使う近傍操作が 2-opt：経路から 2 本の辺 (a,b), (c,d) を選び、間の区間を反転させて (a,c), (b,d) に組み替える。これで交差した経路がほどけて短くなることが多い。',
        '改善する組み替えが無くなるまで続けると「局所最適」（それ以上その操作では良くならない解）にたどり着く。ただし局所最適が全体で一番良い解（大域最適）とは限らない（7.3 で見る）。',
      ],
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<double> x(n), y(n);',
        '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
        '  vector<int> order(n);',
        '  for (int i = 0; i < n; i++) cin >> order[i]; // 貪欲法などで作った初期経路',
        '  auto dist = [&](int a, int b) {',
        '    return hypot(x[a] - x[b], y[a] - y[b]);',
        '  };',
        '  bool improved = true;',
        '  while (improved) {',
        '    improved = false;',
        '    for (int i = 0; i < n - 2; i++) {',
        '      for (int j = i + 2; j < n; j++) {',
        '        if (i == 0 && j == n - 1) continue;',
        '        int a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];',
        '        double delta = (dist(a, c) + dist(b, d)) - (dist(a, b) + dist(c, d));',
        '        if (delta < -1e-9) {',
        '          reverse(order.begin() + i + 1, order.begin() + j + 1);',
        '          improved = true;',
        '        }',
        '      }',
        '    }',
        '  }',
        '  double total = 0;',
        '  for (int i = 0; i < n; i++) total += dist(order[i], order[(i + 1) % n]);',
        '  for (int v : order) cout << v << " ";',
        '  cout << "\\n";',
        '  printf("%.4f\\n", total);',
        '}',
      ].join('\n'),
      steps,
      example: {
        statement: '平面上の N 個の点と、その初期の訪問順（例えば貪欲法で作ったもの）が与えられる。2-opt（2 本の辺を選び、その間を反転する操作）を改善が無くなるまで繰り返して経路を作れ。出力は 0〜N-1 の順列であり、そのスコア（総移動距離）が 22.0 以下であれば正解とする。',
        constraints: ['4 ≤ N ≤ 1000', '0 ≤ x_i, y_i ≤ 1000'],
        samples: [
          { input: '5\n0 0\n3 4\n6 1\n5 6\n1 5\n0 1 4 3 2', output: '0 4 1 3 2\n21.3453' },
        ],
      },
      solution: {
        idea: '初期経路に対して、改善する 2-opt の組み替えが見つからなくなるまで繰り返す。N ≤ 1000 程度なら 1 回の改善チェックが O(N²) で、何回かの改善ループでも十分間に合う。',
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          'int main() {',
          '  int n; cin >> n;',
          '  vector<double> x(n), y(n);',
          '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
          '  vector<int> order(n);',
          '  for (int i = 0; i < n; i++) cin >> order[i];',
          '  auto dist = [&](int a, int b) { return hypot(x[a] - x[b], y[a] - y[b]); };',
          '  bool improved = true;',
          '  while (improved) {',
          '    improved = false;',
          '    for (int i = 0; i < n - 2; i++) {',
          '      for (int j = i + 2; j < n; j++) {',
          '        if (i == 0 && j == n - 1) continue;',
          '        int a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];',
          '        double delta = (dist(a, c) + dist(b, d)) - (dist(a, b) + dist(c, d));',
          '        if (delta < -1e-9) {',
          '          reverse(order.begin() + i + 1, order.begin() + j + 1);',
          '          improved = true;',
          '        }',
          '      }',
          '    }',
          '  }',
          '  double total = 0;',
          '  for (int i = 0; i < n; i++) total += dist(order[i], order[(i + 1) % n]);',
          '  for (int v : order) cout << v << " ";',
          '  cout << "\\n";',
          '  printf("%.4f\\n", total);',
          '}',
        ].join('\n'),
      },
    });
  })();

  // ---- 7.3 焼きなまし法 ----
  (function registerAnnealing() {
    const pts = PTS7;
    const initOrder = greedyNearest(pts); // [0,1,4,3,5,2,6] スコア約73.14
    const stuck = twoOptOnce(pts, initOrder); // [0,2,5,1,4,3,6] スコア約63.08（局所最適で止まる）
    const n = initOrder.length;
    let order = [...initOrder];
    const rng = makeRng(12345);
    const T0 = 5.0, T1 = 0.01, ITERS = 2000;
    const detail = new Set([0, 1, 2, 3, 4]);
    const summary = new Set([20, 50, 100, 300, 600, 1000, 1500, 1999]);
    const steps = [];
    steps.push({
      line: 18, vars: { 貪欲法: r2(tourLength(pts, initOrder)), '2opt(局所最適)': r2(tourLength(pts, stuck)) },
      array: { label: '経路 order', values: [...order], hl: [] },
      note: `この例では 2-opt だけだとスコア${r2(tourLength(pts, stuck))}の局所最適で止まる。焼きなましで抜け出せるか試す。`,
    });
    for (let it = 0; it < ITERS; it++) {
      const temp = T0 * Math.pow(T1 / T0, it / (ITERS - 1));
      const i = rng() % (n - 2);
      const maxJ = (i === 0) ? n - 2 : n - 1;
      const j = i + 2 + (rng() % (maxJ - (i + 2) + 1));
      const a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];
      const delta = (dist(pts, a, c) + dist(pts, b, d)) - (dist(pts, a, b) + dist(pts, c, d));
      const r = rng() / 4294967296;
      const accept = delta < 0 || r < Math.exp(-delta / temp);
      if (detail.has(it)) {
        steps.push({
          line: 28, vars: { it, 温度: r2(temp), i, j, 差: r2(delta), 乱数r: r2(r) },
          array: { label: `経路 order（スコア ${r2(tourLength(pts, order))}）`, values: [...order], hl: [i, (i + 1) % n, j, (j + 1) % n] },
          note: accept
            ? (delta < 0 ? `差${r2(delta)}で短くなるので採用。` : `差${r2(delta)}は長くなるが、温度${r2(temp)}が高いので確率的に採用（乱数${r2(r)} < 採用確率）。`)
            : `差${r2(delta)}は長くなり、乱数${r2(r)}が採用確率以上なので不採用。`,
        });
      }
      if (accept) {
        let lo = i + 1, hi = j;
        while (lo < hi) { const t = order[lo]; order[lo] = order[hi]; order[hi] = t; lo++; hi--; }
      }
      if (summary.has(it)) {
        steps.push({
          line: 30, vars: { it, 温度: r2(temp), score: r2(tourLength(pts, order)) },
          array: { label: '経路 order', values: [...order], hl: [] },
          note: `${it}回目: 温度が${r2(temp)}まで下がり、スコアは${r2(tourLength(pts, order))}。`,
        });
      }
    }
    const finalScore = tourLength(pts, order);
    steps.push({ line: 35, vars: { score: r2(finalScore) }, array: { label: '最終的な経路 order', values: [...order], hl: [] }, note: `${ITERS}回繰り返した結果、スコアは${r2(finalScore)}まで改善した（2-optだけの局所最適${r2(tourLength(pts, stuck))}より良い）。` });

    registerTopic('7.3', {
      title: '焼きなまし法',
      explain: [
        '局所探索法は「良くなる変更しか採用しない」ため、途中の局所最適で止まってしまうことがある。焼きなまし法（Simulated Annealing）は、悪くなる変更も確率的に受け入れることで、そこから抜け出せるようにする。',
        '悪くなる変更を受け入れる確率は exp(-差 / 温度) で決める。温度が高いうちはよく受け入れ（広く探す）、繰り返すうちに温度を下げていくと、だんだん良い変更しか受け入れなくなり、最後は局所探索に近づく。金属を高温からゆっくり冷やす「焼きなまし」になぞらえた名前。',
        'どの変更を試すかは毎回ランダムに選ぶ。ここでは固定シードの乱数（xorshift32）を使い、同じ種なら誰が実行しても同じ手順になるようにしている。',
      ],
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'unsigned int rngState;',
        'unsigned int xorshift32() {',
        '  rngState ^= rngState << 13;',
        '  rngState ^= rngState >> 17;',
        '  rngState ^= rngState << 5;',
        '  return rngState;',
        '}',
        'double rand01() { return xorshift32() / 4294967296.0; }',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<double> x(n), y(n);',
        '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
        '  vector<int> order(n);',
        '  for (int i = 0; i < n; i++) cin >> order[i];',
        '  auto dist = [&](int a, int b) { return hypot(x[a] - x[b], y[a] - y[b]); };',
        '  rngState = 12345;',
        '  int iters = 2000;',
        '  double t0 = 5.0, t1 = 0.01;',
        '  for (int it = 0; it < iters; it++) {',
        '    double temp = t0 * pow(t1 / t0, (double)it / (iters - 1));',
        '    int i = xorshift32() % (n - 2);',
        '    int maxJ = (i == 0) ? n - 2 : n - 1;',
        '    int j = i + 2 + (int)(xorshift32() % (maxJ - (i + 2) + 1));',
        '    int a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];',
        '    double delta = (dist(a, c) + dist(b, d)) - (dist(a, b) + dist(c, d));',
        '    bool accept = delta < 0 || rand01() < exp(-delta / temp);',
        '    if (accept) reverse(order.begin() + i + 1, order.begin() + j + 1);',
        '  }',
        '  double total = 0;',
        '  for (int i = 0; i < n; i++) total += dist(order[i], order[(i + 1) % n]);',
        '  for (int v : order) cout << v << " ";',
        '  cout << "\\n";',
        '  printf("%.4f\\n", total);',
        '}',
      ].join('\n'),
      steps,
      example: {
        statement: '平面上の N 個の点と初期経路が与えられる。乱数の種 12345 から始まる xorshift32（コードと同じ式）を使い、t0=5.0, t1=0.01, 2000 回の焼きなましを行え。i, j の選び方・温度の下げ方・採用確率はコードの通りとする。出力はスコアが 60.5 以下であれば正解とする（この入力では 2-opt だけだと約63.08で止まるが、焼きなましなら抜け出せる）。',
        constraints: ['4 ≤ N ≤ 1000', '0 ≤ x_i, y_i ≤ 1000'],
        samples: [
          {
            input: '7\n19 17\n10 13\n16 5\n3 8\n7 13\n12 7\n0 19\n0 1 4 3 5 2 6',
            output: '0 1 4 6 3 5 2\n59.3670',
          },
        ],
      },
      solution: {
        idea: '乱数で 2-opt の組み替え (i, j) を 1 つ選び、短くなれば必ず、長くなっても exp(-差/温度) の確率で採用する。温度を t0 から t1 まで徐々に下げることで、最初は広く探し、最後は改善だけを拾うようにする。',
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          'unsigned int rngState;',
          'unsigned int xorshift32() {',
          '  rngState ^= rngState << 13;',
          '  rngState ^= rngState >> 17;',
          '  rngState ^= rngState << 5;',
          '  return rngState;',
          '}',
          'double rand01() { return xorshift32() / 4294967296.0; }',
          'int main() {',
          '  int n; cin >> n;',
          '  vector<double> x(n), y(n);',
          '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
          '  vector<int> order(n);',
          '  for (int i = 0; i < n; i++) cin >> order[i];',
          '  auto dist = [&](int a, int b) { return hypot(x[a] - x[b], y[a] - y[b]); };',
          '  rngState = 12345;',
          '  int iters = 2000;',
          '  double t0 = 5.0, t1 = 0.01;',
          '  for (int it = 0; it < iters; it++) {',
          '    double temp = t0 * pow(t1 / t0, (double)it / (iters - 1));',
          '    int i = xorshift32() % (n - 2);',
          '    int maxJ = (i == 0) ? n - 2 : n - 1;',
          '    int j = i + 2 + (int)(xorshift32() % (maxJ - (i + 2) + 1));',
          '    int a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];',
          '    double delta = (dist(a, c) + dist(b, d)) - (dist(a, b) + dist(c, d));',
          '    bool accept = delta < 0 || rand01() < exp(-delta / temp);',
          '    if (accept) reverse(order.begin() + i + 1, order.begin() + j + 1);',
          '  }',
          '  double total = 0;',
          '  for (int i = 0; i < n; i++) total += dist(order[i], order[(i + 1) % n]);',
          '  for (int v : order) cout << v << " ";',
          '  cout << "\\n";',
          '  printf("%.4f\\n", total);',
          '}',
        ].join('\n'),
      },
    });
  })();

  // ---- 7.4 ビームサーチ ----
  (function registerBeamSearch() {
    const pts = PTS5;
    const n = pts.length;
    const width = 2;
    const steps = [];
    let beam = [{ order: [0], visited: 1, len: 0 }];
    steps.push({ line: 9, vars: { 幅W: width }, array: { label: 'ビーム（残している途中経路）', values: ['[0] 長さ0.00'], hl: [0] }, note: '点0から始まる途中経路だけを1つ持って始める。' });
    for (let depth = 0; depth < n - 1; depth++) {
      const candidates = [];
      for (const state of beam) {
        const cur = state.order[state.order.length - 1];
        for (let next = 0; next < n; next++) {
          if (state.visited & (1 << next)) continue;
          candidates.push({ order: [...state.order, next], visited: state.visited | (1 << next), len: state.len + dist(pts, cur, next) });
        }
      }
      candidates.sort((a, b) => a.len - b.len);
      const kept = candidates.slice(0, width);
      steps.push({
        line: 20, vars: { 深さ: depth, 候補数: candidates.length, 残す数: kept.length },
        array: {
          label: `深さ${depth + 1}の途中経路（長さ順。先頭${width}個だけ残す）`,
          values: candidates.map((c) => `[${c.order.join(',')}] ${r2(c.len)}`),
          hl: candidates.map((_, i) => i).slice(0, width),
        },
        note: `今のビームの途中経路すべてに、次に行ける点を1つずつ足して候補を作り、短い順に上位${width}個だけ残す。`,
      });
      beam = kept;
    }
    let best = null;
    for (const state of beam) {
      const total = state.len + dist(pts, state.order[state.order.length - 1], 0);
      if (!best || total < best.total) best = { order: state.order, total };
    }
    steps.push({
      line: 27, vars: { score: r2(best.total) },
      array: { label: '選ばれた経路（出発点に戻る）', values: [...best.order, 0], hl: [] },
      note: `全点を訪れた${width}個の経路それぞれに出発点へ戻る辺を足し、一番短い${r2(best.total)}を答えにする。`,
    });

    registerTopic('7.4', {
      title: 'ビームサーチ',
      explain: [
        '貪欲法は「毎回いちばん良い1つだけ」を残して進む。これだと、今は少し損でも後で得になる選択肢を最初から捨ててしまう。ビームサーチは、毎回「良い順に上位 W 個（ビーム幅）」を残して並行に進めることで、この弱点をやわらげる。',
        '手順は貪欲法に似ている。各深さで、今残っている W 個の途中経路それぞれに次に行ける点をすべて足して候補を作り、その中から（これまでの長さで）良い順に上位 W 個だけを残して次の深さに進む。W=1 なら貪欲法と同じになる。',
        '最後まで進めたら、残った W 個の経路に出発点へ戻る辺を足して比べ、一番良いものを答えにする。W を大きくするほど良い解が見つかりやすいが、その分計算量も増える。',
      ],
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'struct State { vector<int> order; int visited; double len; };',
        'int main() {',
        '  int n, width; cin >> n >> width;',
        '  vector<double> x(n), y(n);',
        '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
        '  auto dist = [&](int a, int b) { return hypot(x[a] - x[b], y[a] - y[b]); };',
        '  vector<State> beam = {{ {0}, 1, 0.0 }};',
        '  for (int depth = 0; depth < n - 1; depth++) {',
        '    vector<State> cand;',
        '    for (auto &s : beam) {',
        '      int cur = s.order.back();',
        '      for (int next = 0; next < n; next++) {',
        '        if (s.visited >> next & 1) continue;',
        '        auto o = s.order; o.push_back(next);',
        '        cand.push_back({ o, s.visited | (1 << next), s.len + dist(cur, next) });',
        '      }',
        '    }',
        '    sort(cand.begin(), cand.end(), [](auto &a, auto &b) { return a.len < b.len; });',
        '    if ((int)cand.size() > width) cand.resize(width);',
        '    beam = cand;',
        '  }',
        '  double best = 1e18; vector<int> bestOrder;',
        '  for (auto &s : beam) {',
        '    double total = s.len + dist(s.order.back(), 0);',
        '    if (total < best) { best = total; bestOrder = s.order; }',
        '  }',
        '  for (int v : bestOrder) cout << v << " ";',
        '  cout << "\\n";',
        '  printf("%.4f\\n", best);',
        '}',
      ].join('\n'),
      steps,
      example: {
        statement: '平面上の N 個の点（点0が出発点）とビーム幅 W が与えられる。点0から始め、各深さで「今残っている途中経路すべてに次の点を1つ足した候補」のうち総距離が短い順に上位 W 個だけを残すビームサーチで、点0に戻る経路を1つ求めよ。出力はスコアが 22.0 以下であれば正解とする。',
        constraints: ['2 ≤ N ≤ 200', '1 ≤ W ≤ 8', '0 ≤ x_i, y_i ≤ 1000'],
        samples: [
          { input: '5 2\n0 0\n3 4\n6 1\n5 6\n1 5', output: '0 4 1 3 2\n21.3453' },
        ],
      },
      solution: {
        idea: '途中経路を State（訪問順・訪問済み集合・ここまでの長さ）として持ち、深さごとに全候補を作って長さでソートし、上位 W 個だけ残す。最後に出発点へ戻る辺を足して一番良いものを選ぶ。',
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          'struct State { vector<int> order; int visited; double len; };',
          'int main() {',
          '  int n, width; cin >> n >> width;',
          '  vector<double> x(n), y(n);',
          '  for (int i = 0; i < n; i++) cin >> x[i] >> y[i];',
          '  auto dist = [&](int a, int b) { return hypot(x[a] - x[b], y[a] - y[b]); };',
          '  vector<State> beam = {{ {0}, 1, 0.0 }};',
          '  for (int depth = 0; depth < n - 1; depth++) {',
          '    vector<State> cand;',
          '    for (auto &s : beam) {',
          '      int cur = s.order.back();',
          '      for (int next = 0; next < n; next++) {',
          '        if (s.visited >> next & 1) continue;',
          '        auto o = s.order; o.push_back(next);',
          '        cand.push_back({ o, s.visited | (1 << next), s.len + dist(cur, next) });',
          '      }',
          '    }',
          '    sort(cand.begin(), cand.end(), [](auto &a, auto &b) { return a.len < b.len; });',
          '    if ((int)cand.size() > width) cand.resize(width);',
          '    beam = cand;',
          '  }',
          '  double best = 1e18; vector<int> bestOrder;',
          '  for (auto &s : beam) {',
          '    double total = s.len + dist(s.order.back(), 0);',
          '    if (total < best) { best = total; bestOrder = s.order; }',
          '  }',
          '  for (int v : bestOrder) cout << v << " ";',
          '  cout << "\\n";',
          '  printf("%.4f\\n", best);',
          '}',
        ].join('\n'),
      },
    });
  })();

  // ---- 7.5 チャレンジ問題（章のまとめ） ----
  (function registerChallenge() {
    const pts = PTS7;
    const g = greedyNearest(pts);
    const h = twoOptOnce(pts, g);
    const rng = makeRng(12345);
    const T0 = 5.0, T1 = 0.01, ITERS = 2000;
    let order = [...g];
    const n = order.length;
    for (let it = 0; it < ITERS; it++) {
      const temp = T0 * Math.pow(T1 / T0, it / (ITERS - 1));
      const i = rng() % (n - 2);
      const maxJ = (i === 0) ? n - 2 : n - 1;
      const j = i + 2 + (rng() % (maxJ - (i + 2) + 1));
      const a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];
      const delta = (dist(pts, a, c) + dist(pts, b, d)) - (dist(pts, a, b) + dist(pts, c, d));
      const r = rng() / 4294967296;
      const accept = delta < 0 || r < Math.exp(-delta / temp);
      if (accept) {
        let lo = i + 1, hi = j;
        while (lo < hi) { const t = order[lo]; order[lo] = order[hi]; order[hi] = t; lo++; hi--; }
      }
    }
    const steps = [
      { line: 6, vars: { score: r2(tourLength(pts, g)) }, array: { label: '① 貪欲法の経路', values: [...g], hl: [] }, note: `まず貪欲法で初期解を作る。スコア${r2(tourLength(pts, g))}。` },
      { line: 7, vars: { score: r2(tourLength(pts, h)) }, array: { label: '② 2-optで改善した経路', values: [...h], hl: [] }, note: `2-optで局所最適まで改善。スコア${r2(tourLength(pts, h))}（まだこれが限界）。` },
      { line: 8, vars: { score: r2(tourLength(pts, order)) }, array: { label: '③ 焼きなましでさらに改善した経路', values: [...order], hl: [] }, note: `焼きなましで局所最適から抜け出し、スコア${r2(tourLength(pts, order))}まで改善した。` },
      { line: 11, vars: { score: r2(tourLength(pts, order)) }, array: { label: '最終的な答え', values: [...order, order[0]], hl: [] }, note: `これを答えとして出力する。` },
    ];

    registerTopic('7.5', {
      title: 'チャレンジ問題',
      explain: [
        'この章で見た貪欲法・局所探索法・焼きなまし法・ビームサーチは、どれも単独でも使えるが、組み合わせるとさらに強い。典型的な流れは「貪欲法やビームサーチで初期解を作る → 局所探索法や焼きなまし法で仕上げる」。',
        '最後の問題は、この章全体のまとめとして「貪欲法で作り、2-optで改善し、焼きなましでさらに改善する」という一連の流れを1つのプログラムにする。',
        'ヒューリスティックでは「時間の許す限りできるだけ良い解を探す」ことが基本になる。焼きなましの繰り返し回数や温度の下げ方を変えるだけでも結果は変わるので、色々試してみるとよい。',
      ],
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '// ... dist, 乱数などはこれまでの節と同じものを使う ...',
        'int main() {',
        '  // 入力を読む（省略）',
        '  vector<int> order = greedyNearest();      // ① 貪欲法で初期解',
        '  order = twoOpt(order);                    // ② 2-optで局所最適まで改善',
        '  order = simulatedAnnealing(order, 2000);  // ③ 焼きなましでさらに改善',
        '  for (int v : order) cout << v << " ";',
        '  cout << "\\n";',
        '  printf("%.4f\\n", tourLength(order));      // ④ 最終的なスコアを出力',
        '}',
      ].join('\n'),
      steps,
      example: {
        statement: '平面上の N 個の点が与えられる。点0から始めて全点を1回ずつ訪れ、点0に戻る経路を求めよ。出力は0〜N-1の順列であり、そのスコア（総移動距離）が 60.0 以下であれば正解とする。使う手法は自由（貪欲法だけ、2-optだけでもよいが、この入力ではそれだけでは基準に届かない）。',
        constraints: ['4 ≤ N ≤ 1000', '0 ≤ x_i, y_i ≤ 1000'],
        samples: [
          {
            input: '7\n19 17\n10 13\n16 5\n3 8\n7 13\n12 7\n0 19',
            output: '0 1 4 6 3 5 2\n59.3670',
          },
        ],
      },
      solution: {
        idea: '7.1の貪欲法で初期解を作り、7.2の2-optで局所最適まで改善し、7.3の焼きなまし法（乱数の種12345、t0=5.0, t1=0.01, 2000回）でさらに改善する。3つの節のコードをそのままつなげればよい。',
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          'int n; vector<double> X, Y;',
          'double dist(int a, int b) { return hypot(X[a] - X[b], Y[a] - Y[b]); }',
          'double tourLength(vector<int> &order) {',
          '  double t = 0;',
          '  for (int i = 0; i < n; i++) t += dist(order[i], order[(i + 1) % n]);',
          '  return t;',
          '}',
          'vector<int> greedyNearest() {',
          '  vector<bool> visited(n, false);',
          '  vector<int> order = {0};',
          '  visited[0] = true;',
          '  for (int step = 0; step < n - 1; step++) {',
          '    int cur = order.back(); int best = -1; double bestD = 1e18;',
          '    for (int cand = 0; cand < n; cand++) {',
          '      if (visited[cand]) continue;',
          '      double d = dist(cur, cand);',
          '      if (d < bestD) { bestD = d; best = cand; }',
          '    }',
          '    visited[best] = true; order.push_back(best);',
          '  }',
          '  return order;',
          '}',
          'vector<int> twoOpt(vector<int> order) {',
          '  bool improved = true;',
          '  while (improved) {',
          '    improved = false;',
          '    for (int i = 0; i < n - 2; i++) {',
          '      for (int j = i + 2; j < n; j++) {',
          '        if (i == 0 && j == n - 1) continue;',
          '        int a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];',
          '        double delta = (dist(a, c) + dist(b, d)) - (dist(a, b) + dist(c, d));',
          '        if (delta < -1e-9) { reverse(order.begin() + i + 1, order.begin() + j + 1); improved = true; }',
          '      }',
          '    }',
          '  }',
          '  return order;',
          '}',
          'unsigned int rngState;',
          'unsigned int xorshift32() {',
          '  rngState ^= rngState << 13; rngState ^= rngState >> 17; rngState ^= rngState << 5;',
          '  return rngState;',
          '}',
          'double rand01() { return xorshift32() / 4294967296.0; }',
          'vector<int> simulatedAnnealing(vector<int> order, int iters) {',
          '  rngState = 12345;',
          '  double t0 = 5.0, t1 = 0.01;',
          '  for (int it = 0; it < iters; it++) {',
          '    double temp = t0 * pow(t1 / t0, (double)it / (iters - 1));',
          '    int i = xorshift32() % (n - 2);',
          '    int maxJ = (i == 0) ? n - 2 : n - 1;',
          '    int j = i + 2 + (int)(xorshift32() % (maxJ - (i + 2) + 1));',
          '    int a = order[i], b = order[i + 1], c = order[j], d = order[(j + 1) % n];',
          '    double delta = (dist(a, c) + dist(b, d)) - (dist(a, b) + dist(c, d));',
          '    bool accept = delta < 0 || rand01() < exp(-delta / temp);',
          '    if (accept) reverse(order.begin() + i + 1, order.begin() + j + 1);',
          '  }',
          '  return order;',
          '}',
          'int main() {',
          '  cin >> n;',
          '  X.resize(n); Y.resize(n);',
          '  for (int i = 0; i < n; i++) cin >> X[i] >> Y[i];',
          '  vector<int> order = greedyNearest();',
          '  order = twoOpt(order);',
          '  order = simulatedAnnealing(order, 2000);',
          '  for (int v : order) cout << v << " ";',
          '  cout << "\\n";',
          '  printf("%.4f\\n", tourLength(order));',
          '}',
        ].join('\n'),
      },
    });
  })();

  // ---- 7.c コラム: 再帰関数 ----
  (function registerRecursion() {
    const stack = [];
    const steps = [];
    function call(k) {
      stack.push(`fact(${k})`);
      steps.push({ line: 4, vars: { k }, array: { label: '呼び出しスタック（右端が今の呼び出し）', values: [...stack], hl: [stack.length - 1] }, note: `fact(${k}) を呼ぶ。k ≤ 1 かを確かめる。` });
      let result;
      if (k <= 1) {
        result = 1;
        steps.push({ line: 4, vars: { k, result }, array: { label: '呼び出しスタック（右端が今の呼び出し）', values: [...stack], hl: [stack.length - 1] }, note: `k ≤ 1 なので、これ以上は呼ばずに1を返す（再帰の底）。` });
      } else {
        steps.push({ line: 5, vars: { k }, array: { label: '呼び出しスタック（右端が今の呼び出し）', values: [...stack], hl: [stack.length - 1] }, note: `k > 1 なので、先に fact(${k - 1}) を呼んで結果を待つ。` });
        const sub = call(k - 1);
        result = k * sub;
        steps.push({ line: 6, vars: { k, 'fact(k-1)': sub, result }, array: { label: '呼び出しスタック（右端が今の呼び出し）', values: [...stack], hl: [stack.length - 1] }, note: `fact(${k - 1}) = ${sub} が返ってきたので、${k} × ${sub} = ${result} を返す。` });
      }
      stack.pop();
      return result;
    }
    call(4);

    registerTopic('7.c', {
      title: 'コラム: 再帰関数',
      explain: [
        '再帰関数は「自分自身を呼び出す関数」。1つの大きな問題を、同じ形の小さな問題（+ちょっとした処理）に分けて解くときに使う。この章の焼きなましやビームサーチのような探索系のアルゴリズムでも、再帰で書けると見通しが良くなる場面が多い。',
        '呼び出しは裏でスタック（後入れ先出しの積み重ね）に積まれていく。fact(4) を呼ぶと、その中で fact(3)、さらに fact(2)、fact(1) …と呼び出しが積み上がり、一番底（再帰の底、ここでは k ≤ 1）に着いたら、そこから順に答えを返しながら積み上がった呼び出しを1つずつ消していく。',
        '似た形で fibonacci(n) = fibonacci(n-1) + fibonacci(n-2) のように2回自分を呼ぶものもある（枝分かれする再帰）。その場合は呼び出しの木が大きくなりやすく、同じ引数を何度も計算してしまうことがあるので注意（後の章で学ぶメモ化やDPで防げる）。',
      ],
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'long long fact(int k) {',
        '  if (k <= 1) return 1;',
        '  long long sub = fact(k - 1);',
        '  return (long long)k * sub;',
        '}',
        'int main() {',
        '  int n; cin >> n;',
        '  cout << fact(n) << endl;',
        '}',
      ].join('\n'),
      steps,
      example: {
        statement: '整数 N が与えられる。N! （N の階乗）を求めよ。',
        constraints: ['0 ≤ N ≤ 20'],
        samples: [
          { input: '4', output: '24' },
          { input: '0', output: '1' },
        ],
      },
      solution: {
        idea: 'fact(k) = k ≤ 1 なら1、そうでなければ k × fact(k-1) という定義そのものを、そのまま再帰関数として書く。N ≤ 20 なら答えは long long に収まる。',
        code: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          'long long fact(int k) {',
          '  if (k <= 1) return 1;',
          '  long long sub = fact(k - 1);',
          '  return (long long)k * sub;',
          '}',
          'int main() {',
          '  int n; cin >> n;',
          '  cout << fact(n) << endl;',
          '}',
        ].join('\n'),
      },
    });
  })();
})();
