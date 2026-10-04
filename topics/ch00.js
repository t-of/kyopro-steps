'use strict';
// 序章 競技プログラミング入門
// ステップ図のフレームは、実際の処理を下の register* 関数内で JS で動かして作る（手計算のミスを防ぐため）。

// ---- jo.1 競技プログラミングとは ----
(function registerWhatIs() {
  const a = 3, b = 5;
  const steps = [];
  steps.push({ line: 4, vars: {}, note: '標準入力から整数を読み込む準備をする。' });
  steps.push({ line: 4, vars: { a }, note: `1 つ目の整数 a = ${a} を読み込んだ。` });
  steps.push({ line: 4, vars: { a, b }, note: `2 つ目の整数 b = ${b} を読み込んだ。` });
  const sum = a + b;
  steps.push({ line: 5, vars: { a, b, sum }, note: `a + b = ${sum} を計算した。` });
  steps.push({ line: 5, vars: { sum }, note: `標準出力に ${sum} を書き出す。これをジャッジ（採点システム）が正解と比べ、合っていれば AC（Accepted）になる。` });

  registerTopic('jo.1', {
    title: '競技プログラミングとは',
    explain: [
      '競技プログラミングは、与えられた「問題文」を読み、それを解くプログラムを書いて提出する競技。プログラムは標準入力からデータを受け取り、標準出力に答えを書き出す形が多い。',
      '提出すると、ジャッジ（採点システム）がプログラムを複数のテストケースで実行し、結果を判定する。代表的な結果に AC（Accepted、正解）、WA（Wrong Answer、不正解）、TLE（Time Limit Exceeded、制限時間内に終わらない）、RE（Runtime Error、実行時エラー）などがある。',
      'この本では、C++ でプログラムを書く前提で進める。ここでは、まず標準入力を読んで標準出力に書き出す、という一番基本の形に慣れておく。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int a, b; cin >> a >> b;',
      '  cout << a + b << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '標準入力から整数 A, B が与えられる。A + B を標準出力に出力せよ。',
      constraints: ['1 ≤ A, B ≤ 100'],
      samples: [{ input: '3 5', output: '8' }],
    },
    solution: {
      idea: '2 つの整数を変数に読み込み、足した結果をそのまま出力するだけ。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int a, b; cin >> a >> b;',
        '  cout << a + b << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- jo.2 どんなコンテストがあるか ----
(function registerContests() {
  const contests = ['ABC', 'ARC', 'AGC', 'AHC'];
  const hints = [
    '初心者から中級者向け。この本の技法は主に ABC を解ける力を目標にしている。',
    'ABC より難しい問題が中心。',
    '最も難しい部類のコンテスト。',
    'ヒューリスティック系（最適化の度合いを競う。§7章で扱う）。',
  ];
  const steps = contests.map((c, i) => ({
    line: 5, vars: { 種別: c },
    array: { label: 'AtCoder のコンテスト種別', values: contests, hl: [i] },
    note: `${c}: ${hints[i]}`,
  }));

  registerTopic('jo.2', {
    title: 'どんなコンテストがあるか',
    explain: [
      '日本語で参加しやすい競技プログラミングのサイトの代表が AtCoder。定期的にオンラインでコンテストが開かれ、順位表やレーティング（実力を表す数値）で自分の成長を確かめられる。',
      'AtCoder には難易度の違う複数のコンテスト種別がある。ABC（AtCoder Beginner Contest）は初心者から中級者向け、ARC（AtCoder Regular Contest）・AGC（AtCoder Grand Contest）はより難しい問題が中心。この本で扱っている技法（全探索・累積和・二分探索・DP・データ構造・グラフなど）は、主に ABC の問題を解く力をつけることを目標にしている。',
      'このほかに、最適化の度合いを競う「ヒューリスティック系」のコンテスト（AtCoder では AHC = AtCoder Heuristic Contest）もある（§7章で扱う）。正解がひとつに決まる問題とは違い、より良い解を時間内にどれだけ作れるかを競う。',
      'AtCoder 以外にも、企業や大学が主催するプログラミングコンテストや、海外の competitive programming サイトなど、さまざまな場がある。まずは 1 つのサイトに登録して、実際に問題を解いて提出してみるのが上達の近道。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  vector<string> contests = {"ABC", "ARC", "AGC", "AHC"};',
      '  for (auto &c : contests) cout << c << endl;',
      '}',
    ].join('\n'),
    steps,
  });
})();

// ---- jo.3 求められること ----
(function registerRequirements() {
  const budget = 100000000; // 1秒の目安
  const cases = [
    { n: 5000, note: '素朴な O(N²) でも 25,000,000 回程度で間に合う。' },
    { n: 200000, note: '素朴な O(N²) だと 400 億回を超えて間に合わない（TLE）。累積和や二分探索などで O(N log N) 以下に落とす必要がある。' },
  ];
  const steps = cases.map((c) => {
    const ops = c.n * c.n;
    const ok = ops <= budget;
    return { line: 5, vars: { N: c.n, '素朴な解法の操作回数(N²)': ops, '1秒で間に合うか': ok ? 'Yes' : 'No' }, note: c.note };
  });

  registerTopic('jo.3', {
    title: '求められること',
    explain: [
      '競技プログラミングの問題で求められることは大きく 2 つ、「正しさ」と「計算量」。',
      '正しさとは、与えられたすべての入力（問題文に書かれた制約の範囲すべて）に対して、正しい答えを出せること。手元で試した 1、2 個の例で合っていても、境界値（N が最小・最大のとき、配列が空のときなど）で間違えることがよくある。',
      '計算量とは、プログラムが実行時間制限内に終わること。正しいロジックでも、制約に対して遅すぎるアルゴリズムでは TLE になる。問題の制約（N の最大値など）を見て、どれくらいの計算量なら間に合うかを見積もる力が重要になる（§10.0 で詳しく扱う）。',
      'この本の各章では、「素朴に解くとどれくらいの計算量になるか」から始めて、それを落とすための技法を順番に見ていく。正しさと計算量の両方を満たして初めて、問題は「解けた」ことになる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  long long n; cin >> n;',
      '  long long ops = n * n; // 素朴な解法（O(N^2)）の操作回数',
      '  bool ok = ops <= 100000000; // 1秒の目安',
      '  cout << (ok ? "間に合う" : "間に合わない") << endl;',
      '}',
    ].join('\n'),
    steps,
  });
})();
