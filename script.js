/* ============================================================
   NIHAL USDT — script.js
   Live prices · Calculator · Form · FAQ · Nav · Scroll
   ============================================================ */

'use strict';

// ── CONSTANTS ────────────────────────────────────────────────
const WA_NUMBER  = '213673588838';
const DZD_RATE   = 135.5;    // 1 USD ≈ 135.5 DZD
const MARGIN_BUY  = 1.025;   // +2.5 % spread for buy
const MARGIN_SELL = 0.975;   // -2.5 % spread for sell

// ── STATE ────────────────────────────────────────────────────
let prices  = { btc: 67000, eth: 3800, usdt: 1.0, bnb: 580 };
let calcMode = 'buy';

// ── HELPERS ──────────────────────────────────────────────────
function fmt(n, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

function fmtDZD(n) {
  if (n >= 1_000_000) return fmt(n / 1_000_000, 2) + 'M DZD';
  if (n >= 1_000)     return fmt(n, 0) + ' DZD';
  return fmt(n, 2) + ' DZD';
}

function set(id, val)  { const el = document.getElementById(id); if (el) el.textContent = val; }
function setClass(id, cls) { const el = document.getElementById(id); if (el) el.className = cls; }

function waLink(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

// ── LIVE PRICES (CoinGecko) ──────────────────────────────────
async function fetchPrices() {
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin&vs_currencies=usd&include_24hr_change=true';
    const res  = await fetch(url);
    const data = await res.json();

    prices.btc  = data.bitcoin?.usd      || prices.btc;
    prices.eth  = data.ethereum?.usd     || prices.eth;
    prices.usdt = data.tether?.usd       || prices.usdt;
    prices.bnb  = data.binancecoin?.usd  || prices.bnb;

    const btcChg = +(data.bitcoin?.usd_24h_change     || 2.4).toFixed(2);
    const ethChg = +(data.ethereum?.usd_24h_change    || 1.8).toFixed(2);
    const bnbChg = +(data.binancecoin?.usd_24h_change || 0.9).toFixed(2);

    renderPrices(btcChg, ethChg, bnbChg);
  } catch (_) {
    renderPrices(2.4, 1.8, 0.9);
  }

  set('last-updated', 'آخر تحديث: ' + new Date().toLocaleTimeString('ar-DZ'));
  buildTicker();
  calcUpdate();
}

function renderPrices(btcChg, ethChg, bnbChg) {
  // Hero cards
  set('btc-price',  '$' + fmt(prices.btc));
  set('eth-price',  '$' + fmt(prices.eth));
  set('usdt-price', '$' + fmt(prices.usdt));
  set('btc-change',  (btcChg > 0 ? '+' : '') + btcChg + '%');
  set('eth-change',  (ethChg > 0 ? '+' : '') + ethChg + '%');
  setClass('btc-change',  'price-change ' + (btcChg > 0 ? 'up' : 'down'));
  setClass('eth-change',  'price-change ' + (ethChg > 0 ? 'up' : 'down'));

  // Rate section (DZD)
  set('btc-dzd-price',  fmt(prices.btc  * DZD_RATE, 0));
  set('eth-dzd-price',  fmt(prices.eth  * DZD_RATE, 0));
  set('usdt-dzd-price', fmt(prices.usdt * DZD_RATE, 2));
  set('bnb-dzd-price',  fmt(prices.bnb  * DZD_RATE, 0));

  set('btc-pct',  (btcChg > 0 ? '+' : '') + btcChg + '%');
  set('eth-pct',  (ethChg > 0 ? '+' : '') + ethChg + '%');
  set('bnb-pct',  (bnbChg > 0 ? '+' : '') + bnbChg + '%');
  set('usdt-pct', 'Stable');

  setClass('btc-pct',  'rate-change ' + (btcChg > 0 ? 'up' : 'down'));
  setClass('eth-pct',  'rate-change ' + (ethChg > 0 ? 'up' : 'down'));
  setClass('bnb-pct',  'rate-change ' + (bnbChg > 0 ? 'up' : 'down'));
  setClass('usdt-pct', 'rate-change up');
}

// ── TICKER ───────────────────────────────────────────────────
function buildTicker() {
  const items = [
    { sym: 'BTC/DZD',  price: fmt(prices.btc  * DZD_RATE, 0) + ' DZD', icon: '₿'  },
    { sym: 'ETH/DZD',  price: fmt(prices.eth  * DZD_RATE, 0) + ' DZD', icon: 'Ξ'  },
    { sym: 'USDT/DZD', price: fmt(prices.usdt * DZD_RATE, 2) + ' DZD', icon: '₮'  },
    { sym: 'BNB/DZD',  price: fmt(prices.bnb  * DZD_RATE, 0) + ' DZD', icon: '🔶' },
    { sym: 'BTC/USD',  price: '$' + fmt(prices.btc),                    icon: '₿'  },
    { sym: 'ETH/USD',  price: '$' + fmt(prices.eth),                    icon: 'Ξ'  },
  ];

  const html = [...items, ...items].map(i =>
    `<div class="ticker-item">
      <span style="font-size:15px">${i.icon}</span>
      <span class="ticker-sym">${i.sym}</span>
      <span class="ticker-price">${i.price}</span>
      <span class="ticker-sep">|</span>
    </div>`
  ).join('');

  const el = document.getElementById('ticker');
  if (el) el.innerHTML = html;
}

// ── CALCULATOR ───────────────────────────────────────────────
function switchCalcTab(mode, btn) {
  calcMode = mode;
  document.querySelectorAll('.calc-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  calcUpdate();
}

function calcUpdate() {
  const cryptoKey = document.getElementById('calc-crypto')?.value || 'usdt';
  const amount    = parseFloat(document.getElementById('calc-amount')?.value) || 0;
  const priceUSD  = prices[cryptoKey] || 1;
  const priceDZD  = priceUSD * DZD_RATE;
  const rate      = calcMode === 'buy' ? priceDZD * MARGIN_BUY : priceDZD * MARGIN_SELL;
  const total     = amount * rate;
  const isUsdt    = cryptoKey === 'usdt';

  set('res-unit',    fmt(rate, isUsdt ? 2 : 0) + ' DZD');
  set('res-total',   fmt(total, 0) + ' DZD');

  if (calcMode === 'buy') {
    set('res-receive', fmt(amount, isUsdt ? 2 : 6) + ' ' + cryptoKey.toUpperCase());
  } else {
    set('res-receive', fmt(total, 0) + ' DZD');
  }

  const waText = calcMode === 'buy'
    ? `سلام، حاب نشري ${amount} ${cryptoKey.toUpperCase()} بـ ${fmt(total, 0)} DZD`
    : `سلام، حاب نبيع ${amount} ${cryptoKey.toUpperCase()} وناخذ ${fmt(total, 0)} DZD`;

  const btn = document.getElementById('calc-wa-btn');
  if (btn) btn.href = waLink(waText);
}

// ── CONTACT FORM → WhatsApp ───────────────────────────────────
function submitForm() {
  const name    = document.getElementById('form-name')?.value    || '';
  const phone   = document.getElementById('form-phone')?.value   || '';
  const service = document.getElementById('form-service')?.value || '';
  const msg     = document.getElementById('form-msg')?.value     || '';

  const text = `سلام، أنا ${name || 'عميل جديد'}
الهاتف: ${phone || '-'}
الخدمة: ${service || '-'}
الرسالة: ${msg || '-'}`;

  window.open(waLink(text), '_blank');
}

// ── FAQ ACCORDION ────────────────────────────────────────────
function toggleFaq(btn) {
  const item   = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── MOBILE MENU ──────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// ── LANGUAGE SWITCHER ────────────────────────────────────────
function setLang(lang, btn) {
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const dirs = { ar: 'rtl', fr: 'ltr', en: 'ltr' };
  document.documentElement.dir  = dirs[lang] || 'rtl';
  document.documentElement.lang = lang;
}

// ── SCROLL REVEAL ────────────────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 75);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── NAVBAR SCROLL EFFECT ─────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 50
      ? '0 4px 30px rgba(0,0,0,0.85)'
      : 'none';
  }, { passive: true });
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  fetchPrices();
  setInterval(fetchPrices, 60_000);   // refresh every 60 s
  initReveal();
  initNavbar();
});
