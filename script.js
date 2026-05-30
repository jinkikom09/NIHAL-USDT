'use strict';

const WA_NUMBER = '213673588838';

const FIXED_PRICES = {
  usdtBuy: 240,
  usdtSell: 237,
  btc: 14500000,
  eth: 480000,
  bnb: 95000
};

let calcMode = 'buy';

function fmt(n, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

function set(id,val){ const el=document.getElementById(id); if(el) el.textContent=val; }
function setClass(id,cls){ const el=document.getElementById(id); if(el) el.className=cls; }

function waLink(text){
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

function renderPrices(){
  set('btc-price', fmt(FIXED_PRICES.btc) + ' DZD');
  set('eth-price', fmt(FIXED_PRICES.eth) + ' DZD');
  set('usdt-price', FIXED_PRICES.usdtBuy + ' DZD');

  set('btc-dzd-price', fmt(FIXED_PRICES.btc));
  set('eth-dzd-price', fmt(FIXED_PRICES.eth));
  set('usdt-dzd-price', FIXED_PRICES.usdtBuy.toFixed(0));
  set('bnb-dzd-price', fmt(FIXED_PRICES.bnb));

  set('btc-pct','Fixed');
  set('eth-pct','Fixed');
  set('usdt-pct',`Buy ${FIXED_PRICES.usdtBuy} | Sell ${FIXED_PRICES.usdtSell}`);
  set('bnb-pct','Fixed');
}

function buildTicker() {
 const items=[
  {sym:'BTC/DZD',price:fmt(FIXED_PRICES.btc)+' DZD'},
  {sym:'ETH/DZD',price:fmt(FIXED_PRICES.eth)+' DZD'},
  {sym:'USDT BUY',price:FIXED_PRICES.usdtBuy+' DZD'},
  {sym:'USDT SELL',price:FIXED_PRICES.usdtSell+' DZD'},
  {sym:'BNB/DZD',price:fmt(FIXED_PRICES.bnb)+' DZD'}
 ];
 const html=[...items,...items].map(i=>`<div class="ticker-item"><span class="ticker-sym">${i.sym}</span><span class="ticker-price">${i.price}</span><span class="ticker-sep">|</span></div>`).join('');
 const el=document.getElementById('ticker');
 if(el) el.innerHTML=html;
}

function switchCalcTab(mode, btn){
 calcMode=mode;
 document.querySelectorAll('.calc-tab').forEach(b=>b.classList.remove('active'));
 btn.classList.add('active');
 calcUpdate();
}

function calcUpdate(){
 const crypto=document.getElementById('calc-crypto')?.value || 'usdt';
 const amount=parseFloat(document.getElementById('calc-amount')?.value)||0;

 let unitPrice=0;
 if(crypto==='usdt'){
   unitPrice = calcMode==='buy' ? FIXED_PRICES.usdtBuy : FIXED_PRICES.usdtSell;
 } else {
   unitPrice = FIXED_PRICES[crypto];
 }

 const total = amount * unitPrice;

 set('res-unit', fmt(unitPrice)+' DZD');
 set('res-total', fmt(total)+' DZD');
 set('res-receive', calcMode==='buy' ? amount+' '+crypto.toUpperCase() : fmt(total)+' DZD');

 const btn=document.getElementById('calc-wa-btn');
 if(btn){
   btn.href=waLink(`طلب ${calcMode==='buy'?'شراء':'بيع'} ${amount} ${crypto.toUpperCase()} بسعر ${fmt(total)} DZD`);
 }
}

function submitForm(){}
function toggleFaq(btn){const item=btn.parentElement; item.classList.toggle('open');}
function toggleMenu(){document.getElementById('mobileMenu')?.classList.toggle('open');}
function setLang(lang,btn){}
function initReveal(){}
function initNavbar(){}

document.addEventListener('DOMContentLoaded',()=>{
 renderPrices();
 buildTicker();
 calcUpdate();
});
