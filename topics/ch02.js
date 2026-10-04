'use strict';
// 2章 累積和
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* 関数で動かして作る。

// ---- 2.0 累積和とは ----
(function registerPrefixIntro() {
  const a = [1, 2, 3, 4, 5];
  const l = 1, r = 4;
  const steps = [];
  let sum = 0;
  steps.push({ line: 10, vars: { l, r, sum }, array: { label: 'a', values: a, hl: [] }, note: `区間 [${l}, ${r}] の和を、1 つずつ足して求める。` });
  for (let i = l; i <= r; i++) {
    sum += a[i];
    steps.push({ line: 11, vars: { i, sum }, array: { label: 'a', values: a, hl: Array.from({ length: i - l + 1 }, (_, k) => l + k), ptr: { i } }, note: `a[${i}] = ${a[i]} を足す → sum = ${sum}` });
  }
  steps.push({ line: 12, vars: { sum }, array: { label: 'a', values: a, hl: Array.from({ length: r - l + 1 }, (_, k) => l + k) }, note: `このクエリの答えは ${sum}。クエリが Q 個あると、この作業を Q 回繰り返すので O(NQ)。` });

  registerTopic('2.0', {
    title: '累積和とは',
    explain: [
      '「配列の区間 [l, r] の和を求める」クエリが何回も来るとき、毎回 l から r まで律儀に足すと 1 回あたり O(N)、Q 回で O(NQ) かかる。',
      '累積和は「先頭から i 番目までの和」をあらかじめ 1 回だけ計算しておく前処理。これさえ用意すれば、どの区間の和も引き算 1 回（O(1)）で求まる（次の 2.1 で作り方を見る）。',
      'N, Q が小さいうちは愚直な方法でも間に合うので、まずは愚直な O(NQ) の方法を見て、何がボトルネックになるかを確かめる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  int q; cin >> q;',
      '  while (q--) {',
      '    int l, r; cin >> l >> r;',
      '    long long sum = 0;',
      '    for (int i = l; i <= r; i++) sum += a[i];',
      '    cout << sum << "\\n";',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の整数からなる数列 A と、Q 個の質問を持っている。i 番目の質問では区間 [L_i, R_i]（0-indexed、両端含む）が与えられるので、A_{L_i} + A_{L_i+1} + … + A_{R_i} を求めてください。',
      constraints: ['1 ≤ N, Q ≤ 1000', '1 ≤ A_i ≤ 10^4', '0 ≤ L_i ≤ R_i < N', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N\nQ\nL_1 R_1\n⋮\nL_Q R_Q',
      output: '各質問について、答えを 1 行ずつ出力してください。',
      samples: [
        { input: '5\n1 2 3 4 5\n2\n0 2\n1 4', output: '6\n14' },
        { input: '1\n5\n1\n0 0', output: '5', note: '区間が 1 要素だけの場合。' },
      ],
    },
    solution: {
      idea: 'N, Q ≤ 1000 なので、クエリごとに区間をそのまま足しても最大 10^6 回程度で間に合う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  int q; cin >> q;',
        '  while (q--) {',
        '    int l, r; cin >> l >> r;',
        '    long long sum = 0;',
        '    for (int i = l; i <= r; i++) sum += a[i];',
        '    cout << sum << "\\n";',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 2.1 一次元の累積和(1) ----
(function registerPrefix1() {
  const a = [1, 2, 3, 4, 5];
  const n = a.length;
  const s = new Array(n + 1).fill(0);
  const steps = [];
  steps.push({ line: 7, vars: { 's[0]': 0 }, arrays: [{ label: 'a', values: a }, { label: 'S（累積和。S[0]=0）', values: [0] }], note: 'S[0] = 0 から始める。' });
  for (let i = 0; i < n; i++) {
    s[i + 1] = s[i] + a[i];
    steps.push({
      line: 8, vars: { i, 'a[i]': a[i], 'S[i+1]': s[i + 1] },
      arrays: [
        { label: 'a', values: a, hl: [i] },
        { label: 'S（累積和。S[0]=0）', values: s.slice(0, i + 2), hl: [i + 1] },
      ],
      note: `S[${i + 1}] = S[${i}] + a[${i}] = ${s[i]} + ${a[i]} = ${s[i + 1]}`,
    });
  }
  const l = 1, r = 4;
  const ans = s[r + 1] - s[l];
  steps.push({
    line: 12, vars: { l, r, 'S[r+1]': s[r + 1], 'S[l]': s[l], 答え: ans },
    arrays: [{ label: 'a（区間 [l, r]）', values: a, hl: Array.from({ length: r - l + 1 }, (_, k) => l + k) }, { label: 'S', values: s, ptr: { l: l, 'r+1': r + 1 } }],
    note: `クエリ [l, r] = [${l}, ${r}] の答えは S[r+1] - S[l] = ${s[r + 1]} - ${s[l]} = ${ans}。引き算 1 回、O(1)。`,
  });

  registerTopic('2.1', {
    title: '一次元の累積和(1)',
    explain: [
      '累積和の配列 S を S[0] = 0, S[i+1] = S[i] + a[i] で作る。S[i] は「a の先頭から i 個の和」を表す。',
      '区間 [l, r]（0-indexed、両端含む）の和は、S[r+1] - S[l] で 1 回の引き算で求まる。S[r+1] は「0 から r まで」の和、S[l] は「0 から l-1 まで」の和なので、引くと l から r までだけが残る。',
      '前処理が O(N)、クエリ 1 回が O(1) なので、Q 個のクエリ全部でも O(N + Q) で済む。2.0 の O(NQ) よりずっと速い。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  vector<long long> s(n + 1, 0);',
      '  for (int i = 0; i < n; i++) s[i + 1] = s[i] + a[i];',
      '  int q; cin >> q;',
      '  while (q--) {',
      '    int l, r; cin >> l >> r;',
      '    cout << s[r + 1] - s[l] << "\\n";',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は N 個の整数からなる数列 A と、Q 個の質問を持っている。i 番目の質問では区間 [L_i, R_i]（0-indexed、両端含む）が与えられるので、A_{L_i} + … + A_{R_i} を求めてください。',
      constraints: ['1 ≤ N, Q ≤ 2×10^5', '1 ≤ A_i ≤ 10^4', '0 ≤ L_i ≤ R_i < N', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N\nQ\nL_1 R_1\n⋮\nL_Q R_Q',
      output: '各質問について、答えを 1 行ずつ出力してください。',
      samples: [
        { input: '5\n1 2 3 4 5\n2\n0 2\n1 4', output: '6\n14' },
        { input: '1\n5\n1\n0 0', output: '5', note: '区間が 1 要素だけの場合。' },
      ],
    },
    solution: {
      idea: '累積和 S を前計算し、各クエリに S[r+1] - S[l] で O(1) で答える。N, Q が大きくても O(N + Q) で間に合う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  vector<long long> s(n + 1, 0);',
        '  for (int i = 0; i < n; i++) s[i + 1] = s[i] + a[i];',
        '  int q; cin >> q;',
        '  while (q--) {',
        '    int l, r; cin >> l >> r;',
        '    cout << s[r + 1] - s[l] << "\\n";',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 2.2 一次元の累積和(2): いもす法 ----
(function registerImos1D() {
  const n = 5;
  const queries = [[0, 2, 3], [1, 4, 1]];
  const d = new Array(n + 1).fill(0);
  const steps = [];
  for (const [l, r, v] of queries) {
    d[l] += v;
    d[r + 1] -= v;
    steps.push({
      line: 9, vars: { l, r, v },
      array: { label: '差分配列 D', values: [...d], hl: [l, r + 1] },
      note: `区間 [${l}, ${r}] に ${v} を足したい。D[${l}] に +${v}、D[${r + 1}] に -${v} するだけで済ませる。`,
    });
  }
  let cur = 0;
  const a = [];
  for (let i = 0; i < n; i++) {
    cur += d[i];
    a.push(cur);
    steps.push({
      line: 15, vars: { i, cur },
      arrays: [{ label: '差分配列 D', values: d }, { label: 'a（D の累積和）', values: [...a], hl: [i] }],
      note: `D を先頭から累積和すると、その場所の実際の値が求まる。a[${i}] = ${cur}`,
    });
  }

  registerTopic('2.2', {
    title: '一次元の累積和(2)',
    explain: [
      '「区間 [l, r] に v を足す」という更新クエリが何回も来るとき、毎回区間を律儀に書き換えると 1 回 O(N) かかる。',
      'いもす法は、更新の「差分」だけを記録する方法。区間に v を足したいとき、差分配列 D の D[l] に +v、D[r+1] に -v するだけ（O(1)）で済ませる。',
      '全部の更新が終わったあと、D を先頭から 1 回だけ累積和すると、各マスの最終的な値が求まる。これは「配列を作る」累積和の逆向きの使い方で、更新 Q 回 + 最後の累積和 O(N) の合計 O(N + Q) で済む。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> d(n + 1, 0);',
      '  int q; cin >> q;',
      '  while (q--) {',
      '    int l, r; long long v; cin >> l >> r >> v;',
      '    d[l] += v;',
      '    d[r + 1] -= v;',
      '  }',
      '  vector<long long> a(n);',
      '  long long cur = 0;',
      '  for (int i = 0; i < n; i++) {',
      '    cur += d[i];',
      '    a[i] = cur;',
      '  }',
      '  for (int i = 0; i < n; i++) cout << a[i] << " \\n"[i == n - 1];',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は長さ N の数列（最初はすべて 0）を持っている。これから Q 個の操作を行う。i 番目の操作では区間 [L_i, R_i]（0-indexed、両端含む）と整数 V_i が与えられ、区間内のすべての要素に V_i を加える。すべての操作を行った後の数列を求めてください。',
      constraints: ['1 ≤ N, Q ≤ 2×10^5', '0 ≤ L_i ≤ R_i < N', '1 ≤ V_i ≤ 1000', '入力はすべて整数'],
      input: 'N\nQ\nL_1 R_1 V_1\n⋮\nL_Q R_Q V_Q',
      output: '最終的な数列を空白区切りで 1 行に出力してください。',
      samples: [{ input: '5\n2\n0 2 3\n1 4 1', output: '3 4 4 1 1' }],
    },
    solution: {
      idea: 'いもす法で各クエリを O(1) で差分配列に記録し、最後に 1 回だけ累積和する。合計 O(N + Q)。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> d(n + 1, 0);',
        '  int q; cin >> q;',
        '  while (q--) {',
        '    int l, r; long long v; cin >> l >> r >> v;',
        '    d[l] += v;',
        '    d[r + 1] -= v;',
        '  }',
        '  vector<long long> a(n);',
        '  long long cur = 0;',
        '  for (int i = 0; i < n; i++) {',
        '    cur += d[i];',
        '    a[i] = cur;',
        '  }',
        '  for (int i = 0; i < n; i++) cout << a[i] << " \\n"[i == n - 1];',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 2.3 二次元の累積和(1) ----
(function registerPrefix2D() {
  const a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  const h = 3, w = 3;
  const s = Array.from({ length: h + 1 }, () => new Array(w + 1).fill(0));
  const steps = [];
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      s[i + 1][j + 1] = s[i][j + 1] + s[i + 1][j] - s[i][j] + a[i][j];
      steps.push({
        line: 10, vars: { i, j, 'a[i][j]': a[i][j], 'S[i+1][j+1]': s[i + 1][j + 1] },
        table: [
          { label: 'A（元のグリッド）', data: a, hl: [[i, j]] },
          { label: 'S（2次元累積和）', data: s, hl: [[i + 1, j + 1]] },
        ],
        note: `S[${i + 1}][${j + 1}] = S[${i}][${j + 1}] + S[${i + 1}][${j}] - S[${i}][${j}] + A[${i}][${j}] = ${s[i + 1][j + 1]}`,
      });
    }
  }
  const r1 = 0, c1 = 0, r2 = 1, c2 = 1;
  const ans = s[r2 + 1][c2 + 1] - s[r1][c2 + 1] - s[r2 + 1][c1] + s[r1][c1];
  steps.push({
    line: 14, vars: { r1, c1, r2, c2, 答え: ans },
    table: [{ label: 'S（4隅を使う）', data: s, hl: [[r1, c1], [r1, c2 + 1], [r2 + 1, c1], [r2 + 1, c2 + 1]] }],
    note: `長方形 (${r1},${c1})-(${r2},${c2}) の和は S の 4 隅の足し引きで求まる: ${s[r2 + 1][c2 + 1]} - ${s[r1][c2 + 1]} - ${s[r2 + 1][c1]} + ${s[r1][c1]} = ${ans}`,
  });

  registerTopic('2.3', {
    title: '二次元の累積和(1)',
    explain: [
      '一次元の累積和を 2 方向に拡張したもの。S[i][j] を「グリッドの (0,0) から (i-1, j-1) までの長方形の和」と決め、S[i+1][j+1] = S[i][j+1] + S[i+1][j] - S[i][j] + A[i][j] で埋めていく（左と上の和を単純に足すと左上が二重に数えられるので、1 回引く）。',
      '長方形 (r1, c1)-(r2, c2) の和は、S の 4 隅 S[r2+1][c2+1] - S[r1][c2+1] - S[r2+1][c1] + S[r1][c1] を使った包除原理（5.6 で詳しく）で O(1) に求まる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int h, w; cin >> h >> w;',
      '  vector<vector<long long>> a(h, vector<long long>(w));',
      '  for (int i = 0; i < h; i++) for (int j = 0; j < w; j++) cin >> a[i][j];',
      '  vector<vector<long long>> s(h + 1, vector<long long>(w + 1, 0));',
      '  for (int i = 0; i < h; i++)',
      '    for (int j = 0; j < w; j++)',
      '      s[i+1][j+1] = s[i][j+1] + s[i+1][j] - s[i][j] + a[i][j];',
      '  int q; cin >> q;',
      '  while (q--) {',
      '    int r1, c1, r2, c2; cin >> r1 >> c1 >> r2 >> c2;',
      '    cout << s[r2+1][c2+1] - s[r1][c2+1] - s[r2+1][c1] + s[r1][c1] << "\\n";',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は H×W のグリッド A を持っている。Q 個の質問があり、i 番目の質問では長方形の左上 (R1_i, C1_i) と右下 (R2_i, C2_i)（0-indexed、両端含む）が与えられるので、その範囲の和を求めてください。',
      constraints: ['1 ≤ H, W ≤ 1000', '1 ≤ Q ≤ 2×10^5', '0 ≤ A_{i,j} ≤ 1000', '入力はすべて整数'],
      input: 'H W\nA_{1,1} … A_{1,W}\n⋮\nA_{H,1} … A_{H,W}\nQ\nR1_1 C1_1 R2_1 C2_1\n⋮\nR1_Q C1_Q R2_Q C2_Q',
      output: '各質問について、答えを 1 行ずつ出力してください。',
      samples: [
        { input: '3 3\n1 2 3\n4 5 6\n7 8 9\n1\n0 0 1 1', output: '12' },
        { input: '1 1\n7\n1\n0 0 0 0', output: '7', note: '1×1 のグリッド全体を指定する場合。' },
      ],
    },
    solution: {
      idea: '2 次元累積和 S を O(HW) で前計算し、クエリは 4 隅の足し引きで O(1) に答える。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int h, w; cin >> h >> w;',
        '  vector<vector<long long>> a(h, vector<long long>(w));',
        '  for (int i = 0; i < h; i++) for (int j = 0; j < w; j++) cin >> a[i][j];',
        '  vector<vector<long long>> s(h + 1, vector<long long>(w + 1, 0));',
        '  for (int i = 0; i < h; i++)',
        '    for (int j = 0; j < w; j++)',
        '      s[i + 1][j + 1] = s[i][j + 1] + s[i + 1][j] - s[i][j] + a[i][j];',
        '  int q; cin >> q;',
        '  while (q--) {',
        '    int r1, c1, r2, c2; cin >> r1 >> c1 >> r2 >> c2;',
        '    cout << s[r2 + 1][c2 + 1] - s[r1][c2 + 1] - s[r2 + 1][c1] + s[r1][c1] << "\\n";',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 2.4 二次元の累積和(2): 二次元いもす法 ----
(function registerImos2D() {
  const h = 3, w = 3;
  const d = Array.from({ length: h + 1 }, () => new Array(w + 1).fill(0));
  const steps = [];
  const queries = [[0, 0, 1, 1, 5]];
  for (const [r1, c1, r2, c2, v] of queries) {
    d[r1][c1] += v;
    d[r1][c2 + 1] -= v;
    d[r2 + 1][c1] -= v;
    d[r2 + 1][c2 + 1] += v;
    steps.push({
      line: 9, vars: { r1, c1, r2, c2, v },
      table: [{ label: '差分グリッド D（4隅だけ触る）', data: d.map((row) => [...row]), hl: [[r1, c1], [r1, c2 + 1], [r2 + 1, c1], [r2 + 1, c2 + 1]] }],
      note: `長方形 (${r1},${c1})-(${r2},${c2}) に ${v} を足したい。D の 4 隅だけを ±${v} する。`,
    });
  }
  for (let i = 0; i <= h; i++) {
    for (let j = 1; j <= w; j++) d[i][j] += d[i][j - 1];
  }
  steps.push({ line: 15, vars: {}, table: [{ label: '横方向に累積した D', data: d.map((row) => [...row]) }], note: '各行を横方向に累積和する。' });
  for (let j = 0; j <= w; j++) {
    for (let i = 1; i <= h; i++) d[i][j] += d[i - 1][j];
  }
  steps.push({ line: 17, vars: {}, table: [{ label: '縦方向にも累積した D = 最終結果', data: d.slice(0, h).map((row) => row.slice(0, w)) }], note: '続けて各列を縦方向に累積和すると、最終的なグリッドが求まる。' });

  registerTopic('2.4', {
    title: '二次元の累積和(2)',
    explain: [
      'いもす法を 2 次元に拡張したもの。「長方形 (r1,c1)-(r2,c2) に v を足す」クエリを、差分グリッド D の 4 隅 D[r1][c1] += v, D[r1][c2+1] -= v, D[r2+1][c1] -= v, D[r2+1][c2+1] += v だけで O(1) に記録する。',
      '全クエリを記録したあと、D を横方向に 1 回、縦方向に 1 回、合計 2 回累積和すると、各マスの最終的な値が求まる（2.3 の作り方を 2 回繰り返しているのと同じ）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int h, w; cin >> h >> w;',
      '  vector<vector<long long>> d(h + 1, vector<long long>(w + 1, 0));',
      '  int q; cin >> q;',
      '  while (q--) {',
      '    int r1, c1, r2, c2; long long v; cin >> r1 >> c1 >> r2 >> c2 >> v;',
      '    d[r1][c1] += v;',
      '    d[r1][c2 + 1] -= v;',
      '    d[r2 + 1][c1] -= v;',
      '    d[r2 + 1][c2 + 1] += v;',
      '  }',
      '  for (int i = 0; i <= h; i++)',
      '    for (int j = 1; j <= w; j++) d[i][j] += d[i][j - 1];',
      '  for (int j = 0; j <= w; j++)',
      '    for (int i = 1; i <= h; i++) d[i][j] += d[i - 1][j];',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は H×W のグリッド（最初はすべて 0）を持っている。Q 個の操作があり、i 番目の操作では長方形の左上 (R1_i, C1_i)・右下 (R2_i, C2_i)（0-indexed、両端含む）と整数 V_i が与えられ、その範囲すべてに V_i を加える。すべての操作を行った後のグリッドを求めてください。',
      constraints: ['1 ≤ H, W ≤ 1000', '1 ≤ Q ≤ 2×10^5', '1 ≤ V_i ≤ 1000', '入力はすべて整数'],
      input: 'H W\nQ\nR1_1 C1_1 R2_1 C2_1 V_1\n⋮\nR1_Q C1_Q R2_Q C2_Q V_Q',
      output: '最終的なグリッドを H 行で出力してください（各行は W 個の整数を空白区切りで）。',
      samples: [{ input: '3 3\n1\n0 0 1 1 5', output: '5 5 0\n5 5 0\n0 0 0' }],
    },
    solution: {
      idea: '2 次元いもす法で各クエリを O(1) で差分グリッドに記録し、最後に横・縦の 2 回の累積和で結果を求める。合計 O(HW + Q)。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int h, w; cin >> h >> w;',
        '  vector<vector<long long>> d(h + 1, vector<long long>(w + 1, 0));',
        '  int q; cin >> q;',
        '  while (q--) {',
        '    int r1, c1, r2, c2; long long v; cin >> r1 >> c1 >> r2 >> c2 >> v;',
        '    d[r1][c1] += v;',
        '    d[r1][c2 + 1] -= v;',
        '    d[r2 + 1][c1] -= v;',
        '    d[r2 + 1][c2 + 1] += v;',
        '  }',
        '  for (int i = 0; i <= h; i++)',
        '    for (int j = 1; j <= w; j++) d[i][j] += d[i][j - 1];',
        '  for (int j = 0; j <= w; j++)',
        '    for (int i = 1; i <= h; i++) d[i][j] += d[i - 1][j];',
        '  for (int i = 0; i < h; i++) {',
        '    for (int j = 0; j < w; j++) cout << d[i][j] << " \\n"[j == w - 1];',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 2.c コラム: アルゴリズムで使う数学 ----
(function registerMathColumn() {
  const a = 1, d = 1, n = 5;
  const steps = [];
  let loopSum = 0;
  steps.push({ line: 4, vars: { a, d, n }, array: { label: '項（a, a+d, a+2d, ...）', values: [] }, note: '等差数列の和を、まずはループで計算してみる。' });
  const terms = [];
  for (let i = 0; i < n; i++) {
    const term = a + d * i;
    terms.push(term);
    loopSum += term;
    steps.push({ line: 6, vars: { i, term, loopSum }, array: { label: '項（a, a+d, a+2d, ...）', values: [...terms], hl: [terms.length - 1] }, note: `${i} 番目の項 ${term} を足す → 合計 ${loopSum}（ここまで O(n) 回のループ）` });
  }
  const formulaSum = a * n + d * n * (n - 1) / 2;
  steps.push({ line: 7, vars: { formulaSum }, array: { label: '項（a, a+d, a+2d, ...）', values: terms }, note: `公式 a×n + d×n(n-1)/2 を使えば、ループを回さず O(1) で ${formulaSum} が求まる（n が 10^9 でも一瞬）。` });

  registerTopic('2.c', {
    title: 'コラム: アルゴリズムで使う数学',
    explain: [
      '累積和のように「規則的な和」を求めるとき、ループを回さなくても公式で O(1) に求まることがある。代表例が等差数列の和：初項 a、公差 d、項数 n の和は a×n + d×n(n-1)/2。',
      'n が小さいうちはループでも公式でも結果は同じだが、n が 10^9 のように大きいとループは間に合わない。「ループで求められる値に、実は閉じた式がないか」を疑う習慣が、計算量を落とす近道になることが多い。',
      '等比数列の和や二項係数 nCr の公式なども、同じように競プロでよく使う「規則的な和・個数を O(1) や O(log n) で求める」道具。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  long long a, d, n; cin >> a >> d >> n;',
      '  long long loopSum = 0;',
      '  for (int i = 0; i < n; i++) loopSum += a + d * i;  // ループなら O(N)',
      '  long long sum = a * n + d * n * (n - 1) / 2;       // 公式なら O(1)',
      '  cout << sum << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は初項 A、公差 D、項数 N の等差数列（A, A+D, A+2D, …, A+(N-1)D）の和を求めたい。この和を求めてください。',
      constraints: ['1 ≤ A, D ≤ 10^9', '1 ≤ N ≤ 10^9', '入力はすべて整数'],
      input: 'A D N',
      output: '和を出力してください。',
      samples: [
        { input: '1 1 5', output: '15' },
        { input: '2 3 4', output: '26' },
      ],
    },
    solution: {
      idea: 'n が最大 10^9 なのでループでは間に合わない。等差数列の和の公式 a×n + d×n(n-1)/2 を使えば O(1) で求まる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  long long a, d, n; cin >> a >> d >> n;',
        '  long long sum = a * n + d * n * (n - 1) / 2;',
        '  cout << sum << endl;',
        '}',
      ].join('\n'),
    },
  });
})();
