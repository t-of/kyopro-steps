'use strict';
// 1章 アルゴリズムと計算量
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* 関数で動かして作る（手計算のミスを防ぐため）。

// ---- 1.0 計算量とは ----
(function registerComplexity() {
  const steps = [];
  const c1s = [];
  const c2s = [];
  for (let n = 1; n <= 5; n++) {
    steps.push({ line: 4, vars: { n }, note: `n = ${n} のループが始まる。` });
    const c1 = n;
    c1s.push(c1);
    steps.push({
      line: 5, vars: { n, c1 },
      arrays: [{ label: '1重ループの回数（O(N)）', values: [...c1s], hl: [c1s.length - 1] }],
      note: `1 重のループは n 回まわる。n = ${n} なら ${c1} 回。`,
    });
    const c2 = n * n;
    c2s.push(c2);
    steps.push({
      line: 6, vars: { n, c1, c2 },
      arrays: [
        { label: '1重ループの回数（O(N)）', values: [...c1s], hl: [c1s.length - 1] },
        { label: '2重ループの回数（O(N²)）', values: [...c2s], hl: [c2s.length - 1] },
      ],
      note: `2 重のループは n × n 回まわる。n = ${n} なら ${c2} 回。N が増えるほど O(N²) の方が急に増える。`,
    });
  }

  registerTopic('1.0', {
    title: '計算量とは',
    explain: [
      'プログラムが「だいたいどれくらいの回数の操作をするか」を、入力の大きさ N を使って O(…) の形で表したものが計算量。中身の定数やループの速さの違いは無視して、N を大きくしたときの増え方だけを見る。',
      '競技プログラミングでは、制約（N の最大値）と実行時間制限から、使える計算量の見当をつける。だいたい 1 秒で 10^8〜10^9 回程度の単純な操作ができる、というのが目安。',
      '例えば N ≤ 5000 なら O(N²)（最大 2500 万回）で間に合うが、N ≤ 10^6 では O(N²) は重すぎて、O(N) や O(N log N) の方法が必要になる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  for (int n = 1; n <= 5; n++) {',
      '    int c1 = n;        // O(N) のループ回数',
      '    int c2 = n * n;    // O(N^2) のループ回数',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君のクラスには N 人の生徒がいて、i 番目の生徒の身長は H_i である。異なる 2 人の身長差の絶対値の最大値を求めてください。',
      constraints: ['2 ≤ N ≤ 3000', '1 ≤ H_i ≤ 200', '入力はすべて整数'],
      input: 'N\nH_1 H_2 … H_N',
      output: '答えを出力してください。',
      samples: [
        { input: '4\n160 170 155 180', output: '25' },
        { input: '2\n100 100', output: '0', note: '身長が同じ 2 人しかいない場合、差は 0。' },
      ],
    },
    solution: {
      idea: 'すべての 2 人の組 (i, j) は N(N-1)/2 通りで、N ≤ 3000 なら最大でも約 450 万通り。2 重ループの O(N²) の全探索で、どの組が差の最大を作るかをそのまま調べられる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<int> h(n);',
        '  for (auto &x : h) cin >> x;',
        '  int ans = 0;',
        '  for (int i = 0; i < n; i++)',
        '    for (int j = i + 1; j < n; j++)',
        '      ans = max(ans, abs(h[i] - h[j]));',
        '  cout << ans << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 1.1 導入問題 ----
(function registerIntro() {
  const a = [3, 5, 3, 2, 3, 7];
  const x = 3;
  const steps = [];
  let cnt = 0;
  for (let i = 0; i < a.length; i++) {
    steps.push({ line: 9, vars: { i, x, cnt }, array: { label: 'a', values: a, hl: [i], ptr: { i } }, note: `a[${i}] = ${a[i]} を見る。` });
    if (a[i] === x) {
      cnt++;
      steps.push({ line: 9, vars: { i, x, cnt }, array: { label: 'a', values: a, hl: [i], ptr: { i } }, note: `a[${i}] は x と等しいので cnt を増やす → cnt = ${cnt}` });
    }
  }
  steps.push({ line: 11, vars: { cnt }, array: { label: 'a', values: a, hl: [] }, note: `全部見終わった。答えは ${cnt}。` });

  registerTopic('1.1', {
    title: '導入問題',
    explain: [
      '一番基本の「全探索」は、配列を 1 つのループで端から端まで見ていくこと。1 つずつ条件を確かめるだけで答えが出せる問題は多い。',
      'ここでは「指定した値と同じ要素がいくつあるか」を数える。考え方はシンプルでも、この「全部見る」という発想が後の全探索の土台になる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, x; cin >> n >> x;',
      '  vector<int> a(n);',
      '  for (auto &v : a) cin >> v;',
      '  int cnt = 0;',
      '  for (int i = 0; i < n; i++) {',
      '    if (a[i] == x) cnt++;',
      '  }',
      '  cout << cnt << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は N 個の整数からなる数列 A と整数 X を持っている。A の中に X と等しい値がいくつあるかを求めてください。',
      constraints: ['1 ≤ N ≤ 10^5', '1 ≤ A_i, X ≤ 10^9', '入力はすべて整数'],
      input: 'N X\nA_1 A_2 … A_N',
      output: '答えを出力してください。',
      samples: [
        { input: '6 3\n3 5 3 2 3 7', output: '3' },
        { input: '1 5\n3', output: '0', note: 'X と一致する値が 1 つもない場合。' },
      ],
    },
    solution: {
      idea: '配列を 1 回のループで端から見て、X と一致するたびに数える。O(N) で間に合う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, x; cin >> n >> x;',
        '  vector<int> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  int cnt = 0;',
        '  for (int i = 0; i < n; i++) {',
        '    if (a[i] == x) cnt++;',
        '  }',
        '  cout << cnt << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 1.2 全探索(1): ペアの全探索 ----
(function registerBrute1() {
  const a = [2, 7, 4, 1, 5];
  const k = 9;
  const steps = [];
  let found = false;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      const sum = a[i] + a[j];
      const ok = sum === k;
      if (ok) found = true;
      steps.push({
        line: 10, vars: { i, j, 'a[i]+a[j]': sum, k, found },
        array: { label: 'a', values: a, hl: [i, j], ptr: { i, j } },
        note: `a[${i}] + a[${j}] = ${sum}${ok ? ' → k と一致！' : ' は k と不一致'}`,
      });
    }
  }

  registerTopic('1.2', {
    title: '全探索(1)',
    explain: [
      '「2 つ選ぶ」組み合わせをすべて調べるには、2 重ループで i < j となる組をすべて見ればよい。組の数は N(N-1)/2 通りなので、計算量は O(N²)。',
      'N が大きすぎると間に合わなくなる（§2 累積和や §3 二分探索で、もっと速い方法を学ぶ）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, k; cin >> n >> k;',
      '  vector<int> a(n);',
      '  for (auto &v : a) cin >> v;',
      '  bool found = false;',
      '  for (int i = 0; i < n; i++) {',
      '    for (int j = i + 1; j < n; j++) {',
      '      if (a[i] + a[j] == k) found = true;',
      '    }',
      '  }',
      '  cout << (found ? "Yes" : "No") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の整数からなる数列 A と整数 K を持っている。A から異なる 2 つを選んで和をちょうど K にできるか判定してください。',
      constraints: ['2 ≤ N ≤ 3000', '1 ≤ A_i ≤ 10^6', '1 ≤ K ≤ 2×10^6', '入力はすべて整数'],
      input: 'N K\nA_1 A_2 … A_N',
      output: '2 つを選んで和を K にできるなら Yes、できないなら No を出力してください。',
      samples: [
        { input: '5 9\n2 7 4 1 5', output: 'Yes' },
        { input: '4 100\n1 2 3 4', output: 'No', note: 'どの 2 つを選んでも和が K にならない場合。' },
      ],
    },
    solution: {
      idea: 'N ≤ 3000 なので組の数は最大約 450 万。2 重ループの全探索で全部の組を確かめられる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, k; cin >> n >> k;',
        '  vector<int> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  bool found = false;',
        '  for (int i = 0; i < n; i++) {',
        '    for (int j = i + 1; j < n; j++) {',
        '      if (a[i] + a[j] == k) found = true;',
        '    }',
        '  }',
        '  cout << (found ? "Yes" : "No") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 1.3 全探索(2): 3つ選ぶ全探索 ----
(function registerBrute2() {
  const a = [1, 2, 3, 4, 5];
  const s = 10;
  const steps = [];
  let found = false;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      for (let k = j + 1; k < a.length; k++) {
        const sum = a[i] + a[j] + a[k];
        const ok = sum === s;
        if (ok) found = true;
        steps.push({
          line: 11, vars: { i, j, k, sum, s, found },
          array: { label: 'a', values: a, hl: [i, j, k], ptr: { i, j, k } },
          note: `a[${i}]+a[${j}]+a[${k}] = ${sum}${ok ? ' → s と一致！' : ''}`,
        });
      }
    }
  }

  registerTopic('1.3', {
    title: '全探索(2)',
    explain: [
      '「3 つ選ぶ」なら 3 重ループにすれば、同じやり方で全探索できる。選ぶ個数が増えるたびにループが 1 段ずつ増え、計算量は O(N³)、O(N⁴)…と急に重くなる。',
      'このため、何個かを選ぶ全探索は N が小さいとき（目安 N ≤ 300〜500 程度）しか使えない。N が大きいときは、後の章で学ぶ工夫（二分探索・動的計画法など）で選ぶ個数を減らさずに済む方法を探す。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, s; cin >> n >> s;',
      '  vector<int> a(n);',
      '  for (auto &v : a) cin >> v;',
      '  bool found = false;',
      '  for (int i = 0; i < n; i++) {',
      '    for (int j = i + 1; j < n; j++) {',
      '      for (int k = j + 1; k < n; k++) {',
      '        if (a[i] + a[j] + a[k] == s) found = true;',
      '      }',
      '    }',
      '  }',
      '  cout << (found ? "Yes" : "No") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は N 個の整数からなる数列 A と整数 S を持っている。A から異なる 3 つを選んで和をちょうど S にできるか判定してください。',
      constraints: ['3 ≤ N ≤ 200', '1 ≤ A_i ≤ 10^4', '1 ≤ S ≤ 3×10^4', '入力はすべて整数'],
      input: 'N S\nA_1 A_2 … A_N',
      output: '3 つを選んで和を S にできるなら Yes、できないなら No を出力してください。',
      samples: [
        { input: '5 10\n1 2 3 4 5', output: 'Yes' },
        { input: '5 100\n1 2 3 4 5', output: 'No', note: 'どの 3 つを選んでも和が S にならない場合。' },
      ],
    },
    solution: {
      idea: 'N ≤ 200 なので組の数は最大でも約 130 万通り。3 重ループの全探索で間に合う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, s; cin >> n >> s;',
        '  vector<int> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  bool found = false;',
        '  for (int i = 0; i < n; i++) {',
        '    for (int j = i + 1; j < n; j++) {',
        '      for (int k = j + 1; k < n; k++) {',
        '        if (a[i] + a[j] + a[k] == s) found = true;',
        '      }',
        '    }',
        '  }',
        '  cout << (found ? "Yes" : "No") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 1.4 2進法 ----
(function registerBinary() {
  let n = 13;
  const bits = [];
  const steps = [];
  steps.push({ line: 4, vars: { n }, note: '変換する数 n から始める。' });
  while (n > 0) {
    const bit = n % 2;
    const nextN = Math.floor(n / 2);
    bits.push(bit);
    steps.push({
      line: 7, vars: { n, bit },
      array: { label: '求まったビット（下の桁から）', values: [...bits] },
      note: `n = ${n} を 2 で割った余り ${bit} が 1 つの桁になる。`,
    });
    steps.push({ line: 8, vars: { n: nextN }, array: { label: '求まったビット（下の桁から）', values: [...bits] }, note: `n を 2 で割って n = ${nextN} にする。` });
    n = nextN;
  }
  const reversed = [...bits].reverse();
  steps.push({ line: 11, vars: {}, array: { label: '上の桁からに並べ替え', values: reversed }, note: `下の桁から求めたので、逆順にすると 2 進法表記 ${reversed.join('')} になる。` });

  registerTopic('1.4', {
    title: '2進法',
    explain: [
      '整数を 2 で割った余り（0 か 1）を繰り返し取り出すと、下の桁から 2 進法の各桁が求まる。n を 2 で割り切れなくなる（n = 0 になる）まで繰り返す。',
      '求まった桁は下の桁から出てくるので、最後に順序を逆にすると、ふつうの 2 進法表記（上の桁が先）になる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<int> bits;',
      '  while (n > 0) {',
      '    bits.push_back(n % 2);',
      '    n /= 2;',
      '  }',
      '  if (bits.empty()) bits.push_back(0);',
      '  reverse(bits.begin(), bits.end());',
      '  for (int b : bits) cout << b;',
      '  cout << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は整数 N を持っている。N を 2 進法で表記したものを求めてください（先頭に余計な 0 は付けない。N = 0 のときは 0 と出力してください）。',
      constraints: ['0 ≤ N ≤ 10^9', '入力はすべて整数'],
      input: 'N',
      output: '2 進法表記を出力してください。',
      samples: [
        { input: '13', output: '1101' },
        { input: '0', output: '0', note: 'N = 0 のときは 0 と出力する。' },
      ],
    },
    solution: {
      idea: '2 で割った余りを下の桁から求め、最後に逆順にする。N = 0 のときだけ特別に「0」を出す。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<int> bits;',
        '  while (n > 0) {',
        '    bits.push_back(n % 2);',
        '    n /= 2;',
        '  }',
        '  if (bits.empty()) bits.push_back(0);',
        '  reverse(bits.begin(), bits.end());',
        '  for (int b : bits) cout << b;',
        '  cout << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 1.c コラム: ビット演算 ----
(function registerBitOps() {
  const a = 12; // 1100
  const b = 10; // 1010
  const steps = [];
  let and_ = 0, or_ = 0, xor_ = 0;
  for (let i = 0; i < 4; i++) {
    const ba = (a >> i) & 1;
    const bb = (b >> i) & 1;
    const bitsOf = (v) => [0, 1, 2, 3].map((k) => (v >> k) & 1);
    steps.push({
      line: 7, vars: { i, 'a の bit i': ba, 'b の bit i': bb },
      arrays: [
        { label: 'A のビット（右が0桁目）', values: bitsOf(a), hl: [i] },
        { label: 'B のビット（右が0桁目）', values: bitsOf(b), hl: [i] },
      ],
      note: `i = ${i} 桁目を取り出す。A は ${ba}、B は ${bb}。`,
    });
    if (ba && bb) and_ |= (1 << i);
    steps.push({ line: 8, vars: { i, and_ }, note: `AND: 両方 1（${ba} と ${bb}）のときだけ、and_ の ${i} 桁目を 1 にする。` });
    if (ba || bb) or_ |= (1 << i);
    steps.push({ line: 9, vars: { i, or_ }, note: `OR: どちらかが 1 なら、or_ の ${i} 桁目を 1 にする。` });
    if (ba !== bb) xor_ |= (1 << i);
    steps.push({ line: 10, vars: { i, xor_ }, note: `XOR: 片方だけ 1（違う値）なら、xor_ の ${i} 桁目を 1 にする。` });
  }

  registerTopic('1.c', {
    title: 'コラム: ビット演算',
    explain: [
      '整数を 2 進法の桁（ビット）の並びとして見て、桁ごとに演算するのが AND（&）・OR（|）・XOR（^）。各桁は独立に、両方 1 なら AND は 1、どちらかが 1 なら OR は 1、片方だけ 1 なら XOR は 1 になる。',
      'C++ では a & b, a | b, a ^ b で一瞬で計算できるが、ここでは仕組みを見るために 1 桁ずつ (a >> i) & 1 で取り出して確かめる。',
      '1 << i は「1 を i 桁だけ左にずらした数」、つまり i 桁目だけが 1 の値を作る。ビット演算は後の「ビット全探索」や「ビットDP」で多用する。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int a, b; cin >> a >> b;',
      '  int and_ = 0, or_ = 0, xor_ = 0;',
      '  for (int i = 0; i < 4; i++) {',
      '    int ba = (a >> i) & 1, bb = (b >> i) & 1;',
      '    if (ba && bb) and_ |= (1 << i);',
      '    if (ba || bb) or_ |= (1 << i);',
      '    if (ba != bb) xor_ |= (1 << i);',
      '  }',
      '  cout << and_ << " " << or_ << " " << xor_ << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は 0 以上 15 以下の整数 A, B を持っている（4 桁の 2 進法で表せる）。A と B のビットごとの AND, OR, XOR を順に求めてください。',
      constraints: ['0 ≤ A, B ≤ 15', '入力はすべて整数'],
      input: 'A B',
      output: 'AND, OR, XOR の値をこの順に空白区切りで出力してください。',
      samples: [
        { input: '12 10', output: '8 14 6' },
        { input: '0 0', output: '0 0 0', note: '両方 0 のときはすべて 0 になる。' },
      ],
    },
    solution: {
      idea: '4 つの桁それぞれについて、A と B のその桁の値を取り出して AND・OR・XOR の定義どおりに判定し、結果の対応する桁に 1 を立てる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int a, b; cin >> a >> b;',
        '  int and_ = 0, or_ = 0, xor_ = 0;',
        '  for (int i = 0; i < 4; i++) {',
        '    int ba = (a >> i) & 1;',
        '    int bb = (b >> i) & 1;',
        '    if (ba && bb) and_ |= (1 << i);',
        '    if (ba || bb) or_ |= (1 << i);',
        '    if (ba != bb) xor_ |= (1 << i);',
        '  }',
        '  cout << and_ << " " << or_ << " " << xor_ << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 1.5 ビット全探索 ----
(function registerBitSearch() {
  const w = [2, 3, 5, 7];
  const s = 9;
  const n = w.length;
  const steps = [];
  let found = false;
  for (let mask = 0; mask < (1 << n); mask++) {
    let sum = 0;
    const hl = [];
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) { sum += w[i]; hl.push(i); }
    }
    const ok = sum === s;
    if (ok) found = true;
    steps.push({
      line: 13, vars: { mask: mask.toString(2).padStart(n, '0'), sum, found },
      array: { label: 'w（選んだものを強調）', values: w, hl },
      note: `mask = ${mask.toString(2).padStart(n, '0')}（選ぶ/選ばないの組み合わせ） → 合計 ${sum}${ok ? ' → s と一致！' : ''}`,
    });
  }

  registerTopic('1.5', {
    title: 'ビット全探索',
    explain: [
      'N 個のものそれぞれを「選ぶ／選ばない」で全部の組み合わせを試したいとき、組み合わせは 2^N 通りある。これを 0 から 2^N - 1 までの整数（mask）のビットに対応させると、1 つの for 文で全部の組み合わせを表せる。',
      'mask の i 桁目が 1 なら「i 番目を選ぶ」、0 なら「選ばない」と決めれば、mask を 1 つ決めるごとに 1 つの組み合わせが決まる。N ≤ 20 程度までなら 2^N 回のループで間に合う。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, s; cin >> n >> s;',
      '  vector<int> w(n);',
      '  for (auto &x : w) cin >> x;',
      '  bool found = false;',
      '  for (int mask = 0; mask < (1 << n); mask++) {',
      '    int sum = 0;',
      '    for (int i = 0; i < n; i++) {',
      '      if ((mask >> i) & 1) sum += w[i];',
      '    }',
      '    if (sum == s) found = true;',
      '  }',
      '  cout << (found ? "Yes" : "No") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の品物を持っていて、i 番目の品物の重さは W_i である。いくつか（0 個でもよい）を選んで、重さの合計をちょうど S にできるか判定してください。',
      constraints: ['1 ≤ N ≤ 15', '1 ≤ W_i ≤ 1000', '1 ≤ S ≤ 10^4', '入力はすべて整数'],
      input: 'N S\nW_1 W_2 … W_N',
      output: '重さの合計を S にできるなら Yes、できないなら No を出力してください。',
      samples: [
        { input: '4 9\n2 3 5 7', output: 'Yes' },
        { input: '4 100\n2 3 5 7', output: 'No', note: 'どう選んでも合計が S にならない場合。' },
      ],
    },
    solution: {
      idea: 'N ≤ 15 なので組み合わせは最大 2^15 = 32768 通り。mask を 0 から 2^N - 1 まで動かすビット全探索で、どの組み合わせを選んだかを確かめられる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, s; cin >> n >> s;',
        '  vector<int> w(n);',
        '  for (auto &x : w) cin >> x;',
        '  bool found = false;',
        '  for (int mask = 0; mask < (1 << n); mask++) {',
        '    int sum = 0;',
        '    for (int i = 0; i < n; i++) {',
        '      if ((mask >> i) & 1) sum += w[i];',
        '    }',
        '    if (sum == s) found = true;',
        '  }',
        '  cout << (found ? "Yes" : "No") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();
