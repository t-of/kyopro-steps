'use strict';
// 5章 数学的問題
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* 関数で動かして作る（手計算のミスを防ぐため）。

// ---- 5.0 数学的問題について ----
(function registerMathIntro() {
  const p = 7;
  const steps = [];
  const vals = [];
  for (let i = 0; i <= 8; i++) {
    const m = i % p;
    vals.push(m);
    steps.push({
      line: 5, vars: { i, p, 'i % p': m },
      array: { label: 'i % p の列', values: [...vals], hl: [vals.length - 1] },
      note: `i = ${i} を p = ${p} で割った余りは ${m}。i が大きくなっても、余りは 0〜${p - 1} の間を繰り返す。`,
    });
  }

  registerTopic('5.0', {
    title: '数学的問題について',
    explain: [
      '競技プログラミングでは、答えの個数や組み合わせの数がとても大きくなることが多く、そのままでは long long にも収まらない。そこで「ある数 p で割った余り」を答えとして求める問題がよく出る。',
      'この章では、素数判定・最大公約数・余り（mod）の計算といった、数そのものの性質を使う技法と、勝ち負けを論理で決める「ゲーム」の問題を扱う。',
      '上の図は i を p = 7 で割った余りの変化。余りは必ず 0 以上 p 未満の範囲に収まり、p 個ごとに同じ値を繰り返す。この性質が、この章の多くの技法の土台になる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int p; cin >> p;',
      '  for (int i = 0; i <= 8; i++) cout << i % p << " ";',
      '  cout << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の整数からなる数列 a が与えられる。a の総和を求め、10^9 + 7 で割った余りを出力せよ（総和は非常に大きくなることがある）。',
      constraints: ['1 ≤ N ≤ 10^5', '1 ≤ a_i ≤ 10^9'],
      samples: [{ input: '4\n5 7 2 9', output: '23' }],
    },
    solution: {
      idea: '総和は最大でも約 10^14 なので long long なら桁あふれしないが、この章の他の問題のように掛け算が絡むと long long でも収まらなくなる。「毎回 mod p を取りながら足し込む」習慣をここで付けておく。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  const long long MOD = 1000000007;',
        '  long long sum = 0;',
        '  for (int i = 0; i < n; i++) {',
        '    long long a; cin >> a;',
        '    sum = (sum + a) % MOD;',
        '  }',
        '  cout << sum << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.1 素数判定 ----
(function registerPrime() {
  const N = 30;
  const isComposite = new Array(N + 1).fill(false);
  const steps = [];
  steps.push({ line: 5, vars: { N }, note: `2 から ${N} までの数で、素数でないもの（合成数）に印を付けていく（エラトステネスの篩）。` });
  for (let i = 2; i * i <= N; i++) {
    if (isComposite[i]) {
      steps.push({
        line: 7, vars: { i },
        array: { label: `2〜${N}（● は合成数済み）`, values: makeRow(N, isComposite), hl: [i] },
        note: `i = ${i} はすでに合成数と分かっているので、i の倍数を消す作業は飛ばす。`,
      });
      continue;
    }
    steps.push({
      line: 7, vars: { i },
      array: { label: `2〜${N}（● は合成数済み）`, values: makeRow(N, isComposite), hl: [i] },
      note: `i = ${i} はまだ消されていない → 素数。i の倍数（i×i 以上）をすべて合成数として消す。`,
    });
    for (let j = i * i; j <= N; j += i) {
      isComposite[j] = true;
      steps.push({
        line: 8, vars: { i, j },
        array: { label: `2〜${N}（● は合成数済み）`, values: makeRow(N, isComposite), hl: [j] },
        note: `j = ${j}（= ${i} の倍数）を合成数として消す。`,
      });
    }
  }
  const primes = [];
  for (let i = 2; i <= N; i++) if (!isComposite[i]) primes.push(i);
  steps.push({
    line: 12, vars: { count: primes.length },
    array: { label: `2〜${N}（● は合成数済み）`, values: makeRow(N, isComposite), hl: [] },
    note: `最後まで消されなかった数が素数。2〜${N} の素数は ${primes.join(', ')} の ${primes.length} 個。`,
  });

  function makeRow(n, flags) {
    const vs = [];
    for (let k = 2; k <= n; k++) vs.push(flags[k] ? '●' : k);
    return vs;
  }

  registerTopic('5.1', {
    title: '素数判定',
    explain: [
      '1 つの数 N が素数かどうかだけを調べるなら、2 から √N までの数で順に割ってみる「試し割り」で十分。N が √N より大きい約数を持つなら、対応する N/√N より小さい約数も必ず存在するので、√N まで調べれば足りる。計算量は O(√N)。',
      '一方、2〜N の範囲の素数を「全部」まとめて求めたいときは、1 つずつ試し割りすると重い。そこで使うのが「エラトステネスの篩（ふるい）」。小さい素数 i を見つけるたびに、i×i, i×i+i, i×i+2i, … と i の倍数をまとめて「合成数」に印を付けて消していく。最後まで消されなかった数がすべて素数になる。',
      '篩は全体で O(N log log N) 程度とかなり速く、複数のクエリに答える問題で特に有効。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<bool> is_composite(n + 1, false);',
      '  for (int i = 2; (long long)i * i <= n; i++) {',
      '    if (is_composite[i]) continue;',
      '    for (int j = i * i; j <= n; j += i) is_composite[j] = true;',
      '  }',
      '  int cnt = 0;',
      '  for (int i = 2; i <= n; i++) if (!is_composite[i]) cnt++;',
      '  cout << cnt << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '整数 N が与えられる。2 以上 N 以下の素数の個数を求めよ。',
      constraints: ['2 ≤ N ≤ 10^6'],
      samples: [{ input: '30', output: '10' }],
    },
    solution: {
      idea: 'N が 10^6 程度まであるので、1 つずつ試し割りすると重い（O(N√N)）。エラトステネスの篩で 2〜N の合成数をまとめて消し、消されなかった数を数える。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<bool> is_composite(n + 1, false);',
        '  for (int i = 2; (long long)i * i <= n; i++) {',
        '    if (is_composite[i]) continue;',
        '    for (int j = i * i; j <= n; j += i) is_composite[j] = true;',
        '  }',
        '  int cnt = 0;',
        '  for (int i = 2; i <= n; i++) if (!is_composite[i]) cnt++;',
        '  cout << cnt << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.2 最大公約数 ----
(function registerGcd() {
  let a = 48, b = 18;
  const steps = [];
  steps.push({ line: 4, vars: { a, b }, note: `a = ${a}, b = ${b} から始める。` });
  while (b !== 0) {
    const r = a % b;
    steps.push({ line: 5, vars: { a, b, r }, note: `a を b で割った余り r = ${a} % ${b} = ${r} を求める。` });
    steps.push({ line: 6, vars: { a: b, b: r }, note: `(a, b) を (b, r) = (${b}, ${r}) に更新する。` });
    a = b; b = r;
  }
  steps.push({ line: 8, vars: { gcd: a }, note: `b が 0 になったら止まる。そのときの a = ${a} が最大公約数。` });

  registerTopic('5.2', {
    title: '最大公約数',
    explain: [
      '2 つの整数 a, b（a ≥ b）の最大公約数は、「a を b で割った余り r」を使うと gcd(a, b) = gcd(b, r) という関係が成り立つ。これを繰り返し、片方が 0 になったときのもう片方が最大公約数になる（ユークリッドの互除法）。',
      'なぜこれで求まるかというと、a と b の公約数は、a - b（= b で何回か引いた余り r）の公約数とも一致するから。余りを取るたびに数はどんどん小さくなるので、少ない回数で 0 にたどり着く（計算量は O(log(min(a,b)))）。',
      '最小公倍数（LCM）は a × b / gcd(a, b) で求まる（先に割ってからかけると、積が大きくなりすぎるのを防げる）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'long long gcd_(long long a, long long b) {',
      '  while (b != 0) {',
      '    long long r = a % b;',
      '    a = b; b = r;',
      '  }',
      '  return a;',
      '}',
      'int main() {',
      '  long long a, b; cin >> a >> b;',
      '  cout << gcd_(a, b) << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '2 つの正整数 A, B が与えられる。A と B の最大公約数と最小公倍数を、この順に出力せよ。',
      constraints: ['1 ≤ A, B ≤ 10^9'],
      samples: [{ input: '48 18', output: '6 144' }],
    },
    solution: {
      idea: 'ユークリッドの互除法で gcd(A, B) を求める。最小公倍数は A / gcd × B と、先に割ってからかけてオーバーフローを避ける。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'long long gcd_(long long a, long long b) {',
        '  while (b != 0) {',
        '    long long r = a % b;',
        '    a = b; b = r;',
        '  }',
        '  return a;',
        '}',
        'int main() {',
        '  long long a, b; cin >> a >> b;',
        '  long long g = gcd_(a, b);',
        '  long long l = a / g * b;',
        '  cout << g << " " << l << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.3 余りの計算(1)基本 ----
(function registerModBasic() {
  const MOD = 1000000007;
  const a = [12, 7, 15, 9];
  let sumMod = 0;
  let prodMod = 1;
  const steps = [];
  for (let i = 0; i < a.length; i++) {
    const beforeSum = sumMod;
    sumMod = (sumMod + a[i]) % MOD;
    steps.push({
      line: 10, vars: { i, 'a[i]': a[i], sumMod },
      array: { label: 'a', values: a, hl: [i] },
      note: `sum = (${beforeSum} + ${a[i]}) % MOD = ${sumMod}。足すたびに mod を取るので、sum は MOD 未満のまま大きくならない。`,
    });
    const beforeProd = prodMod;
    prodMod = (prodMod * a[i]) % MOD;
    steps.push({
      line: 11, vars: { i, 'a[i]': a[i], prodMod },
      array: { label: 'a', values: a, hl: [i] },
      note: `prod = (${beforeProd} × ${a[i]}) % MOD = ${prodMod}。掛けるたびに mod を取らないと long long でもあふれてしまう。`,
    });
  }

  registerTopic('5.3', {
    title: '余りの計算(1)基本',
    explain: [
      '「X を MOD で割った余りを求めよ」という問題では、答えを計算の最後でまとめて mod するのではなく、足し算・引き算・掛け算をする「たびに」mod を取るのが基本。そうすれば値が MOD 未満に保たれ、桁あふれしない。',
      '足し算・掛け算は mod を取っても結果は変わらない：(A + B) % M = ((A % M) + (B % M)) % M、(A × B) % M = ((A % M) × (B % M)) % M。引き算は結果が負になることがあるので、(A - B % M + M) % M のように M を足してから mod するとよい。',
      '割り算だけは単純に mod を取れない（次の §5.5 で「逆元」を使う方法を扱う）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long MOD = 1000000007;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> a(n);',
      '  long long sum = 0, prod = 1;',
      '  for (int i = 0; i < n; i++) {',
      '    cin >> a[i];',
      '    sum = (sum + a[i]) % MOD;',
      '    prod = (prod * a[i]) % MOD;',
      '  }',
      '  cout << sum << " " << prod << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の整数からなる数列 a が与えられる。a の総和と総積を、それぞれ 10^9 + 7 で割った余りで出力せよ。',
      constraints: ['1 ≤ N ≤ 10^5', '1 ≤ a_i ≤ 10^9'],
      samples: [{ input: '4\n12 7 15 9', output: '43 11340' }],
    },
    solution: {
      idea: '総和・総積のどちらも、1 要素足す／掛けるたびに MOD で割った余りに直しておけば、long long の範囲を超えない。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long MOD = 1000000007;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> a(n);',
        '  long long sum = 0, prod = 1;',
        '  for (int i = 0; i < n; i++) {',
        '    cin >> a[i];',
        '    sum = (sum + a[i]) % MOD;',
        '    prod = (prod * a[i]) % MOD;',
        '  }',
        '  cout << sum << " " << prod << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.4 余りの計算(2)累乗 ----
(function registerModPow() {
  const MOD = 1000000007;
  let base = 3, exp = 13;
  let result = 1;
  let cur = base % MOD;
  let e = exp;
  const steps = [];
  const bits = e.toString(2).split('').map(Number);
  steps.push({ line: 5, vars: { base, exp, result }, note: `${base}^${exp} mod ${MOD} を求める。exp を 2 進法で見ると ${bits.join('')}。` });
  while (e > 0) {
    const bit = e & 1;
    steps.push({ line: 7, vars: { e, bit, result, cur }, note: `exp の最下位ビットは ${bit}。` });
    if (bit) {
      const before = result;
      result = (result * cur) % MOD;
      steps.push({ line: 8, vars: { e, bit, result, cur }, note: `ビットが 1 なので、result に今の底を掛ける: result = (${before} × ${cur}) % MOD = ${result}。` });
    }
    const beforeCur = cur;
    cur = (cur * cur) % MOD;
    steps.push({ line: 9, vars: { e, cur }, note: `底を 2 乗して次の桁に備える: cur = (${beforeCur} × ${beforeCur}) % MOD = ${cur}。` });
    e >>= 1;
    steps.push({ line: 10, vars: { e }, note: `exp を右に 1 ビットずらす（2 で割る）: e = ${e}。` });
  }
  steps.push({ line: 12, vars: { result }, note: `exp が 0 になったら終わり。答えは ${result}。` });

  registerTopic('5.4', {
    title: '余りの計算(2)累乗',
    explain: [
      'a^n を求めるのに a を n 回掛けると O(n) かかる。n が 10^9 のように大きいと間に合わない。そこで「繰り返し二乗法（高速累乗法）」を使うと O(log n) で求まる。',
      '考え方は、n を 2 進法で見ること。a^n は、n のビットが 1 の桁に対応する a^1, a^2, a^4, a^8, … を掛け合わせたものになる。a^(2^k) は a^(2^(k-1)) を 2 乗するだけで次々作れるので、ループのたびに底を 2 乗し、ビットが 1 のときだけ答えに掛け込めばよい。',
      '掛け算のたびに mod を取れば、答えも計算の途中の値も MOD 未満に収まる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long MOD = 1000000007;',
      'long long modpow(long long a, long long n) {',
      '  long long result = 1;',
      '  a %= MOD;',
      '  while (n > 0) {',
      '    if (n & 1) result = result * a % MOD;',
      '    a = a * a % MOD;',
      '    n >>= 1;',
      '  }',
      '  return result;',
      '}',
      'int main() {',
      '  long long a, n; cin >> a >> n;',
      '  cout << modpow(a, n) << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '整数 A, N が与えられる。A^N を 10^9 + 7 で割った余りを求めよ。',
      constraints: ['1 ≤ A ≤ 10^9', '1 ≤ N ≤ 10^18'],
      samples: [{ input: '3 13', output: '1594323' }],
    },
    solution: {
      idea: 'N が最大 10^18 なので、そのまま N 回掛けるのは不可能。繰り返し二乗法で O(log N) 回の掛け算に抑える。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long MOD = 1000000007;',
        'long long modpow(long long a, long long n) {',
        '  long long result = 1;',
        '  a %= MOD;',
        '  while (n > 0) {',
        '    if (n & 1) result = result * a % MOD;',
        '    a = a * a % MOD;',
        '    n >>= 1;',
        '  }',
        '  return result;',
        '}',
        'int main() {',
        '  long long a, n; cin >> a >> n;',
        '  cout << modpow(a, n) << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.5 余りの計算(3)割り算 ----
(function registerModInv() {
  const MOD = 13; // 小さい素数で計算の流れを追いやすくする
  function modpow(a, n, mod) {
    let r = 1; a %= mod;
    while (n > 0) { if (n & 1) r = r * a % mod; a = a * a % mod; n >>= 1; }
    return r;
  }
  const N = 5, R = 2;
  const steps = [];
  steps.push({ line: 13, vars: { N, R, p: MOD }, note: `C(${N}, ${R}) mod ${MOD} を求める。まず階乗 fact[0..N] を作る。` });

  const fact = [1];
  for (let i = 1; i <= N; i++) {
    fact.push((fact[i - 1] * i) % MOD);
    steps.push({
      line: 16, vars: { i },
      array: { label: 'fact', values: [...fact], hl: [i] },
      note: `fact[${i}] = fact[${i - 1}] × ${i} % p = ${fact[i]}。`,
    });
  }

  steps.push({ line: 17, vars: { 'fact[N]': fact[N] }, array: { label: 'fact', values: [...fact], hl: [N] }, note: `fact[N] の逆元を「フェルマーの小定理」で求める: p が素数なら a^(p-1) ≡ 1 (mod p) なので、a^(p-2) が a の逆元になる。これは §5.4 の繰り返し二乗法で計算できる。` });
  const invFactN = modpow(fact[N], MOD - 2, MOD);
  steps.push({ line: 17, vars: { 'fact[N]^(p-2) % p': invFactN }, note: `inv_fact[N] = fact[N]^(p-2) % p = ${invFactN}。(fact[N] × inv_fact[N]) % p = ${(fact[N] * invFactN) % MOD} になっているはず（= 1 なら逆元として正しい）。` });

  const invFact = new Array(N + 1);
  invFact[N] = invFactN;
  for (let i = N; i >= 1; i--) {
    invFact[i - 1] = (invFact[i] * i) % MOD;
    steps.push({
      line: 18, vars: { i },
      array: { label: 'inv_fact', values: invFact.map((v) => (v === undefined ? '-' : v)), hl: [i - 1] },
      note: `inv_fact[${i - 1}] = inv_fact[${i}] × ${i} % p = ${invFact[i - 1]}（fact[i] = fact[i-1] × i だったことの逆をたどる）。`,
    });
  }

  const ans = (((fact[N] * invFact[R]) % MOD) * invFact[N - R]) % MOD;
  steps.push({
    line: 19, vars: { 'fact[N]': fact[N], 'inv_fact[R]': invFact[R], 'inv_fact[N-R]': invFact[N - R], ans },
    note: `C(N, R) = fact[N] × inv_fact[R] × inv_fact[N-R] % p = ${ans}。`,
  });

  registerTopic('5.5', {
    title: '余りの計算(3)割り算',
    explain: [
      '「A ÷ B の余り」は、単純に (A % p) / (B % p) としても正しい答えにならない。mod の世界で割り算をするには「B の逆元」、つまり掛けると 1 になる数 B⁻¹ を求め、割る代わりに掛ける。',
      'p が素数のとき、フェルマーの小定理より B^(p-1) ≡ 1 (mod p) が成り立つ。両辺を B で割ると B^(p-2) ≡ B⁻¹ (mod p) となるので、逆元は §5.4 の繰り返し二乗法で B^(p-2) mod p を計算するだけで求まる。',
      'この逆元を使うと nCr mod p も求められる。nCr = n! / (r! (n-r)!) なので、階乗 fact[] をすべて前計算し、割る部分は逆元 inv_fact[] を掛けることで求める。inv_fact は一番大きい inv_fact[N] だけ逆元計算（高速累乗）で求め、残りは inv_fact[i-1] = inv_fact[i] × i % p で 1 つずつ安く求められる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'long long modpow(long long a, long long e, long long p) {',
      '  long long r = 1; a %= p;',
      '  while (e > 0) {',
      '    if (e & 1) r = r * a % p;',
      '    a = a * a % p;',
      '    e >>= 1;',
      '  }',
      '  return r;',
      '}',
      'int main() {',
      '  long long n, r, p; cin >> n >> r >> p;',
      '  vector<long long> fact(n + 1), inv_fact(n + 1);',
      '  fact[0] = 1;',
      '  for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % p;',
      '  inv_fact[n] = modpow(fact[n], p - 2, p);',
      '  for (int i = n; i >= 1; i--) inv_fact[i - 1] = inv_fact[i] * i % p;',
      '  long long ans = fact[n] * inv_fact[r] % p * inv_fact[n - r] % p;',
      '  cout << ans << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '整数 N, R と素数 P が与えられる。N 個から R 個選ぶ組み合わせの数 nCr を P で割った余りを求めよ。',
      constraints: ['1 ≤ R ≤ N ≤ 1000', 'P は素数で 1000 ≤ P ≤ 10^9 + 7'],
      samples: [{ input: '5 2 13', output: '10' }],
    },
    solution: {
      idea: '階乗 fact[0..N] を前計算し、fact[N] の逆元だけフェルマーの小定理（繰り返し二乗法）で求める。残りの逆元 inv_fact[i] は inv_fact[i] = inv_fact[i+1] × (i+1) % p で後ろから安く求まる（除算なしに逆元の列が作れる）。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'long long modpow(long long a, long long e, long long p) {',
        '  long long r = 1; a %= p;',
        '  while (e > 0) {',
        '    if (e & 1) r = r * a % p;',
        '    a = a * a % p;',
        '    e >>= 1;',
        '  }',
        '  return r;',
        '}',
        'int main() {',
        '  long long n, r, p; cin >> n >> r >> p;',
        '  vector<long long> fact(n + 1), inv_fact(n + 1);',
        '  fact[0] = 1;',
        '  for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % p;',
        '  inv_fact[n] = modpow(fact[n], p - 2, p);',
        '  for (int i = n; i >= 1; i--) inv_fact[i - 1] = inv_fact[i] * i % p;',
        '  long long ans = fact[n] * inv_fact[r] % p * inv_fact[n - r] % p;',
        '  cout << ans << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.6 包除原理 ----
(function registerInclusionExclusion() {
  const N = 30, A = 3, B = 5;
  const steps = [];
  function lcm(x, y) {
    let a = x, b = y;
    while (b !== 0) { const r = a % b; a = b; b = r; }
    return x / a * y;
  }
  const cntA = Math.floor(N / A);
  steps.push({ line: 6, vars: { N, A, 'N/A': cntA }, note: `1〜${N} のうち A = ${A} の倍数は floor(${N}/${A}) = ${cntA} 個。` });
  const cntB = Math.floor(N / B);
  steps.push({ line: 7, vars: { N, B, 'N/B': cntB }, note: `同様に B = ${B} の倍数は floor(${N}/${B}) = ${cntB} 個。` });
  const l = lcm(A, B);
  const cntAB = Math.floor(N / l);
  steps.push({ line: 9, vars: { A, B, lcm: l, 'N/lcm': cntAB }, note: `A と B の最小公倍数は ${l}（これの倍数は「A の倍数でも B の倍数でもある」数）。1〜${N} にはその倍数が floor(${N}/${l}) = ${cntAB} 個ある。` });
  const ans = cntA + cntB - cntAB;
  steps.push({
    line: 10, vars: { cntA, cntB, cntAB, ans },
    note: `「A の倍数」と「B の倍数」を単純に足すと、両方の倍数（lcm の倍数）を 2 回数えてしまう。1 回分を引いて ans = ${cntA} + ${cntB} - ${cntAB} = ${ans}。`,
  });

  registerTopic('5.6', {
    title: '包除原理',
    explain: [
      '「条件 X を満たすもの」と「条件 Y を満たすもの」の個数を足すと、両方満たすものを 2 回数えてしまう。正しい個数は |X| + |Y| - |X かつ Y| になる。これが包除原理（2 つの場合）。',
      '例えば「1〜N のうち A の倍数、または B の倍数であるものの個数」を求めたいとき、A の倍数の個数と B の倍数の個数を単純に足すと、A と B の最小公倍数（lcm）の倍数を二重に数えてしまう。その分を 1 回引けばよい。',
      '3 つ以上の条件になると、|X|+|Y|+|Z| - |X∩Y| - |Y∩Z| - |Z∩X| + |X∩Y∩Z| のように「奇数個の共通部分は足し、偶数個の共通部分は引く」を繰り返す（符号が交互に反転するのが名前の由来）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'long long gcd_(long long a, long long b) { while (b) { long long r = a % b; a = b; b = r; } return a; }',
      'int main() {',
      '  long long n, a, b; cin >> n >> a >> b;',
      '  long long cnt_a = n / a;',
      '  long long cnt_b = n / b;',
      '  long long l = a / gcd_(a, b) * b;',
      '  long long cnt_ab = n / l;',
      '  cout << (cnt_a + cnt_b - cnt_ab) << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '整数 N, A, B が与えられる。1 以上 N 以下の整数のうち、A の倍数または B の倍数であるものの個数を求めよ。',
      constraints: ['1 ≤ N ≤ 10^9', '1 ≤ A, B ≤ 10^6'],
      samples: [{ input: '30 3 5', output: '14' }],
    },
    solution: {
      idea: '「A の倍数の個数」+「B の倍数の個数」-「A と B の公倍数（lcm の倍数）の個数」を包除原理で計算する。lcm は gcd から求める。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'long long gcd_(long long a, long long b) { while (b) { long long r = a % b; a = b; b = r; } return a; }',
        'int main() {',
        '  long long n, a, b; cin >> n >> a >> b;',
        '  long long cnt_a = n / a;',
        '  long long cnt_b = n / b;',
        '  long long l = a / gcd_(a, b) * b;',
        '  long long cnt_ab = n / l;',
        '  cout << (cnt_a + cnt_b - cnt_ab) << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.7 ゲーム(1)必勝法 ----
(function registerGameWinLose() {
  const N = 10;
  const moves = [1, 2, 3];
  const win = new Array(N + 1).fill(false);
  const steps = [];
  function row(upTo) {
    return Array.from({ length: upTo + 1 }, (_, i) => (i <= upTo ? (win[i] ? '勝' : '負') : ''));
  }
  steps.push({ line: 6, vars: { N }, array: { label: '石が i 個残っているときの手番側の勝敗', values: [], hl: [] }, note: `石が ${N} 個あり、1 回に ${moves.join('・')} 個のいずれかを取れる。最後の石を取った方が勝ち。石が 0 個のときは手番側の負け（win[0] = 負）。` });
  for (let i = 1; i <= N; i++) {
    let w = false;
    const checked = [];
    for (const m of moves) {
      if (i - m >= 0) {
        checked.push({ m, from: i - m, winFrom: win[i - m] });
        if (!win[i - m]) w = true;
      }
    }
    win[i] = w;
    const desc = checked.map((c) => `i-${c.m}=${c.from}(${c.winFrom ? '勝' : '負'})`).join(', ');
    steps.push({
      line: 9, vars: { i, result: w ? '勝' : '負' },
      array: { label: '石が i 個残っているときの手番側の勝敗', values: row(i).map((v, idx) => (idx <= i ? v : '')), hl: [i] },
      note: `i = ${i}: 移動先 ${desc} のうち、相手が「負け」になる i-m が${w ? '' : '見つからない → win[i] は負'}${w ? 'ある → win[i] は勝' : ''}。`,
    });
  }

  registerTopic('5.7', {
    title: 'ゲーム(1)必勝法',
    explain: [
      '石取りゲームのような「2 人が交互に操作し、操作できなくなった方が負け」というゲームは、小さい状態から順に「勝ち」か「負け」かを表に埋めていくと解ける。',
      'ある状態が「勝ち」なのは、そこから 1 手で移動できる状態の中に「負け」の状態が 1 つでもあるとき（相手を負けの状態に追い込めるから）。逆に、移動先がすべて「勝ち」の状態しかないなら、自分はどう動いても相手を勝たせてしまうので「負け」になる。',
      'これは動的計画法と同じ考え方で、状態数が少なければ表を埋めるだけで必勝法が分かる。状態数が多い場合は、次の §5.8・§5.9 のように、もっと速く判定できる特別な形（ニム・Grundy 数）を使う。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<int> moves = {1, 2, 3};',
      '  vector<bool> win(n + 1, false);',
      '  for (int i = 1; i <= n; i++) {',
      '    for (int m : moves) {',
      '      if (i - m >= 0 && !win[i - m]) win[i] = true;',
      '    }',
      '  }',
      '  cout << (win[n] ? "First" : "Second") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の石の山がある。2 人が交互に、1 個・2 個・3 個のいずれかを取る。最後の石を取った方が勝ち。先手と後手が最善を尽くすとき、どちらが勝つか判定せよ。',
      constraints: ['1 ≤ N ≤ 10^5'],
      samples: [{ input: '10', output: 'First' }, { input: '4', output: 'Second' }],
    },
    solution: {
      idea: '石が i 個残っているときに手番側が勝てるかを win[i] として、小さい i から順に埋める。win[i] は、i から 1・2・3 個取った先 i-m のいずれかが「負け」なら true。win[0] = false（取る石がなく負け）から始める。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<int> moves = {1, 2, 3};',
        '  vector<bool> win(n + 1, false);',
        '  for (int i = 1; i <= n; i++) {',
        '    for (int m : moves) {',
        '      if (i - m >= 0 && !win[i - m]) win[i] = true;',
        '    }',
        '  }',
        '  cout << (win[n] ? "First" : "Second") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.8 ゲーム(2)ニム ----
(function registerNim() {
  const piles = [3, 4, 5];
  let xorAll = 0;
  const steps = [];
  steps.push({ line: 5, vars: { xorAll }, array: { label: '山（石の数）', values: piles, hl: [] }, note: `山が ${piles.length} 個、それぞれ ${piles.join(', ')} 個の石がある。各山から好きな数だけ（1 個以上）取れ、最後の石を取った方が勝ち（ニム）。` });
  for (let i = 0; i < piles.length; i++) {
    const before = xorAll;
    xorAll ^= piles[i];
    steps.push({
      line: 8, vars: { i, 'piles[i]': piles[i], xorAll },
      array: { label: '山（石の数）', values: piles, hl: [i] },
      note: `xor = ${before} XOR ${piles[i]} = ${xorAll}（2 進法: ${before.toString(2)} ^ ${piles[i].toString(2)} = ${xorAll.toString(2)}）。`,
    });
  }
  steps.push({ line: 10, vars: { xorAll }, note: `全部の山の XOR（= ニム和）が ${xorAll}。${xorAll !== 0 ? '0 でないので先手必勝。' : '0 なので後手必勝。'}` });

  registerTopic('5.8', {
    title: 'ゲーム(2)ニム',
    explain: [
      'ニムは「いくつかの山があり、各ターンに 1 つの山を選んで好きな数（1 個以上）取り、最後の石を取った方が勝ち」というゲーム。§5.7 のように状態を全部表にするのは山の数・石の数が多いと大変だが、ニムには「すべての山の個数の XOR（ニム和）」だけ見れば勝敗が分かるという定理がある。',
      '定理: ニム和が 0 でなければ先手必勝、0 なら後手必勝。直感的には、ニム和が 0 でないときは「どれか 1 つの山を減らしてニム和を 0 に戻す」手が必ず存在し、逆にニム和が 0 の状態からはどう 1 手打ってもニム和が 0 でなくなってしまう（0 の状態を保ち続けられるのは今ニム和が 0 でない側だけ）。',
      'XOR は各ビットを独立に計算でき、足し算のように繰り上がりがないので、全部の山をまとめて 1 回の計算で判定できる（O(山の数)）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  int x = 0;',
      '  for (int i = 0; i < n; i++) {',
      '    int a; cin >> a;',
      '    x ^= a;',
      '  }',
      '  cout << (x != 0 ? "First" : "Second") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の山があり、i 番目の山には a_i 個の石がある。2 人が交互に、1 つの山を選んでそこから 1 個以上好きな数の石を取る。最後の石を取った方が勝ち。先手と後手が最善を尽くすとき、どちらが勝つか判定せよ。',
      constraints: ['1 ≤ N ≤ 10^5', '1 ≤ a_i ≤ 10^9'],
      samples: [{ input: '3\n3 4 5', output: 'First' }, { input: '2\n3 3', output: 'Second' }],
    },
    solution: {
      idea: '全部の山の石の個数の XOR（ニム和）を求め、0 でなければ先手必勝、0 なら後手必勝というニムの定理をそのまま使う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  int x = 0;',
        '  for (int i = 0; i < n; i++) {',
        '    int a; cin >> a;',
        '    x ^= a;',
        '  }',
        '  cout << (x != 0 ? "First" : "Second") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.9 ゲーム(3)Grundy数 ----
(function registerGrundy() {
  const MAXN = 6;
  const moves = [1, 2];
  const grundy = new Array(MAXN + 1).fill(0);
  const steps = [];
  steps.push({ line: 6, vars: { 'moves': `{${moves.join(',')}}` }, array: { label: 'grundy[i]（1 山・1 個/2 個取りゲーム）', values: [0], hl: [0] }, note: `石が 0 個（手番側が動けない）の Grundy 数は 0。各石の山の「勝ち筋の強さ」を Grundy 数という 1 つの数に変換すると、§5.8 のニムと同じように XOR で組み合わせて判定できる。` });
  for (let i = 1; i <= MAXN; i++) {
    const reach = new Set();
    for (const m of moves) if (i - m >= 0) reach.add(grundy[i - m]);
    let mex = 0;
    while (reach.has(mex)) mex++;
    grundy[i] = mex;
    steps.push({
      line: 12, vars: { i, '移動先のgrundy集合': `{${[...reach].sort((a, b) => a - b).join(',')}}`, mex },
      array: { label: 'grundy[i]（1 山・1 個/2 個取りゲーム）', values: grundy.slice(0, i + 1), hl: [i] },
      note: `i = ${i}: 1 手で移動できる先の Grundy 数の集合は {${[...reach].sort((a, b) => a - b).join(',')}}。そこに含まれない最小の非負整数（mex）が grundy[${i}] = ${mex}。`,
    });
  }
  const pileSizes = [3, 4, 5];
  let xorAll = 0;
  for (const s of pileSizes) xorAll ^= grundy[s];
  steps.push({
    line: 16, vars: { xorAll },
    array: { label: `独立な山 {${pileSizes.join(',')}} の Grundy 数`, values: pileSizes.map((s) => grundy[s]), hl: [] },
    note: `山が複数あり、それぞれ独立に同じルールで遊べるときは、各山の Grundy 数の XOR を取れば全体の勝敗が分かる（§5.8 のニムは、どの山も「1 個以上好きな数取れる」ので grundy[i] = i になる特別な場合）。XOR = ${xorAll}。${xorAll !== 0 ? '0 でないので先手必勝。' : '0 なので後手必勝。'}`,
  });

  registerTopic('5.9', {
    title: 'ゲーム(3)Grundy数',
    explain: [
      'ニムは「1 個以上好きな数を取れる」という特別なルールだったが、「1 個か 2 個しか取れない」のように移動のルールが違うゲームでも、同じように XOR で勝敗を判定したい。そこで使うのが Grundy 数（グランディ数）。',
      '状態 i の Grundy 数 grundy[i] は、「i から 1 手で移動できる先の Grundy 数の集合」に含まれない最小の非負整数（mex: minimum excludant）として定義する。grundy[i] = 0 の状態は「負け」の状態（§5.7 の win[i] = 負 に対応）。',
      '複数の独立なゲーム（山）を同時に遊び、どれか 1 つを選んで操作する形のゲーム全体では、各ゲームの Grundy 数の XOR が 0 なら後手必勝、0 でなければ先手必勝になる（Sprague-Grundy の定理）。ニムで grundy[i] = i になるのは「移動先が 0〜i-1 を全部作れる」特別な場合に当たる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int maxn; cin >> maxn;',
      '  vector<int> moves = {1, 2};',
      '  vector<int> grundy(maxn + 1, 0);',
      '  for (int i = 1; i <= maxn; i++) {',
      '    set<int> reach;',
      '    for (int m : moves) if (i - m >= 0) reach.insert(grundy[i - m]);',
      '    int mex = 0;',
      '    while (reach.count(mex)) mex++;',
      '    grundy[i] = mex;',
      '  }',
      '  int k; cin >> k;',
      '  int x = 0;',
      '  for (int j = 0; j < k; j++) { int a; cin >> a; x ^= grundy[a]; }',
      '  cout << (x != 0 ? "First" : "Second") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'K 個の独立な山があり、i 番目の山には a_i 個の石がある。2 人が交互に、1 つの山を選んでそこから 1 個か 2 個の石を取る（選んだ山に石がなければその山は選べない）。最後の石を取った方が勝ち。先手と後手が最善を尽くすとき、どちらが勝つか判定せよ。',
      constraints: ['1 ≤ K ≤ 100', '1 ≤ a_i ≤ 1000'],
      samples: [{ input: '3\n3 4 5', output: 'First' }],
    },
    solution: {
      idea: '1 個か 2 個取れる 1 山のゲームの Grundy 数を、石の数の小さい方から mex で前計算する（grundy[i] は実は i % 3 の周期になる）。各山の Grundy 数の XOR を取り、0 でなければ先手必勝。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int k; cin >> k;',
        '  vector<int> a(k);',
        '  int maxn = 0;',
        '  for (auto &x : a) { cin >> x; maxn = max(maxn, x); }',
        '  vector<int> moves = {1, 2};',
        '  vector<int> grundy(maxn + 1, 0);',
        '  for (int i = 1; i <= maxn; i++) {',
        '    set<int> reach;',
        '    for (int m : moves) if (i - m >= 0) reach.insert(grundy[i - m]);',
        '    int mex = 0;',
        '    while (reach.count(mex)) mex++;',
        '    grundy[i] = mex;',
        '  }',
        '  int x = 0;',
        '  for (int v : a) x ^= grundy[v];',
        '  cout << (x != 0 ? "First" : "Second") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 5.10 チャレンジ問題 ----
(function registerChallenge() {
  const MOD = 1000000007;
  const a = [48, 18, 30];
  const steps = [];
  let g = a[0];
  steps.push({ line: 10, vars: { g }, array: { label: 'a', values: a, hl: [0] }, note: `まず g = a[0] = ${g} から始める。` });
  for (let i = 1; i < a.length; i++) {
    let x = g, y = a[i];
    steps.push({ line: 11, vars: { i, g, 'a[i]': a[i] }, array: { label: 'a', values: a, hl: [i] }, note: `g = ${g} と a[${i}] = ${a[i]} の最大公約数を求める（ユークリッドの互除法。gcd_ は §5.2 と同じ中身を 1 行にまとめたもの）。` });
    while (y !== 0) {
      const r = x % y;
      steps.push({ line: 4, vars: { x, y, r }, note: `gcd_ の中では ${x} % ${y} = ${r} → (x, y) を (${y}, ${r}) に更新、を繰り返している。` });
      x = y; y = r;
    }
    g = x;
    steps.push({ line: 11, vars: { i, g }, array: { label: 'a', values: a, hl: [i] }, note: `gcd(旧 g, a[${i}]) = ${g}。これが新しい g。` });
  }
  steps.push({ line: 11, vars: { G: g }, note: `全部の要素の最大公約数は G = ${g}。` });
  function modpow(base, exp, mod) {
    let r = 1; base %= mod;
    while (exp > 0) { if (exp & 1) r = r * base % mod; base = base * base % mod; exp >>= 1; }
    return r;
  }
  const ans = modpow(2, g, MOD);
  steps.push({ line: 12, vars: { G: g, ans }, note: `答えは 2^G mod (10^9+7)。G = ${g} は小さいのでそのまま計算すると 2^${g} = ${ans}。` });

  registerTopic('5.10', {
    title: 'チャレンジ問題',
    explain: [
      'この章の技法を組み合わせる問題。「N 個の整数すべての最大公約数 G を求め、2^G を 10^9+7 で割った余りを出力せよ」という問題を考える。',
      '最大公約数は 2 個ずつユークリッドの互除法を適用すればよい（gcd(a, b, c) = gcd(gcd(a, b), c)）。求まった G に対して 2^G を求める部分は §5.4 の繰り返し二乗法（G が大きくても O(log G) で求まる）を使う。',
      '「まず数の性質（gcd）で問題を小さい 1 つの数に落とし、その数を使って mod の計算をする」という組み立ては、数学的問題の典型的な流れ。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long MOD = 1000000007;',
      'long long gcd_(long long a, long long b) { while (b) { long long r = a % b; a = b; b = r; } return a; }',
      'long long modpow(long long a, long long e) { long long r = 1; a %= MOD; while (e > 0) { if (e & 1) r = r * a % MOD; a = a * a % MOD; e >>= 1; } return r; }',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  long long g = a[0];',
      '  for (int i = 1; i < n; i++) g = gcd_(g, a[i]);',
      '  cout << modpow(2, g) << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の整数からなる数列 a が与えられる。a 全体の最大公約数を G とするとき、2^G を 10^9 + 7 で割った余りを出力せよ。',
      constraints: ['2 ≤ N ≤ 10^5', '1 ≤ a_i ≤ 10^9'],
      samples: [{ input: '3\n48 18 30', output: '64' }],
    },
    solution: {
      idea: 'gcd を数列全体に左から累積で適用して G を求め（gcd(a,b,c) = gcd(gcd(a,b),c)）、2^G mod (10^9+7) を繰り返し二乗法で求める。G ≤ 10^9 なので愚直な掛け算では間に合わず、必ず高速累乗を使う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long MOD = 1000000007;',
        'long long gcd_(long long a, long long b) { while (b) { long long r = a % b; a = b; b = r; } return a; }',
        'long long modpow(long long a, long long e) { long long r = 1; a %= MOD; while (e > 0) { if (e & 1) r = r * a % MOD; a = a * a % MOD; e >>= 1; } return r; }',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  long long g = a[0];',
        '  for (int i = 1; i < n; i++) g = gcd_(g, a[i]);',
        '  cout << modpow(2, g) << endl;',
        '}',
      ].join('\n'),
    },
  });
})();
