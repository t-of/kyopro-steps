'use strict';
// 8章 データ構造とクエリ処理
// ステップ図のフレームは、実際のアルゴリズムを下の simulate* 関数で動かして作る（手計算のミスを防ぐため）。

// ---- 8.0 データ構造とは ----
(function registerDsIntro() {
  // 動機づけ: 配列の先頭を何度も取り除くと、そのたびに残りを全部ずらす必要があり重い。
  const a0 = [10, 20, 30, 40, 50];
  const steps = [];
  const a = [...a0];
  steps.push({ line: 5, vars: { 操作: 'a.erase(a.begin())' }, array: { label: 'a（先頭を取り除く前）', values: [...a] }, note: '配列 a の先頭を取り除きたい。vector::erase は「取り除いた後ろを 1 つずつ前へずらす」ことで実現している。' });
  const removed = a.shift();
  for (let i = 0; i < a.length; i++) {
    steps.push({ line: 5, vars: { removed, ずらす先: i }, array: { label: 'a（ずらしている途中）', values: [...a], hl: [i] }, note: `a[${i + 1}] を a[${i}] の位置へずらす。これを残り全部について行うので、要素数を N とすると 1 回の削除に O(N) かかる。` });
  }
  steps.push({ line: 6, vars: { removed }, array: { label: 'a（先頭を取り除いた後）', values: [...a] }, note: '先頭を 1 個取り除くだけで O(N) もかかってしまう。これを何度も繰り返すと全体で O(N²) になり重い。' });

  registerTopic('8.0', {
    title: 'データ構造とは',
    explain: [
      '同じ「値の集まり」でも、どんな操作を速くしたいかによって、向いた持ち方（データ構造）が違う。普通の配列（vector）は「末尾への追加・末尾の削除・添字でのアクセス」は O(1) で速いが、先頭の削除や、途中への挿入は残りを全部ずらす必要があり O(N) かかる。',
      'この章では、よく使う操作ごとに「それを速くするための形」を持つデータ構造（スタック・キュー・優先度付きキュー・連想配列・集合・セグメント木など）を見ていく。中身はほとんどが配列や木を工夫して並べたものにすぎない。',
      '大事なのは「この問題で何度もやる操作は何か」を見て、それが速いデータ構造を選ぶこと。例えば「最小値を何度も取り出す」なら優先度付きキュー、「区間の和や最小値に何度も答える」ならセグメント木、という具合。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  vector<int> a = {10, 20, 30, 40, 50};',
      '  a.erase(a.begin()); // 先頭を消す → 残りを 1 個ずつ前にずらす（O(N)）',
      '  for (int x : a) cout << x << " ";',
      '  cout << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '長さ N の数列に対して、「先頭の値を 1 個取り除く」という操作を Q 回行う（先頭がなくなったら何もしない）。すべての操作が終わった後に残っている数列を出力せよ。',
      constraints: ['1 ≤ N ≤ 2×10^5', '1 ≤ Q ≤ 2×10^5'],
      samples: [{ input: '5 3\n10 20 30 40 50', output: '40 50' }],
    },
    solution: {
      idea: 'vector の先頭を何度も erase すると 1 回 O(N) で、合計 O(NQ) になり N, Q が大きいと間に合わない。先頭から取り除くだけでよいなら、実際には消さずに「今の先頭の添字（開始位置）」を 1 つずつ進める deque や、添字管理だけで O(1) に抑えられる。8.2 のキューで詳しく扱う。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, q; cin >> n >> q;',
        '  vector<int> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  int head = 0;',
        '  for (int i = 0; i < q; i++) {',
        '    if (head < n) head++; // 先頭を「見なかったこと」にするだけ。ずらさない',
        '  }',
        '  for (int i = head; i < n; i++) cout << a[i] << " \\n"[i == n - 1];',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.1 スタック（括弧の対応など） ----
(function registerStack() {
  const s = '(()())';
  const steps = [];
  const stack = [];
  let ok = true;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') {
      stack.push(i);
      steps.push({ line: 9, vars: { i, c, stackサイズ: stack.length }, array: { label: 'スタック（上＝右端）', values: [...stack], hl: [stack.length - 1] }, note: `'(' が来たので、その位置 ${i} をスタックに push する。` });
    } else {
      if (stack.length === 0) {
        ok = false;
        steps.push({ line: 11, vars: { i, c, ok }, array: { label: 'スタック（上＝右端）', values: [...stack] }, note: `')' が来たが、スタックが空なので対応する '(' がない → 不正。` });
        break;
      }
      const top = stack[stack.length - 1];
      steps.push({ line: 12, vars: { i, c, topの位置: top }, array: { label: 'スタック（上＝右端）', values: [...stack], hl: [stack.length - 1] }, note: `')' が来たので、スタックの一番上（位置 ${top} の '('）と対応する。pop する。` });
      stack.pop();
    }
  }
  if (ok) steps.push({ line: 15, vars: { ok, stackサイズ: stack.length }, array: { label: 'スタック（上＝右端）', values: [...stack] }, note: `全部読み終わり、スタックが空なら正しい括弧列。` });

  registerTopic('8.1', {
    title: 'スタック（括弧の対応など）',
    explain: [
      'スタックは「後から入れたものを先に取り出す（LIFO: Last In, First Out）」データ構造。push で末尾に積み、pop で末尾から取り出す。どちらも O(1)。',
      '代表的な使い道が括弧列の対応判定。開き括弧が来たら push、閉じ括弧が来たら「一番最近の開き括弧」と対応させて pop する。最後にスタックが空なら、すべての括弧がきちんと対応している。',
      'C++ では std::stack<T> を使う。push・pop・top（一番上を見る）・empty（空か）だけのシンプルな操作しかできないが、それが「一番最近のもの」を扱う処理にぴったり合う。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  string s; cin >> s;',
      '  stack<int> st;',
      '  bool ok = true;',
      '  for (int i = 0; i < (int)s.size(); i++) {',
      '    if (s[i] == \'(\') {',
      '      st.push(i);',
      '    } else {',
      '      if (st.empty()) { ok = false; break; }',
      '      st.pop();',
      '    }',
      '  }',
      '  if (!st.empty()) ok = false;',
      '  cout << (ok ? "Yes" : "No") << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '"(" と ")" だけからなる文字列 S が与えられる。S が正しい括弧列（すべての "(" が、それより右にある対応する ")" とちょうど 1 対 1 で対応する）かどうかを判定せよ。',
      constraints: ['1 ≤ |S| ≤ 2×10^5'],
      samples: [
        { input: '(()())', output: 'Yes' },
        { input: '(()', output: 'No' },
        { input: ')(', output: 'No' },
      ],
    },
    solution: {
      idea: '左から見て "(" ならスタックに push、")" なら pop する（スタックが空なら途中で不正と確定）。最後までにスタックが空になっていれば、すべて対応が取れている。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  string s; cin >> s;',
        '  stack<int> st;',
        '  bool ok = true;',
        '  for (int i = 0; i < (int)s.size(); i++) {',
        '    if (s[i] == \'(\') {',
        '      st.push(i);',
        '    } else {',
        '      if (st.empty()) { ok = false; break; }',
        '      st.pop();',
        '    }',
        '  }',
        '  if (!st.empty()) ok = false;',
        '  cout << (ok ? "Yes" : "No") << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.2 キュー ----
(function registerQueue() {
  const tickets = [101, 102, 103, 104];
  const steps = [];
  const q = [];
  let served = 0;
  const ops = [
    { type: 'push', v: tickets[0] }, { type: 'push', v: tickets[1] }, { type: 'pop' },
    { type: 'push', v: tickets[2] }, { type: 'pop' }, { type: 'push', v: tickets[3] }, { type: 'pop' }, { type: 'pop' },
  ];
  for (const op of ops) {
    if (op.type === 'push') {
      q.push(op.v);
      steps.push({ line: 8, vars: { 操作: `push(${op.v})` }, array: { label: 'キュー（左＝先頭=front, 右＝末尾=back）', values: [...q], hl: [q.length - 1] }, note: `整理券 ${op.v} を列の末尾に push する。` });
    } else {
      const front = q.shift();
      served++;
      steps.push({ line: 9, vars: { 操作: 'pop', 呼ばれた番号: front, 対応した人数: served }, array: { label: 'キュー（左＝先頭=front, 右＝末尾=back）', values: [...q] }, note: `先頭（最初に並んだ ${front}）を pop して対応する。残りはそのまま並び順を保つ。` });
    }
  }

  registerTopic('8.2', {
    title: 'キュー',
    explain: [
      'キューは「先に入れたものを先に取り出す（FIFO: First In, First Out）」データ構造。push で末尾に追加、pop で先頭を取り出す。どちらも O(1)。窓口に並ぶ行列そのもの。',
      'スタックと違い、取り出す場所（先頭）と入れる場所（末尾）が逆の端にある。C++ では std::queue<T> を使い、push・front（先頭を見る）・pop・empty が基本操作。内部では deque（両端で O(1) の配列）を使っているので、先頭を取り出しても 8.0 で見たような「ずらし」は起きない。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int q; cin >> q;',
      '  queue<int> que;',
      '  for (int i = 0; i < q; i++) {',
      '    string op; cin >> op;',
      '    if (op == "P") { int x; cin >> x; que.push(x); }',
      '    else { cout << que.front() << endl; que.pop(); }',
      '  }',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'Q 個のクエリを順に処理する。クエリは 2 種類: "P x"（整理券番号 x の人が列に並ぶ）、"S"（先頭の人を呼び出して対応する。対応した人の番号を出力する）。すべての "S" クエリへの出力を順に答えよ。',
      constraints: ['1 ≤ Q ≤ 2×10^5', '1 ≤ x ≤ 10^9', '"S" が来るとき列は空でない'],
      samples: [{ input: '8\nP 101\nP 102\nS\nP 103\nS\nP 104\nS\nS', output: '101\n102\n103\n104' }],
    },
    solution: {
      idea: 'queue<int> に整理券番号をそのまま push し、"S" が来たら front を出力して pop する。すべて O(1) なので全体 O(Q)。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int q; cin >> q;',
        '  queue<int> que;',
        '  for (int i = 0; i < q; i++) {',
        '    string op; cin >> op;',
        '    if (op == "P") { int x; cin >> x; que.push(x); }',
        '    else { cout << que.front() << "\\n"; que.pop(); }',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.3 優先度付きキュー（priority_queue） ----
(function registerPQ() {
  // 二分ヒープを配列で表す。heap[0] が根。子は 2i+1, 2i+2。最大値が根にくる max-heap。
  const steps = [];
  const heap = [];
  function siftUp(i, label) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      steps.push({ line: 9, vars: { 比較する位置: i, 親の位置: p, heap_i: heap[i], heap_p: heap[p] }, array: { label, values: [...heap], hl: [i, p] }, note: `新しく入れた位置 ${i} の値 ${heap[i]} と、親（位置 ${p}）の値 ${heap[p]} を比べる。` });
      if (heap[p] >= heap[i]) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      steps.push({ line: 10, vars: { 入れ替え: `位置${i}と位置${p}` }, array: { label, values: [...heap], hl: [i, p] }, note: `子の方が大きいので親と入れ替える（max-heap は常に親 ≥ 子）。` });
      i = p;
    }
  }
  const pushVals = [5, 9, 3, 8, 1];
  const label = 'ヒープ（配列。親=⌊(i-1)/2⌋, 子=2i+1,2i+2）';
  for (const v of pushVals) {
    heap.push(v);
    steps.push({ line: 5, vars: { push: v }, array: { label, values: [...heap], hl: [heap.length - 1] }, note: `${v} を配列の末尾に置く（木の一番下・一番左の空きに入れたのと同じ）。` });
    siftUp(heap.length - 1, label);
  }
  // top を 2 回取り出す
  for (let k = 0; k < 2; k++) {
    const top = heap[0];
    steps.push({ line: 15, vars: { top }, array: { label, values: [...heap], hl: [0] }, note: `top() は常に根（位置 0）。今回は ${top}。これを答えとして取り出す。` });
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      steps.push({ line: 17, vars: {}, array: { label, values: [...heap], hl: [0] }, note: `根を取った穴に、一番最後の要素 ${last} を持ってきて、下へ沈めていく（sift-down）。` });
      // sift down
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let largest = i;
        if (l < heap.length && heap[l] > heap[largest]) largest = l;
        if (r < heap.length && heap[r] > heap[largest]) largest = r;
        if (largest === i) break;
        [heap[i], heap[largest]] = [heap[largest], heap[i]];
        steps.push({ line: 24, vars: { 入れ替え: `位置${i}と位置${largest}` }, array: { label, values: [...heap], hl: [i, largest] }, note: `子の方が大きいので下へ入れ替える。木の一番下まで、またはもう入れ替えが要らなくなるまで続く。` });
        i = largest;
      }
    }
  }

  registerTopic('8.3', {
    title: '優先度付きキュー（priority_queue）',
    explain: [
      '優先度付きキューは「一番大きい（または小さい）値を、すぐに取り出せる」データ構造。push は O(log N)、top で最大値を見るのは O(1)、pop（取り出し）は O(log N)。',
      '中身は「二分ヒープ」という木を、親 i の子が 2i+1, 2i+2 になるように配列へそのまま詰めたもの。木の形を保ちながら、new の要素は配列の末尾（木の一番下）に置き、親と比べて大きければ入れ替える（sift-up）ことで木の条件（親 ≥ 子）を保つ。',
      '取り出すときは根（配列の 0 番目）が答え。取った後は、末尾の要素を根に持ってきて、子と比べながら下へ沈める（sift-down）ことで木の形を保つ。C++ では std::priority_queue<T> がこれを全部やってくれる（既定では最大値が top）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'vector<int> heap;',
      'void push(int v) {',
      '  heap.push_back(v);',
      '  int i = heap.size() - 1;',
      '  while (i > 0) {',
      '    int p = (i - 1) / 2;',
      '    if (heap[p] >= heap[i]) break;',
      '    swap(heap[i], heap[p]);',
      '    i = p;',
      '  }',
      '}',
      'int topAndPop() {',
      '  int top = heap[0];',
      '  heap[0] = heap.back();',
      '  heap.pop_back();',
      '  int i = 0;',
      '  while (true) {',
      '    int l = 2 * i + 1, r = 2 * i + 2, largest = i;',
      '    if (l < (int)heap.size() && heap[l] > heap[largest]) largest = l;',
      '    if (r < (int)heap.size() && heap[r] > heap[largest]) largest = r;',
      '    if (largest == i) break;',
      '    swap(heap[i], heap[largest]);',
      '    i = largest;',
      '  }',
      '  return top;',
      '}',
      'int main() {',
      '  for (int v : {5, 9, 3, 8, 1}) push(v);',
      '  cout << topAndPop() << "\\n" << topAndPop() << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の整数を順に 1 つずつ受け取って push する。すべて push し終えたら、「top を出力して pop する」を 2 回繰り返せ（N ≥ 2 とする）。',
      constraints: ['2 ≤ N ≤ 2×10^5'],
      samples: [{ input: '5\n5 9 3 8 1', output: '9\n8' }],
    },
    solution: {
      idea: 'priority_queue<int> に全部 push すると、内部の二分ヒープが自動で「根が最大値」の状態を保つ。top・pop を 2 回呼べば、大きい順に 2 個取り出せる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  priority_queue<int> pq;',
        '  for (int i = 0; i < n; i++) { int v; cin >> v; pq.push(v); }',
        '  for (int k = 0; k < 2; k++) {',
        '    cout << pq.top() << "\\n";',
        '    pq.pop();',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.4 連想配列（map / unordered_map） ----
(function registerMap() {
  const words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
  const steps = [];
  const counts = {};
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    counts[w] = (counts[w] || 0) + 1;
    steps.push({
      line: 8, vars: { ...counts },
      array: { label: '読んだ単語', values: words.slice(0, i + 1), hl: [i] },
      note: `"${w}" を読んだので、連想配列の counts["${w}"] を ${counts[w]} に増やす（なければ 0 から始める）。`,
    });
  }
  steps.push({ line: 10, vars: { ...counts }, array: { label: '読んだ単語', values: [...words] }, note: '全部読み終わった。連想配列には、出てきた単語ごとの個数が入っている。' });

  registerTopic('8.4', {
    title: '連想配列（map / unordered_map）',
    explain: [
      '連想配列は「キー → 値」の対応を持つデータ構造。添字が整数に限らず、文字列や組などをキーにできる。std::map はキー順に並んだ木（検索・追加が O(log N)）、std::unordered_map はハッシュ表（平均 O(1)）。',
      'よくある使い道が「出現回数を数える」。配列のように毎回添字の範囲を気にせず、counts[word]++ のように、見たことのないキーでも自動で 0 から始められる。',
      'map は順番（キーの昇順）で走査できる、unordered_map は速いが順番は保証されない、という使い分けをする。迷ったら、順番がいらないなら unordered_map の方が速い。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n; cin >> n;',
      '  unordered_map<string, int> counts;',
      '  for (int i = 0; i < n; i++) {',
      '    string w; cin >> w;',
      '    counts[w]++;',
      '  }',
      '  cout << counts.size() << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の単語が与えられる。相異なる単語が何種類あるかを出力し、続けて最も多く出てきた単語の出現回数を出力せよ（同数が複数あれば好きなものでよい）。',
      constraints: ['1 ≤ N ≤ 2×10^5', '単語は英小文字のみ、長さ 1 以上 20 以下'],
      samples: [{ input: '6\napple banana apple cherry banana apple', output: '3\n3' }],
    },
    solution: {
      idea: 'unordered_map<string,int> に出現回数を数える。種類数は counts.size()、最大の出現回数は全体を回って最大値を取るだけ。全体で O(N)（ハッシュの平均計算量）。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  unordered_map<string, int> counts;',
        '  for (int i = 0; i < n; i++) {',
        '    string w; cin >> w;',
        '    counts[w]++;',
        '  }',
        '  int best = 0;',
        '  for (auto &p : counts) best = max(best, p.second);',
        '  cout << counts.size() << "\\n" << best << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.5 集合の管理（set、lower_bound） ----
(function registerSet() {
  const inserts = [5, 1, 9, 3, 7];
  const steps = [];
  let set = [];
  function insertSorted(v) {
    let i = 0;
    while (i < set.length && set[i] < v) i++;
    set.splice(i, 0, v);
    return i;
  }
  for (const v of inserts) {
    const pos = insertSorted(v);
    steps.push({ line: 6, vars: { insert: v, 入った位置: pos }, array: { label: 'set（常に昇順）', values: [...set], hl: [pos] }, note: `${v} を insert すると、set は常にソート済みなので、正しい位置（${pos} 番目）に入る。` });
  }
  // lower_bound(4): 最初に 4 以上になる位置
  const x = 4;
  let lb = 0;
  while (lb < set.length && set[lb] < x) lb++;
  steps.push({ line: 8, vars: { x, 'lower_bound(x)の位置': lb, その値: set[lb] ?? 'end()' }, array: { label: 'set（常に昇順）', values: [...set], hl: lb < set.length ? [lb] : [] }, note: `lower_bound(${x}) は「${x} 以上が初めて現れる位置」を O(log N) で返す。ここでは位置 ${lb}（値 ${set[lb] ?? '該当なし'}）。` });

  registerTopic('8.5', {
    title: '集合の管理（set、lower_bound）',
    explain: [
      'std::set<T> は「重複なし・常にソート済み」の集合。insert・erase・find はどれも O(log N)（中身は平衡二分探索木）。配列と違い、insert しても自分でソートし直す必要がない。',
      'set の強みは lower_bound(x)。「x 以上の値が初めて現れる場所」を O(log N) で返す（upper_bound は「x より大きい値が初めて現れる場所」）。ソート済み配列への二分探索（3 章）と同じ考え方を、値の追加・削除ができる形で使える。',
      '「ある値以上で一番小さいものを知りたい」「今まで見た値の中で、ある値に一番近いものを探したい」といった問題で威力を発揮する。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  set<int> s;',
      '  int n; cin >> n;',
      '  for (int i = 0; i < n; i++) { int v; cin >> v; s.insert(v); }',
      '  int x; cin >> x;',
      '  auto it = s.lower_bound(x);',
      '  if (it == s.end()) cout << -1 << endl;',
      '  else cout << *it << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個の整数を 1 つずつ集合に insert する（同じ値は 1 回しか入らないとしてよい）。その後、整数 X が与えられるので、集合の中で X 以上の値のうち最小のものを出力せよ（なければ -1）。',
      constraints: ['1 ≤ N ≤ 2×10^5', '1 ≤ 各値, X ≤ 10^9'],
      samples: [{ input: '5\n5 1 9 3 7\n4', output: '5' }],
    },
    solution: {
      idea: 'set<int> に全部 insert すれば常にソート済みになる。lower_bound(X) で「X 以上の最小値」の位置が O(log N) で求まる。end() なら該当なし。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  set<int> s;',
        '  for (int i = 0; i < n; i++) { int v; cin >> v; s.insert(v); }',
        '  int x; cin >> x;',
        '  auto it = s.lower_bound(x);',
        '  cout << (it == s.end() ? -1 : *it) << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.6 文字列のハッシュ（ローリングハッシュ） ----
(function registerHash() {
  const S = 'abcab';
  const B = 131n, M = 1000000007n;
  const steps = [];
  const n = S.length;
  const h = [0n];
  steps.push({ line: 4, vars: { B: B.toString(), M: M.toString() }, array: { label: 'prefix hash h（h[0]=0）', values: [0] }, note: 'h[0] = 0 から始める。h[i] は S の先頭 i 文字のハッシュ値。' });
  for (let i = 0; i < n; i++) {
    const code = BigInt(S.charCodeAt(i));
    const next = (h[i] * B + code) % M;
    h.push(next);
    steps.push({ line: 9, vars: { i, 'S[i]': S[i], 'h[i]': h[i].toString() }, array: { label: 'prefix hash h（h[0]=0）', values: h.map((v) => v.toString()), hl: [i + 1] }, note: `h[${i + 1}] = h[${i}] × B + S[${i}]（の文字コード） を M で割った余り。これで先頭 ${i + 1} 文字分のハッシュが求まる。` });
  }
  // クエリ: 部分文字列 [2,5) = "cab" のハッシュを、全体を数えずに求める
  const l = 2, r = 5;
  let powBR = 1n;
  for (let i = 0; i < r - l; i++) powBR = (powBR * B) % M;
  const sub = ((h[r] - h[l] * powBR) % M + M) % M;
  steps.push({
    line: 13, vars: { l, r, 'h[r]': h[r].toString(), 'h[l]': h[l].toString(), 'B^(r-l)': powBR.toString(), hash値: sub.toString() },
    array: { label: 'prefix hash h（h[0]=0）', values: h.map((v) => v.toString()), hl: [l, r] },
    note: `部分文字列 S[${l}..${r}) = "${S.slice(l, r)}" のハッシュは、h[${r}] − h[${l}]×B^${r - l} （mod M）で、文字を 1 つずつ見直さずに O(1) で求まる。`,
  });

  registerTopic('8.6', {
    title: '文字列のハッシュ（ローリングハッシュ）',
    explain: [
      '文字列をそのまま比較すると、長さ L の部分文字列どうしの比較に O(L) かかる。ローリングハッシュは、文字列を 1 つの整数（ハッシュ値）に変換し、2 つの文字列が同じかどうかを「ハッシュ値が同じか」でほぼ O(1) に近似できるようにする技法。',
      'まず prefix hash（先頭から i 文字分のハッシュ）h[i] を、h[i] = h[i-1]×B + S[i] (mod M) という漸化式で配列に作っておく（B は適当な基数、M は衝突を減らす大きな法）。',
      '一度 h を作っておけば、任意の部分文字列 S[l..r) のハッシュは h[r] − h[l]×B^(r-l) (mod M) という式だけで O(1) に求まる（B^(r-l) は事前に累乗の配列を作っておく）。これで 2 つの部分文字列が同じかの判定が O(1) になり、最長共通部分文字列や文字列の周期の判定などに使える。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'using ll = long long;',
      'const ll B = 131, M = 1000000007;',
      'int main() {',
      '  string s; cin >> s;',
      '  int n = s.size();',
      '  vector<ll> h(n + 1, 0);',
      '  for (int i = 0; i < n; i++) h[i + 1] = (h[i] * B + s[i]) % M;',
      '  vector<ll> p(n + 1, 1);',
      '  for (int i = 0; i < n; i++) p[i + 1] = p[i] * B % M;',
      '  int l, r; cin >> l >> r; // [l, r)',
      '  ll sub = ((h[r] - h[l] * p[r - l]) % M + M) % M;',
      '  cout << sub << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '英小文字からなる文字列 S と、クエリ (l, r) が与えられる。S の部分文字列 S[l..r)（0-indexed、l 文字目から r 文字目の手前まで）のローリングハッシュ値（B=131, M=1000000007）を求めよ。',
      constraints: ['1 ≤ |S| ≤ 2×10^5', '0 ≤ l < r ≤ |S|'],
      samples: [{ input: 'abcab\n2 5', output: '1711744' }],
    },
    solution: {
      idea: '先頭から累積的に h[i] を作り、B のべき乗 p[i] も前計算しておけば、どのクエリも h[r] − h[l]×p[r-l] (mod M) の式 1 つで O(1) に答えられる。全体で前計算 O(N) + クエリ 1 件 O(1)。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'using ll = long long;',
        'const ll B = 131, M = 1000000007;',
        'int main() {',
        '  string s; cin >> s;',
        '  int n = s.size();',
        '  vector<ll> h(n + 1, 0), p(n + 1, 1);',
        '  for (int i = 0; i < n; i++) {',
        '    h[i + 1] = (h[i] * B + s[i]) % M;',
        '    p[i + 1] = p[i] * B % M;',
        '  }',
        '  int l, r; cin >> l >> r;',
        '  ll sub = ((h[r] - h[l] * p[r - l]) % M + M) % M;',
        '  cout << sub << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.7 ダブリング ----
(function registerDoubling() {
  // next[i]: i の次の行き先（関数グラフ）。2^k 先を table[k][i] に埋める。
  const nxt = [3, 2, 0, 1, 3, 4]; // 6 ノード
  const n = nxt.length;
  const K = 3; // 2^0,2^1,2^2 まで（2^2=4 先まで届けば十分な例）
  const table = [[...nxt]];
  const steps = [];
  const cols = [...Array(n).keys()];
  steps.push({ line: 6, vars: { K }, table: { label: 'table[k][i] = iから2^k歩進んだ先', rows: ['k=0'], cols, data: [[...nxt]] }, note: 'table[0][i] は「1 歩（2^0 歩）先」＝ next[i] そのまま。' });
  for (let k = 1; k < K; k++) {
    const prev = table[k - 1];
    const row = new Array(n);
    for (let i = 0; i < n; i++) {
      row[i] = prev[prev[i]];
    }
    table.push(row);
    steps.push({
      line: 9, vars: { k },
      table: { label: 'table[k][i] = iから2^k歩進んだ先', rows: table.map((_, r) => `k=${r}`), cols, data: table.map((r) => [...r]), hl: cols.map((c) => [k, c]) },
      note: `table[${k}][i] = table[${k - 1}][ table[${k - 1}][i] ]。「2^${k - 1} 歩進んで、さらに 2^${k - 1} 歩進む」で 2^${k} 歩先になる。`,
    });
  }
  // クエリ: i=1 から 5 歩進んだ先
  let cur = 1, steps_left = 5;
  const trace = [];
  for (let k = K - 1; k >= 0; k--) {
    if ((steps_left >> k) & 1) {
      const nextCur = table[k][cur];
      trace.push({ k, from: cur, to: nextCur });
      cur = nextCur;
    }
  }
  steps.push({
    line: 10, vars: { 開始: 1, 歩数: 5, '2進法': (5).toString(2) },
    table: { label: 'table[k][i] = iから2^k歩進んだ先', rows: table.map((_, r) => `k=${r}`), cols, data: table.map((r) => [...r]) },
    note: `5 歩進みたい。5 = 4+1 = 2^2+2^0 なので、2進法の立っているビットの分だけ table を使って一気に進む。`,
  });
  for (const t of trace) {
    steps.push({
      line: 13, vars: { 使うk: t.k, from: t.from, to: t.to },
      table: { label: 'table[k][i] = iから2^k歩進んだ先', rows: table.map((_, r) => `k=${r}`), cols, data: table.map((r) => [...r]), hl: [[t.k, t.from]] },
      note: `2^${t.k} のビットが立っているので table[${t.k}][${t.from}] = ${t.to} を使って一気に進む。`,
    });
  }
  steps.push({ line: 14, vars: { 答え: cur }, table: { label: 'table[k][i] = iから2^k歩進んだ先', rows: table.map((_, r) => `k=${r}`), cols, data: table.map((r) => [...r]) }, note: `合計 log(歩数) 回の table 参照で、5 歩先の ${cur} へたどり着いた。歩数が 10^9 でも、table さえ作っておけば O(log(歩数)) で答えられる。` });

  registerTopic('8.7', {
    title: 'ダブリング',
    explain: [
      '「各点から次の点が 1 つに決まる」関数的なグラフ（next[i]）で、「i から K 歩進んだ先はどこか」を何度も聞かれるとき、1 歩ずつ K 回たどると 1 クエリ O(K) かかってしまう。',
      'ダブリングは、あらかじめ table[k][i] =「i から 2^k 歩進んだ先」を、table[k][i] = table[k-1][ table[k-1][i] ] という漸化式で作っておく技法。2^(k-1) 歩進んで、さらに 2^(k-1) 歩進めば 2^k 歩になる、という「倍々」の考え方。',
      '表さえ作れば（前計算 O(N log K)）、K 歩進んだ先は、K を 2 進法で見て立っているビットの分だけ table を使うことで O(log K) で求まる。LCA（最近共通祖先）やサイクル検出など、グラフを K 歩たどる系の問題で広く使われる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, K = 20; cin >> n;',
      '  vector<vector<int>> table(K, vector<int>(n));',
      '  for (auto &x : table[0]) cin >> x; // table[0][i] = next[i]',
      '  for (int k = 1; k < K; k++)',
      '    for (int i = 0; i < n; i++)',
      '      table[k][i] = table[k - 1][ table[k - 1][i] ];',
      '  int start, steps_; cin >> start >> steps_;',
      '  int cur = start;',
      '  for (int k = 0; k < K; k++)',
      '    if ((steps_ >> k) & 1) cur = table[k][cur];',
      '  cout << cur << endl;',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: 'N 個のマス（0 から N-1）があり、マス i からは next[i] へ 1 歩で進む。開始マスと歩数 D が与えられるので、ちょうど D 歩進んだ先のマス番号を求めよ（D は非常に大きいことがある）。',
      constraints: ['1 ≤ N ≤ 2×10^5', '0 ≤ D ≤ 10^9'],
      samples: [{ input: '6\n3 2 0 1 3 4\n1 5', output: '2' }],
    },
    solution: {
      idea: 'table[0][i]=next[i] から始め、table[k][i]=table[k-1][table[k-1][i]] を K=log2(D)+1 段まで作る（前計算 O(N log D)）。D を 2 進法に分解し、立っているビットの k ごとに table[k] を使って進めれば O(log D) で答えが求まる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n; cin >> n;',
        '  const int K = 31;',
        '  vector<vector<int>> table(K, vector<int>(n));',
        '  for (auto &x : table[0]) cin >> x;',
        '  for (int k = 1; k < K; k++)',
        '    for (int i = 0; i < n; i++)',
        '      table[k][i] = table[k - 1][table[k - 1][i]];',
        '  int start; long long d; cin >> start >> d;',
        '  int cur = start;',
        '  for (int k = 0; k < K; k++)',
        '    if ((d >> k) & 1) cur = table[k][cur];',
        '  cout << cur << endl;',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- セグメント木 共通の土台（8.8 / 8.9 で使う） ----
function buildSegTreeSteps(a, op, identity, opName, labelPrefix) {
  // 反復（iterative, 1-indexed, 葉が n..2n-1）のセグメント木。n は a.length（2 のべき乗にそろえる）。
  let sz = 1;
  while (sz < a.length) sz *= 2;
  const tree = new Array(2 * sz).fill(identity);
  const n = sz;

  function rowsOf(curTree) {
    // 木を段ごとに分けて arrays の複数行にする（1 が根、2,3 が次の段…n..2n-1 が葉）。
    const rows = [];
    let lo = 1;
    while (lo < 2 * n) {
      const hi = Math.min(2 * n, lo * 2);
      rows.push({ lo, hi, values: curTree.slice(lo, hi) });
      lo = hi;
    }
    return rows;
  }
  function frame(line, vars, hlGlobal, note) {
    const rows = rowsOf(tree);
    const arrays = rows.map((r, ri) => ({
      label: ri === rows.length - 1 ? `葉（元の配列, idx ${r.lo}..${r.hi - 1}）` : `内部ノード idx ${r.lo}..${r.hi - 1}`,
      values: r.values,
      hl: hlGlobal.filter((g) => g >= r.lo && g < r.hi).map((g) => g - r.lo),
    }));
    return { line, vars, arrays, note };
  }

  const steps = [];
  for (let i = 0; i < n; i++) {
    tree[n + i] = i < a.length ? a[i] : identity;
  }
  steps.push(frame(8, { n }, [...Array(n).keys()].map((i) => n + i), `元の配列 ${JSON.stringify(a)} を葉（idx ${n}..${2 * n - 1}）に並べる。足りない分は単位元（${opName} に影響しない値）で埋める。`));
  for (let i = n - 1; i >= 1; i--) {
    tree[i] = op(tree[2 * i], tree[2 * i + 1]);
    steps.push(frame(9, { i, 左の子: tree[2 * i], 右の子: tree[2 * i + 1] }, [i, 2 * i, 2 * i + 1], `idx ${i} の値は、2 つの子（idx ${2 * i}, ${2 * i + 1}）を ${opName} して ${tree[i]} になる。これを根（idx 1）まで繰り返す。`));
  }

  function update(pos, val) {
    let i = pos + n;
    tree[i] = val;
    steps.push(frame(13, { pos, val }, [i], `葉 idx ${i}（元の配列の pos=${pos}）の値を ${val} に書き換える。`));
    i = Math.floor(i / 2);
    while (i >= 1) {
      tree[i] = op(tree[2 * i], tree[2 * i + 1]);
      steps.push(frame(14, { i }, [i, 2 * i, 2 * i + 1], `親 idx ${i} を、子 idx ${2 * i}, ${2 * i + 1} から ${opName} して ${tree[i]} に更新する。根まで上る。`));
      i = Math.floor(i / 2);
    }
  }

  function query(l, r) {
    // [l, r) 半開区間、0-indexed
    let res = identity;
    let lo = l + n, hi = r + n;
    const visited = [];
    steps.push(frame(17, { l, r }, [], `区間 [${l}, ${r}) の${opName}を求めたい。葉の idx ${lo} と ${hi} から、木を上りながら必要なノードだけを集める。`));
    while (lo < hi) {
      if (lo & 1) {
        res = op(res, tree[lo]);
        visited.push(lo);
        steps.push(frame(19, { res }, [lo], `idx ${lo} は区間の左端で、自分の親が区間の外も含んでしまうので、このノード自身を答えに取り込む。`));
        lo++;
      }
      if (hi & 1) {
        hi--;
        res = op(res, tree[hi]);
        visited.push(hi);
        steps.push(frame(20, { res }, [hi], `idx ${hi} は区間の右端で、同じ理由でこのノード自身を答えに取り込む。`));
      }
      lo = Math.floor(lo / 2);
      hi = Math.floor(hi / 2);
    }
    steps.push(frame(22, { 答え: res }, visited, `上まで行き着いた。訪れたノードを ${opName} してまとめた答えは ${res}。全体で O(log N) 回しか見ていない。`));
    return res;
  }

  return { steps, update, query, tree };
}

// ---- 8.8 セグメント木:RMQ ----
(function registerSegRMQ() {
  const INF = Infinity;
  const a = [5, 2, 8, 1, 9, 3];
  const built = buildSegTreeSteps(a, (x, y) => Math.min(x, y), INF, '最小値', 'min');
  built.update(3, 0); // a[3] = 1 -> 0
  built.query(1, 5); // [1,5)

  registerTopic('8.8', {
    title: 'セグメント木: RMQ（区間最小値）',
    explain: [
      'セグメント木は、配列を「木」として持つことで、区間に対する質問（最小値・最大値・和など）と、1 点の更新を、どちらも O(log N) でこなせるデータ構造。',
      '葉（木の一番下）に元の配列の値を並べ、内部のノードには「自分の 2 つの子を演算（RMQ なら min）した結果」を持たせる。これを配列 1 本（1-indexed、子は 2i, 2i+1）で表現できる。',
      '1 点更新は、その葉から親へ 1 段ずつ登りながら min を計算し直すだけで O(log N)。区間 [l, r) の最小値クエリは、区間の端にあたる O(log N) 個のノードだけを木の形に沿って集めれば求まる（全部の葉を見る必要はない）。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'const int INF = 1e9;',
      'int n; vector<int> seg;',
      'void build(vector<int>& a) {',
      '  n = 1; while (n < (int)a.size()) n *= 2;',
      '  seg.assign(2 * n, INF);',
      '  for (int i = 0; i < (int)a.size(); i++) seg[n + i] = a[i];',
      '  for (int i = n - 1; i >= 1; i--) seg[i] = min(seg[2*i], seg[2*i+1]);',
      '}',
      'void update(int pos, int val) {',
      '  int i = pos + n;',
      '  seg[i] = val;',
      '  for (i /= 2; i >= 1; i /= 2) seg[i] = min(seg[2*i], seg[2*i+1]);',
      '}',
      'int query(int l, int r) { // [l, r)',
      '  int res = INF;',
      '  for (l += n, r += n; l < r; l /= 2, r /= 2) {',
      '    if (l & 1) res = min(res, seg[l++]);',
      '    if (r & 1) res = min(res, seg[--r]);',
      '  }',
      '  return res;',
      '}',
      'int main() {',
      '  int n_, q; cin >> n_ >> q;',
      '  vector<int> a(n_);',
      '  for (auto &x : a) cin >> x;',
      '  build(a);',
      '  for (int i = 0; i < q; i++) {',
      '    int type; cin >> type;',
      '    if (type == 1) { int p, x; cin >> p >> x; update(p, x); }',
      '    else { int l, r; cin >> l >> r; cout << query(l, r) << "\\n"; }',
      '  }',
      '}',
    ].join('\n'),
    steps: built.steps,
    example: {
      statement: '長さ N の数列 a に、Q 個のクエリを順に処理する。クエリは 2 種類: "1 p x"（a[p] を x に変える）、"2 l r"（区間 [l, r) の最小値を出力する）。',
      constraints: ['1 ≤ N, Q ≤ 2×10^5', '0 ≤ a_i, x ≤ 10^9', '0 ≤ l < r ≤ N'],
      samples: [{ input: '6 2\n5 2 8 1 9 3\n1 3 0\n2 1 5', output: '0' }],
    },
    solution: {
      idea: '区間最小値クエリ（RMQ）と 1 点更新をどちらも O(log N) で行うため、反復実装のセグメント木を使う。N を超える最小の 2 べき n を木のサイズとし、葉に元の配列、内部ノードに min を持たせる。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const int INF = 1e9;',
        'int n; vector<int> seg;',
        'void build(vector<int>& a) {',
        '  n = 1; while (n < (int)a.size()) n *= 2;',
        '  seg.assign(2 * n, INF);',
        '  for (int i = 0; i < (int)a.size(); i++) seg[n + i] = a[i];',
        '  for (int i = n - 1; i >= 1; i--) seg[i] = min(seg[2*i], seg[2*i+1]);',
        '}',
        'void update(int pos, int val) {',
        '  int i = pos + n;',
        '  seg[i] = val;',
        '  for (i /= 2; i >= 1; i /= 2) seg[i] = min(seg[2*i], seg[2*i+1]);',
        '}',
        'int query(int l, int r) {',
        '  int res = INF;',
        '  for (l += n, r += n; l < r; l /= 2, r /= 2) {',
        '    if (l & 1) res = min(res, seg[l++]);',
        '    if (r & 1) res = min(res, seg[--r]);',
        '  }',
        '  return res;',
        '}',
        'int main() {',
        '  int n_, q; cin >> n_ >> q;',
        '  vector<int> a(n_);',
        '  for (auto &x : a) cin >> x;',
        '  build(a);',
        '  for (int i = 0; i < q; i++) {',
        '    int type; cin >> type;',
        '    if (type == 1) { int p, x; cin >> p >> x; update(p, x); }',
        '    else { int l, r; cin >> l >> r; cout << query(l, r) << "\\n"; }',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.9 セグメント木:RSQ ----
(function registerSegRSQ() {
  const a = [1, 3, 5, 7, 9, 11];
  const built = buildSegTreeSteps(a, (x, y) => x + y, 0, '合計', 'sum');
  built.update(2, 0); // a[2] = 5 -> 0
  built.query(0, 4); // [0,4)

  registerTopic('8.9', {
    title: 'セグメント木: RSQ（区間和）',
    explain: [
      '区間和クエリ（RSQ）は累積和（2 章）でも O(1) で求まるが、累積和は「途中で値を更新する」と、その後ろ全部を作り直す必要があり O(N) かかってしまう。',
      'セグメント木なら、演算を min の代わりに + にするだけで、8.8 とまったく同じ仕組みのまま「1 点更新 O(log N)」と「区間和クエリ O(log N)」を両立できる。内部ノードが「自分の子 2 つの合計」を持つようになるだけ。',
      '更新ができる区間和、というのがポイント。累積和は更新のない静的な配列向き、セグメント木は更新がある・ない両方に強い、という使い分けになる。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'using ll = long long;',
      'int n; vector<ll> seg;',
      'void build(vector<ll>& a) {',
      '  n = 1; while (n < (int)a.size()) n *= 2;',
      '  seg.assign(2 * n, 0);',
      '  for (int i = 0; i < (int)a.size(); i++) seg[n + i] = a[i];',
      '  for (int i = n - 1; i >= 1; i--) seg[i] = seg[2*i] + seg[2*i+1];',
      '}',
      'void update(int pos, ll val) {',
      '  int i = pos + n;',
      '  seg[i] = val;',
      '  for (i /= 2; i >= 1; i /= 2) seg[i] = seg[2*i] + seg[2*i+1];',
      '}',
      'll query(int l, int r) { // [l, r)',
      '  ll res = 0;',
      '  for (l += n, r += n; l < r; l /= 2, r /= 2) {',
      '    if (l & 1) res += seg[l++];',
      '    if (r & 1) res += seg[--r];',
      '  }',
      '  return res;',
      '}',
      'int main() {',
      '  int n_, q; cin >> n_ >> q;',
      '  vector<ll> a(n_);',
      '  for (auto &x : a) cin >> x;',
      '  build(a);',
      '  for (int i = 0; i < q; i++) {',
      '    int type; cin >> type;',
      '    if (type == 1) { int p; ll x; cin >> p >> x; update(p, x); }',
      '    else { int l, r; cin >> l >> r; cout << query(l, r) << "\\n"; }',
      '  }',
      '}',
    ].join('\n'),
    steps: built.steps,
    example: {
      statement: '長さ N の数列 a に、Q 個のクエリを順に処理する。クエリは 2 種類: "1 p x"（a[p] を x に変える）、"2 l r"（区間 [l, r) の和を出力する）。',
      constraints: ['1 ≤ N, Q ≤ 2×10^5', '0 ≤ a_i, x ≤ 10^9', '0 ≤ l < r ≤ N'],
      samples: [{ input: '6 2\n1 3 5 7 9 11\n1 2 0\n2 0 4', output: '11' }],
    },
    solution: {
      idea: '8.8 の min を + に、単位元を INF の代わりに 0 に変えるだけで、更新ができる区間和（RSQ）が同じ木の形で実現できる。long long で桁あふれに注意する。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'using ll = long long;',
        'int n; vector<ll> seg;',
        'void build(vector<ll>& a) {',
        '  n = 1; while (n < (int)a.size()) n *= 2;',
        '  seg.assign(2 * n, 0);',
        '  for (int i = 0; i < (int)a.size(); i++) seg[n + i] = a[i];',
        '  for (int i = n - 1; i >= 1; i--) seg[i] = seg[2*i] + seg[2*i+1];',
        '}',
        'void update(int pos, ll val) {',
        '  int i = pos + n;',
        '  seg[i] = val;',
        '  for (i /= 2; i >= 1; i /= 2) seg[i] = seg[2*i] + seg[2*i+1];',
        '}',
        'll query(int l, int r) {',
        '  ll res = 0;',
        '  for (l += n, r += n; l < r; l /= 2, r /= 2) {',
        '    if (l & 1) res += seg[l++];',
        '    if (r & 1) res += seg[--r];',
        '  }',
        '  return res;',
        '}',
        'int main() {',
        '  int n_, q; cin >> n_ >> q;',
        '  vector<ll> a(n_);',
        '  for (auto &x : a) cin >> x;',
        '  build(a);',
        '  for (int i = 0; i < q; i++) {',
        '    int type; cin >> type;',
        '    if (type == 1) { int p; ll x; cin >> p >> x; update(p, x); }',
        '    else { int l, r; cin >> l >> r; cout << query(l, r) << "\\n"; }',
        '  }',
        '}',
      ].join('\n'),
    },
  });
})();

// ---- 8.10 チャレンジ問題（章のまとめ） ----
(function registerChallenge() {
  // スライド幅Kの最小値を、単調（増加）なデックで O(N) に求める。スタック/キューの応用。
  const a = [4, 2, 5, 1, 6, 3, 7];
  const K = 3;
  const steps = [];
  const deque = []; // 添字を保持。値が昇順になるように保つ（先頭が現在のウィンドウの最小値）
  const ans = [];
  for (let i = 0; i < a.length; i++) {
    while (deque.length && a[deque[deque.length - 1]] >= a[i]) {
      const popped = deque.pop();
      steps.push({ line: 10, vars: { i, 'a[i]': a[i], 追い出す添字: popped }, array: { label: 'a（窓=直近K個）', values: a, hl: [i, popped] }, note: `末尾の添字 ${popped}（値 ${a[popped]}）は a[${i}]=${a[i]} 以上なので、もう最小値候補になれず追い出す（back を pop）。` });
    }
    deque.push(i);
    steps.push({ line: 11, vars: { i }, array: { label: 'a（窓=直近K個）', values: a, hl: [...deque] }, note: `添字 ${i} を末尾に push する。デックの中は常に値が昇順。` });
    if (deque[0] <= i - K) {
      const popped = deque.shift();
      steps.push({ line: 12, vars: { i, 古い添字: popped }, array: { label: 'a（窓=直近K個）', values: a, hl: [...deque] }, note: `先頭の添字 ${popped} は窓（直近 ${K} 個）から外れたので、front を pop する。` });
    }
    if (i >= K - 1) {
      ans.push(a[deque[0]]);
      steps.push({ line: 13, vars: { i, 窓の最小値: a[deque[0]] }, array: { label: 'a（窓=直近K個）', values: a, hl: [deque[0]] }, arrays: undefined, note: `先頭の添字 ${deque[0]} の値 ${a[deque[0]]} が、今の窓 [${i - K + 1}, ${i}] の最小値。答えに加える。` });
    }
  }
  steps.push({ line: 15, vars: {}, array: { label: `各窓の最小値（答え: [${ans.join(', ')}]）`, values: ans }, note: 'すべての窓について、追い出す／加えるを合わせても要素は 1 回ずつしか出入りしないので、全体 O(N)。8.1 のスタックと 8.2 のキューを合わせた「デック」の応用。' });

  registerTopic('8.10', {
    title: 'チャレンジ問題（8章のまとめ）',
    explain: [
      'この章の総まとめとして、「スタックとキューを両方の端で使えるようにした deque」を使う問題を見る。配列を幅 K の窓でスライドさせ、各窓の最小値を全部求めたい。',
      '素朴にやると、窓ごとに K 個を見て最小値を探すので O(NK)。そこで、deque に「まだ最小値候補になりうる添字」だけを、値が昇順になるように保つ。新しい値が来たら、末尾からそれ以上の値を追い出し（もう最小値になれないので）、先頭が窓の外に出たら front から捨てる。',
      'それぞれの添字は deque に高々 1 回入り、1 回しか出ない（push_back と pop_back / pop_front のどちらか）ので、全体で O(N) になる。「不要になったものをどちらかの端から捨てる」という、スタックとキューの両方の発想が合わさっている。',
    ],
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  int n, k; cin >> n >> k;',
      '  vector<int> a(n);',
      '  for (auto &x : a) cin >> x;',
      '  deque<int> dq; // 添字。a[dq[0]] <= a[dq[1]] <= ... を保つ',
      '  vector<int> ans;',
      '  for (int i = 0; i < n; i++) {',
      '    while (!dq.empty() && a[dq.back()] >= a[i]) dq.pop_back();',
      '    dq.push_back(i);',
      '    if (dq.front() <= i - k) dq.pop_front();',
      '    if (i >= k - 1) ans.push_back(a[dq.front()]);',
      '  }',
      '  for (int i = 0; i < (int)ans.size(); i++) cout << ans[i] << " \\n"[i + 1 == (int)ans.size()];',
      '}',
    ].join('\n'),
    steps,
    example: {
      statement: '長さ N の数列 a と整数 K が与えられる。長さ K の連続する区間（窓）を、左端を 0 から N-K まで 1 つずつ動かしながら、各窓での最小値をすべて求めよ。',
      constraints: ['1 ≤ K ≤ N ≤ 2×10^5', '1 ≤ a_i ≤ 10^9'],
      samples: [{ input: '7 3\n4 2 5 1 6 3 7', output: '2 1 1 1 3' }],
    },
    solution: {
      idea: '添字の deque を「値が昇順」になるように保つ単調デック法。新しい添字を入れる前に、末尾から「新しい値以上」の添字を全部追い出す（もう最小値候補になれないため）。先頭が窓から外れたら捨てる。各添字は高々 1 回しか push/pop されないので O(N)。',
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main() {',
        '  int n, k; cin >> n >> k;',
        '  vector<int> a(n);',
        '  for (auto &x : a) cin >> x;',
        '  deque<int> dq;',
        '  vector<int> ans;',
        '  for (int i = 0; i < n; i++) {',
        '    while (!dq.empty() && a[dq.back()] >= a[i]) dq.pop_back();',
        '    dq.push_back(i);',
        '    if (dq.front() <= i - k) dq.pop_front();',
        '    if (i >= k - 1) ans.push_back(a[dq.front()]);',
        '  }',
        '  for (int i = 0; i < (int)ans.size(); i++) cout << ans[i] << " \\n"[i + 1 == (int)ans.size()];',
        '}',
      ].join('\n'),
    },
  });
})();
