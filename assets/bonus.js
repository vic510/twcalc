"use strict";
const { fmt } = TW;
const { $, parse } = UI;
let last = null;

function insured() {
  if ($("known").checked) return parse($("ins").value);
  const s = parse($("salary").value);
  return s ? TW.grade(TW.HEALTH, s) : 0;
}

function render() {
  $("ins-f").hidden = !$("known").checked;
  const ins = insured();
  const r = TW.bonus(ins, parse($("before").value), parse($("bonus").value));
  $("slip-code").textContent = "投保金額 " + fmt(r.insured);
  $("o-bonus").textContent = fmt(r.thisBonus);
  $("o-cap").textContent = fmt(r.cap);
  $("o-room").textContent = fmt(r.room);
  $("o-over").textContent = fmt(r.over);
  $("o-prem").textContent = UI.minus(r.premium);
  $("o-why").textContent = r.over ? "超過部分 " + fmt(r.over) + " 元 × 2.11%" : "全年累計未超過 4 倍，免扣";
  $("o-net").textContent = "NT$ " + fmt(r.net);
  const tip = $("tip");
  if (!r.over && r.room > r.thisBonus) {
    tip.hidden = false;
    tip.innerHTML = "<strong>今年還有額度</strong>這次發完後，同一家公司今年再發 " + fmt(r.room - r.thisBonus) + " 元以內的獎金都不會被扣。";
  } else if (r.over) {
    tip.hidden = false;
    tip.innerHTML = "<strong>額度已用完</strong>今年同一家公司之後再發的獎金，每一元都要扣 2.11%。";
  } else tip.hidden = true;
  if (last !== r.net) { UI.hit($("stamp")); last = r.net; }
  window.__r = r;
}

["salary", "ins", "bonus", "before"].forEach(id => UI.bindMoney($(id), render));
$("known").addEventListener("change", () => {
  if ($("known").checked && !parse($("ins").value)) $("ins").value = fmt(insured() || 0);
  render();
});
$("form").addEventListener("submit", e => e.preventDefault());
$("copy").addEventListener("click", () => {
  const r = window.__r;
  UI.copy(`【獎金補充保費試算】\n健保投保金額：${fmt(r.insured)} 元（4 倍門檻 ${fmt(r.cap)} 元）\n今年已發：${fmt(r.paidBefore)} 元\n本次獎金：${fmt(r.thisBonus)} 元\n補充保費：${fmt(r.premium)} 元\n扣保費後：${fmt(r.net)} 元`, $("toast"));
});
render();
