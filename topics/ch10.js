'use strict';
// 10章 総合問題
// ステップ図のフレームは、実際のアルゴリズムを下の register* 関数内で JS で動かして作る（手計算のミスを防ぐため）。
// この章の例題はすべてオリジナル（本や AtCoder の問題文の引き写しではない）。

// ---- 10.0 問題の取り組み方 ----
(function registerApproach() {
  const plan = [
    { n: 18, label: 'N ≤ 18程度', hint: 'O(2^N)。ビット全探索（1.5）などの指数時間アルゴリズムが使える。' },
    { n: 3000, label: 'N ≤ 3000程度', hint: 'O(N^2)。2重ループの全探索（1.2・1.3）が間に合う。' },
    { n: 200000, label: 'N ≤ 10^5〜10^6程度', hint: 'O(N log N)。ソート＋二分探索（3章）やセグメント木（8章）を使う。' },
    { n: 100000000, label: 'N ≤ 10^8程度', hint: 'O(N)。1重のループ（1章）で間に合う。' },
  ];
  const budget = 1e8; // 1秒でできる操作回数の目安
  const steps = [];
  steps.push({ line: 4, vars: { budget }, note: '競技プログラミングでは、だいたい 1 秒で 10^8 回程度の単純な操作ができる、という目安から逆算して計算量を決める。' });
  for (const p of plan) {
    const n2 = p.n <= 3000 ? p.n * p.n : null;
    const ops = n2 !== null ? n2 : (p.n <= 18 ? Math.pow(2, p.n) : p.n * Math.max(1, Math.log2(p.n)));
    const line = p.n <= 18 ? 6 : p.n <= 3000 ? 8 : p.n <= 1000000 ? 10 : 12;
    steps.push({
      line, vars: { N: p.n, '目安の回数': Math.round(ops) },
      note: `${p.label} なら、${p.hint}`,
    });
  }

  registerTopic('10.0', {
    title: '問題の取り組み方',
    explain: [
      '問題を見たら、まず制約（N の最大値）と実行時間制限から「どれくらいの計算量なら間に合うか」の見当をつける。目安は 1 秒で 10^8〜10^9 回程度の単純な操作。',
      'N ≤ 20 程度ならビット全探索（1.5）などの指数時間、N ≤ 3000 程度なら O(N²) の全探索、N ≤ 10^5〜10^6 なら O(N log N)、N ≤ 10^8 なら O(N) が目安になる。',
      '次に、計算量を気にせずまず「素朴な解法」を思いつく。それが間に合わなければ、この本で見てきた技法（累積和・二分探索・DP・データ構造など）のどれで高速化できるかを考える。多くの問題は、1 つの技法だけでなく、複数の技法を組み合わせて解く。10.1〜10.7 ではその組み合わせを練習する。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  long long n; cin >> n;',
      '  if (n <= 20) {',
      '    cout << "2^N: bit search" << endl;',
      '  } else if (n <= 5000) {',
      '    cout << "N^2: double loop" << endl;',
      '  } else if (n <= 1000000) {',
      '    cout << "N log N: sort/binary search" << endl;',
      '  } else {',
      '    cout << "N: single loop" << endl;',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は、問題を見てから計算量を見積もる練習をしている。\n\n整数 N が与えられるので、間に合う計算量を次の基準で判定し、番号を出力してほしい: N ≤ 20 なら 4（O(2^N)）、N ≤ 5000 なら 3（O(N^2)）、N ≤ 10^6 なら 2（O(N log N)）、それ以外なら 1（O(N)）とする。',
      constraints: ['1 ≤ N ≤ 10^9', '入力はすべて整数'],
      input: 'N',
      output: '間に合う計算量の番号を出力してください。',
      samples: [
        { input: '15', output: '4' },
        { input: '5000', output: '3', note: '境界ちょうどの場合。' },
        { input: '100000000', output: '1' },
      ],
    },
    solution: {
      idea: '制約の目安（N ≤ 20 で 2^N、N ≤ 5000 で N^2、N ≤ 10^6 で N log N、それ以上で N）に沿って if-else で分岐するだけ。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  long long n; cin >> n;',
        '  if (n <= 20) cout << 4 << endl;',
        '  else if (n <= 5000) cout << 3 << endl;',
        '  else if (n <= 1000000) cout << 2 << endl;',
        '  else cout << 1 << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 10.1 総合問題(1): 累積和 + 二分探索 ----
(function registerCombo1() {
  const a = [2, 5, 1, 3, 4];
  const n = a.length;
  const p = [0];
  for (let i = 1; i <= n; i++) p.push(p[i - 1] + a[i - 1]);

  const l = 2, x = 10; // 1-indexed l
  const target = p[l - 1] + x;
  const steps = [];
  steps.push({ line: 6, vars: { n }, array: { label: 'a', values: a }, note: 'まず累積和の配列 p を作る（§2.1）。p[i] は a の先頭 i 個の和。' });
  for (let i = 1; i <= n; i++) {
    steps.push({ line: 6, vars: { i, 'p[i]': p[i] }, array: { label: 'p（累積和）', values: [...p], hl: [i] }, note: `p[${i}] = p[${i - 1}] + a[${i - 1}] = ${p[i]}。` });
  }
  steps.push({ line: 9, vars: { l, x, target }, array: { label: 'p（累積和）', values: p }, note: `クエリ (l=${l}, x=${x})。p[l-1]=${p[l - 1]} なので、p[r] ≧ target(=p[l-1]+x=${target}) となる最小の r を探す。p は a がすべて正なので単調に増える（§3.1 と同じ二分探索が使える）。` });
  let lo = l, hi = n, ans = -1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const ok = p[mid] >= target;
    steps.push({ line: 13, vars: { lo, hi, mid, 'p[mid]': p[mid], target }, array: { label: 'p（累積和）', values: p, ptr: { lo, mid, hi } }, note: `mid=${mid}: p[mid]=${p[mid]} ${ok ? '≧' : '<'} target。${ok ? 'ここで間に合うので、もっと左でも間に合うか調べる（hi を縮める）。' : 'まだ足りないので lo を進める。'}` });
    if (ok) { ans = mid; hi = mid - 1; } else { lo = mid + 1; }
  }
  steps.push({ line: 16, vars: { ans }, array: { label: 'p（累積和）', values: p, hl: ans >= 0 ? [ans] : [] }, note: `答えは r = ${ans}（${ans < 0 ? '目標に届かない' : `a[${l}..${ans}] の和が初めて x 以上になる`}）。` });

  registerTopic('10.1', {
    title: '総合問題(1)',
    explain: [
      'この問題は §2.1 一次元の累積和(1) と §3.1 配列の二分探索 を組み合わせて解く。',
      '累積和 p[i]（a の先頭 i 個の和）を作っておけば、区間 [l, r] の和は p[r] - p[l-1] で O(1) に求まる。さらに a の値がすべて正なら p は単調に増えるので、「p[r] が目標値以上になる最小の r」を二分探索で O(log N) に求められる。',
      '素朴にやると 1 クエリごとに r を 1 から伸ばして O(N) かかり、Q クエリで O(NQ) になるが、この組み合わせで O((N+Q) log N) に落とせる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, q; cin >> n >> q;',
      '  vector<long long> a(n + 1), p(n + 1, 0);',
      '  for (int i = 1; i <= n; i++) { cin >> a[i]; p[i] = p[i - 1] + a[i]; }',
      '  while (q--) {',
      '    int l; long long x; cin >> l >> x;',
      '    long long target = p[l - 1] + x;',
      '    int lo = l, hi = n, ans = -1;',
      '    while (lo <= hi) {',
      '      int mid = (lo + hi) / 2;',
      '      if (p[mid] >= target) { ans = mid; hi = mid - 1; }',
      '      else lo = mid + 1;',
      '    }',
      '    cout << ans << "\\n";',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の正の整数からなる数列 A（1-indexed）を持っている。\n\nQ 個の質問があり、i 番目の質問は整数 L_i, X_i の組で与えられる。A_{L_i} から始めて何番目まで足せば和が X_i 以上になるか、その最小の右端 R_i（L_i ≤ R_i ≤ N）を求めてください。どのように足しても X_i 以上にならない場合は、代わりに -1 を出力してください。',
      constraints: ['1 ≤ N, Q ≤ 2×10^5', '1 ≤ A_i ≤ 10^4', '1 ≤ L_i ≤ N', '1 ≤ X_i ≤ 2×10^9', '入力はすべて整数'],
      input: 'N Q\nA_1 A_2 … A_N\nL_1 X_1\n⋮\nL_Q X_Q',
      output: '各質問について、答えを 1 行ずつ出力してください。',
      samples: [
        { input: '5 2\n2 5 1 3 4\n2 10\n1 20', output: '5\n-1' },
        { input: '5 1\n2 5 1 3 4\n5 1', output: '5', note: '右端の候補が N 自身しかない場合。' },
      ],
    },
    solution: {
      idea: '累積和 p を作り、クエリ (l, x) は target = p[l-1] + x として「p[r] ≥ target となる最小の r」を [l, N] の範囲で二分探索する。p は狭義単調増加なので二分探索が成り立つ。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, q; cin >> n >> q;',
        '  vector<long long> a(n + 1), p(n + 1, 0);',
        '  for (int i = 1; i <= n; i++) { cin >> a[i]; p[i] = p[i - 1] + a[i]; }',
        '  while (q--) {',
        '    int l; long long x; cin >> l >> x;',
        '    long long target = p[l - 1] + x;',
        '    int lo = l, hi = n, ans = -1;',
        '    while (lo <= hi) {',
        '      int mid = (lo + hi) / 2;',
        '      if (p[mid] >= target) { ans = mid; hi = mid - 1; }',
        '      else lo = mid + 1;',
        '    }',
        '    cout << ans << "\\n";',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 10.2 総合問題(2): ソート + しゃくとり法 ----
(function registerCombo2() {
  const raw = [1, 5, 3, 19, 18, 25];
  const d = 2;
  const a = [...raw].sort((x, y) => x - y);
  const steps = [];
  steps.push({ line: 6, vars: { d }, array: { label: 'a（入力順）', values: raw }, note: 'まず配列をソートする（標準ライブラリの sort）。ソートしておくと、差が D 以下の組を「近くにある組」として探せるようになる。' });
  steps.push({ line: 7, vars: { d }, array: { label: 'a（ソート後）', values: a }, note: 'ソート後の配列。ここから §3.3 しゃくとり法と同じやり方で、左右の端を伸ばし縮めしながら数える。' });
  let i = 0, cnt = 0;
  for (let j = 0; j < a.length; j++) {
    while (a[j] - a[i] > d) {
      steps.push({ line: 11, vars: { i, j, 'a[j]-a[i]': a[j] - a[i], d }, array: { label: 'a（ソート後）', values: a, ptr: { i, j } }, note: `a[j]-a[i] = ${a[j] - a[i]} > D なので、左端 i を 1 つ進める。` });
      i++;
    }
    cnt += j - i;
    steps.push({ line: 12, vars: { i, j, cnt }, array: { label: 'a（ソート後）', values: a, hl: Array.from({ length: j - i }, (_, k) => i + k), ptr: { i, j } }, note: `a[${i}..${j - 1}] はどれも a[${j}] との差が D 以下。${j - i} 個追加して cnt = ${cnt}。` });
  }
  steps.push({ line: 14, vars: { cnt }, array: { label: 'a（ソート後）', values: a }, note: `答えは ${cnt} 組。` });

  registerTopic('10.2', {
    title: '総合問題(2)',
    explain: [
      'この問題は「ソート」と §3.3 しゃくとり法 を組み合わせて解く。',
      '差が D 以下かどうかは元の並び順では判定しづらいが、ソートしておけば「ある要素と差が D 以下の要素は、ソート後の配列で連続する範囲に集まる」という性質が使える。',
      '右端 j を 1 つずつ伸ばしながら、条件を満たさなくなるまで左端 i を進めると、i も j も配列全体で片道しか動かないので、全体で O(N log N)（ソート）+ O(N)（しゃくとり法）で解ける。素朴に全部の組を調べる O(N²) より速い。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; long long d; cin >> n >> d;',
      '  vector<long long> a(n);',
      '  for (auto &v : a) cin >> v;',
      '  sort(a.begin(), a.end());',
      '  long long cnt = 0;',
      '  int i = 0;',
      '  for (int j = 0; j < n; j++) {',
      '    while (a[j] - a[i] > d) i++;',
      '    cnt += j - i;',
      '  }',
      '  cout << cnt << "\\n";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は N 個の整数からなる数列 A を持っている。\n\nこの中から異なる 2 つの要素を選んでできる差の絶対値が D 以下であるような組の個数を求めてください。',
      constraints: ['2 ≤ N ≤ 2×10^5', '1 ≤ A_i ≤ 10^9', '0 ≤ D ≤ 10^9', '入力はすべて整数'],
      input: 'N D\nA_1 A_2 … A_N',
      output: '条件を満たす組の個数を出力してください。',
      samples: [
        { input: '6 2\n1 5 3 19 18 25', output: '3' },
        { input: '4 0\n2 2 2 5', output: '3', note: '差がちょうど 0（同じ値どうし）の組も数える。' },
        { input: '2 1000000000\n1 1000000000', output: '1', note: 'N=2 の最小ケース。' },
      ],
    },
    solution: {
      idea: '配列をソートすると、ある a[j] と差が D 以下の要素はソート後の配列で連続する区間になる。左端 i を右端 j の動きに合わせて片道で動かす「しゃくとり法」で、各 j について条件を満たす i の範囲を O(1) 償却で求め、j - i を足し合わせる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; long long d; cin >> n >> d;',
        '  vector<long long> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  sort(a.begin(), a.end());',
        '  long long cnt = 0;',
        '  int i = 0;',
        '  for (int j = 0; j < n; j++) {',
        '    while (a[j] - a[i] > d) i++;',
        '    cnt += j - i;',
        '  }',
        '  cout << cnt << "\\n";',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 10.3 総合問題(3): DP + 累積和で高速化 ----
(function registerCombo3() {
  const N = 8, K = 3;
  const dp = new Array(N + 1).fill(0);
  const s = new Array(N + 1).fill(0);
  dp[1] = 1; s[1] = 1;
  const steps = [];
  steps.push({ line: 7, vars: { N, K }, array: { label: 'dp（i番目のマスへの到達方法の数）', values: dp.slice(1) }, note: `マス i には、i より前の最大 K 個のマスから進める。dp[1] = 1（出発点）。` });
  for (let i = 2; i <= N; i++) {
    const lo = Math.max(0, i - 1 - K);
    dp[i] = s[i - 1] - s[lo];
    s[i] = s[i - 1] + dp[i];
    steps.push({
      line: 10, vars: { i, lo: lo + 1, 'S[i-1]': s[i - 1], 'S[lo]': s[lo], 'dp[i]': dp[i] },
      array: { label: 'dp（i番目のマスへの到達方法の数）', values: dp.slice(1), hl: [i - 1] },
      note: `dp[${i}] は「${lo + 1}〜${i - 1} 番目からの合計」。素朴に毎回足すと O(K) だが、累積和 S（§2.1）があれば S[${i - 1}] - S[${lo}] = ${dp[i]} と O(1) で求まる。`,
    });
  }
  steps.push({ line: 13, vars: { answer: dp[N] }, array: { label: 'dp（i番目のマスへの到達方法の数）', values: dp.slice(1), hl: [N - 1] }, note: `答えは dp[${N}] = ${dp[N]}。` });

  registerTopic('10.3', {
    title: '総合問題(3)',
    explain: [
      'この問題は §4.1 動的計画法の基本 と §2.1 一次元の累積和(1) を組み合わせて解く。',
      '素朴な DP では dp[i] = dp[i-K] + … + dp[i-1] を毎回 K 個足すので O(NK)。しかしこれは「dp の区間の和」なので、dp 自身の累積和 S を同時に更新しながら持てば、dp[i] = S[i-1] - S[max(0,i-1-K)] と O(1) の引き算だけで求まり、全体 O(N) になる。',
      '「DP の遷移が区間和になっている」と気づいたら、累積和で高速化できないか疑うのがこの組み合わせのコツ。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long MOD = 1000000007;',
      'int main() {',
      '  int n, k; cin >> n >> k;',
      '  vector<long long> dp(n + 1, 0), s(n + 1, 0);',
      '  dp[1] = 1; s[1] = 1;',
      '  for (int i = 2; i <= n; i++) {',
      '    int lo = max(0, i - 1 - k);',
      '    dp[i] = (s[i - 1] - s[lo] + MOD) % MOD;',
      '    s[i] = (s[i - 1] + dp[i]) % MOD;',
      '  }',
      '  cout << dp[n] << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は横一列に並んだ N 個のマスを使ったゲームをしている。\n\n1 番目のマスから出発し、マス i にいるとき、i+1 番目から i+K 番目までのいずれか 1 つのマスに進める（N 番目を超えて進むことはできない）。N 番目のマスに到達する方法の数を、10^9+7 で割った余りで求めてください。',
      constraints: ['2 ≤ N ≤ 2×10^5', '1 ≤ K ≤ N-1', '入力はすべて整数'],
      input: 'N K',
      output: '答えを 10^9+7 で割った余りで出力してください。',
      samples: [
        { input: '8 3', output: '44' },
        { input: '2 1', output: '1', note: 'マスが 2 つだけの最小ケース。' },
      ],
    },
    solution: {
      idea: 'dp[i] = 「i 番目のマスへの到達方法の数」とすると dp[i] = Σ_{j=max(1,i-K)}^{i-1} dp[j]。この区間和を dp 自身の累積和 S を保ちながら O(1) で求めれば、全体 O(N) で解ける。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long MOD = 1000000007;',
        'int main() {',
        '  int n, k; cin >> n >> k;',
        '  vector<long long> dp(n + 1, 0), s(n + 1, 0);',
        '  dp[1] = 1; s[1] = 1;',
        '  for (int i = 2; i <= n; i++) {',
        '    int lo = max(0, i - 1 - k);',
        '    dp[i] = (s[i - 1] - s[lo] + MOD) % MOD;',
        '    s[i] = (s[i - 1] + dp[i]) % MOD;',
        '  }',
        '  cout << dp[n] << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 10.4 総合問題(4): 二分探索 + 貪欲 ----
(function registerCombo4() {
  const w = [3, 1, 4, 1, 5, 9, 2, 6];
  const K = 3;
  const n = w.length;

  function trucksNeeded(cap) {
    let trucks = 1, cur = 0;
    for (const x of w) {
      if (cur + x > cap) { trucks++; cur = 0; }
      cur += x;
    }
    return trucks;
  }

  const steps = [];
  let lo = Math.max(...w), hi = w.reduce((s, x) => s + x, 0);
  steps.push({ line: 7, vars: { lo, hi, K }, array: { label: '荷物の重さ w', values: w }, note: `容量 C を lo=${lo}（最大の荷物1個分、これ未満だと積めない荷物が出る）〜 hi=${hi}（全部1台に積む）の範囲で二分探索する（§3.2 答えで二分探索）。` });
  let ans = hi;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const trucks = trucksNeeded(mid);
    const ok = trucks <= K;
    steps.push({
      line: 10, vars: { lo, hi, mid, trucks, K },
      array: { label: '荷物の重さ w', values: w },
      note: `容量 C=${mid} のとき、先頭から貪欲に「積めるだけ積み、積めなくなったら次のトラック」で詰めると ${trucks} 台必要（§7.1 貪欲法）。${ok ? `${K} 台以内なので、もっと小さい C でも足りるか調べる。` : `${K} 台を超えるので、C を大きくする。`}`,
    });
    if (ok) { hi = mid; } else { lo = mid + 1; }
  }
  ans = lo;
  steps.push({ line: 18, vars: { ans }, array: { label: '荷物の重さ w', values: w }, note: `答えは最小の容量 C = ${ans}。` });

  registerTopic('10.4', {
    title: '総合問題(4)',
    explain: [
      'この問題は §3.2 答えで二分探索 と §7.1 貪欲法 を組み合わせて解く。',
      '容量 C を固定したとき「先頭から、積めるだけ積んで、積めなくなったら次のトラックに移す」という貪欲な詰め方が、台数を最小にすることが知られている（順番を変えられないので、できるだけ今のトラックに詰め込むのが最善）。',
      'そして「容量 C で何台必要か」は C が大きいほど減る単調な関係にあるので、「K 台以内で済む最小の C」を二分探索できる。判定 1 回が O(N)、全体で O(N log(総重量)) になる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, k; cin >> n >> k;',
      '  vector<long long> w(n);',
      '  for (auto &x : w) cin >> x;',
      '  long long lo = *max_element(w.begin(), w.end());',
      '  long long hi = accumulate(w.begin(), w.end(), 0LL);',
      '  while (lo < hi) {',
      '    long long mid = (lo + hi) / 2;',
      '    long long trucks = 1, cur = 0;',
      '    for (long long x : w) {',
      '      if (cur + x > mid) { trucks++; cur = 0; }',
      '      cur += x;',
      '    }',
      '    if (trucks <= k) hi = mid; else lo = mid + 1;',
      '  }',
      '  cout << lo << "\\n";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の荷物を、搬入された順番のまま先頭から順にトラックに積みたい（順番は変えられず、荷物は分割できない）。\n\n各トラックは容量 C を超えない範囲で先頭の荷物からできるだけ積み、容量を超える荷物が来たら次のトラックに移す。使うトラックの台数が K 台以内になるような、容量 C の最小値を求めてください。',
      constraints: ['1 ≤ N ≤ 2×10^5', '1 ≤ K ≤ N', '1 ≤ W_i ≤ 10^9', '入力はすべて整数'],
      input: 'N K\nW_1 W_2 … W_N',
      output: '条件を満たす最小の容量 C を出力してください。',
      samples: [
        { input: '8 3\n3 1 4 1 5 9 2 6', output: '14' },
        { input: '8 8\n3 1 4 1 5 9 2 6', output: '9', note: 'K=N（1 台ずつ使える）なら、答えは最大の荷物の重さ。' },
        { input: '3 1\n1 2 3', output: '6', note: 'K=1（1 台にまとめる）なら、答えは重さの合計。' },
      ],
    },
    solution: {
      idea: '容量 C を固定すると、先頭から貪欲に詰める必要台数は O(N) で計算できる。必要台数は C について単調非増加なので、「K 台以内で済む最小の C」を二分探索で求める。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, k; cin >> n >> k;',
        '  vector<long long> w(n);',
        '  for (auto &x : w) cin >> x;',
        '  long long lo = *max_element(w.begin(), w.end());',
        '  long long hi = accumulate(w.begin(), w.end(), 0LL);',
        '  while (lo < hi) {',
        '    long long mid = (lo + hi) / 2;',
        '    long long trucks = 1, cur = 0;',
        '    for (long long x : w) {',
        '      if (cur + x > mid) { trucks++; cur = 0; }',
        '      cur += x;',
        '    }',
        '    if (trucks <= k) hi = mid; else lo = mid + 1;',
        '  }',
        '  cout << lo << "\\n";',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 10.5 総合問題(5): mod + 組み合わせ ----
(function registerCombo5() {
  const MOD = 1000000007;
  function modpow(a, n, mod) {
    let r = 1; a %= mod;
    while (n > 0) { if (n & 1) r = r * a % mod; a = a * a % mod; n >>= 1; }
    return r;
  }
  const H = 3, W = 3;
  const m = H + W - 2;
  const fact = [1];
  const steps = [];
  steps.push({ line: 11, vars: { H, W, m }, note: `(1,1) から (${H},${W}) へ右か下にしか進めない経路の数は、全 ${m} 歩のうち「下」に進む ${H - 1} 歩をどこに置くかで決まるので、二項係数 C(${m}, ${H - 1}) に等しい（組み合わせの考え方）。` });
  for (let i = 1; i <= m; i++) {
    fact.push((fact[i - 1] * i) % MOD);
    steps.push({ line: 14, vars: { i }, array: { label: 'fact', values: [...fact], hl: [i] }, note: `fact[${i}] = fact[${i - 1}] × ${i} % MOD = ${fact[i]}。` });
  }
  const need = (H - 1 >= 0 && W - 1 >= 0) ? (fact[H - 1] * fact[W - 1]) % MOD : 0;
  steps.push({ line: 15, vars: { 'fact[H-1]': fact[H - 1], 'fact[W-1]': fact[W - 1] }, array: { label: 'fact', values: fact }, note: 'C(m, H-1) = fact[m] / (fact[H-1] × fact[W-1]) を mod で計算するには割り算の代わりに逆元を掛ける（§5.5）。逆元は §5.4 の繰り返し二乗法（フェルマーの小定理）で求める。' });
  const inv = modpow(need, MOD - 2, MOD);
  const ans = (fact[m] * inv) % MOD;
  steps.push({ line: 16, vars: { 'fact[m]': fact[m], inv, ans }, array: { label: 'fact', values: fact, hl: [m] }, note: `答えは fact[m] × inv % MOD = ${ans}。` });

  registerTopic('10.5', {
    title: '総合問題(5)',
    explain: [
      'この問題は「組み合わせの考え方」と §5.4 余りの計算(2)累乗・§5.5 余りの計算(3)割り算 を組み合わせて解く。',
      '右か下にしか進めない経路は、全部で (H-1)+(W-1) 歩のうち「下」に進む H-1 歩の位置の選び方に対応するので、経路の数は二項係数 C(H+W-2, H-1) と等しい（グリッドのマス目を1つずつ数える必要はない）。',
      'この二項係数を大きい MOD で割った余りで求めるには、階乗 fact[i] をあらかじめ作り、割り算の代わりにフェルマーの小定理で求めた逆元を掛ける。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long MOD = 1000000007;',
      'long long modpow(long long a, long long n) {',
      '  long long r = 1; a %= MOD;',
      '  while (n > 0) { if (n & 1) r = r * a % MOD; a = a * a % MOD; n >>= 1; }',
      '  return r;',
      '}',
      'int main() {',
      '  long long h, w; cin >> h >> w;',
      '  int m = h + w - 2;',
      '  vector<long long> fact(m + 1);',
      '  fact[0] = 1;',
      '  for (int i = 1; i <= m; i++) fact[i] = fact[i - 1] * i % MOD;',
      '  long long denom = fact[h - 1] * fact[w - 1] % MOD;',
      '  long long ans = fact[m] * modpow(denom, MOD - 2) % MOD;',
      '  cout << ans << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は縦 H 行、横 W 列のグリッドを使ったパズルを考えている。\n\n左上のマス (1,1) から出発し、1 回の移動で右か下に 1 マスだけ進めるとき、右下のマス (H,W) に到達する経路の数を 10^9+7 で割った余りで求めてください。',
      constraints: ['1 ≤ H, W ≤ 10^6', '入力はすべて整数'],
      input: 'H W',
      output: '答えを 10^9+7 で割った余りで出力してください。',
      samples: [
        { input: '3 3', output: '6' },
        { input: '1 1', output: '1', note: '出発点とゴールが同じ場合。' },
        { input: '1 5', output: '1', note: '一直線にしか進めない場合。' },
      ],
    },
    solution: {
      idea: '経路の数は二項係数 C(H+W-2, H-1)。階乗の配列を作り、フェルマーの小定理（a^(MOD-2) が a の逆元）で割り算を mod の世界の掛け算に変える。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long MOD = 1000000007;',
        'long long modpow(long long a, long long n) {',
        '  long long r = 1; a %= MOD;',
        '  while (n > 0) { if (n & 1) r = r * a % MOD; a = a * a % MOD; n >>= 1; }',
        '  return r;',
        '}',
        'int main() {',
        '  long long h, w; cin >> h >> w;',
        '  int m = h + w - 2;',
        '  vector<long long> fact(m + 1);',
        '  fact[0] = 1;',
        '  for (int i = 1; i <= m; i++) fact[i] = fact[i - 1] * i % MOD;',
        '  long long denom = fact[h - 1] * fact[w - 1] % MOD;',
        '  long long ans = fact[m] * modpow(denom, MOD - 2) % MOD;',
        '  cout << ans << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 10.6 総合問題(6): 区間更新を累積和で代用 + 二分探索 ----
(function registerCombo6() {
  const M = 6;
  const intervals = [[1, 3], [2, 5], [4, 6], [1, 1]];
  const diff = new Array(M + 2).fill(0);
  const steps = [];
  steps.push({ line: 6, vars: { M }, note: `${intervals.length} 個の区間すべてに +1 する更新を、1 回ずつ律儀に行うと O(区間の長さ) かかる。いもす法（§2.2）なら、区間の両端だけを記録して O(1) で済む。` });
  for (const [l, r] of intervals) {
    diff[l] += 1; diff[r + 1] -= 1;
    steps.push({ line: 8, vars: { l, r }, array: { label: '差分配列 diff', values: diff.slice(1, M + 2) }, note: `区間 [${l}, ${r}] の更新は diff[${l}] += 1, diff[${r + 1}] -= 1 だけ。` });
  }
  const cnt = [];
  let cur = 0;
  for (let pIdx = 1; pIdx <= M; pIdx++) {
    cur += diff[pIdx];
    cnt.push(cur);
    steps.push({ line: 12, vars: { p: pIdx, cur }, array: { label: 'cnt（各位置の値）', values: [...cnt], hl: [pIdx - 1] }, note: `diff を先頭から累積和すると、位置 ${pIdx} の値 ${cur} が求まる（§2.1 と同じやり方）。` });
  }
  const sorted = [...cnt].sort((x, y) => x - y);
  steps.push({ line: 13, vars: {}, array: { label: 'cnt を昇順ソート', values: sorted }, note: 'クエリ「値が X 以上の位置は何個？」に何度も答えるため、確定した値をソートして二分探索できるようにする（§3.1）。' });
  function answerQuery(x) {
    let lo = 0, hi = sorted.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (sorted[mid] >= x) hi = mid; else lo = mid + 1;
    }
    return sorted.length - lo;
  }
  for (const x of [2, 3]) {
    const idx = (() => { let lo = 0, hi = sorted.length; while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (sorted[mid] >= x) hi = mid; else lo = mid + 1; } return lo; })();
    const res = sorted.length - idx;
    steps.push({ line: 16, vars: { X: x, lower_bound: idx, answer: res }, array: { label: 'cnt を昇順ソート', values: sorted, ptr: { idx } }, note: `X=${x}: lower_bound で「X 以上が初めて現れる位置」${idx} を二分探索で求め、M - ${idx} = ${res} が答え。` });
  }

  registerTopic('10.6', {
    title: '総合問題(6)',
    explain: [
      'この問題は §2.2 一次元の累積和(2)（いもす法） と §3.1 配列の二分探索 を組み合わせて解く。',
      '区間 [l, r] への一斉加算を N 回行うのは、セグメント木（8章）を使う方法もあるが、「全部の更新を行ってから、まとめて 1 回読む」だけでよいなら、いもす法で差分配列に記録し、最後に 1 回累積和するだけで O(N+M) で済む（セグメント木より単純）。',
      '最終的な値の配列が求まったら、クエリ「X 以上の位置がいくつあるか」に何度も答えるために、配列をソートして二分探索（lower_bound）すれば、クエリ 1 回あたり O(log M) で答えられる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int m, n, q; cin >> m >> n >> q;',
      '  vector<long long> diff(m + 2, 0);',
      '  for (int i = 0; i < n; i++) {',
      '    int l, r; cin >> l >> r;',
      '    diff[l]++; diff[r + 1]--;',
      '  }',
      '  vector<long long> cnt(m);',
      '  long long cur = 0;',
      '  for (int p = 1; p <= m; p++) { cur += diff[p]; cnt[p - 1] = cur; }',
      '  sort(cnt.begin(), cnt.end());',
      '  while (q--) {',
      '    long long x; cin >> x;',
      '    int idx = lower_bound(cnt.begin(), cnt.end(), x) - cnt.begin();',
      '    cout << (m - idx) << "\\n";',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は数直線上の 1 から M までの整数の位置に、N 個の区間 [L_i, R_i] それぞれについて、その範囲に含まれる位置すべてに 1 を加える更新を行った。\n\nすべての更新が終わったあと、Q 個の質問に答えてほしい。質問 i は整数 X_i で、値が X_i 以上である位置の個数を求めてください。',
      constraints: ['1 ≤ M, N, Q ≤ 2×10^5', '1 ≤ L_i ≤ R_i ≤ M', '1 ≤ X_i ≤ N', '入力はすべて整数'],
      input: 'M N Q\nL_1 R_1\n⋮\nL_N R_N\nX_1\n⋮\nX_Q',
      output: '各質問について、答えを 1 行ずつ出力してください。',
      samples: [
        { input: '6 4 2\n1 3\n2 5\n4 6\n1 1\n2\n3', output: '5\n0' },
        { input: '3 1 2\n1 3\n1\n2', output: '3\n0', note: '区間が 1 個だけで、M 全体を覆う場合。' },
      ],
    },
    solution: {
      idea: 'いもす法（差分配列）で全更新を O(N) に記録し、1 回累積和して各位置の値を求める。値をソートし、クエリごとに lower_bound で二分探索する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int m, n, q; cin >> m >> n >> q;',
        '  vector<long long> diff(m + 2, 0);',
        '  for (int i = 0; i < n; i++) {',
        '    int l, r; cin >> l >> r;',
        '    diff[l]++; diff[r + 1]--;',
        '  }',
        '  vector<long long> cnt(m);',
        '  long long cur = 0;',
        '  for (int p = 1; p <= m; p++) { cur += diff[p]; cnt[p - 1] = cur; }',
        '  sort(cnt.begin(), cnt.end());',
        '  while (q--) {',
        '    long long x; cin >> x;',
        '    int idx = lower_bound(cnt.begin(), cnt.end(), x) - cnt.begin();',
        '    cout << (m - idx) << "\\n";',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 10.7 総合問題(7): ビット全探索 + ビットDP ----
(function registerCombo7() {
  const M = 3; // スキルの種類数
  const skill = [0b011, 0b100, 0b001, 0b110]; // 作業員ごとの担当スキル（ビット集合、§1.5 と同じ考え方）
  const full = (1 << M) - 1;
  const INF = Infinity;
  let dp = new Array(1 << M).fill(INF);
  dp[0] = 0;
  const steps = [];
  steps.push({
    line: 7, vars: { M, full: full.toString(2).padStart(M, '0') },
    array: { label: '作業員の担当スキル（ビット集合）', values: skill.map((v) => v.toString(2).padStart(M, '0')) },
    note: `各作業員の担当スキルを、§1.5 と同じようにビット集合（整数）で表す。目標は全スキル ${full.toString(2).padStart(M, '0')}（10進で${full}）をカバーすること。`,
  });
  for (let i = 0; i < skill.length; i++) {
    const before = dp.map((v) => (v === INF ? '-' : v));
    const ndp = dp.slice();
    for (let s = 0; s <= full; s++) {
      if (dp[s] === INF) continue;
      const ns = s | skill[i];
      if (dp[s] + 1 < ndp[ns]) ndp[ns] = dp[s] + 1;
    }
    dp = ndp;
    steps.push({
      line: 16, vars: { worker: i, skill: skill[i].toString(2).padStart(M, '0') },
      array: { label: 'dp[カバー済みスキル集合] = 最小人数', values: dp.map((v) => (v === INF ? '-' : v)), hl: [full] },
      note: `作業員 ${i}（スキル ${skill[i].toString(2).padStart(M, '0')}）を取り込む。これは §4.8 ビットDP と同じ「状態 = ビット集合」の DP で、各作業員は使う/使わないの 2 択（0/1 ナップザックと同じ形）。`,
    });
  }
  const ans = dp[full] === INF ? -1 : dp[full];
  steps.push({ line: 20, vars: { answer: ans }, array: { label: 'dp[カバー済みスキル集合] = 最小人数', values: dp.map((v) => (v === INF ? '-' : v)), hl: [full] }, note: `答えは dp[全スキル] = ${ans}。` });

  registerTopic('10.7', {
    title: '総合問題(7)',
    explain: [
      'この問題は §1.5 ビット全探索 と §4.8 ビットDP を組み合わせて解く。',
      'まず「どの仕事を担当できるか」という集合を、§1.5 と同じように 1 つの整数のビット（i 桁目が 1 なら仕事 i を担当できる）として表す。こうすると、2 つの作業員の担当範囲を合わせた集合は、ビットの OR で一瞬で求まる。',
      '次に、「ある仕事の集合 s をカバーするのに必要な最小人数」を、作業員を 1 人ずつ取り込みながら更新する DP（状態がビット集合そのもの）で求める。各作業員は「使う／使わない」の 2 択なので、ナップザック DP と同じように、更新前の配列をコピーしてから更新すれば、同じ作業員を 2 回使ってしまう心配がない。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long INF = 1e9;',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<int> skill(n);',
      '  for (auto &x : skill) cin >> x;',
      '  int full = (1 << m) - 1;',
      '  vector<long long> dp(1 << m, INF);',
      '  dp[0] = 0;',
      '  for (int i = 0; i < n; i++) {',
      '    vector<long long> ndp = dp;',
      '    for (int s = 0; s <= full; s++) {',
      '      if (dp[s] == INF) continue;',
      '      int ns = s | skill[i];',
      '      ndp[ns] = min(ndp[ns], dp[s] + 1);',
      '    }',
      '    dp = ndp;',
      '  }',
      '  cout << (dp[full] >= INF ? -1 : dp[full]) << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君はビルの清掃を N 人の作業員に任せたい。清掃すべき仕事は M 種類あり、作業員 i は仕事の集合を表す整数 skill_i（0 以上 2^M 未満。i 桁目のビットが 1 なら、その仕事を担当できる）を持っている。\n\nすべての仕事をカバーするように作業員を選ぶとき、選ぶ人数の最小値を求めてください。どのように選んでも全部の仕事をカバーできない場合は、代わりに -1 を出力してください。',
      constraints: ['1 ≤ N ≤ 15', '1 ≤ M ≤ 10', '0 ≤ skill_i < 2^M', '入力はすべて整数'],
      input: 'N M\nskill_1 skill_2 … skill_N',
      output: '答えを出力してください。カバーできない場合は -1 を出力してください。',
      samples: [
        { input: '4 3\n3 4 1 6', output: '2' },
        { input: '2 2\n1 1', output: '-1', note: 'どう選んでもカバーできないビットが残る場合。' },
        { input: '1 1\n1', output: '1', note: '1 人で全部をカバーできる場合。' },
      ],
    },
    solution: {
      idea: 'dp[s] = 「仕事の集合 s をカバーするために必要な最小人数」とし、作業員を 1 人ずつ、その作業員を使う場合/使わない場合をナップザック DP と同じ形で更新する（ns = s | skill[i]）。答えは dp[全仕事]。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long INF = 1e9;',
        'int main() {',
        '  int n, m; cin >> n >> m;',
        '  vector<int> skill(n);',
        '  for (auto &x : skill) cin >> x;',
        '  int full = (1 << m) - 1;',
        '  vector<long long> dp(1 << m, INF);',
        '  dp[0] = 0;',
        '  for (int i = 0; i < n; i++) {',
        '    vector<long long> ndp = dp;',
        '    for (int s = 0; s <= full; s++) {',
        '      if (dp[s] == INF) continue;',
        '      int ns = s | skill[i];',
        '      ndp[ns] = min(ndp[ns], dp[s] + 1);',
        '    }',
        '    dp = ndp;',
        '  }',
        '  cout << (dp[full] >= INF ? -1 : dp[full]) << endl;',
        '}',
      ].join('\n'),
    },
  });
})();
