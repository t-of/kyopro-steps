'use strict';
// 4章 動的計画法
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* 関数で動かして作る（手計算のミスを防ぐため）。

// ---- 4.0 動的計画法とは ----
(function registerDpIntro() {
  const n = 5;
  const dp = new Array(n + 1).fill(0);
  const steps = [];
  steps.push({ line: 5, vars: { n }, array: { label: 'dp（i段目までの上り方の数）', values: [...dp] }, note: 'dp[i] を「ちょうど i 段上る方法の数」とする配列を、まず全部 0 で用意する。' });
  dp[0] = 1;
  steps.push({ line: 6, vars: { n }, array: { label: 'dp（i段目までの上り方の数）', values: [...dp], hl: [0] }, note: 'dp[0] = 1（0段は「何もしない」の1通り）。これが土台になる。' });
  if (n >= 1) {
    dp[1] = 1;
    steps.push({ line: 7, vars: { n }, array: { label: 'dp（i段目までの上り方の数）', values: [...dp], hl: [1] }, note: 'dp[1] = 1（1歩で1段上る1通り）。' });
  }
  for (let i = 2; i <= n; i++) {
    const a = dp[i - 1];
    const b = dp[i - 2];
    dp[i] = a + b;
    steps.push({
      line: 9, vars: { i, 'dp[i-1]': a, 'dp[i-2]': b },
      array: { label: 'dp（i段目までの上り方の数）', values: [...dp], hl: [i, i - 1, i - 2] },
      note: `i 段目への最後の一歩は「i-1 段目から1段」か「i-2 段目から2段」のどちらか。だから dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${a} + ${b} = ${dp[i]}。同じ dp[i-1], dp[i-2] を何度も使い回すのがポイント（これが「動的計画法」＝小さい答えを覚えておいて大きい答えを作る考え方）。`,
    });
  }
  steps.push({ line: 11, vars: { answer: dp[n] }, array: { label: 'dp（i段目までの上り方の数）', values: [...dp] }, note: `答えは dp[${n}] = ${dp[n]}。` });

  registerTopic('4.0', {
    title: '動的計画法とは',
    explain: [
      '動的計画法（DP）は、大きい問題を「小さい問題の答えを使って解ける形」に分解し、小さい方から順に答えを配列（dp 配列）に埋めていく方法。一度計算した答えは配列に残るので、同じ計算を何度もやり直さずに済む。',
      '全探索だと指数的に時間がかかる問題でも、「状態」の数が少なく、状態どうしのつながり（遷移）が単純なら、DP で状態の数 × 遷移の手間ぐらいの計算量に抑えられることが多い。',
      '以下は最も基本の形。i 段目までの上り方の数 dp[i] を、1 つ前・2 つ前の dp の値から作る。dp[i-1] や dp[i-2] はすでに表に書いてあるので、新しく計算し直す必要がない。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> dp(n + 1, 0);',
      '  dp[0] = 1;',
      '  if (n >= 1) dp[1] = 1;',
      '  for (int i = 2; i <= n; i++) {',
      '    dp[i] = dp[i - 1] + dp[i - 2];',
      '  }',
      '  cout << dp[n] << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 段の階段を上ろうとしている。1 回の動作で 1 段または 2 段のぼれる。ちょうど N 段目まで上る方法が何通りあるかを求めてください。',
      constraints: ['0 ≤ N ≤ 50', '入力はすべて整数'],
      input: 'N',
      output: '上る方法の数を出力してください。',
      samples: [
        { input: '5', output: '8' },
        { input: '0', output: '1', note: 'N = 0 なら「何もしない」の1通り。' },
      ],
    },
    solution: {
      idea: 'dp[i] を「ちょうど i 段上る方法の数」とすると、最後の一歩が 1 段か 2 段かで場合分けでき、dp[i] = dp[i-1] + dp[i-2]。dp[0] = dp[1] = 1 を初期値に、小さい i から順に埋める。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> dp(n + 1, 0);',
        '  dp[0] = 1;',
        '  if (n >= 1) dp[1] = 1;',
        '  for (int i = 2; i <= n; i++) {',
        '    dp[i] = dp[i - 1] + dp[i - 2];',
        '  }',
        '  cout << dp[n] << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.1 基本 ----
(function registerDpBasic() {
  const p = [3, 1, 4, 1, 5];
  const n = p.length;
  const dp = new Array(n).fill('');
  const steps = [];
  dp[0] = p[0];
  steps.push({
    line: 8, vars: { 'p[0]': p[0] },
    arrays: [{ label: 'p（マスの得点）', values: p, hl: [0] }, { label: 'dp（0〜i番目まで進んだ最大合計）', values: [...dp] }],
    note: `dp[0] = p[0] = ${p[0]}（マス0は必ず通るので、そのまま得点になる）。`,
  });
  if (n >= 2) {
    dp[1] = dp[0] + p[1];
    steps.push({
      line: 9, vars: { 'dp[0]': dp[0], 'p[1]': p[1] },
      arrays: [{ label: 'p（マスの得点）', values: p, hl: [1] }, { label: 'dp（0〜i番目まで進んだ最大合計）', values: [...dp], hl: [1] }],
      note: `dp[1] = dp[0] + p[1] = ${dp[0]} + ${p[1]} = ${dp[1]}（マス1へはマス0経由の1通りしかない）。`,
    });
  }
  for (let i = 2; i < n; i++) {
    const better = dp[i - 1] >= dp[i - 2] ? i - 1 : i - 2;
    const best = Math.max(dp[i - 1], dp[i - 2]);
    dp[i] = p[i] + best;
    steps.push({
      line: 11, vars: { i, 'dp[i-1]': dp[i - 1], 'dp[i-2]': dp[i - 2] },
      arrays: [{ label: 'p（マスの得点）', values: p, hl: [i] }, { label: 'dp（0〜i番目まで進んだ最大合計）', values: [...dp], hl: [i, better] }],
      note: `マス${i}へは1つ前か2つ前から来られる。dp[${i}] = p[${i}] + max(dp[${i - 1}], dp[${i - 2}]) = ${p[i]} + ${best} = ${dp[i]}。`,
    });
  }
  steps.push({ line: 13, vars: { answer: dp[n - 1] }, arrays: [{ label: 'p（マスの得点）', values: p }, { label: 'dp（0〜i番目まで進んだ最大合計）', values: [...dp] }], note: `ゴール（マス${n - 1}）の dp の値 ${dp[n - 1]} が答え。` });

  registerTopic('4.1', {
    title: '基本',
    explain: [
      'DP の基本の形は「dp[状態] = その状態までの最善の値」を決め、状態を 1 つずつ増やしながら、来られる前の状態の dp の値から計算すること。',
      'ここでは「1 マスか 2 マス進める」すごろくで、通ったマスの得点合計を最大化する。マス i には「マス i-1 から来る」か「マス i-2 から来る」かの 2 通りしかないので、dp[i] = p[i] + max(dp[i-1], dp[i-2]) という単純な式になる。',
      '最初の数項（dp[0], dp[1]）は来られる前のマスがない・少ないので、別扱い（初期値）にしておく。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> p(n);',
      '  for (auto &x : p) cin >> x;',
      '  vector<long long> dp(n);',
      '  dp[0] = p[0];',
      '  if (n >= 2) dp[1] = dp[0] + p[1];',
      '  for (int i = 2; i < n; i++) {',
      '    dp[i] = p[i] + max(dp[i - 1], dp[i - 2]);',
      '  }',
      '  cout << dp[n - 1] << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君はすごろくのコマを、0 から N-1 の番号のマスが並ぶ盤面でマス 0 から出発させ、1 マスか 2 マス先へ進んでマス N-1 まで動かす。マス i には得点 P_i が書かれていて、立ち寄った（通った）マスすべての得点の合計が得られる。合計得点の最大値を求めてください。',
      constraints: ['1 ≤ N ≤ 1000', '-10^4 ≤ P_i ≤ 10^4', '入力はすべて整数'],
      input: 'N\nP_1 P_2 … P_N',
      output: '合計得点の最大値を出力してください。',
      samples: [
        { input: '5\n3 1 4 1 5', output: '14' },
        { input: '2\n-3 -1', output: '-4', note: 'N = 2 ではマス0とマス1の両方を必ず通る。' },
      ],
    },
    solution: {
      idea: 'dp[i] を「マス i まで進んだときの合計得点の最大値」とすると、マス i には i-1 かi-2 から来るので dp[i] = p[i] + max(dp[i-1], dp[i-2])。dp[0] = p[0]、dp[1] = dp[0] + p[1] を初期値にする。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> p(n);',
        '  for (auto &x : p) cin >> x;',
        '  vector<long long> dp(n);',
        '  dp[0] = p[0];',
        '  if (n >= 2) dp[1] = dp[0] + p[1];',
        '  for (int i = 2; i < n; i++) {',
        '    dp[i] = p[i] + max(dp[i - 1], dp[i - 2]);',
        '  }',
        '  cout << dp[n - 1] << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.2 復元 ----
(function registerDpRestore() {
  const p = [5, -3, 4, -2, 6, 1, -5, 8];
  const n = p.length;
  const dp = new Array(n).fill('');
  const from = new Array(n).fill(-1);
  const steps = [];
  dp[0] = p[0];
  steps.push({
    line: 9, vars: { 'p[0]': p[0] },
    arrays: [{ label: 'p（マスの得点）', values: p, hl: [0] }, { label: 'dp', values: [...dp] }, { label: 'from（どこから来たか）', values: [...from] }],
    note: `dp[0] = p[0] = ${p[0]}。マス0は出発点なので from[0] は使わない（-1 のまま）。`,
  });
  if (n >= 2) {
    dp[1] = dp[0] + p[1];
    from[1] = 0;
    steps.push({
      line: 10, vars: { 'dp[0]': dp[0], 'p[1]': p[1] },
      arrays: [{ label: 'p（マスの得点）', values: p, hl: [1] }, { label: 'dp', values: [...dp], hl: [1] }, { label: 'from（どこから来たか）', values: [...from], hl: [1] }],
      note: `dp[1] = dp[0] + p[1] = ${dp[0]} + ${p[1]} = ${dp[1]}。from[1] = 0（マス0から来た）。`,
    });
  }
  for (let i = 2; i < n; i++) {
    const useI1 = dp[i - 1] >= dp[i - 2];
    const line = useI1 ? 12 : 13;
    if (useI1) { dp[i] = p[i] + dp[i - 1]; from[i] = i - 1; }
    else { dp[i] = p[i] + dp[i - 2]; from[i] = i - 2; }
    steps.push({
      line, vars: { i, 'dp[i-1]': dp[i - 1], 'dp[i-2]': dp[i - 2] },
      arrays: [{ label: 'p（マスの得点）', values: p, hl: [i] }, { label: 'dp', values: [...dp], hl: [i, from[i]] }, { label: 'from（どこから来たか）', values: [...from], hl: [i] }],
      note: `dp[${i - 1}] と dp[${i - 2}] のうち大きい方は dp[${from[i]}]。dp[${i}] = p[${i}] + dp[${from[i]}] = ${dp[i]}。来た場所を from[${i}] = ${from[i]} に覚えておく。`,
    });
  }
  steps.push({ line: 15, vars: { answer: dp[n - 1] }, arrays: [{ label: 'p（マスの得点）', values: p }, { label: 'dp', values: [...dp] }, { label: 'from（どこから来たか）', values: [...from] }], note: `合計得点の最大値は dp[${n - 1}] = ${dp[n - 1]}。ここから from をたどって、実際に通った道を復元する。` });

  const path = [];
  for (let c = n - 1; c !== -1; c = from[c]) {
    path.push(c);
    steps.push({
      line: 17, vars: { c },
      arrays: [{ label: 'from（どこから来たか）', values: from, hl: [c] }, { label: 'path（後ろから集めている途中）', values: [...path] }],
      note: `マス${c} を path に追加し、from[${c}] = ${from[c]} へさかのぼる。${from[c] === -1 ? 'from が -1 なので出発点に着いた。' : ''}`,
    });
  }
  const reversed = [...path].reverse();
  steps.push({ line: 18, vars: {}, arrays: [{ label: 'path（逆順にして完成）', values: reversed }], note: `path は後ろ（ゴール）から集めたので、逆順にすると通った順番 ${reversed.join(' → ')} になる。` });

  registerTopic('4.2', {
    title: '復元',
    explain: [
      'DP は最善の「値」だけでなく、その値を達成する「具体的な選び方」も復元できる。やり方は、dp[i] を更新するときに「どこから来たか」を別の配列（from）に記録しておくこと。',
      '最後に、ゴールの状態から from を逆向きにたどっていくと、実際に選ばれた経路が得られる。たどる順番はゴール→スタートなので、出力する前に逆順に並べ替える。',
      '4.1 と同じすごろくの問題に、通った道順の出力を加えたもの。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<long long> p(n);',
      '  for (auto &x : p) cin >> x;',
      '  vector<long long> dp(n);',
      '  vector<int> from(n, -1);',
      '  dp[0] = p[0];',
      '  if (n >= 2) { dp[1] = dp[0] + p[1]; from[1] = 0; }',
      '  for (int i = 2; i < n; i++) {',
      '    if (dp[i - 1] >= dp[i - 2]) { dp[i] = p[i] + dp[i - 1]; from[i] = i - 1; }',
      '    else { dp[i] = p[i] + dp[i - 2]; from[i] = i - 2; }',
      '  }',
      '  cout << dp[n - 1] << endl;',
      '  vector<int> path;',
      '  for (int c = n - 1; c != -1; c = from[c]) path.push_back(c);',
      '  reverse(path.begin(), path.end());',
      '  for (int i = 0; i < (int)path.size(); i++) cout << path[i] << " \\n"[i + 1 == (int)path.size()];',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君はすごろくのコマを、0 から N-1 の番号のマスが並ぶ盤面でマス 0 から出発させ、1 マスか 2 マス先へ進んでマス N-1 まで動かす。マス i には得点 P_i（負の数もありうる）が書かれていて、立ち寄ったマスすべての得点の合計が得られる。合計得点が最大になるように進んだとき、その最大値と、実際に通ったマスの番号を出発から順に求めてください。',
      constraints: ['2 ≤ N ≤ 1000', '-10^4 ≤ P_i ≤ 10^4', '入力はすべて整数'],
      input: 'N\nP_1 P_2 … P_N',
      output: '1 行目に合計得点の最大値、2 行目に実際に通ったマスの番号を出発から順に空白区切りで出力してください。',
      samples: [
        { input: '8\n5 -3 4 -2 6 1 -5 8', output: '24\n0 2 4 5 7' },
        { input: '2\n-3 -1', output: '-4\n0 1', note: 'N = 2 ではマス0とマス1の両方を必ず通る。' },
      ],
    },
    solution: {
      idea: '4.1 の dp[i] = p[i] + max(dp[i-1], dp[i-2]) を計算するとき、どちらを選んだかを from[i] に記録する。ゴールから from を逆にたどり、最後に順序を逆転させれば通った道になる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> p(n);',
        '  for (auto &x : p) cin >> x;',
        '  vector<long long> dp(n);',
        '  vector<int> from(n, -1);',
        '  dp[0] = p[0];',
        '  if (n >= 2) { dp[1] = dp[0] + p[1]; from[1] = 0; }',
        '  for (int i = 2; i < n; i++) {',
        '    if (dp[i - 1] >= dp[i - 2]) { dp[i] = p[i] + dp[i - 1]; from[i] = i - 1; }',
        '    else { dp[i] = p[i] + dp[i - 2]; from[i] = i - 2; }',
        '  }',
        '  cout << dp[n - 1] << endl;',
        '  vector<int> path;',
        '  for (int c = n - 1; c != -1; c = from[c]) path.push_back(c);',
        '  reverse(path.begin(), path.end());',
        '  for (int i = 0; i < (int)path.size(); i++) cout << path[i] << " \\n"[i + 1 == (int)path.size()];',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.3 部分和問題 ----
(function registerSubsetSum() {
  const a = [2, 3, 5];
  const S = 5;
  const n = a.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(S + 1).fill(false));
  const steps = [];
  const snap = (hl, note, line, vars) => {
    steps.push({
      line, vars: vars || {},
      table: [{ label: 'dp（行=使った枚数, 列=目標の和）', rows: [...Array(n + 1).keys()], cols: [...Array(S + 1).keys()], data: dp.map((row) => row.map((v) => (v ? 'T' : 'F'))), hl }],
      note,
    });
  };
  dp[0][0] = true;
  snap([[0, 0]], 'dp[0][0] = true（何も選ばなければ合計0は作れる）。それ以外の dp[0][j] は初期値 false のまま。', 8);
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= S; j++) {
      dp[i][j] = dp[i - 1][j];
      const hl = [[i - 1, j], [i, j]];
      let note = `dp[${i}][${j}] はまず「${i}枚目を使わない」場合の dp[${i - 1}][${j}] = ${dp[i - 1][j] ? 'true' : 'false'} をコピー。`;
      let line = 11;
      if (j >= a[i - 1] && dp[i - 1][j - a[i - 1]]) {
        dp[i][j] = true;
        hl.push([i - 1, j - a[i - 1]]);
        note += ` さらに a[${i - 1}] = ${a[i - 1]} を使うと dp[${i - 1}][${j - a[i - 1]}] = true なので dp[${i}][${j}] = true になる。`;
        line = 12;
      }
      snap(hl, note, line, { i, j, 'a[i-1]': a[i - 1] });
    }
  }
  snap([[n, S]], `dp[${n}][${S}] = ${dp[n][S] ? 'true' : 'false'} なので、答えは ${dp[n][S] ? 'Yes' : 'No'}。`, 15);

  registerTopic('4.3', {
    title: '部分和問題',
    explain: [
      '「いくつか選んで合計をちょうど S にできるか」は、dp[i][j] を「最初の i 個の中から選んで合計 j を作れるか（真偽値）」とする 2 次元 DP で解ける。',
      'i 番目の品物を「使わない」なら dp[i][j] = dp[i-1][j]。「使う」なら残り j - a[i-1] を最初の i-1 個で作れればよいので dp[i-1][j-a[i-1]] も調べ、どちらかが true なら dp[i][j] も true。',
      '表は上の行（少ない個数）から下の行へ、1 行ずつ確定していく。各マスは真上のマスと、1つ左にずれたやや上のマスの 2 つだけから決まる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, s; cin >> n >> s;',
      '  vector<int> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  vector<vector<bool>> dp(n + 1, vector<bool>(s + 1, false));',
      '  dp[0][0] = true;',
      '  for (int i = 1; i <= n; i++) {',
      '    for (int j = 0; j <= s; j++) {',
      '      dp[i][j] = dp[i - 1][j];',
      '      if (j >= a[i - 1] && dp[i - 1][j - a[i - 1]]) dp[i][j] = true;',
      '    }',
      '  }',
      '  cout << (dp[n][s] ? "Yes" : "No") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 枚のメダルを持っていて、i 枚目には整数の得点 A_i が書かれている。何枚か選んで（1 枚も選ばなくてもよい）合計得点をちょうど S にできるかを判定してください。',
      constraints: ['1 ≤ N ≤ 20', '1 ≤ A_i ≤ 1000', '0 ≤ S ≤ 1000', '入力はすべて整数'],
      input: 'N S\nA_1 A_2 … A_N',
      output: '合計をちょうど S にできるなら Yes、できないなら No を出力してください。',
      samples: [
        { input: '3 5\n2 3 5', output: 'Yes' },
        { input: '3 6\n2 3 5', output: 'No' },
        { input: '3 0\n2 3 5', output: 'Yes', note: '1 枚も選ばなければ合計 0 を作れる。' },
      ],
    },
    solution: {
      idea: 'dp[i][j] =「最初の i 枚から選んで合計 j を作れるか」。i 枚目を使わない場合は dp[i-1][j]、使う場合は a[i-1] ≤ j かつ dp[i-1][j-a[i-1]] のとき true になる。O(N・S) で表を埋める。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, s; cin >> n >> s;',
        '  vector<int> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  vector<vector<bool>> dp(n + 1, vector<bool>(s + 1, false));',
        '  dp[0][0] = true;',
        '  for (int i = 1; i <= n; i++) {',
        '    for (int j = 0; j <= s; j++) {',
        '      dp[i][j] = dp[i - 1][j];',
        '      if (j >= a[i - 1] && dp[i - 1][j - a[i - 1]]) dp[i][j] = true;',
        '    }',
        '  }',
        '  cout << (dp[n][s] ? "Yes" : "No") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.4 ナップザック問題 ----
(function registerKnapsack() {
  const w = [2, 3, 4];
  const v = [3, 4, 5];
  const n = w.length;
  const W = 5;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const steps = [];
  const snap = (hl, note, line, vars) => {
    steps.push({
      line, vars: vars || {},
      table: [{ label: 'dp（行=使える品物の数, 列=容量）', rows: [...Array(n + 1).keys()], cols: [...Array(W + 1).keys()], data: dp.map((row) => [...row]), hl }],
      note,
    });
  };
  snap([], 'dp[0][*] = 0（品物が1つも無ければ、どんな容量でも価値0）。', 7);
  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= W; c++) {
      const hl = [[i - 1, c], [i, c]];
      let note = `容量 ${c} で ${i}番目の品物（重さ${w[i - 1]}, 価値${v[i - 1]}）を使わない場合、dp[${i}][${c}] = dp[${i - 1}][${c}] = ${dp[i - 1][c]}。`;
      let line = 10;
      let val = dp[i - 1][c];
      if (w[i - 1] <= c) {
        const cand = dp[i - 1][c - w[i - 1]] + v[i - 1];
        hl.push([i - 1, c - w[i - 1]]);
        line = 11;
        if (cand > val) {
          val = cand;
          note = `${i}番目（重さ${w[i - 1]}, 価値${v[i - 1]}）を使うと dp[${i - 1}][${c - w[i - 1]}] + ${v[i - 1]} = ${dp[i - 1][c - w[i - 1]]} + ${v[i - 1]} = ${cand}。使わない場合の ${dp[i - 1][c]} より大きいので採用。`;
        } else {
          note = `${i}番目を使うと ${cand}、使わないと ${dp[i - 1][c]}。使わない方が大きい（か同じ）ので dp[${i}][${c}] = ${val}。`;
        }
      }
      dp[i][c] = val;
      snap(hl, note, line, { i, c, 'w[i-1]': w[i - 1], 'v[i-1]': v[i - 1] });
    }
  }
  snap([[n, W]], `dp[${n}][${W}] = ${dp[n][W]} が答え。`, 13);

  registerTopic('4.4', {
    title: 'ナップザック問題',
    explain: [
      '品物ごとに「重さ」と「価値」があり、容量の決まった袋に入れて価値の合計を最大化するのがナップザック問題。各品物は 1 個までしか使えない（0/1 ナップザック）。',
      'dp[i][c] を「最初の i 個の品物から、重さの合計が c 以下になるように選んだときの価値の最大値」とする。i 番目を使わなければ dp[i-1][c]、使うなら（重さが c 以下のとき）dp[i-1][c - w[i-1]] + v[i-1]。この 2 つの大きい方が dp[i][c]。',
      '部分和問題（4.3）とほぼ同じ形で、真偽値の代わりに数値の最大値を持つ表になっている。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, cap; cin >> n >> cap;',
      '  vector<int> w(n), v(n);',
      '  for (int i = 0; i < n; i++) cin >> w[i] >> v[i];',
      '  vector<vector<int>> dp(n + 1, vector<int>(cap + 1, 0));',
      '  for (int i = 1; i <= n; i++) {',
      '    for (int c = 0; c <= cap; c++) {',
      '      dp[i][c] = dp[i - 1][c];',
      '      if (w[i - 1] <= c) dp[i][c] = max(dp[i][c], dp[i - 1][c - w[i - 1]] + v[i - 1]);',
      '    }',
      '  }',
      '  cout << dp[n][cap] << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は N 個の宝石を持っていて、i 番目の重さは W_i、価値は V_i。重さの合計が W を超えないように選んだとき、選んだ宝石の価値の合計の最大値を求めてください（同じ宝石は 1 個までしか選べない）。',
      constraints: ['1 ≤ N ≤ 100', '1 ≤ W_i, V_i ≤ 1000', '1 ≤ W ≤ 1000', '入力はすべて整数'],
      input: 'N W\nW_1 V_1\n⋮\nW_N V_N',
      output: '価値の合計の最大値を出力してください。',
      samples: [
        { input: '3 5\n2 3\n3 4\n4 5', output: '7' },
        { input: '2 1\n5 10\n6 20', output: '0', note: 'どの宝石も重さが W = 1 より大きく、1 個も選べない。' },
      ],
    },
    solution: {
      idea: 'dp[i][c] =「最初の i 個から重さの合計 c 以下で選んだときの価値の最大値」。i 番目を使わない dp[i-1][c] と、使う dp[i-1][c-w[i-1]] + v[i-1] の大きい方を採用する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, cap; cin >> n >> cap;',
        '  vector<int> w(n), v(n);',
        '  for (int i = 0; i < n; i++) cin >> w[i] >> v[i];',
        '  vector<vector<int>> dp(n + 1, vector<int>(cap + 1, 0));',
        '  for (int i = 1; i <= n; i++) {',
        '    for (int c = 0; c <= cap; c++) {',
        '      dp[i][c] = dp[i - 1][c];',
        '      if (w[i - 1] <= c) dp[i][c] = max(dp[i][c], dp[i - 1][c - w[i - 1]] + v[i - 1]);',
        '    }',
        '  }',
        '  cout << dp[n][cap] << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.5 最長共通部分列 ----
(function registerLcs() {
  const s1 = 'AGCAT';
  const s2 = 'GAC';
  const n = s1.length;
  const m = s2.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const steps = [];
  const snap = (hl, note, line, vars) => {
    steps.push({
      line, vars: vars || {},
      table: [{ label: `dp（縦=${s1} の位置, 横=${s2} の位置）`, rows: ['', ...s1.split('')], cols: ['', ...s2.split('')], data: dp.map((row) => [...row]), hl }],
      note,
    });
  };
  snap([], 'dp[0][*] と dp[*][0] は 0（片方の文字列の長さが0なら共通部分列も長さ0）。', 6);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const hl = [];
      let note;
      let line;
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        hl.push([i - 1, j - 1]);
        line = 10;
        note = `${s1}の${i}文字目 と ${s2}の${j}文字目 はどちらも「${s1[i - 1]}」で一致。dp[${i - 1}][${j - 1}] + 1 = ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}。`;
      } else {
        const a = dp[i - 1][j];
        const b = dp[i][j - 1];
        dp[i][j] = Math.max(a, b);
        hl.push(a >= b ? [i - 1, j] : [i, j - 1]);
        line = 12;
        note = `「${s1[i - 1]}」と「${s2[j - 1]}」は不一致。どちらか一方を読み飛ばすので dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${a}, ${b}) = ${dp[i][j]}。`;
      }
      snap(hl, note, line, { i, j });
    }
  }
  snap([[n, m]], `dp[${n}][${m}] = ${dp[n][m]} が最長共通部分列の長さ。`, 16);

  registerTopic('4.5', {
    title: '最長共通部分列',
    explain: [
      '2 つの文字列 s1, s2 に共通する部分列（順序を保ったまま、飛び飛びに取り出した並び）のうち最長のものの長さを求める問題（LCS）。',
      'dp[i][j] を「s1 の最初の i 文字と s2 の最初の j 文字の LCS の長さ」とする。最後の文字どうしが一致するなら dp[i-1][j-1] + 1。一致しないなら、どちらかの文字列の最後の1文字を諦めた dp[i-1][j] と dp[i][j-1] の大きい方。',
      '2 次元の表を左上から右下へ、行ごとに埋めていく。各マスは真上・真左・左上の 3 方向のマスだけから決まる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  string s1, s2; cin >> s1 >> s2;',
      '  int n = s1.size(), m = s2.size();',
      '  vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));',
      '  for (int i = 1; i <= n; i++) {',
      '    for (int j = 1; j <= m; j++) {',
      '      if (s1[i - 1] == s2[j - 1]) {',
      '        dp[i][j] = dp[i - 1][j - 1] + 1;',
      '      } else {',
      '        dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);',
      '      }',
      '    }',
      '  }',
      '  cout << dp[n][m] << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は 2 つの文字列 S, T（英大文字のみ）を持っている。S と T の最長共通部分列（どちらにも順序を保ったまま現れる、最も長い文字の並び）の長さを求めてください。',
      constraints: ['1 ≤ |S|, |T| ≤ 1000', 'S, T は英大文字のみからなる'],
      input: 'S\nT',
      output: '最長共通部分列の長さを出力してください。',
      samples: [
        { input: 'AGCAT\nGAC', output: '2' },
        { input: 'ABC\nXYZ', output: '0', note: '共通する文字がなく、空の部分列（長さ0）しか作れない。' },
      ],
    },
    solution: {
      idea: 'dp[i][j] =「S の最初の i 文字と T の最初の j 文字の LCS の長さ」。最後の文字が一致すれば dp[i-1][j-1]+1、しなければ dp[i-1][j] と dp[i][j-1] の大きい方。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  string s1, s2; cin >> s1 >> s2;',
        '  int n = s1.size(), m = s2.size();',
        '  vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));',
        '  for (int i = 1; i <= n; i++) {',
        '    for (int j = 1; j <= m; j++) {',
        '      if (s1[i - 1] == s2[j - 1]) {',
        '        dp[i][j] = dp[i - 1][j - 1] + 1;',
        '      } else {',
        '        dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);',
        '      }',
        '    }',
        '  }',
        '  cout << dp[n][m] << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.6 区間DP ----
(function registerIntervalDp() {
  const a = [3, 4, 2, 5];
  const n = a.length;
  const prefix = [0];
  for (const x of a) prefix.push(prefix[prefix.length - 1] + x);
  const sum = (l, r) => prefix[r + 1] - prefix[l];
  const INF = Infinity;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  const steps = [];
  const snap = (hl, note, line, vars) => {
    steps.push({
      line, vars: vars || {},
      table: [{ label: 'dp[l][r]（区間 l〜r をまとめる最小コスト。空欄は未計算）', rows: [...Array(n).keys()], cols: [...Array(n).keys()], data: dp.map((row, l) => row.map((v, r) => (r < l ? null : v))), hl }],
      note,
    });
  };
  snap([], '石は1個だけならまとめるコストは0。dp[i][i] = 0。', 9);
  for (let len = 2; len <= n; len++) {
    for (let l = 0; l + len - 1 < n; l++) {
      const r = l + len - 1;
      let best = INF;
      let bestK = -1;
      for (let k = l; k < r; k++) {
        const cand = dp[l][k] + dp[k + 1][r] + sum(l, r);
        if (cand < best) { best = cand; bestK = k; }
      }
      dp[l][r] = best;
      const hl = [];
      for (let k = l; k < r; k++) { hl.push([l, k]); hl.push([k + 1, r]); }
      hl.push([l, r]);
      snap(hl, `区間[${l},${r}]を、石${l}〜${bestK}の山と石${bestK + 1}〜${r}の山に分けて最後にまとめるのが最小。dp[${l}][${r}] = dp[${l}][${bestK}] + dp[${bestK + 1}][${r}] + (区間の重さの合計 ${sum(l, r)}) = ${dp[l][bestK]} + ${dp[bestK + 1][r]} + ${sum(l, r)} = ${best}。`, 17, { l, r, k: bestK });
    }
  }
  snap([[0, n - 1]], `dp[0][${n - 1}] = ${dp[0][n - 1]} が、すべての石を1つにまとめる最小コスト。`, 20);

  registerTopic('4.6', {
    title: '区間DP',
    explain: [
      '区間 DP は「配列の連続した区間」を状態にする DP。dp[l][r] を「区間 [l, r] をある決まった操作でまとめるときの最小（または最大）コスト」として、短い区間から長い区間へ埋めていく。',
      '区間 [l, r] を、どこか境目 k（l ≤ k < r）で [l, k] と [k+1, r] の 2 つの小さい区間に分け、それぞれの答え dp[l][k], dp[k+1][r] と、その区間をまとめる追加コストを足したものの最小値をとる。境目 k は区間の中で全部試す。',
      '例として、横に並んだ石の山をどんな順でまとめても、まとめるたびに「まとめる2つの山の重さの合計」のコストがかかるとき、全部を1つにまとめる最小コストを求める（まとめる合計は分割の仕方によらず常に区間の重さの総和になる）。',
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
      '  vector<vector<long long>> dp(n, vector<long long>(n, 0));',
      '  for (int len = 2; len <= n; len++) {',
      '    for (int l = 0; l + len - 1 < n; l++) {',
      '      int r = l + len - 1;',
      '      long long best = LLONG_MAX;',
      '      for (int k = l; k < r; k++) {',
      '        best = min(best, dp[l][k] + dp[k + 1][r] + (s[r + 1] - s[l]));',
      '      }',
      '      dp[l][r] = best;',
      '    }',
      '  }',
      '  cout << dp[0][n - 1] << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君の前に N 個の石が横一列に並んでいて、i 番目の重さは A_i。隣り合う 2 つの山を 1 つにまとめる操作を繰り返し、すべてを 1 つの山にする。1 回まとめるごとに、まとめる 2 つの山の重さの合計がコストとしてかかる。全部を 1 つにまとめる最小の総コストを求めてください。',
      constraints: ['2 ≤ N ≤ 100', '1 ≤ A_i ≤ 1000', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N',
      output: '最小の総コストを出力してください。',
      samples: [
        { input: '4\n3 4 2 5', output: '28' },
        { input: '2\n1 2', output: '3', note: 'N = 2 なら1回まとめるだけで、コストは必ず A_1 + A_2。' },
      ],
    },
    solution: {
      idea: 'dp[l][r] =「石 l から r までを1つにまとめる最小コスト」。区間の長さの短い順に、境目 k を全部試して dp[l][k] + dp[k+1][r] + (区間の重さの合計) の最小値を求める。区間の重さの合計は累積和で O(1) に求まる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<long long> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  vector<long long> s(n + 1, 0);',
        '  for (int i = 0; i < n; i++) s[i + 1] = s[i] + a[i];',
        '  vector<vector<long long>> dp(n, vector<long long>(n, 0));',
        '  for (int len = 2; len <= n; len++) {',
        '    for (int l = 0; l + len - 1 < n; l++) {',
        '      int r = l + len - 1;',
        '      long long best = LLONG_MAX;',
        '      for (int k = l; k < r; k++) {',
        '        best = min(best, dp[l][k] + dp[k + 1][r] + (s[r + 1] - s[l]));',
        '      }',
        '      dp[l][r] = best;',
        '    }',
        '  }',
        '  cout << dp[0][n - 1] << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.7 遷移形式の工夫（配る DP と貰う DP）----
(function registerPushPullDp() {
  const coins = [2, 3];
  const T = 5;
  const dp = new Array(T + 1).fill(0);
  dp[0] = 1;
  const steps = [];
  steps.push({ line: 7, vars: { T }, array: { label: 'dp（合計がちょうどsになる組み合わせの数）', values: [...dp] }, note: 'dp[0] = 1（何も使わなければ合計0が1通り）。それ以外は0から始める。' });
  for (const coin of coins) {
    for (let s = 0; s + coin <= T; s++) {
      const before = dp[s];
      dp[s + coin] += before;
      steps.push({
        line: 11, vars: { coin, s, 'dp[s]': before },
        array: { label: 'dp（合計がちょうどsになる組み合わせの数）', values: [...dp], hl: [s, s + coin] },
        note: `硬貨${coin}を使って、dp[${s}] = ${before} 通りのそれぞれに硬貨${coin}を足すと合計${s + coin}になる。だから dp[${s + coin}] に ${before} を配る（足す） → dp[${s + coin}] = ${dp[s + coin]}。`,
      });
    }
  }
  steps.push({ line: 14, vars: { answer: dp[T] }, array: { label: 'dp（合計がちょうどsになる組み合わせの数）', values: [...dp] }, note: `dp[${T}] = ${dp[T]} が答え。` });

  registerTopic('4.7', {
    title: '遷移形式の工夫（配る DP と貰う DP）',
    explain: [
      'DP の更新のしかたには2通りの書き方がある。「貰う DP」は dp[今の状態] を、それより前の状態の値を見にいって計算する書き方（4.0〜4.6 はすべてこちら）。「配る DP」は逆に、今の状態 dp[s] の値を確定させた時点で、そこから遷移できる先 dp[s + 何か] に値を足しにいく書き方。',
      'どちらで書いても計算する内容・結果は同じ。ただし「使った個数に制限がない（何度でも選べる）」遷移では配る DP の方が素直に書けることが多い。ここでは硬貨を何枚でも使ってよい場合の、合計をちょうど T にする選び方の数（順番は区別しない）を配る DP で数える。',
      'コードでは、硬貨の種類ごとに、小さい合計 s から大きい方へ dp[s] の値を dp[s + coin] に配っていく。同じ硬貨を2回配る（2枚使う）ことも許されるので、1種類の硬貨の中では s を小さい方から順に進めてよい。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, t; cin >> n >> t;',
      '  vector<int> c(n);',
      '  for (auto &x : c) cin >> x;',
      '  vector<long long> dp(t + 1, 0);',
      '  dp[0] = 1;',
      '  for (int coin : c) {',
      '    for (int s = 0; s + coin <= t; s++) {',
      '      dp[s + coin] += dp[s]; // 「配る」: dp[s] の分を dp[s+coin] に配る',
      '    }',
      '  }',
      '  cout << dp[t] << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 種類の硬貨を持っていて、金額は C_1, …, C_N。それぞれ何枚でも使ってよいとき、合計金額がちょうど T になる選び方が何通りあるか求めてください（使う硬貨の種類と枚数の組み合わせだけを数え、使う順番は区別しない）。',
      constraints: ['1 ≤ N ≤ 20', '1 ≤ C_i ≤ 100', '0 ≤ T ≤ 1000', '入力はすべて整数'],
      input: 'N T\nC_1 C_2 … C_N',
      output: '選び方の数を出力してください。',
      samples: [
        { input: '2 5\n2 3', output: '1' },
        { input: '1 0\n5', output: '1', note: 'T = 0 なら、1 枚も使わない選び方の 1 通りだけ。' },
      ],
    },
    solution: {
      idea: 'dp[s] =「合計がちょうど s になる選び方の数」。硬貨 coin を1種類ずつ処理し、s の小さい方から dp[s+coin] += dp[s] と「配る」ことで、その硬貨を何枚でも使える数え方になる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, t; cin >> n >> t;',
        '  vector<int> c(n);',
        '  for (auto &x : c) cin >> x;',
        '  vector<long long> dp(t + 1, 0);',
        '  dp[0] = 1;',
        '  for (int coin : c) {',
        '    for (int s = 0; s + coin <= t; s++) {',
        '      dp[s + coin] += dp[s];',
        '    }',
        '  }',
        '  cout << dp[t] << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.8 ビットDP ----
(function registerBitDp() {
  const cost = [
    [4, 2, 8],
    [4, 3, 7],
    [3, 1, 6],
  ];
  const n = cost.length;
  const full = 1 << n;
  const INF = Infinity;
  const dp = new Array(full).fill(INF);
  dp[0] = 0;
  const steps = [];
  const label = (mask) => mask.toString(2).padStart(n, '0');
  steps.push({ line: 9, vars: {}, array: { label: 'dp[mask]（maskの人たちに仕事を割り振った最小コスト, ∞=未到達）', values: dp.map((v) => (v === INF ? '∞' : v)) }, note: 'dp[000] = 0（まだ誰にも仕事を割り振っていない状態のコストは0）。' });
  for (let mask = 0; mask < full; mask++) {
    if (dp[mask] === INF) continue;
    const j = popcount(mask);
    if (j >= n) continue;
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) continue;
      const nmask = mask | (1 << i);
      const cand = dp[mask] + cost[i][j];
      const before = dp[nmask];
      const updated = cand < dp[nmask];
      if (updated) dp[nmask] = cand;
      steps.push({
        line: 17, vars: { mask: label(mask), i, j, cand },
        array: { label: 'dp[mask]（maskの人たちに仕事を割り振った最小コスト, ∞=未到達）', values: dp.map((v) => (v === INF ? '∞' : v)), hl: [mask, nmask] },
        note: `mask=${label(mask)} は仕事0〜${j - 1}まで割り振り済み（次は仕事${j}）。まだ仕事をしていない人${i}に仕事${j}を割り振ると、コスト${cost[i][j]}がかかり dp[${label(nmask)}] の候補は ${dp[mask]} + ${cost[i][j]} = ${cand}。${updated ? `これまでの ${before === INF ? '∞' : before} より小さいので更新。` : `これまでの ${before} 以上なので更新しない。`}`,
      });
    }
  }
  steps.push({ line: 20, vars: { answer: dp[full - 1] }, array: { label: 'dp[mask]（maskの人たちに仕事を割り振った最小コスト, ∞=未到達）', values: dp.map((v) => (v === INF ? '∞' : v)), hl: [full - 1] }, note: `全員に割り振った dp[${label(full - 1)}] = ${dp[full - 1]} が、割り振り方を工夫した最小の合計コスト。` });

  function popcount(x) { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; }

  registerTopic('4.8', {
    title: 'ビットDP',
    explain: [
      '「N 個のものをどの順・どの組み合わせで使ったか」を状態にしたいとき、N が小さければ（目安 N ≤ 20 程度）、使った/使っていないを N 桁のビット列（mask）で表し、mask を状態にした DP（ビット DP）が使える。',
      'ここでは N 人に N 個の仕事を1人1つずつ割り振る「割り当て問題」を考える。dp[mask] を「mask に入っている人たちに、仕事 0 番から順に割り振り終えたときの最小コスト」とすると、次に割り振る仕事の番号は mask に立っているビットの数（popcount）でわかる。',
      'mask に入っていない人 i を見つけて、仕事 popcount(mask) を割り振ると mask | (1<<i) という新しい状態に遷移する。全部のビットが立った mask（全員に割り振り終えた状態）の dp の値が答え。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const long long INF = 1e18;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<vector<int>> cost(n, vector<int>(n));',
      '  for (auto &row : cost) for (auto &x : row) cin >> x;',
      '  vector<long long> dp(1 << n, INF);',
      '  dp[0] = 0;',
      '  for (int mask = 0; mask < (1 << n); mask++) {',
      '    if (dp[mask] == INF) continue;',
      '    int j = __builtin_popcount(mask); // 次に割り振る仕事の番号',
      '    if (j >= n) continue;',
      '    for (int i = 0; i < n; i++) {',
      '      if (mask & (1 << i)) continue; // 人iはもう割り振り済み',
      '      int nmask = mask | (1 << i);',
      '      dp[nmask] = min(dp[nmask], dp[mask] + cost[i][j]);',
      '    }',
      '  }',
      '  cout << dp[(1 << n) - 1] << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君の工房には N 人の職人と N 個の仕事があり、人 i が仕事 j をすると Cost_{i,j} のコストがかかる。1 人につき仕事を 1 つだけ、全員に異なる仕事を割り振るとき、合計コストの最小値を求めてください。',
      constraints: ['1 ≤ N ≤ 16', '1 ≤ Cost_{i,j} ≤ 1000', '入力はすべて整数'],
      input: 'N\nCost_{1,1} Cost_{1,2} … Cost_{1,N}\n⋮\nCost_{N,1} Cost_{N,2} … Cost_{N,N}',
      output: '合計コストの最小値を出力してください。',
      samples: [
        { input: '3\n4 2 8\n4 3 7\n3 1 6', output: '12' },
        { input: '1\n5', output: '5', note: '職人も仕事も1つだけなので割り振り方は1通り。' },
      ],
    },
    solution: {
      idea: 'dp[mask] =「mask に入っている人たちに、仕事0番から順に割り振ったときの最小コスト」。次に割り振る仕事番号は popcount(mask)。mask にいない人 i それぞれについて、dp[mask | (1<<i)] を dp[mask] + cost[i][popcount(mask)] で更新する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long INF = 1e18;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<vector<int>> cost(n, vector<int>(n));',
        '  for (auto &row : cost) for (auto &x : row) cin >> x;',
        '  vector<long long> dp(1 << n, INF);',
        '  dp[0] = 0;',
        '  for (int mask = 0; mask < (1 << n); mask++) {',
        '    if (dp[mask] == INF) continue;',
        '    int j = __builtin_popcount(mask);',
        '    if (j >= n) continue;',
        '    for (int i = 0; i < n; i++) {',
        '      if (mask & (1 << i)) continue;',
        '      int nmask = mask | (1 << i);',
        '      dp[nmask] = min(dp[nmask], dp[mask] + cost[i][j]);',
        '    }',
        '  }',
        '  cout << dp[(1 << n) - 1] << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.9 最長増加部分列 ----
(function registerLis() {
  const a = [3, 1, 4, 1, 5, 9, 2, 6];
  const tails = [];
  const steps = [];
  for (const x of a) {
    let pos = tails.length;
    for (let k = 0; k < tails.length; k++) {
      if (tails[k] >= x) { pos = k; break; }
    }
    const hl = [pos];
    if (pos === tails.length) {
      tails.push(x);
      steps.push({ line: 10, vars: { x, pos }, array: { label: 'tails（増加列を作れる最小の末尾の値）', values: [...tails], hl }, note: `x=${x} は tails のどの値よりも大きいので、末尾に追加する（長さが1伸びる）。tails = [${tails.join(', ')}]` });
    } else {
      tails[pos] = x;
      steps.push({ line: 11, vars: { x, pos }, array: { label: 'tails（増加列を作れる最小の末尾の値）', values: [...tails], hl }, note: `x=${x} 以上の最初の値が tails[${pos}]（二分探索で発見）。そこを x に置き換える（長さは変わらないが、続きが作りやすくなる）。tails = [${tails.join(', ')}]` });
    }
  }
  steps.push({ line: 13, vars: { answer: tails.length }, array: { label: 'tails（増加列を作れる最小の末尾の値）', values: [...tails] }, note: `tails の長さ ${tails.length} が最長増加部分列の長さ。` });

  registerTopic('4.9', {
    title: '最長増加部分列',
    explain: [
      '数列 a の中から、順序を保ったまま取り出して作れる「狭義単調増加」な部分列のうち最長のものの長さを求める問題（LIS）。',
      '素朴には dp[i] =「a[i] を最後に使う LIS の長さ」とし、dp[i] = 1 + max(dp[j]) (j<i かつ a[j]<a[i]) を全部の j について調べると O(N²) で求まる。',
      'もっと速くするには、tails という配列を使う。tails[k] は「長さ k+1 の増加列を作れる、末尾の値としてあり得る最小のもの」。数列を順に見て、x が tails のどの値よりも大きければ末尾に追加（長さが1伸びる）、そうでなければ x 以上で最初の値を x に置き換える（より伸ばしやすい末尾に更新）。「x 以上で最初の値」は tails が常にソート済みなので二分探索（lower_bound）で高速に見つかり、全体で O(N log N) になる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  vector<int> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  vector<int> tails;',
      '  for (int x : a) {',
      '    int pos = lower_bound(tails.begin(), tails.end(), x) - tails.begin();',
      '    if (pos == (int)tails.size()) tails.push_back(x);',
      '    else tails[pos] = x;',
      '  }',
      '  cout << tails.size() << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '高橋君は N 個の整数からなる数列 A_1, A_2, …, A_N を持っている。A から（順序を保ったまま、飛び飛びに選んでよい）狭義単調増加な部分列を作るとき、その長さの最大値を求めてください。',
      constraints: ['1 ≤ N ≤ 2 × 10^5', '1 ≤ A_i ≤ 10^9', '入力はすべて整数'],
      input: 'N\nA_1 A_2 … A_N',
      output: '最長増加部分列の長さを出力してください。',
      samples: [
        { input: '8\n3 1 4 1 5 9 2 6', output: '4' },
        { input: '4\n5 4 3 2', output: '1', note: '減少列しかないので、1個だけ選ぶのが最長になる。' },
      ],
    },
    solution: {
      idea: 'tails[k] を「長さ k+1 の増加部分列の、あり得る最小の末尾の値」として管理する。各 x について、tails の中で x 以上の最初の位置を二分探索（lower_bound）で見つけ、無ければ末尾に追加、あれば置き換える。最後の tails の長さが答え。O(N log N)。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  vector<int> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  vector<int> tails;',
        '  for (int x : a) {',
        '    int pos = lower_bound(tails.begin(), tails.end(), x) - tails.begin();',
        '    if (pos == (int)tails.size()) tails.push_back(x);',
        '    else tails[pos] = x;',
        '  }',
        '  cout << tails.size() << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 4.10 チャレンジ問題 ----
(function registerChallenge() {
  const w = [2, 3, 4];
  const v = [3, 4, 5];
  const n = w.length;
  const cap = 7;
  const dp = new Array(cap + 1).fill(0);
  const choice = new Array(cap + 1).fill(-1);
  const steps = [];
  steps.push({ line: 7, vars: {}, array: { label: 'dp（容量cまでの価値の最大値）', values: [...dp] }, note: 'dp[0] = 0（容量0なら何も入れられない）。品物は何個でも使ってよい。' });
  for (let c = 1; c <= cap; c++) {
    let before = dp[c];
    for (let i = 0; i < n; i++) {
      if (w[i] <= c && dp[c - w[i]] + v[i] > dp[c]) {
        dp[c] = dp[c - w[i]] + v[i];
        choice[c] = i;
        steps.push({
          line: 12, vars: { c, i, 'w[i]': w[i], 'v[i]': v[i] },
          arrays: [{ label: 'dp（容量cまでの価値の最大値）', values: [...dp], hl: [c, c - w[i]] }, { label: 'choice（最後に使った品物の番号）', values: [...choice], hl: [c] }],
          note: `容量${c}で品物${i}（重さ${w[i]}, 価値${v[i]}）をもう1個使うと dp[${c - w[i]}] + ${v[i]} = ${dp[c - w[i]]} + ${v[i]} = ${dp[c]}。これまでの候補より良いので更新し、choice[${c}] = ${i}。`,
        });
      }
    }
    if (dp[c] === before && choice[c] === -1) {
      steps.push({ line: 11, vars: { c }, arrays: [{ label: 'dp（容量cまでの価値の最大値）', values: [...dp], hl: [c] }, { label: 'choice（最後に使った品物の番号）', values: [...choice] }], note: `容量${c}に入る品物がない（全部の品物の重さが${c}より大きい）ので dp[${c}] = 0 のまま。` });
    }
  }
  steps.push({ line: 17, vars: { answer: dp[cap] }, arrays: [{ label: 'dp（容量cまでの価値の最大値）', values: [...dp] }, { label: 'choice（最後に使った品物の番号）', values: [...choice] }], note: `最大価値は dp[${cap}] = ${dp[cap]}。ここから choice をたどって、実際に使った品物を復元する。` });

  const used = [];
  let c = cap;
  while (c > 0 && choice[c] !== -1) {
    const i = choice[c];
    used.push(i);
    steps.push({ line: 21, vars: { c, 'choice[c]': i }, arrays: [{ label: 'choice（最後に使った品物の番号）', values: choice, hl: [c] }, { label: 'used（後ろから集めている途中）', values: [...used] }], note: `容量${c}の最後の一手は品物${i}。used に加え、残り容量 ${c} - w[${i}] = ${c - w[i]} へ進む。` });
    c -= w[i];
  }
  const reversedUsed = [...used].reverse();
  steps.push({ line: 24, vars: {}, array: { label: 'used（使った順に並べ替え）', values: reversedUsed }, note: `used は価値の大きい側（容量${cap}）から集めたので、逆順にすると ${reversedUsed.join(', ')} の順で使ったことになる（番号の重複は同じ品物を複数回使ったことを表す）。` });

  registerTopic('4.10', {
    title: 'チャレンジ問題',
    explain: [
      'これまでに出てきた技法を組み合わせる章末問題。4.4 のナップザックを「同じ品物を何個でも使ってよい」（個数制限なしナップザック）に変え、さらに 4.2 のように実際に選んだ品物を復元する。',
      '個数制限なしナップザックは、1 次元の dp[c]（容量 c のときの価値の最大値）だけで表せる。品物 i を使うかどうかを考えるとき、「使った後」の残り容量 c - w[i] の dp はすでに確定しているので、同じ品物をもう1回使うことも自然に表現できる。',
      '復元は 4.2 と同じ考え方で、dp[c] を更新するたびに「最後に使った品物の番号」を choice[c] に記録し、容量 0 になるまで choice をたどる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, cap; cin >> n >> cap;',
      '  vector<int> w(n), v(n);',
      '  for (int i = 0; i < n; i++) cin >> w[i] >> v[i];',
      '  vector<int> dp(cap + 1, 0);',
      '  vector<int> choice(cap + 1, -1);',
      '  for (int c = 1; c <= cap; c++) {',
      '    for (int i = 0; i < n; i++) {',
      '      if (w[i] <= c && dp[c - w[i]] + v[i] > dp[c]) {',
      '        dp[c] = dp[c - w[i]] + v[i];',
      '        choice[c] = i;',
      '      }',
      '    }',
      '  }',
      '  cout << dp[cap] << endl;',
      '  vector<int> used;',
      '  int c = cap;',
      '  while (c > 0 && choice[c] != -1) {',
      '    used.push_back(choice[c]);',
      '    c -= w[choice[c]];',
      '  }',
      '  reverse(used.begin(), used.end());',
      '  for (int i = 0; i < (int)used.size(); i++) cout << used[i] << " \\n"[i + 1 == (int)used.size()];',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '青木君は N 種類の品物を持っていて、i 番目の重さは W_i、価値は V_i。それぞれ何個でも使ってよいものとして、重さの合計が W を超えないように選んだときの価値の合計の最大値と、実際に使った品物の番号を使った順に求めてください（同じ番号が複数回出てもよい）。',
      constraints: ['1 ≤ N ≤ 100', '1 ≤ W_i, V_i ≤ 1000', '1 ≤ W ≤ 1000', '入力はすべて整数'],
      input: 'N W\nW_1 V_1\n⋮\nW_N V_N',
      output: '1 行目に価値の合計の最大値、2 行目に使った品物の番号を使った順に空白区切りで出力してください。',
      samples: [
        { input: '3 7\n2 3\n3 4\n4 5', output: '10\n1 0 0' },
        { input: '2 1\n5 10\n6 20', output: '0\n', note: 'どの品物も重さが W = 1 より大きく、1 個も使えない。' },
      ],
    },
    solution: {
      idea: 'dp[c] =「容量 c のときの価値の最大値（品物は何個でも使える）」。品物 i を使うなら dp[c] = max(dp[c], dp[c - w_i] + v_i)。更新するたびに使った品物の番号を choice[c] に残し、choice をたどって復元する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, cap; cin >> n >> cap;',
        '  vector<int> w(n), v(n);',
        '  for (int i = 0; i < n; i++) cin >> w[i] >> v[i];',
        '  vector<int> dp(cap + 1, 0);',
        '  vector<int> choice(cap + 1, -1);',
        '  for (int c = 1; c <= cap; c++) {',
        '    for (int i = 0; i < n; i++) {',
        '      if (w[i] <= c && dp[c - w[i]] + v[i] > dp[c]) {',
        '        dp[c] = dp[c - w[i]] + v[i];',
        '        choice[c] = i;',
        '      }',
        '    }',
        '  }',
        '  cout << dp[cap] << endl;',
        '  vector<int> used;',
        '  int c = cap;',
        '  while (c > 0 && choice[c] != -1) {',
        '    used.push_back(choice[c]);',
        '    c -= w[choice[c]];',
        '  }',
        '  reverse(used.begin(), used.end());',
        '  for (int i = 0; i < (int)used.size(); i++) cout << used[i] << " \\n"[i + 1 == (int)used.size()];',
        '}',
      ].join('\n'),
    },
  });
})();
