'use strict';
// 6章 考察テクニック
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* 関数で動かして作る（手計算のミスを防ぐため）。

// ---- 6.0 入門 ----
(function registerIntro() {
  const n = 5;
  const steps = [];
  let sum = 0;
  const sums = [];
  for (let i = 1; i <= n; i++) {
    steps.push({ line: 7, vars: { i, sum }, array: { label: 'sum の移り変わり', values: [...sums] }, note: `i = ${i} 番目の子どもが ${i} 個持っている。sum に足す前。` });
    sum += i;
    sums.push(sum);
    steps.push({ line: 7, vars: { i, sum }, array: { label: 'sum の移り変わり', values: [...sums] }, note: `sum += ${i} → sum = ${sum}` });
  }
  steps.push({
    line: 9, vars: { sum },
    note: `全員分を足し終えた。答えは ${sum}。1と5、2と4のように端から組にすると、どの組も合計が6（= N+1）になり、真ん中の3が1つ余る → 6×2+3 = ${6 * 2 + 3} という、N×(N+1)/2 の形が見えてくる。`,
  });

  registerTopic('6.0', {
    title: '入門',
    explain: [
      '6章では「実装の前に少し考えると、計算の仕方そのものを変えられる」という発想（考察テクニック）を扱う。まずはその一番やさしい例から。',
      '素直な解き方は「1 から N まで順に足す」ループ（O(N)）。気づきは、両端から組にすると、どの組も合計が同じ値（N+1）になること。',
      '速い解き方は、組の数 × 1組の合計、という式 N×(N+1)/2 を直接計算するだけ（O(1)）。N が 10 億でもループなしで一瞬で求まる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  long long n; cin >> n;',
      '  long long sum = 0;',
      '  for (long long i = 1; i <= n; i++) {',
      '    sum += i;',
      '  }',
      '  cout << sum << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は、一列に並んだ N 人の子どもが持っているアメの総数を知りたい。前から z 番目の子どもは、ちょうど z 個のアメを持っている。子ども全員が持っているアメの総数を求めてください。',
      constraints: ['1 ≤ N ≤ 10^9', '入力はすべて整数'],
      input: 'N',
      output: '総数を出力してください。',
      samples: [
        { input: '5', output: '15' },
        { input: '1000000000', output: '500000000500000000', note: 'N が最大のとき（端のケース）。答えがとても大きくなる。' },
      ],
    },
    solution: {
      idea: '1番目とN番目、2番目とN-1番目、…のように端から組にすると、どの組も合計がN+1になる。組はだいたいN/2個できるので、総和はN×(N+1)/2という式1つで求まり、ループは不要になる。Nが大きいのでオーバーフローに注意しlong longを使う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  long long n; cin >> n;',
        '  cout << n * (n + 1) / 2 << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.1 偶奇を考える ----
(function registerParity() {
  const K = 4;
  const steps = [];
  const range = Array.from({ length: 2 * K + 1 }, (_, i) => i - K); // -K..K
  let reach = new Set([0]);
  const toArr = (set) => range.map((p) => (set.has(p) ? 1 : 0));
  steps.push({ line: 5, vars: { t: 0 }, array: { label: '到達できる座標（1=到達可、中央が0）', values: toArr(reach) }, note: '0回の操作後は座標0だけにいる。' });
  for (let t = 1; t <= K; t++) {
    const next = new Set();
    for (const p of reach) { next.add(p + 1); next.add(p - 1); }
    reach = next;
    steps.push({
      line: 9, vars: { t }, array: { label: '到達できる座標（1=到達可、中央が0）', values: toArr(reach) },
      note: `${t} 回操作後に到達できる座標。偶数回後は偶数座標だけ、奇数回後は奇数座標だけに到達できる（偶奇が1回ごとに反転する）。`,
    });
  }

  registerTopic('6.1', {
    title: '偶奇を考える',
    explain: [
      '操作のたびに値が+1か-1だけ変わるとき、「今どこにいるか」を全部調べなくても、座標の偶奇（パリティ）は1回の操作ごとに必ず反転する、という規則性がある。',
      '素直な解き方は、K回操作後に到達できる座標の集合を1回ずつ広げてシミュレートすること。気づきは、K回後に到達できる座標は「Kと同じ偶奇を持ち、かつ|座標| ≤ K」のものだけ、という形で言い換えられること。',
      '速い解き方は、座標Pについて |P| ≤ K と (K-P) が偶数か、の2条件をその場で確かめるだけ（O(1)）。Kが10億でもシミュレートせず判定できる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int k; cin >> k;',
      '  set<int> reach = {0};',
      '  for (int t = 0; t < k; t++) {',
      '    set<int> nxt;',
      '    for (int p : reach) { nxt.insert(p + 1); nxt.insert(p - 1); }',
      '    reach = nxt;',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は数直線上の座標 0 にロボットを置いた。1 回の操作で、座標を +1 するか -1 するかを選べる。ちょうど K 回操作したあと、ロボットが座標 P にいることがあり得るか判定してください。',
      constraints: ['0 ≤ K ≤ 10^9', '-10^9 ≤ P ≤ 10^9', '入力はすべて整数'],
      input: 'K P',
      output: 'あり得るなら Yes、あり得ないなら No を出力してください。',
      samples: [
        { input: '4 2', output: 'Yes' },
        { input: '3 2', output: 'No' },
        { input: '2 5', output: 'No' },
      ],
    },
    solution: {
      idea: '+1をa回、-1をb回使うとすると a+b=K, a-b=P なので a=(K+P)/2, b=(K-P)/2。これが両方とも0以上の整数になる条件は、|P| ≤ K かつ K+P が偶数（= K-P が偶数）のとき。到達できる座標を1つずつ広げなくても、この2条件をその場で確かめればよい。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  long long k, p; cin >> k >> p;',
        '  bool ok = (abs(p) <= k) && ((k - p) % 2 == 0);',
        '  cout << (ok ? "Yes" : "No") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.2 足された回数を考える ----
(function registerContribution() {
  const a = [1, 2, 3];
  const n = a.length;
  const steps = [];
  let total = 0;
  for (let l = 0; l < n; l++) {
    let sum = 0;
    for (let r = l; r < n; r++) {
      sum += a[r];
      total += sum;
      const hl = [];
      for (let k = l; k <= r; k++) hl.push(k);
      steps.push({
        line: 12, vars: { l, r, sum, total },
        array: { label: 'a', values: a, hl },
        note: `区間[${l},${r}]の和は${sum}。これまでの区間の和の合計(total)に足す → total=${total}`,
      });
    }
  }
  const counts = a.map((_, i) => (i + 1) * (n - i));
  const contrib = a.map((v, i) => v * counts[i]);
  steps.push({
    line: 15, vars: { total },
    arrays: [
      { label: '各要素が含まれる区間の個数', values: counts },
      { label: '要素 × 含まれる個数（＝その要素の寄与）', values: contrib },
    ],
    note: `i番目の要素は (i+1)×(N-i) 個の区間に含まれるので、要素ごとの寄与 a[i]×(含まれる個数) を全部足しても同じ ${contrib.reduce((x, y) => x + y, 0)} が求まる。`,
  });

  registerTopic('6.2', {
    title: '足された回数を考える',
    explain: [
      '「全部の区間の和を足し合わせる」ような問題では、区間ごとに計算する代わりに、各要素が答えの中に「何回登場するか（何回足されるか）」を数え直すと速く求まることが多い。',
      '素直な解き方は、全部の区間(l,r)について和を求めて足し合わせる2重ループ（O(N²)）。気づきは、a[i]は「iを含む区間の個数」の分だけ答えに足されているということ。その個数は (i+1)×(N-i) という式で求まる（左端の選び方 i+1 通り × 右端の選び方 N-i 通り）。',
      '速い解き方は、各要素についてこの個数を掛けて足し合わせるだけ（O(N)）。答えが大きくなるので 10^9+7 で割った余りを求める。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  long long total = 0;',
      '  for (int l = 0; l < n; l++) {',
      '    long long sum = 0;',
      '    for (int r = l; r < n; r++) {',
      '      sum += a[r];',
      '      total += sum;',
      '    }',
      '  }',
      '  cout << total << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は長さ N の数列 A を持っている。A の空でない連続部分列（区間）すべてについて、その区間に含まれる要素の総和を求め、それらすべてを足し合わせた値を 10^9+7 で割った余りを求めてください。',
      constraints: ['1 ≤ N ≤ 2×10^5', '1 ≤ A_i ≤ 10^9', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N',
      output: '値を出力してください。',
      samples: [
        { input: '3\n1 2 3', output: '20' },
        { input: '1\n5', output: '5', note: 'N = 1 のとき（端のケース）。区間は [5] の 1 つだけ。' },
      ],
    },
    solution: {
      idea: 'a[i]（0-indexed）は、左端をi以下、右端をi以上に選んだ区間すべてに含まれるので、含まれる区間の個数は (i+1)×(N-i) 通り。この個数を a[i] に掛けて全部足せば、区間ごとに和を計算し直さなくても答えが求まる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long MOD = 1000000007;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  long long total = 0;',
        '  for (int i = 0; i < n; i++) {',
        '    long long cnt = (long long)(i + 1) * (n - i) % MOD;',
        '    total = (total + a[i] % MOD * cnt) % MOD;',
        '  }',
        '  cout << total << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.3 上限値を考える ----
(function registerSqrtBound() {
  const n = 12;
  const steps = [];
  let best = n - 1;
  steps.push({ line: 5, vars: { n, best }, note: 'まず1枚×N枚に並べた場合を基準にする（差はN-1）。' });
  for (let i = 1; i * i <= n; i++) {
    steps.push({ line: 6, vars: { i, best }, note: `i=${i}（i×i=${i * i} ≤ N=${n} の間だけ調べる）` });
    if (n % i === 0) {
      const j = n / i;
      const diff = j - i;
      best = Math.min(best, diff);
      steps.push({ line: 9, vars: { i, j, diff, best }, note: `Nはi=${i}で割り切れる（N/i=${j}）。縦横の差は${diff}。best = min(best, ${diff}) = ${best}` });
    } else {
      steps.push({ line: 7, vars: { i, best }, note: `Nはi=${i}で割り切れない。` });
    }
  }
  steps.push({ line: 12, vars: { best }, note: `i を √N=${Math.sqrt(n).toFixed(2)} 程度まで調べれば十分（それより大きいiは、すでに小さい方の約数として逆向きに見つかっている）。答えは${best}。` });

  registerTopic('6.3', {
    title: '上限値を考える',
    explain: [
      '「ある条件を満たす値を探す」とき、素直に考えると広い範囲を調べたくなるが、実は答えの候補はもっと狭い範囲にしか現れない、と気づけることがある。',
      '素直な解き方は、縦の枚数Hを1からNまで全部試すこと（O(N)）。気づきは、H×W=NでH ≤ Wとすると、必ずH ≤ √Nになるということ。H > √NになるものはすべてWの方を1から試したときに裏返しで見つかっている。',
      '速い解き方は、Hを1から√Nまでだけ試すこと（O(√N)）。Nが10^12でもループはたった100万回程度で済む。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  long long n; cin >> n;',
      '  long long best = n - 1; // 1×N の場合',
      '  for (long long i = 1; i * i <= n; i++) {',
      '    if (n % i == 0) {',
      '      long long j = n / i;',
      '      best = min(best, j - i);',
      '    }',
      '  }',
      '  cout << best << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個のクッキーを、余らせずちょうど使い切るように縦 H 枚×横 W 枚（H ≤ W、H×W = N）の長方形に並べたい。縦と横の枚数の差 W - H が最小になるように並べたとき、その最小の差を求めてください。',
      constraints: ['1 ≤ N ≤ 10^12', '入力はすべて整数'],
      input: 'N',
      output: '最小の差を出力してください。',
      samples: [
        { input: '12', output: '1' },
        { input: '1000000000000', output: '0' },
      ],
    },
    solution: {
      idea: 'H ≤ Wとすると必ずH ≤ √Nなので、Hの候補は1から√Nまでだけ調べれば十分。NをHで割り切れるかどうかを順に確かめ、割り切れたときのW-Hの最小値を記録する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  long long n; cin >> n;',
        '  long long best = n - 1;',
        '  for (long long i = 1; i * i <= n; i++) {',
        '    if (n % i == 0) {',
        '      long long j = n / i;',
        '      best = min(best, j - i);',
        '    }',
        '  }',
        '  cout << best << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.4 一手先を考える ----
(function registerGreedyInterval() {
  const jobsOriginal = [[1, 3], [2, 5], [4, 6], [6, 8]];
  const jobs = [...jobsOriginal].sort((a, b) => a[1] - b[1]);
  const steps = [];
  let cnt = 0;
  let last = -1;
  for (let idx = 0; idx < jobs.length; idx++) {
    const [s, t] = jobs[idx];
    const pick = s >= last;
    steps.push({
      line: 10, vars: { s, t, last, cnt },
      table: [{ label: '依頼（終了時刻の早い順）。上段=開始、下段=終了', data: [jobs.map((j) => j[0]), jobs.map((j) => j[1])], rows: ['開始', '終了'], cols: jobs.map((_, i) => i), hl: pick ? [[0, idx], [1, idx]] : [] }],
      note: `依頼(開始${s},終了${t})を見る。開始がlast=${last}以上${pick ? 'なので選べる' : 'でないので選べない（前の依頼とかぶる）'}。`,
    });
    if (pick) {
      cnt++;
      last = t;
      steps.push({ line: 12, vars: { s, t, last, cnt }, note: `選んだ。lastを${t}に更新。これまでに${cnt}件こなせる。` });
    }
  }

  registerTopic('6.4', {
    title: '一手先を考える',
    explain: [
      '「どれを選ぶと得か」を全部の組み合わせで比べる代わりに、1手先だけ考えて「今選べる中で一番良いものを選ぶ」だけで最適になる場合がある（貪欲法）。',
      '素直な解き方は、選ぶ依頼の組み合わせを全部試すこと（組み合わせ爆発でN=20程度が限界）。気づきは、終了時刻が一番早い依頼から順に見て「担当できるなら必ず選ぶ」のが最適だということ。早く終わる依頼を選ぶほど、次に選べる依頼の余地が広く残るため、他の選び方より損をしない。',
      '速い解き方は、終了時刻でソートしてから1回のループで貪欲に選ぶだけ（O(N log N)）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<pair<int,int>> job(n);',
      '  for (auto &[s, t] : job) cin >> s >> t;',
      '  sort(job.begin(), job.end(), [](auto &a, auto &b) { return a.second < b.second; });',
      '  int cnt = 0, last = -1;',
      '  for (auto &[s, t] : job) {',
      '    if (s >= last) {',
      '      cnt++;',
      '      last = t;',
      '    }',
      '  }',
      '  cout << cnt << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '配達員の高橋君は N 件の配達依頼を受け持っている。i 番目の依頼は時刻 S_i に受け取って時刻 T_i までに届け終える必要がある（S_i < T_i）。高橋君は同時に 1 件しか担当できず、ある依頼を届け終えた時刻以降でなければ次の依頼を受け取れない。できるだけ多くの依頼をこなすとき、最大で何件こなせるか求めてください。',
      constraints: ['1 ≤ N ≤ 2×10^5', '0 ≤ S_i < T_i ≤ 10^9', '入力はすべて整数'],
      input: 'N\nS_1 T_1\n⋮\nS_N T_N',
      output: '最大件数を出力してください。',
      samples: [
        { input: '4\n1 3\n2 5\n4 6\n6 8', output: '3' },
        { input: '1\n0 1', output: '1', note: 'N = 1 のとき（端のケース）。' },
      ],
    },
    solution: {
      idea: '終了時刻が早い依頼から順に見て、開始時刻が直前に選んだ依頼の終了時刻以上なら必ず選ぶ。早く終わるものを優先して選ぶほど、後の依頼を選べる余地が狭まらないので、この貪欲な選び方が最適になる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<pair<int,int>> job(n);',
        '  for (auto &[s, t] : job) cin >> s >> t;',
        '  sort(job.begin(), job.end(), [](auto &a, auto &b) { return a.second < b.second; });',
        '  int cnt = 0, last = -1;',
        '  for (auto &[s, t] : job) {',
        '    if (s >= last) {',
        '      cnt++;',
        '      last = t;',
        '    }',
        '  }',
        '  cout << cnt << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.5 個数を考える ----
(function registerCountFormula() {
  const n = 20;
  const steps = [];
  let cnt = 0;
  const cnts = [];
  for (let i = 1; i <= n; i++) {
    const hit = i % 3 === 0 || i % 5 === 0;
    if (hit) cnt++;
    cnts.push(cnt);
    steps.push({ line: 7, vars: { i, cnt }, array: { label: 'cnt の移り変わり', values: [...cnts] }, note: `i=${i} は3の倍数でも5の倍数でも${hit ? 'ある → cnt++' : 'ない'} → cnt=${cnt}` });
  }
  const c3 = Math.floor(n / 3);
  const c5 = Math.floor(n / 5);
  const c15 = Math.floor(n / 15);
  steps.push({
    line: 9, vars: { cnt },
    note: `答えは${cnt}。これは floor(N/3)+floor(N/5)-floor(N/15) = ${c3}+${c5}-${c15} = ${c3 + c5 - c15} とも一致する（3の倍数と5の倍数を別々に数えて、両方の倍数である15の倍数を重複分として引く）。`,
  });

  registerTopic('6.5', {
    title: '個数を考える',
    explain: [
      '「条件を満たすものがいくつあるか」を1個ずつ数える代わりに、「何の倍数が何個あるか」を式で直接数えられることがある。',
      '素直な解き方は、1からNまで全部の整数を調べて数えるループ（O(N)）。気づきは、3の倍数の個数はfloor(N/3)で即座に求まり、5の倍数も同様で、両方の倍数（15の倍数）だけ2回数えてしまっているということ（重複を引く＝包除原理）。',
      '速い解き方は、floor(N/3)+floor(N/5)-floor(N/15)を計算するだけ（O(1)）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  long long n; cin >> n;',
      '  long long cnt = 0;',
      '  for (long long i = 1; i <= n; i++) {',
      '    if (i % 3 == 0 || i % 5 == 0) cnt++;',
      '  }',
      '  cout << cnt << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は整数 N を持っている。1 以上 N 以下の整数のうち、3 の倍数または 5 の倍数であるものの個数を求めてください。',
      constraints: ['1 ≤ N ≤ 10^18', '入力はすべて整数'],
      input: 'N',
      output: '個数を出力してください。',
      samples: [
        { input: '20', output: '9' },
        { input: '1', output: '0', note: 'N = 1 のとき（端のケース）。1 は 3 の倍数でも 5 の倍数でもない。' },
      ],
    },
    solution: {
      idea: '3の倍数はfloor(N/3)個、5の倍数はfloor(N/5)個あるが、これらを単純に足すと両方の倍数（15の倍数）を2回数えてしまう。15の倍数floor(N/15)個を1回分引けば、3の倍数または5の倍数の個数がちょうど求まる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  long long n; cin >> n;',
        '  long long cnt = n / 3 + n / 5 - n / 15;',
        '  cout << cnt << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.6 後ろから考える ----
(function registerSuffixMax() {
  const a = [3, 1, 4, 1, 5, 9, 2, 6];
  const n = a.length;
  const suf = new Array(n);
  const steps = [];
  const toDisplay = () => suf.map((v) => (v === undefined ? '-' : v));
  suf[n - 1] = a[n - 1];
  steps.push({
    line: 8, vars: { i: n - 1 }, arrays: [{ label: 'a', values: a, hl: [n - 1] }, { label: 'suf（後ろからの最大値）', values: toDisplay() }],
    note: `一番右 suf[${n - 1}] = a[${n - 1}] = ${a[n - 1]}`,
  });
  for (let i = n - 2; i >= 0; i--) {
    suf[i] = Math.max(a[i], suf[i + 1]);
    steps.push({
      line: 10, vars: { i, 'a[i]': a[i], 'suf[i+1]': suf[i + 1] },
      arrays: [{ label: 'a', values: a, hl: [i] }, { label: 'suf（後ろからの最大値）', values: toDisplay() }],
      note: `suf[${i}] = max(a[${i}]=${a[i]}, suf[${i + 1}]=${suf[i + 1]}) = ${suf[i]}`,
    });
  }

  registerTopic('6.6', {
    title: '後ろから考える',
    explain: [
      '「各位置から先（または後ろ）を見て何かを求める」問題は、前からではなく後ろから1回だけ通すと、同じ情報を使い回せて速く求まることが多い。',
      '素直な解き方は、各位置iごとに「iから最後まで」を毎回スキャンして最大値を求めること（O(N²)）。気づきは、suf[i]（iから最後までの最大値）は「a[i]とsuf[i+1]の大きい方」と言い換えられ、1つ右の答えを使い回せるということ。',
      '速い解き方は、右端から左端へ1回のループでsufを更新していくだけ（O(N)）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<int> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  vector<int> suf(n);',
      '  suf[n - 1] = a[n - 1];',
      '  for (int i = n - 2; i >= 0; i--) {',
      '    suf[i] = max(a[i], suf[i + 1]);',
      '  }',
      '  for (int i = 0; i < n; i++) cout << suf[i] << " \\n"[i == n - 1];',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の荷物を一列に並べている。i 番目の荷物の重さは A_i である。各 i について、i 番目以降（i 番目を含む）の荷物の中で最大の重さを、前から順に求めてください。',
      constraints: ['1 ≤ N ≤ 2×10^5', '1 ≤ A_i ≤ 10^9', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N',
      output: '答えを空白区切りで出力してください。',
      samples: [
        { input: '8\n3 1 4 1 5 9 2 6', output: '9 9 9 9 9 9 6 6' },
        { input: '1\n7', output: '7', note: 'N = 1 のとき（端のケース）。' },
      ],
    },
    solution: {
      idea: '一番右の答えはa[N-1]自身。そこから左に1つ進むごとに、suf[i] = max(a[i], suf[i+1])と、1つ右の答えを使って即座に求められる。前から求めようとすると各iごとに右側を毎回見直す必要があり遅くなる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<int> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  vector<int> suf(n);',
        '  suf[n - 1] = a[n - 1];',
        '  for (int i = n - 2; i >= 0; i--) {',
        '    suf[i] = max(a[i], suf[i + 1]);',
        '  }',
        '  for (int i = 0; i < n; i++) cout << suf[i] << " \\n"[i == n - 1];',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.7 固定して全探索 ----
(function registerFixSearch() {
  const a = [1, 5, 3, 9, 8];
  const d = 4;
  const set = new Set(a);
  const steps = [];
  let cnt = 0;
  for (let i = 0; i < a.length; i++) {
    const target = a[i] + d;
    const found = set.has(target);
    if (found) cnt++;
    steps.push({
      line: 10, vars: { i, 'a[i]': a[i], target, cnt },
      array: { label: 'a', values: a, hl: [i] },
      note: `a[${i}]=${a[i]}（小さい方）を固定し、${a[i]}+D=${target} が数列にあるか調べる → ${found ? 'ある（組が見つかった）' : 'ない'}`,
    });
  }

  registerTopic('6.7', {
    title: '固定して全探索',
    explain: [
      '2つ以上選ぶ問題は、全部の組を試すと重いことが多い。そこで「1つを固定する」と、残りを求める問題がもっと簡単な形（存在するかどうかの判定など）に変わることがある。',
      '素直な解き方は、全部の2つの組(i,j)を試して差を確かめる2重ループ（O(N²)）。気づきは、差がちょうどDになる組は「小さい方の値v」を決めれば「大きい方はv+Dに決まる」ということ。つまり各要素を固定して、v+Dが数列中にあるかを確かめるだけでよい。',
      '速い解き方は、数列をあらかじめ集合（unordered_set）に入れておき、各要素についてv+Dの有無をO(1)で調べる（全体でO(N)）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; long long d; cin >> n >> d;',
      '  vector<long long> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  unordered_set<long long> s(a.begin(), a.end());',
      '  long long cnt = 0;',
      '  for (int i = 0; i < n; i++) {',
      '    if (s.count(a[i] + d)) cnt++;',
      '  }',
      '  cout << cnt << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の相異なる整数からなる数列 A を持っている。2 つの要素を選んでその差がちょうど D（D > 0）になるような組が何組あるか求めてください（順序は区別しない）。',
      constraints: ['2 ≤ N ≤ 2×10^5', '1 ≤ D ≤ 10^9', '1 ≤ A_i ≤ 10^9（すべて相異なる）', '入力はすべて整数'],
      input: 'N D\nA_1 A_2 … A_N',
      output: '組の数を出力してください。',
      samples: [
        { input: '5 4\n1 5 3 9 8', output: '2' },
        { input: '3 100\n1 2 3', output: '0', note: '差が D になる組が 1 つもないとき（端のケース）。' },
      ],
    },
    solution: {
      idea: '差がDになる組は、小さい方の値vを1つ固定すれば、大きい方はv+Dに決まる。v+Dが数列中にあるかをunordered_setで調べればO(1)で判定でき、各要素について調べて数えれば全体でO(N)になる。全部の2つ組を調べるO(N²)より速い。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; long long d; cin >> n >> d;',
        '  vector<long long> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  unordered_set<long long> s(a.begin(), a.end());',
        '  long long cnt = 0;',
        '  for (int i = 0; i < n; i++) {',
        '    if (s.count(a[i] + d)) cnt++;',
        '  }',
        '  cout << cnt << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.8 問題を言い換える ----
(function registerRephrase() {
  const n = 5;
  const ops = [[1, 3], [2, 5]];
  const on = new Array(n + 1).fill(0);
  const steps = [];
  for (const [l, r] of ops) {
    for (let i = l; i <= r; i++) {
      on[i] ^= 1;
      steps.push({
        line: 9, vars: { l, r, i }, array: { label: '電球の状態（1=点灯）', values: on.slice(1), hl: [i - 1] },
        note: `操作[${l},${r}]: 電球${i}を反転 → ${on[i] ? '点灯' : '消灯'}`,
      });
    }
  }
  const cnt = on.slice(1).reduce((s, v) => s + v, 0);
  steps.push({ line: 13, vars: { cnt }, array: { label: '電球の状態（1=点灯）', values: on.slice(1) }, note: `点灯している電球の個数は${cnt}。` });

  const diff = new Array(n + 2).fill(0);
  for (const [l, r] of ops) { diff[l]++; diff[r + 1]--; }
  const times = [];
  let run = 0;
  for (let i = 1; i <= n; i++) { run += diff[i]; times.push(run); }
  steps.push({
    vars: {},
    arrays: [{ label: '差分配列の累積和から求めた「反転された回数」', values: times }],
    note: `「点灯しているか」は「反転された回数が奇数か」と言い換えられる。回数自体は、区間の両端だけを記録する差分配列（§2 累積和と同じ考え方）の累積和で一度に求まり、点灯数は${times.filter((t) => t % 2 === 1).length}と一致する。`,
  });

  registerTopic('6.8', {
    title: '問題を言い換える',
    explain: [
      '問題文のままの操作（反転を何度も行う）を素直にシミュレートすると遅いことがある。「本当に知りたいのは何か」を考え直すと、もっと扱いやすい形に言い換えられることがある。',
      '素直な解き方は、操作のたびに区間の電球を1つずつ実際に反転するループ（最悪O(NM)）。気づきは、「最終的に点灯しているか」は「その電球が反転された回数が奇数か偶数か」だけで決まる、という言い換えができること。',
      '速い解き方は、各操作で区間の両端(l, r+1)だけを記録しておき（差分配列）、最後に1回の累積和で各電球が反転された回数を求め、奇偶を判定する（O(N+M)）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, m; cin >> n >> m;',
      '  vector<int> on(n + 1, 0);',
      '  for (int q = 0; q < m; q++) {',
      '    int l, r; cin >> l >> r;',
      '    for (int i = l; i <= r; i++) {',
      '      on[i] ^= 1;',
      '    }',
      '  }',
      '  int cnt = 0;',
      '  for (int i = 1; i <= n; i++) cnt += on[i];',
      '  cout << cnt << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の電球を一列に並べ、最初はすべて消している。M 回のスイッチ操作を順に行い、i 回目の操作は区間 [L_i, R_i] の電球すべての状態を反転させる（点灯⇔消灯）。すべての操作を行ったあと、点灯している電球の個数を求めてください。',
      constraints: ['1 ≤ N ≤ 2×10^5', '1 ≤ M ≤ 2×10^5', '1 ≤ L_i ≤ R_i ≤ N', '入力はすべて整数'],
      input: 'N M\nL_1 R_1\n⋮\nL_M R_M',
      output: '個数を出力してください。',
      samples: [
        { input: '5 2\n1 3\n2 5', output: '3' },
        { input: '3 2\n1 3\n1 3', output: '0', note: '同じ区間を 2 回反転すると元に戻るとき（端のケース）。' },
      ],
    },
    solution: {
      idea: '各電球について「点灯しているか」は「反転された回数が奇数か」で決まる。回数そのものは、区間[l,r]の反転を「diff[l]に+1、diff[r+1]に-1」と記録しておき、左から累積和を取ることでまとめて求められる（imos法）。累積和の値が奇数の位置を数えれば答えになる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, m; cin >> n >> m;',
        '  vector<int> diff(n + 2, 0);',
        '  for (int q = 0; q < m; q++) {',
        '    int l, r; cin >> l >> r;',
        '    diff[l]++;',
        '    diff[r + 1]--;',
        '  }',
        '  int cnt = 0, run = 0;',
        '  for (int i = 1; i <= n; i++) {',
        '    run += diff[i];',
        '    if (run % 2 == 1) cnt++;',
        '  }',
        '  cout << cnt << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.9 データの持ち方を工夫する ----
(function registerFreqTable() {
  const a = [2, 5, 2, 9, 5, 5];
  const queries = [5, 2, 7];
  const steps = [];
  for (const x of queries) {
    let cnt = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === x) cnt++;
      steps.push({ line: 11, vars: { x, i, 'a[i]': a[i], cnt }, array: { label: 'a', values: a, hl: [i] }, note: `クエリX=${x}: a[${i}]=${a[i]} を見る${a[i] === x ? '（一致、cnt++）' : ''} → cnt=${cnt}` });
    }
    steps.push({ line: 12, vars: { x, cnt }, note: `X=${x} の答えは${cnt}。このクエリのたびにaを端から端まで見直している。` });
  }
  const freq = {};
  for (const v of a) freq[v] = (freq[v] || 0) + 1;
  const keys = Object.keys(freq).map(Number).sort((p, q) => p - q);
  steps.push({
    vars: {},
    table: [{ label: '値ごとの個数（最初に1回だけ数えておく表）', data: [keys.map((k) => freq[k])], rows: ['個数'], cols: keys }],
    note: 'クエリが来る前に、どの値が何個あるかを1回だけ数えて表（頻度配列・マップ）にしておけば、クエリのたびに全部見直さなくても、表を見るだけでO(1)で答えがわかる。',
  });

  registerTopic('6.9', {
    title: 'データの持ち方を工夫する',
    explain: [
      '同じ種類の質問（クエリ）が何回も来るとき、そのたびに元のデータを全部見直すのではなく、答えやすい形に「持ち方」を変えて前もって準備しておくと速くなる。',
      '素直な解き方は、クエリのたびに数列全体を端から端まで見て数え直すこと（O(N)×クエリ数）。気づきは、数えたい対象は「値ごとの個数」であり、これはクエリが来る前に1回だけ数えておける、ということ。',
      '速い解き方は、最初に1回だけ値ごとの個数を数えて表（配列やmap）にしておき、各クエリはその表を見るだけで答える（準備O(N)、クエリ1回あたりO(1)）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<int> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  int q; cin >> q;',
      '  while (q--) {',
      '    int x; cin >> x;',
      '    int cnt = 0;',
      '    for (int v : a) if (v == x) cnt++;',
      '    cout << cnt << endl;',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の整数からなる数列 A を持っている。続けて Q 個のクエリが与えられ、各クエリでは整数 X が指定されるので、A の中に X と等しい値がいくつあるかをそれぞれ求めてください。',
      constraints: ['1 ≤ N, Q ≤ 2×10^5', '1 ≤ A_i, X ≤ 10^6', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N\nQ\nX_1\n⋮\nX_Q',
      output: '各クエリへの答えを 1 行ずつ出力してください。',
      samples: [
        { input: '6\n2 5 2 9 5 5\n3\n5\n2\n7', output: '3\n2\n0' },
        { input: '1\n4\n1\n4', output: '1', note: 'N = Q = 1 のとき（端のケース）。' },
      ],
    },
    solution: {
      idea: 'クエリが来るたびに数列を見直すのではなく、最初に1回だけ各値の個数をmap（またはaの値の範囲が狭ければ配列）に数えておく。あとは各クエリでその表を引くだけでO(1)で答えられる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  unordered_map<int,int> freq;',
        '  for (int i = 0; i < n; i++) { int x; cin >> x; freq[x]++; }',
        '  int q; cin >> q;',
        '  while (q--) {',
        '    int x; cin >> x;',
        '    cout << freq[x] << endl;',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 6.10 不変量に着目する ----
(function registerInvariant() {
  const v = [1, 2, 4];
  const steps = [];
  steps.push({ line: 5, vars: {}, array: { label: 'v（黒板の数）', values: [...v] }, note: '最初の黒板。総和は1+2+4=7（奇数）。' });
  while (v.length > 1) {
    const b = v.pop();
    const a = v.pop();
    const r = Math.abs(a - b);
    v.push(r);
    steps.push({ line: 10, vars: { a, b, r }, array: { label: 'v（黒板の数）', values: [...v] }, note: `末尾の2つ ${a} と ${b} を消して |${a}-${b}|=${r} を書く。` });
  }
  steps.push({
    line: 12, vars: { result: v[0] },
    array: { label: 'v（黒板の数）', values: [...v] },
    note: `最後に残った数は${v[0]}（${v[0] % 2 === 0 ? '偶数' : '奇数'}）。元の総和7も奇数で、偶奇が一致している。選ぶ順番を変えても最終的な偶奇は変わらない（不変量）。`,
  });

  registerTopic('6.10', {
    title: '不変量に着目する',
    explain: [
      '操作を繰り返す問題では、個々の値は変わっても「操作をしても絶対に変わらない量（不変量）」が見つかることがある。それを見つければ、全部シミュレートしなくても最終的な性質がわかる。',
      '素直な解き方は、実際に2つずつ選んで操作をシミュレートし、最後に残った数を求めること。選ぶ順番によって最終的な値そのものは変わる。気づきは、xとyを消して|x-y|を書く操作は、x+yと|x-y|の偶奇が必ず一致するため、総和の偶奇だけは操作をしても変わらないということ。',
      '速い解き方は、最初の総和を1回だけ計算し、その偶奇をそのまま答えとする（O(N)）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> v(n);',
      '  for (auto &x : v) cin >> x;',
      '  while (v.size() > 1) {',
      '    long long b = v.back(); v.pop_back();',
      '    long long a = v.back(); v.pop_back();',
      '    v.push_back(abs(a - b));',
      '  }',
      '  cout << (v[0] % 2 == 0 ? "Even" : "Odd") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君の黒板に N 個の整数が書かれている。次の操作を、黒板の数が 1 個になるまで繰り返す：好きな 2 個の数 x, y を選んで両方消し、代わりに |x - y| を書く。最終的に黒板に残る数が奇数か偶数かを判定してください（操作の選び方によらず一定であることが知られている）。',
      constraints: ['2 ≤ N ≤ 2×10^5', '0 ≤ A_i ≤ 10^9', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N',
      output: '奇数なら Odd、偶数なら Even を出力してください。',
      samples: [
        { input: '3\n1 2 4', output: 'Odd' },
        { input: '2\n2 2', output: 'Even', note: '最初の総和がすでに偶数のとき（端のケース）。' },
      ],
    },
    solution: {
      idea: 'xとyを消して|x-y|を書く操作は、総和をx+yだけ減らし|x-y|だけ増やす。x+yと|x-y|は必ず同じ偶奇になるので、この操作で総和の偶奇は変わらない（不変量）。よって最後に残る数の偶奇は、最初の総和の偶奇と常に一致し、実際に操作を繰り返さなくても総和を1回計算するだけでわかる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  long long sum = 0;',
        '  for (int i = 0; i < n; i++) { long long x; cin >> x; sum += x; }',
        '  cout << (sum % 2 == 0 ? "Even" : "Odd") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();
