'use strict';
// 3章 二分探索
// ステップ図のフレームは、実際のアルゴリズムを下の register* 関数内で JS で動かして作る（手計算のミスを防ぐため）。

// ---- 3.0 二分探索とは ----
(function registerBinarySearchIntro() {
  const a = [2, 5, 8, 12, 16, 23, 38, 42, 56, 71];
  const x = 42;
  const steps = [];
  steps.push({ line: 8, vars: { x }, array: { label: 'a（昇順）', values: a }, note: `目的の値 x = ${x} を探す。a は昇順に並んでいる。` });
  let idx = -1;
  for (let i = 0; i < a.length; i++) {
    steps.push({ line: 10, vars: { i, x, 'a[i]': a[i] }, array: { label: 'a（昇順）', values: a, ptr: { i } }, note: `a[${i}] = ${a[i]} と x = ${x} を比べる。` });
    if (a[i] === x) {
      idx = i;
      steps.push({ line: 10, vars: { i, idx }, array: { label: 'a（昇順）', values: a, hl: [i], ptr: { i } }, note: `一致した。idx = ${i} で見つかったので、ここで打ち切れる。` });
      break;
    }
  }
  steps.push({
    line: 12, vars: { idx }, array: { label: 'a（昇順）', values: a, hl: idx >= 0 ? [idx] : [] },
    note: `答えは idx = ${idx}。先頭から順に見ると最悪 N 回比べる（O(N)）。でも a は昇順なので、a[mid] と x を比べれば、x は mid より左右どちらにあるかが 1 回の比較でわかる。これを繰り返すのが二分探索で、O(log N) 回の比較で済む。`,
  });

  registerTopic('3.0', {
    title: '二分探索とは',
    explain: [
      '並んでいる数の中から目的の値を探すとき、先頭から 1 つずつ見ていく方法（線形探索）は O(N) かかる。',
      'でも、数が昇順（または降順）に並んでいるなら、真ん中の値 a[mid] と目的の値 x を 1 回比べるだけで、「x は mid より左にある」か「右にある」かが確定し、調べる範囲を半分に絞り込める。',
      'これを繰り返す方法が二分探索。範囲は 1 回ごとに半分になるので、N 個の中から探しても O(log N) 回の比較で終わる。N = 10^9 でも 30 回程度で済む。次の 3.1 で実際のコードの形を見る。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<int> a(n); // 昇順に並んでいる前提',
      '  for (auto &v : a) cin >> v;',
      '  int x; cin >> x;',
      '  int idx = -1;',
      '  for (int i = 0; i < n; i++) {',
      '    if (a[i] == x) { idx = i; break; }',
      '  }',
      '  cout << idx << "\\n";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は昇順に並んだ N 個の整数 A_1, A_2, …, A_N を持っている。整数 X と同じ値が A の中にあるかどうかを調べ、あればその位置（0-indexed）を、なければ -1 を求めてください。',
      constraints: ['1 ≤ N ≤ 1000', '1 ≤ A_i ≤ 10^6（A は昇順）', '1 ≤ X ≤ 10^6', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N\nX',
      output: 'X が A の中にあればその位置（0-indexed）を、なければ -1 を出力してください。',
      samples: [
        { input: '10\n2 5 8 12 16 23 38 42 56 71\n42', output: '7' },
        { input: '5\n1 3 5 7 9\n4', output: '-1', note: 'A の中に X = 4 と同じ値はない。' },
      ],
    },
    solution: {
      idea: 'N ≤ 1000 なので、先頭から順に 1 つずつ比べる線形探索（O(N)）で十分間に合う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<int> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  int x; cin >> x;',
        '  int idx = -1;',
        '  for (int i = 0; i < n; i++) {',
        '    if (a[i] == x) { idx = i; break; }',
        '  }',
        '  cout << idx << "\\n";',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 3.1 配列の二分探索 ----
(function registerArrayBinarySearch() {
  const a = [2, 5, 8, 12, 16, 23, 38, 42, 56, 71];
  const x = 42;
  const steps = [];
  let lo = 0, hi = a.length - 1, idx = -1;
  steps.push({ line: 9, vars: { lo, hi }, array: { label: 'a', values: a, ptr: { lo, hi } }, note: `lo と hi の範囲 [${lo}, ${hi}] の中から x = ${x} を探す。` });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ line: 10, vars: { lo, hi, mid }, array: { label: 'a', values: a, ptr: { lo, mid, hi } }, note: `mid = (lo + hi) / 2 = ${mid}。a[mid] = ${a[mid]} と x = ${x} を比べる。` });
    if (a[mid] === x) {
      idx = mid;
      steps.push({ line: 11, vars: { lo, hi, mid, idx }, array: { label: 'a', values: a, hl: [mid], ptr: { lo, mid, hi } }, note: `a[mid] = x なので、idx = ${mid} で見つかった。` });
      break;
    } else if (a[mid] < x) {
      steps.push({ line: 12, vars: { lo, hi, mid }, array: { label: 'a', values: a, ptr: { lo, mid, hi } }, note: `a[mid] = ${a[mid]} < x なので、mid より左には x はない。lo = mid + 1 = ${mid + 1} にする。` });
      lo = mid + 1;
    } else {
      steps.push({ line: 13, vars: { lo, hi, mid }, array: { label: 'a', values: a, ptr: { lo, mid, hi } }, note: `a[mid] = ${a[mid]} > x なので、mid より右には x はない。hi = mid - 1 = ${mid - 1} にする。` });
      hi = mid - 1;
    }
  }
  steps.push({ line: 16, vars: { idx }, array: { label: 'a', values: a, hl: idx >= 0 ? [idx] : [] }, note: `答えは idx = ${idx}。調べた回数は log2(${a.length}) ≈ ${Math.ceil(Math.log2(a.length))} 回程度で済んだ。` });

  registerTopic('3.1', {
    title: '配列の二分探索',
    explain: [
      '昇順に並んだ配列 a から、半開区間ではなく「lo と hi の両端を含む範囲 [lo, hi]」の中に答えがあると考えて探す方法。',
      '毎回 mid = (lo + hi) / 2 を見て、a[mid] が x と同じなら見つかった。a[mid] が x より小さければ、x は mid より右（lo = mid + 1）にしかない。大きければ、x は mid より左（hi = mid - 1）にしかない。',
      'lo > hi になったら、どこにも x がなかったということ。C++ には <algorithm> に binary_search・lower_bound・upper_bound という完成品の関数もあるが、まずは自分で境界の動かし方を手で書けるようにしておく。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<int> a(n);',
      '  for (auto &v : a) cin >> v;',
      '  int x; cin >> x;',
      '  int lo = 0, hi = n - 1, idx = -1;',
      '  while (lo <= hi) {',
      '    int mid = (lo + hi) / 2;',
      '    if (a[mid] == x) { idx = mid; break; }',
      '    else if (a[mid] < x) lo = mid + 1;',
      '    else hi = mid - 1;',
      '  }',
      '  cout << idx << "\\n";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'ある施設で配られた整理券には、昇順の番号が N 枚分振られている。配られた番号を昇順に並べたものが A_1, A_2, …, A_N として与えられる。高橋君が持っている番号 X が実際に配られた番号かどうかを判定し、配られていればその並び（0-indexed の位置）を、配られていなければ -1 を求めてください。',
      constraints: ['1 ≤ N ≤ 2 × 10^5', '1 ≤ A_i ≤ 10^9（A は昇順で重複なし）', '1 ≤ X ≤ 10^9', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N\nX',
      output: 'X が A の中にあればその位置（0-indexed）を、なければ -1 を出力してください。',
      samples: [
        { input: '10\n2 5 8 12 16 23 38 42 56 71\n42', output: '7' },
        { input: '5\n1 3 5 7 9\n4', output: '-1', note: 'A の中に X = 4 と同じ値はない。' },
      ],
    },
    solution: {
      idea: 'N が大きいので線形探索では間に合わない場合がある。a が昇順なので、lo・hi・mid を使う二分探索で O(log N) で判定する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<int> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  int x; cin >> x;',
        '  int lo = 0, hi = n - 1, idx = -1;',
        '  while (lo <= hi) {',
        '    int mid = (lo + hi) / 2;',
        '    if (a[mid] == x) { idx = mid; break; }',
        '    else if (a[mid] < x) lo = mid + 1;',
        '    else hi = mid - 1;',
        '  }',
        '  cout << idx << "\\n";',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 3.2 答えで二分探索 ----
(function registerBinarySearchOnAnswer() {
  const a = [7, 9, 3, 11];
  const k = 4;
  const steps = [];
  let lo = 1, hi = Math.max(...a);
  steps.push({ line: 7, vars: { lo, hi }, array: { label: 'a（棒の長さ）', values: a }, note: `答え L の範囲を lo = ${lo}〜hi = ${hi}（hi は棒の最大の長さ）に決める。` });
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    steps.push({ line: 9, vars: { lo, hi, mid }, array: { label: 'a（棒の長さ）', values: a }, note: `長さ L = mid = ${mid} で切れるか試す。` });
    let cnt = 0;
    for (const v of a) cnt += Math.floor(v / mid);
    steps.push({ line: 11, vars: { lo, hi, mid, cnt, k }, array: { label: 'a（棒の長さ）', values: a }, note: `各棒を長さ ${mid} で切ると ⌊a_i / ${mid}⌋ 本ずつ作れる。合計 ${cnt} 本（必要なのは K = ${k} 本）。` });
    if (cnt >= k) {
      steps.push({ line: 12, vars: { lo: mid, hi }, array: { label: 'a（棒の長さ）', values: a }, note: `${cnt} ≥ K なので L = ${mid} でも作れる。もっと長くできないか、lo = ${mid} にして探す。` });
      lo = mid;
    } else {
      steps.push({ line: 12, vars: { lo, hi: mid - 1 }, array: { label: 'a（棒の長さ）', values: a }, note: `${cnt} < K なので L = ${mid} では足りない。hi = ${mid - 1} にして探す。` });
      hi = mid - 1;
    }
  }
  steps.push({ line: 14, vars: { lo }, array: { label: 'a（棒の長さ）', values: a }, note: `lo と hi が一致したら探索終了。答えは L = ${lo}。` });

  registerTopic('3.2', {
    title: '答えで二分探索',
    explain: [
      '探す対象は配列の要素とは限らない。「答えとなる値」そのものを二分探索することもできる。',
      'コツは、答えの候補 L について「L は条件を満たせるか？」という判定（check(L)）を作ること。この判定が、ある値を境に true → false（または false → true）と単調に変わるなら、L の二分探索ができる。',
      '判定 1 回が O(N) でも、全体では二分探索の回数 O(log(答えの範囲)) との掛け算で済み、L を 1 ずつ全部試す（O(答えの範囲 × N)）よりずっと速い。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; long long k; cin >> n >> k;',
      '  vector<long long> a(n);',
      '  for (auto &v : a) cin >> v;',
      '  long long lo = 1, hi = *max_element(a.begin(), a.end());',
      '  while (lo < hi) {',
      '    long long mid = (lo + hi + 1) / 2;',
      '    long long cnt = 0;',
      '    for (long long v : a) cnt += v / mid;',
      '    if (cnt >= k) lo = mid; else hi = mid - 1;',
      '  }',
      '  cout << lo << "\\n";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は工作用の棒を N 本持っていて、i 本目の長さは A_i。それぞれの棒を好きな長さ L で切り分け、1 本の棒 A_i からは長さ L の棒を ⌊A_i / L⌋ 本（余りは捨てる）作れる。全部の棒から合計で K 本以上の長さ L の棒を作れるような、最大の整数 L を求めてください。',
      constraints: ['1 ≤ N ≤ 10^5', '1 ≤ K ≤ 10^9', '1 ≤ A_i ≤ 10^9', '答えとなる L は必ず 1 以上存在する', '入力はすべて整数'],
      input: 'N K\nA_1 A_2 … A_N',
      output: '条件を満たす最大の整数 L を出力してください。',
      samples: [
        { input: '4 4\n7 9 3 11', output: '5' },
        { input: '1 1\n1', output: '1', note: '棒が1本しかなく、L = 1 でちょうど1本作れる。' },
      ],
    },
    solution: {
      idea: '「長さ L で合計 K 本以上作れるか」は L が大きいほど作れる本数が減る単調な判定なので、L を二分探索する。判定 1 回は棒を 1 周する O(N)、全体で O(N log(max a_i))。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; long long k; cin >> n >> k;',
        '  vector<long long> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  long long lo = 1, hi = *max_element(a.begin(), a.end());',
        '  while (lo < hi) {',
        '    long long mid = (lo + hi + 1) / 2;',
        '    long long cnt = 0;',
        '    for (long long v : a) cnt += v / mid;',
        '    if (cnt >= k) lo = mid; else hi = mid - 1;',
        '  }',
        '  cout << lo << "\\n";',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 3.3 しゃくとり法 ----
(function registerTwoPointer() {
  const a = [4, 2, 5, 1, 3];
  const p = 8;
  const steps = [];
  let left = 0, sum = 0, best = 0;
  steps.push({ line: 7, vars: { left, sum, best }, array: { label: 'a', values: a }, note: `左端 left と合計 sum を 0 から始める。合計が P = ${p} 以下になる最長の区間を探す。` });
  for (let right = 0; right < a.length; right++) {
    sum += a[right];
    steps.push({
      line: 9, vars: { left, right, sum },
      array: { label: 'a', values: a, hl: Array.from({ length: right - left + 1 }, (_, k) => left + k), ptr: { left, right } },
      note: `a[${right}] = ${a[right]} を右から区間に加える。sum = ${sum}`,
    });
    while (sum > p) {
      steps.push({
        line: 11, vars: { left, right, sum },
        array: { label: 'a', values: a, hl: Array.from({ length: right - left + 1 }, (_, k) => left + k), ptr: { left, right } },
        note: `sum = ${sum} > P = ${p} なので、左端を縮める。a[${left}] = ${a[left]} を引く。`,
      });
      sum -= a[left];
      left++;
    }
    const len = right - left + 1;
    best = Math.max(best, len);
    steps.push({
      line: 14, vars: { left, right, sum, len, best },
      array: { label: 'a', values: a, hl: Array.from({ length: len }, (_, k) => left + k), ptr: { left, right } },
      note: `区間 [${left}, ${right}] は長さ ${len} で sum = ${sum} ≤ P。これまでの最長 best = ${best}`,
    });
  }
  steps.push({ line: 16, vars: { best }, array: { label: 'a', values: a }, note: `すべての右端を試し終えた。答えは best = ${best}。` });

  registerTopic('3.3', {
    title: 'しゃくとり法',
    explain: [
      '配列の要素がすべて 0 以上など「区間を広げると合計が増えるだけ」という単調性があるとき、区間の右端 right を 1 つずつ右に伸ばしながら、合計が条件を超えたら左端 left だけを右に動かして縮める、という方法が使える。',
      'left も right も配列を一度しか右に進まないので、全体で O(N)。両端から迫る動きが芋虫（しゃくとり虫）の歩き方に似ているので「しゃくとり法」と呼ばれる。',
      'すべての区間を 2 重ループで試す O(N²) の全探索を、単調性を使って O(N) まで落とす考え方は、二分探索と同じ「条件の境目を探す」という発想の仲間。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; long long p; cin >> n >> p;',
      '  vector<long long> a(n);',
      '  for (auto &v : a) cin >> v;',
      '  int left = 0; long long sum = 0; int best = 0;',
      '  for (int right = 0; right < n; right++) {',
      '    sum += a[right];',
      '    while (sum > p) {',
      '      sum -= a[left];',
      '      left++;',
      '    }',
      '    best = max(best, right - left + 1);',
      '  }',
      '  cout << best << "\\n";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君が通う社員食堂の定食の値段は N 日分決まっていて、i 日目の値段は A_i 円。連続するいくつかの日を選んだとき、その日数分の定食を全部食べた合計金額が P 円以下になる選び方のうち、選べる日数の最大値を求めてください。',
      constraints: ['1 ≤ N ≤ 2 × 10^5', '1 ≤ A_i ≤ 10^4', '1 ≤ P ≤ 2 × 10^9', '入力はすべて整数'],
      input: 'N P\nA_1 A_2 … A_N',
      output: '選べる日数の最大値を出力してください。',
      samples: [
        { input: '5 8\n4 2 5 1 3', output: '3' },
        { input: '3 1\n5 5 5', output: '0', note: 'どの1日の値段も P = 1 より高く、1日も選べない。' },
      ],
    },
    solution: {
      idea: 'a_i はすべて正なので、区間を広げると合計は増えるだけという単調性がある。右端を 1 つずつ伸ばし、合計が P を超えたら左端を縮めるしゃくとり法で O(N)。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; long long p; cin >> n >> p;',
        '  vector<long long> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  int left = 0; long long sum = 0; int best = 0;',
        '  for (int right = 0; right < n; right++) {',
        '    sum += a[right];',
        '    while (sum > p) {',
        '      sum -= a[left];',
        '      left++;',
        '    }',
        '    best = max(best, right - left + 1);',
        '  }',
        '  cout << best << "\\n";',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 3.4 半分全列挙 ----
(function registerMeetInTheMiddle() {
  const a = [3, 5, 2, 4];
  const t = 9;
  const n = a.length;
  const h = Math.floor(n / 2);
  const steps = [];
  steps.push({ line: 8, vars: { n, h }, array: { label: 'a', values: a, hl: Array.from({ length: h }, (_, i) => i) }, note: `N = ${n} 個を半分ずつに分ける。前半 a[0..${h - 1}]（ハイライト）と後半 a[${h}..${n - 1}] で、それぞれ全部の部分集合の和を列挙する。` });

  const sum1 = [];
  for (let bit = 0; bit < (1 << h); bit++) {
    let s = 0;
    const chosen = [];
    for (let i = 0; i < h; i++) if (bit & (1 << i)) { s += a[i]; chosen.push(i); }
    steps.push({ line: 11, vars: { bit, s }, array: { label: '前半 a[0..' + (h - 1) + ']', values: a.slice(0, h), hl: chosen }, note: `前半の部分集合（bit = ${bit}）の和 s = ${s}` });
    sum1.push(s);
    steps.push({ line: 12, vars: { s }, array: { label: 'sum1（前半の和の一覧）', values: [...sum1], hl: [sum1.length - 1] }, note: `sum1 に ${s} を加える。` });
  }

  const sum2 = [];
  const h2 = n - h;
  for (let bit = 0; bit < (1 << h2); bit++) {
    let s = 0;
    const chosen = [];
    for (let i = 0; i < h2; i++) if (bit & (1 << i)) { s += a[h + i]; chosen.push(h + i); }
    steps.push({ line: 16, vars: { bit, s }, array: { label: '後半 a[' + h + '..' + (n - 1) + ']', values: a.slice(h), hl: chosen.map((x) => x - h) }, note: `後半の部分集合（bit = ${bit}）の和 s = ${s}` });
    sum2.push(s);
    steps.push({ line: 17, vars: { s }, array: { label: 'sum2（後半の和の一覧）', values: [...sum2], hl: [sum2.length - 1] }, note: `sum2 に ${s} を加える。` });
  }

  const sorted2 = [...sum2].sort((x, y) => x - y);
  steps.push({ line: 19, vars: {}, array: { label: 'sum2（昇順にソート）', values: sorted2 }, note: `sum2 を昇順にソートしておく。これで、ある値が中にあるかを二分探索（3.1）で O(log) で調べられる。` });

  let ok = false;
  for (const s of sum1) {
    const need = t - s;
    const found = sorted2.includes(need);
    steps.push({
      line: 22, vars: { s, t, need, 見つかった: found ? 'はい' : 'いいえ' },
      arrays: [{ label: 'sum1', values: sum1, hl: [sum1.indexOf(s)] }, { label: 'sum2（昇順）', values: sorted2, hl: found ? [sorted2.indexOf(need)] : [] }],
      note: `sum1 の ${s} に対して、sum2 の中に T - s = ${need} があるかを二分探索で調べる。` + (found ? ' → あった！' : ' → なかった。'),
    });
    if (found) { ok = true; break; }
  }
  steps.push({ line: 24, vars: { ok: ok ? 'Yes' : 'No' }, array: { label: 'a', values: a }, note: `前半の和 + 後半の和 = T にできる組があったので、答えは ${ok ? 'Yes' : 'No'}。` });

  registerTopic('3.4', {
    title: '半分全列挙',
    explain: [
      'N 個から選ぶ部分集合は 2^N 通りあり、N ≤ 40 程度になると全部は列挙しきれない（N ≤ 20 なら 2^20 ≈ 100 万通りで間に合う）。',
      '半分全列挙は、N 個を前半・後半のおよそ半分ずつに分け、それぞれで部分集合の和を全列挙する方法。前半・後半はそれぞれ N/2 個なので、2^(N/2) 通りずつで済む（N = 40 なら 2^20 ≈ 100 万通り × 2）。',
      '片方の列挙結果をソートしておけば、もう片方の各値に対して「合計が T になる相方があるか」を二分探索（3.1）で O(log) で調べられる。全体で O(2^(N/2) × N/2) になり、N = 40 のような大きさでも間に合う。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; long long t; cin >> n >> t;',
      '  vector<long long> a(n);',
      '  for (auto &v : a) cin >> v;',
      '  int h = n / 2;',
      '  vector<long long> sum1, sum2;',
      '  for (int bit = 0; bit < (1 << h); bit++) {',
      '    long long s = 0;',
      '    for (int i = 0; i < h; i++) if (bit & (1 << i)) s += a[i];',
      '    sum1.push_back(s);',
      '  }',
      '  for (int bit = 0; bit < (1 << (n - h)); bit++) {',
      '    long long s = 0;',
      '    for (int i = 0; i < n - h; i++) if (bit & (1 << i)) s += a[h + i];',
      '    sum2.push_back(s);',
      '  }',
      '  sort(sum2.begin(), sum2.end());',
      '  bool ok = false;',
      '  for (long long s : sum1) {',
      '    if (binary_search(sum2.begin(), sum2.end(), t - s)) { ok = true; break; }',
      '  }',
      '  cout << (ok ? "Yes" : "No") << "\\n";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は宝石を N 個持っていて、i 番目の価値は A_i。いくつか（0 個でもよい）選んで、選んだ宝石の価値の合計をちょうど T にできるかを判定してください。',
      constraints: ['1 ≤ N ≤ 40', '1 ≤ A_i ≤ 10^9', '1 ≤ T ≤ 4 × 10^10', '入力はすべて整数'],
      input: 'N T\nA_1 A_2 … A_N',
      output: '合計をちょうど T にできるなら Yes、できないなら No を出力してください。',
      samples: [
        { input: '4 9\n3 5 2 4', output: 'Yes' },
        { input: '4 100\n3 5 2 4', output: 'No', note: '全部選んでも合計は 14 にしかならない。' },
      ],
    },
    solution: {
      idea: 'N ≤ 40 は 2^N 通りの全探索には大きすぎるが、半分の N/2 ≤ 20 なら 2^20 通りで列挙できる。前半・後半それぞれの部分集合の和を列挙し、後半をソートして、前半の各値 s について T - s が後半にあるかを二分探索で調べる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; long long t; cin >> n >> t;',
        '  vector<long long> a(n);',
        '  for (auto &v : a) cin >> v;',
        '  int h = n / 2;',
        '  vector<long long> sum1, sum2;',
        '  for (int bit = 0; bit < (1 << h); bit++) {',
        '    long long s = 0;',
        '    for (int i = 0; i < h; i++) if (bit & (1 << i)) s += a[i];',
        '    sum1.push_back(s);',
        '  }',
        '  for (int bit = 0; bit < (1 << (n - h)); bit++) {',
        '    long long s = 0;',
        '    for (int i = 0; i < n - h; i++) if (bit & (1 << i)) s += a[h + i];',
        '    sum2.push_back(s);',
        '  }',
        '  sort(sum2.begin(), sum2.end());',
        '  bool ok = false;',
        '  for (long long s : sum1) {',
        '    if (binary_search(sum2.begin(), sum2.end(), t - s)) { ok = true; break; }',
        '  }',
        '  cout << (ok ? "Yes" : "No") << "\\n";',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 3.5 チャレンジ問題（答えで二分探索 + 貪欲な一周判定） ----
(function registerChallenge() {
  const xs = [1, 2, 4, 8, 9];
  const k = 3;
  const steps = [];

  function simulateCheck(d, pushSteps) {
    let last = xs[0];
    let cnt = 1;
    if (pushSteps) steps.push({ line: 4, vars: { d, last, cnt }, array: { label: 'x（位置、昇順）', values: xs, hl: [0] }, note: `check(${d}) を試す。まず x[0] = ${last} を選ぶ（cnt = 1）。` });
    for (let i = 1; i < xs.length; i++) {
      const gap = xs[i] - last;
      const take = gap >= d;
      if (pushSteps) {
        steps.push({
          line: 7, vars: { d, i, 'x[i]': xs[i], last, gap, cnt },
          array: { label: 'x（位置、昇順）', values: xs, hl: [i] },
          note: `x[${i}] = ${xs[i]} と直前の last = ${last} の差は ${gap}。` + (take ? `d = ${d} 以上なので選ぶ。` : `d = ${d} 未満なので選ばない。`),
        });
      }
      if (take) { cnt++; last = xs[i]; }
    }
    const ok = cnt >= k;
    if (pushSteps) steps.push({ line: 9, vars: { d, cnt, k, 結果: ok ? 'true' : 'false' }, array: { label: 'x（位置、昇順）', values: xs }, note: `選べた本数 cnt = ${cnt}（必要 K = ${k}）。check(${d}) = ${ok ? 'true' : 'false'}` });
    return ok;
  }

  let lo = 0, hi = xs[xs.length - 1] - xs[0];
  steps.push({ line: 16, vars: { lo, hi }, array: { label: 'x（位置、昇順）', values: xs }, note: `隣り合う棒の最小の間隔 D の範囲を lo = ${lo}〜hi = ${hi} に決める。この D をできるだけ大きくしたい。` });
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    steps.push({ line: 18, vars: { lo, hi, mid }, array: { label: 'x（位置、昇順）', values: xs }, note: `D = mid = ${mid} で、K = ${k} 本を間隔 ${mid} 以上あけて選べるか check(mid) で調べる。` });
    const ok = simulateCheck(mid, true);
    if (ok) {
      steps.push({ line: 19, vars: { lo: mid, hi }, array: { label: 'x（位置、昇順）', values: xs }, note: `check(${mid}) = true なので D = ${mid} でも選べる。もっと広げられないか lo = ${mid} にする。` });
      lo = mid;
    } else {
      steps.push({ line: 19, vars: { lo, hi: mid - 1 }, array: { label: 'x（位置、昇順）', values: xs }, note: `check(${mid}) = false なので D = ${mid} では選べない。hi = ${mid - 1} にする。` });
      hi = mid - 1;
    }
  }
  steps.push({ line: 21, vars: { lo }, array: { label: 'x（位置、昇順）', values: xs }, note: `lo = hi になったら終了。答えは D = ${lo}。` });

  registerTopic('3.5', {
    title: 'チャレンジ問題',
    explain: [
      'この章のまとめ。「答えを二分探索する」（3.2）には、答えの候補が条件を満たすかを判定する check 関数が必要になる。その check 関数の中身を、しゃくとり法（3.3）のように配列を一方向に 1 回なめるだけの貪欲な処理にできれば、check 1 回が O(N)、全体で O(N log(答えの範囲)) にできる。',
      '今回の check(D) は「間隔 D 以上をあけて、何本選べるか」を数える処理。選べる本数は D が大きいほど減っていく（単調）ので、D を二分探索できる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'bool check(vector<long long> &x, int k, long long d) {',
      '  long long last = x[0];',
      '  int cnt = 1;',
      '  for (size_t i = 1; i < x.size(); i++) {',
      '    if (x[i] - last >= d) { cnt++; last = x[i]; }',
      '  }',
      '  return cnt >= k;',
      '}',
      'int main() {',
      '  int n, k; cin >> n >> k;',
      '  vector<long long> x(n);',
      '  for (auto &v : x) cin >> v;',
      '  sort(x.begin(), x.end());',
      '  long long lo = 0, hi = x.back() - x.front();',
      '  while (lo < hi) {',
      '    long long mid = (lo + hi + 1) / 2;',
      '    if (check(x, k, mid)) lo = mid; else hi = mid - 1;',
      '  }',
      '  cout << lo << "\\n";',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '数直線上に N 本の棒が立っていて、i 本目の位置は X_i（すべて異なる）。高橋君はこの中から K 本を選び、選んだ棒のうち隣り合う 2 本の間隔の最小値ができるだけ大きくなるようにしたい。その最大値を求めてください。',
      constraints: ['2 ≤ K ≤ N ≤ 10^5', '0 ≤ X_i ≤ 10^9（すべて異なる）', '入力はすべて整数'],
      input: 'N K\nX_1 X_2 … X_N',
      output: '間隔の最小値の最大値を出力してください。',
      samples: [
        { input: '5 3\n1 2 4 8 9', output: '3' },
        { input: '2 2\n0 10', output: '10', note: 'K = N なので全部選ぶしかなく、間隔はそのまま 10。' },
      ],
    },
    solution: {
      idea: 'x を昇順にソートしておく。「間隔 D 以上をあけて K 本選べるか」は、先頭から貪欲に「直前に選んだ棒との差が D 以上になったら選ぶ」で判定でき、これは D が大きいほど選べる本数が減る単調な判定になる。この D を二分探索する。check 1 回 O(N)、全体で O(N log(x の範囲))。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'bool check(vector<long long> &x, int k, long long d) {',
        '  long long last = x[0];',
        '  int cnt = 1;',
        '  for (size_t i = 1; i < x.size(); i++) {',
        '    if (x[i] - last >= d) { cnt++; last = x[i]; }',
        '  }',
        '  return cnt >= k;',
        '}',
        'int main() {',
        '  int n, k; cin >> n >> k;',
        '  vector<long long> x(n);',
        '  for (auto &v : x) cin >> v;',
        '  sort(x.begin(), x.end());',
        '  long long lo = 0, hi = x.back() - x.front();',
        '  while (lo < hi) {',
        '    long long mid = (lo + hi + 1) / 2;',
        '    if (check(x, k, mid)) lo = mid; else hi = mid - 1;',
        '  }',
        '  cout << lo << "\\n";',
        '}',
      ].join('\n'),
    },
  });
})();
