"use strict";
const { fmt } = TW;
const { $, parse } = UI;
let last = null;
const opts = () => ({ corporateTenant: $("t-corp").checked, months: Number($("months").value), premiumExempt: $("exempt").checked });

function render() {
  const o = opts();
  const r = TW.rent(parse($("rent").value), o);
  $("slip-code").textContent = (r.corp ? "承租人：公司" : "承租人：個人") + "・" + r.months + " 次";
  $("o-rent").textContent = fmt(r.monthly);
  $("o-tax").textContent = UI.minus(r.tax);
  $("o-tax-why").textContent = r.taxRule;
  $("o-prem").textContent = UI.minus(r.premium);
  $("o-prem-why").textContent = r.premiumRule;
  $("o-net").textContent = "NT$ " + fmt(r.net);
  $("y-rent").textContent = fmt(r.annual);
  $("y-income").textContent = fmt(r.taxableIncome);
  $("y-tax").textContent = fmt(r.annualTax);
  const trap = $("trap");
  if (r.corp && r.monthly > 20000 && r.monthly < 23000) {
    const low = TW.rent(20000, o);
    trap.hidden = false;
    trap.innerHTML = "<strong>門檻提醒</strong>月租 20,000 元每次可實收 " + fmt(low.net) + " 元，比現在的 " + fmt(r.net) + " 元還多。預扣的稅報稅時會結算，差額主要影響每月現金流。";
  } else trap.hidden = true;
  if (last !== r.net) { UI.hit($("stamp")); last = r.net; }
  window.__r = r;
}

UI.bindMoney($("rent"), render);
document.querySelectorAll('input[name="tenant"]').forEach(el => el.addEventListener("change", render));
$("months").addEventListener("change", render);
$("exempt").addEventListener("change", render);
$("form").addEventListener("submit", e => e.preventDefault());
$("copy").addEventListener("click", () => {
  const r = window.__r;
  UI.copy(`【租金扣繳試算】\n每次租金：${fmt(r.monthly)} 元（${r.corp ? "公司承租" : "個人承租"}）\n代扣所得稅：${fmt(r.tax)} 元\n代扣補充保費：${fmt(r.premium)} 元\n每次實收：${fmt(r.net)} 元\n全年租賃所得：${fmt(r.taxableIncome)} 元`, $("toast"));
});
render();
