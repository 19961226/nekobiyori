/* ==========================================================
   保護猫カフェ ねこびより main.js
   ページごとに、必要な要素があるときだけ処理を動かします。
   ========================================================== */

/* ----------------------------------------------------------
   画像の拡張子（ChatGPTで作った画像に差し替えたら変更）
   例：'.jpg' / '.png' / '.webp'
   ※ HTML 内の画像は「images/〇〇.svg」を一括置換してください
   ---------------------------------------------------------- */
const IMG_EXT = '.jpg';

/* ----------------------------------------------------------
   猫のデータ（▼WP化：猫の紹介。WordPress化の際はカスタム投稿に置き換え）
   名前・性別・性格：Canva「ブルー 猫 カフェ お知らせ チラシ A4」の掲載内容
   status：stay＝在籍中 / adopt＝譲渡相談受付中 / home＝家族が決まりました
   ---------------------------------------------------------- */
const CATS = [
  {
    id: 'cat-01',
    name: 'モカ',
    sex: '女の子',
    sexMark: '♀',
    age: '推定3歳',
    status: 'stay',
    personality: 'のんびりやさん\nお昼寝が好き',
    story: '保護されたときは警戒心が強く、ケージの奥でじっとしていました。お店に来てからは、ふかふかのクッションがお気に入り。窓辺でお昼寝している姿をよく見かけます。',
  },
  {
    id: 'cat-02',
    name: 'とらじ',
    sex: '男の子',
    sexMark: '♂',
    age: '推定4歳',
    status: 'adopt',
    personality: '膝の上で寝る\nのが大好き！',
    story: '公園で人なつっこく近寄ってきたところを保護されました。慣れてくると、お客様のひざの上でぐっすり眠ってしまうこともあります。',
  },
  {
    id: 'cat-03',
    name: 'ショコラ',
    sex: '男の子',
    sexMark: '♂',
    age: '推定2歳',
    status: 'stay',
    personality: '甘えん坊で\n恥ずかしがり屋',
    story: '保護当初は人の気配に驚いて、物かげに隠れてばかりいました。今でも少し離れたところから様子を見ていますが、仲良くなるとそっと甘えにきてくれます。',
  },
  {
    id: 'cat-04',
    name: 'おまめ',
    sex: '女の子',
    sexMark: '♀',
    age: '推定5歳',
    status: 'adopt',
    personality: 'おっとりさんで\n甘えん坊',
    story: '飼い主さんの事情で手放され、お店にやってきました。おっとりした性格で、やさしくなでられるのが大好きです。',
  },
  {
    id: 'cat-05',
    name: 'のりまき',
    sex: '男の子',
    sexMark: '♂',
    age: '推定1歳',
    status: 'stay',
    personality: 'おてんばで\n猫タワーが好き',
    story: '子猫のころに兄弟と一緒に保護されました。元気いっぱいで、キャットタワーのてっぺんがお気に入りの場所です。',
  },
  {
    id: 'cat-06',
    name: 'ころもち',
    sex: '女の子',
    sexMark: '♀',
    age: '推定3歳',
    status: 'adopt',
    personality: 'マイペース\nおやつが大好き',
    story: '雨の日に段ボール箱の中で見つかったのが、保護のきっかけでした。今でも箱に入るのが得意で、おやつの時間になると真っ先にやってきます。',
  },
];

const STATUS_LABEL = {
  stay: '在籍中',
  adopt: '譲渡相談受付中',
  home: '家族が決まりました',
};

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.remove('no-js');

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initDrawer();
  initHero();
  initCats();
  initFaq();
  initNewsFilter();
  initCalendar();
  initReserve();
  initPawPrint();
  initPlanPeek();
  initPawWalk();
  initFade(); // 動的に追加した要素も対象にするため最後に実行
});

/* ----------------------------------------------------------
   追従ヘッダー：スクロールで背景と影をつける
   ---------------------------------------------------------- */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ----------------------------------------------------------
   ハンバーガーメニュー
   ---------------------------------------------------------- */
function initDrawer() {
  const btn = document.querySelector('.hamburger');
  const drawer = document.getElementById('drawer');
  if (!btn || !drawer) return;

  const toggle = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
  };

  btn.addEventListener('click', () => {
    toggle(btn.getAttribute('aria-expanded') !== 'true');
  });
  drawer.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => toggle(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) toggle(false);
  });
  // PC幅になったら閉じる
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) toggle(false);
  });
}

/* ----------------------------------------------------------
   ファーストビュー：オープニング＋スライドショー
   HERO_INTERVAL ミリ秒ごとにフェードで切り替え（フェードの長さは SCSS の .hero__slide で調整）
   ---------------------------------------------------------- */
const HERO_INTERVAL = 6000;

function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.hero__slide')];
  let current = 0;
  let timer = null;

  const show = (index) => {
    const prev = slides[current];
    prev.classList.remove('is-active');
    prev.classList.add('is-prev');
    prev.setAttribute('aria-hidden', 'true');
    setTimeout(() => prev.classList.remove('is-prev'), 1700);
    current = (index + slides.length) % slides.length;
    slides[current].classList.remove('is-prev');
    slides[current].classList.add('is-active');
    slides[current].removeAttribute('aria-hidden');
  };

  const stop = () => { clearInterval(timer); timer = null; };
  const play = () => {
    stop();
    // 視差効果を減らす設定の端末では自動で切り替えない
    if (prefersReduced || slides.length < 2) return;
    timer = setInterval(() => show(current + 1), HERO_INTERVAL);
  };
  // 別のタブを見ているあいだは止める
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));

  const start = () => {
    if (hero.classList.contains('is-loaded')) return;
    hero.classList.add('is-loaded');
    play();
  };
  const img = slides[0] ? slides[0].querySelector('img') : null;
  if (img && !img.complete) {
    img.addEventListener('load', start, { once: true });
    img.addEventListener('error', start, { once: true });
    setTimeout(start, 1500); // 読み込みが遅い場合も表示
  } else {
    start();
  }
}

/* ----------------------------------------------------------
   スクロールでフェードイン
   ---------------------------------------------------------- */
function initFade() {
  const targets = document.querySelectorAll('.js-fade');
  if (!targets.length) return;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  targets.forEach((el) => io.observe(el));
}

/* ----------------------------------------------------------
   猫たち：一覧の描画・絞り込み・詳細モーダル
   ---------------------------------------------------------- */
const br = (text) => text.replace(/\n/g, '<br>');
const flat = (text) => text.replace(/\n/g, '');

// Canvaチラシのレイアウト：名前（性別）→ 猫耳つきのアーチ型写真 → 性格の吹き出し
function catCardHTML(cat) {
  return `
    <button type="button" class="cat-card" data-cat-id="${cat.id}" data-status="${cat.status}" aria-haspopup="dialog">
      <span class="cat-card__name">${cat.name}<span class="cat-card__sex" aria-label="${cat.sex}">（${cat.sexMark}）</span></span>
      <span class="cat-card__frame">
        <span class="cat-card__photo">
          <!-- 画像差し替え：${cat.id}｜800×800（1:1）｜${cat.name}のプロフィール写真 -->
          <img src="images/${cat.id}${IMG_EXT}" width="800" height="800" alt="${cat.name}の写真" loading="lazy">
        </span>
        <span class="tag tag--${cat.status} cat-card__status">${STATUS_LABEL[cat.status]}</span>
      </span>
      <span class="cat-card__personality">${br(cat.personality)}<svg class="cat-card__paw" aria-hidden="true"><use href="#i-paw"></use></svg></span>
      <span class="cat-card__more">プロフィールを見る</span>
    </button>`;
}

function initCats() {
  const list = document.getElementById('catList');
  const preview = document.getElementById('catPreview');
  const modal = document.getElementById('catModal');

  // トップ：在籍中・譲渡相談受付中から4匹
  if (preview) {
    // スマホは4匹（2×2）、タブレット以上は3匹（4匹目はCSSで非表示）
    preview.innerHTML = CATS.filter((c) => c.status !== 'home').slice(0, 4).map(catCardHTML).join('');
  }

  // 猫たちページ：全件＋絞り込み
  if (list) {
    list.innerHTML = CATS.map(catCardHTML).join('');
    const buttons = document.querySelectorAll('.filter__btn[data-filter-cat]');
    const count = document.getElementById('catCount');
    const apply = (filter) => {
      let n = 0;
      list.querySelectorAll('.cat-card').forEach((card) => {
        const show = filter === 'all' || card.dataset.status === filter;
        card.hidden = !show;
        card.classList.remove('is-filter-in');
        if (show) {
          n += 1;
          void card.offsetWidth; // アニメーションを再生し直す
          card.classList.add('is-filter-in');
        }
      });
      if (count) count.textContent = n ? `${n}匹を表示しています` : '現在、該当する猫はいません。';
    };
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        apply(btn.dataset.filterCat);
      });
    });
    apply('all');
  }

  if (!modal) return;

  // 詳細モーダル
  const body = modal.querySelector('.modal__content');
  const closeBtn = modal.querySelector('.modal__close');
  let lastFocus = null;

  const open = (cat) => {
    lastFocus = document.activeElement;
    const adoptBtn = cat.status === 'adopt'
      ? `<a class="btn btn--main" href="reserve.html?cat=${encodeURIComponent(cat.name)}#adoption">譲渡について相談する<span class="btn__arrow" aria-hidden="true"></span></a>`
      : '';
    body.innerHTML = `
      <div class="modal__photo">
        <!-- 画像差し替え：${cat.id}｜800×800（1:1）｜猫のプロフィール写真 -->
        <img src="images/${cat.id}${IMG_EXT}" width="800" height="800" alt="${cat.name}の写真">
      </div>
      <div class="modal__body">
        <span class="tag tag--${cat.status}">${STATUS_LABEL[cat.status]}</span>
        <h2 class="modal__name" id="catModalTitle">${cat.name}（${cat.sexMark}）</h2>
        <dl class="modal__dl">
          <dt>性別</dt><dd>${cat.sex}</dd>
          <dt>年齢</dt><dd>${cat.age}</dd>
          <dt>性格</dt><dd>${flat(cat.personality)}</dd>
        </dl>
        <h3 class="modal__story-title">保護から現在まで</h3>
        <p class="modal__story">${cat.story}</p>
      </div>
      <div class="modal__actions">
        <a class="btn btn--reserve" href="reserve.html">来店予約する<span class="btn__arrow" aria-hidden="true"></span></a>
        ${adoptBtn}
      </div>`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    closeBtn.focus();
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  };

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.cat-card');
    if (card) {
      const cat = CATS.find((c) => c.id === card.dataset.catId);
      if (cat) open(cat);
    }
  });
  modal.querySelector('.modal__overlay').addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
}

/* ----------------------------------------------------------
   FAQ アコーディオン
   ---------------------------------------------------------- */
function initFaq() {
  const buttons = document.querySelectorAll('.accordion__btn');
  buttons.forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        panel.style.height = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => { panel.style.height = '0px'; });
      } else {
        panel.style.height = `${panel.scrollHeight}px`;
        const done = () => {
          if (btn.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
          panel.removeEventListener('transitionend', done);
        };
        panel.addEventListener('transitionend', done);
        if (prefersReduced) panel.style.height = 'auto';
      }
    });
  });
}

/* ----------------------------------------------------------
   お知らせ：カテゴリ絞り込み
   ---------------------------------------------------------- */
function initNewsFilter() {
  const list = document.getElementById('newsList');
  if (!list) return;
  const buttons = document.querySelectorAll('.filter__btn[data-filter-news]');
  const empty = document.getElementById('newsEmpty');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filterNews;
      buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      let n = 0;
      list.querySelectorAll('[data-category]').forEach((item) => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.hidden = !show;
        item.classList.remove('is-filter-in');
        if (show) {
          n += 1;
          void item.offsetWidth;
          item.classList.add('is-filter-in');
        }
      });
      if (empty) empty.hidden = n > 0;
    });
  });
}

/* ----------------------------------------------------------
   営業カレンダー（当月・翌月／火曜定休）
   ▼WP化：営業時間・臨時休業。CLOSED_DATES に臨時休業日を追加できます
   ---------------------------------------------------------- */
const CLOSED_WEEKDAY = 2; // 0=日 1=月 2=火 …
const CLOSED_DATES = []; // 例：['2026-12-31', '2027-01-01']

function initCalendar() {
  const wrap = document.getElementById('calendars');
  if (!wrap) return;
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const week = ['日', '月', '火', '水', '木', '金', '土'];

  const build = (year, month) => {
    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    let html = `<div class="calendar"><h3 class="calendar__title">${year}年${month + 1}月</h3><table><thead><tr>`;
    html += week.map((w) => `<th scope="col">${w}</th>`).join('');
    html += '</tr></thead><tbody><tr>';
    for (let i = 0; i < first; i += 1) html += '<td></td>';
    for (let d = 1; d <= last; d += 1) {
      const date = new Date(year, month, d);
      const key = `${year}-${pad(month + 1)}-${pad(d)}`;
      const closed = date.getDay() === CLOSED_WEEKDAY || CLOSED_DATES.includes(key);
      const isToday = date.toDateString() === today.toDateString();
      const cls = ['calendar__day', closed ? 'is-closed' : '', isToday ? 'is-today' : ''].join(' ').trim();
      const label = `${month + 1}月${d}日${closed ? ' 定休日' : ''}${isToday ? ' 今日' : ''}`;
      html += `<td><span class="${cls}" aria-label="${label}">${d}</span></td>`;
      if (date.getDay() === 6 && d !== last) html += '</tr><tr>';
    }
    html += '</tr></tbody></table></div>';
    return html;
  };

  const y = today.getFullYear();
  const m = today.getMonth();
  wrap.innerHTML = build(y, m) + build(m === 11 ? y + 1 : y, (m + 1) % 12);
}

/* ----------------------------------------------------------
   ご予約：タブ切り替え・入力チェック
   ---------------------------------------------------------- */
function initReserve() {
  const tabs = document.querySelectorAll('.tabs__btn');
  if (!tabs.length) return;

  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next);
      next.focus();
    });
  });

  // #adoption 付きで開いたら譲渡相談タブ
  if (location.hash === '#adoption') {
    const t = document.getElementById('tab-adoption');
    if (t) select(t);
  }

  // 気になる猫の選択肢（譲渡相談受付中の猫）
  const catSelect = document.getElementById('adoptCat');
  if (catSelect) {
    CATS.filter((c) => c.status === 'adopt').forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      catSelect.appendChild(opt);
    });
    const param = new URLSearchParams(location.search).get('cat');
    if (param) catSelect.value = param;
  }

  // 希望日は今日以降
  const dateInput = document.getElementById('visitDate');
  if (dateInput) {
    const t = new Date();
    dateInput.min = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  document.querySelectorAll('.js-validate').forEach((form) => {
    const showError = (field, message) => {
      const err = form.querySelector(`[data-error-for="${field.name}"]`);
      if (field.type !== 'radio' && field.type !== 'checkbox') field.classList.toggle('is-error', !!message);
      if (err) {
        err.textContent = message;
        err.classList.toggle('is-show', !!message);
      }
    };

    const check = (field) => {
      const v = field.type === 'checkbox' ? field.checked : field.value.trim();
      if (field.required) {
        if (field.type === 'radio') {
          const checked = form.querySelector(`input[name="${field.name}"]:checked`);
          if (!checked) return '選択してください。';
        } else if (field.type === 'checkbox') {
          if (!v) return '個人情報の取り扱いへの同意が必要です。';
        } else if (!v) {
          return '入力してください。';
        }
      }
      if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        return 'メールアドレスの形式で入力してください。';
      }
      if (field.type === 'tel' && v && !/^[0-9０-９\-－ ]{10,14}$/.test(v)) {
        return '電話番号は数字とハイフンで入力してください。';
      }
      return '';
    };

    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach((f) => {
      f.addEventListener('blur', () => { if (f.type !== 'radio') showError(f, check(f)); });
      f.addEventListener('change', () => showError(f, check(f)));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault(); // デモのため送信しない
      let firstError = null;
      const done = new Set();
      fields.forEach((f) => {
        if (f.type === 'radio') {
          if (done.has(f.name)) return;
          done.add(f.name);
        }
        const msg = check(f);
        showError(f, msg);
        if (msg && !firstError) firstError = f;
      });
      const result = form.querySelector('.form__result');
      if (firstError) {
        result.classList.remove('is-show');
        firstError.focus();
        return;
      }
      result.textContent = '入力内容に問題はありません。デモのため送信されません。';
      result.classList.add('is-show');
    });
  });
}

/* ----------------------------------------------------------
   クリック（タップ）した場所に肉球の跡を残す
   ・跡は約1.4秒で消えます
   ・跡の向きは、歩いているように左右交互＋少しランダムに傾けます
   ---------------------------------------------------------- */
function initPawPrint() {
  const NS = 'http://www.w3.org/2000/svg';
  let step = 0;
  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return; // 左クリック（タップ）のみ
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'paw-print');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#i-paw');
    svg.appendChild(use);
    step += 1;
    const tilt = (step % 2 ? -14 : 14) + (Math.random() * 16 - 8);
    svg.style.setProperty('--rot', `${tilt}deg`);
    svg.style.left = `${e.clientX}px`;
    svg.style.top = `${e.clientY}px`;
    if (prefersReduced) svg.style.animationDuration = '0.8s';
    document.body.appendChild(svg);
    svg.addEventListener('animationend', () => svg.remove(), { once: true });
  });
}

/* ----------------------------------------------------------
   料金：おすすめカードまでスクロールしたら、猫がひょこっと出る
   （スマホでは、猫の分だけカードが下にスライドする）
   ---------------------------------------------------------- */
function initPlanPeek() {
  const cards = document.querySelectorAll('.plan--recommend');
  if (!cards.length) return;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('is-peek'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-peek');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -25% 0px' });
  cards.forEach((card) => io.observe(card));
}

/* ----------------------------------------------------------
   背景：猫がときどき歩いていったような足跡
   ・不定期（1.5〜5秒おき）に、画面内のどこかから歩きはじめる
   ・向き・歩幅・曲がり方・歩数は毎回ランダム
   ・足跡はページに残り（スクロールについてくる）、しばらくして消える
   ---------------------------------------------------------- */
function initPawWalk() {
  if (prefersReduced) return;
  const NS = 'http://www.w3.org/2000/svg';
  const layer = document.createElement('div');
  layer.className = 'paw-walk';
  layer.setAttribute('aria-hidden', 'true');
  document.body.prepend(layer);

  const rand = (min, max) => min + Math.random() * (max - min);
  const MARGIN = 24;

  function stamp(x, y, rot, size) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'paw-walk__print');
    const use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#i-paw');
    svg.appendChild(use);
    svg.style.left = `${x}px`;
    svg.style.top = `${y}px`;
    svg.style.width = `${size}px`;
    svg.style.height = `${size}px`;
    svg.style.setProperty('--rot', `${rot}deg`);
    layer.appendChild(svg);
    svg.addEventListener('animationend', () => svg.remove(), { once: true });
  }

  function walk() {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const sp = vw < 768;
    const size = sp ? rand(15, 18) : rand(18, 23);
    const stride = size * rand(1.5, 1.9); // 1歩の長さ
    const side = size * 0.42; // 左右の足の幅
    // 画面内のどこかから、ランダムな向きで歩きはじめる
    let x = rand(MARGIN, vw - MARGIN);
    let y = window.scrollY + rand(vh * 0.1, vh * 0.9);
    let angle = rand(0, Math.PI * 2);
    let turn = rand(-0.12, 0.12); // 曲がり方（毎歩少しずつ変わる）
    const steps = Math.round(rand(6, 15));
    let i = 0;

    (function next() {
      if (i >= steps || document.hidden) return;
      // 少しずつ向きを変えながら歩く。ときどき立ち止まる
      turn += rand(-0.06, 0.06);
      turn = Math.max(-0.2, Math.min(0.2, turn));
      angle += turn;
      x += Math.cos(angle) * stride;
      y += Math.sin(angle) * stride;
      if (x < MARGIN || x > vw - MARGIN) return; // 画面の外に出たら終わり
      const offset = (i % 2 ? 1 : -1) * side;
      const px = x + Math.cos(angle + Math.PI / 2) * offset;
      const py = y + Math.sin(angle + Math.PI / 2) * offset;
      const rot = (angle * 180) / Math.PI + 90 + rand(-8, 8);
      stamp(px, py, rot, size);
      i += 1;
      const pause = Math.random() < 0.12 ? rand(600, 1200) : 0;
      setTimeout(next, rand(260, 380) + pause);
    })();
  }

  // 1.5〜5秒おきに歩きはじめる（前の猫が歩いている途中でも、別の猫が歩くことがある）
  setTimeout(walk, 800); // ページを開いてすぐ1匹目
  (function schedule() {
    setTimeout(() => {
      if (!document.hidden) walk();
      schedule();
    }, rand(1500, 5000));
  })();
}
