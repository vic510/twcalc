"use strict";
const { fmt } = TW;
const { $, parse, setPressed } = UI;
const state = { times: 4, fs: "single" };
let last = null;

function render() {
  const married = state.fs === "married";
  $("sp-f").hidden = !married;
  const r = TW.dividend({ perPayment: parse($("per").value), times: state.times, otherDividend: parse($("other").value),
    married, salary: parse($("salary").value), spouseSalary: parse($("spouse").value), dependents: Number($("deps").value) });
  const signed = n => (n < 0 ? "退 " + fmt(-n) : fmt(n));
  $("slip-code").textContent = "115 年度・" + (married ? "有配偶" : "單身");
  $("o-div").textContent = fmt(r.annualDiv);
  $("o-div-why").textContent = fmt(r.perPay) + " 元 × " + r.times + " 次" + (r.other ? "＋其他持股 " + fmt(r.other) + " 元" : "");
  $("o-prem").textContent = UI.minus(r.premiumEach);
  $("o-prem-why").textContent = r.premiumEach ? "單次達 20,000 元，整筆 × 2.11%" : "單次未達 20,000 元，免扣";
  $("o-prem-y").textContent = UI.minus(r.annualPremium);
  $("o-comb").textContent = signed(r.combined);
  $("o-comb-why").textContent = "股利併入所得計稅，再抵減 " + fmt(r.credit) + " 元（8.5%，上限 8 萬）";
  $("o-sep").textContent = signed(r.separate);
  $("o-sep-why").textContent = "其他所得稅額 " + fmt(r.baseTax) + " 元＋股利 × 28%";
  $("o-best").textContent = r.saving ? (r.best === "combined" ? "選合併計稅" : "選分開計稅") : "兩種一樣";
  $("o-save").textContent = r.saving ? "省 " + fmt(r.saving) : "–";
  const tip = $("tip");
  if (r.premiumEach) {
    tip.hidden = false;
    tip.innerHTML = "<strong>補充保費一年 " + fmt(r.annualPremium) + " 元</strong>每次股利所得只要低於 20,000 元就完全不扣。例如持股分給家人、或改買月配型 ETF 讓單次金額變小，都能避開門檻。";
  } else if (r.perPay >= 18000) {
    tip.hidden = false;
    tip.innerHTML = "<strong>離門檻只差 " + fmt(20000 - r.perPay) + " 元</strong>再加碼一點，單次股利達 20,000 元就會整筆被扣 2.11%（約 " + fmt(TW.divPremium(20000)) + " 元起）。";
  } else tip.hidden = true;
  if (last !== r.saving) { UI.hit($("stamp")); last = r.saving; }
  window.__r = r;
}

["per", "other", "salary", "spouse"].forEach(id => UI.bindMoney($(id), render));
$("deps").addEventListener("change", render);
document.querySelectorAll("[data-times]").forEach(b => b.addEventListener("click", () => { state.times = Number(b.dataset.times); setPressed("times", state.times); render(); }));
document.querySelectorAll("[data-fs]").forEach(b => b.addEventListener("click", () => { state.fs = b.dataset.fs; setPressed("fs", state.fs); render(); }));
$("form").addEventListener("submit", e => e.preventDefault());
$("copy").addEventListener("click", () => {
  const r = window.__r;
  UI.copy(`【股利扣款與報稅試算 115 年度】\n全年股利所得：${fmt(r.annualDiv)} 元（每次 ${fmt(r.perPay)} 元 × ${r.times} 次）\n補充保費：每次 ${fmt(r.premiumEach)} 元，全年 ${fmt(r.annualPremium)} 元\n合併計稅應納：${fmt(r.combined)} 元\n分開計稅應納：${fmt(r.separate)} 元\n較省：${r.best === "combined" ? "合併計稅" : "分開計稅"}，差 ${fmt(r.saving)} 元`, $("toast"));
});
render();
