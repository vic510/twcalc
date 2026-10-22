"use strict";
const { fmt } = TW;
const { $, parse, setPressed } = UI;
const state = { dep: 0, self: 0 };
let last = null;

function render() {
  const r = TW.payroll(parse($("salary").value), { dependents: state.dep, selfPct: state.self, partTime: $("pt").checked, over65: $("over65").checked });
  if (!r) {
    ["o-salary", "o-labor", "o-health", "o-self", "o-net", "b-labor", "b-health", "b-pension"].forEach(id => ($(id).textContent = "–"));
    $("slip-code").textContent = ""; return;
  }
  $("slip-code").textContent = "2026・眷屬 " + r.deps + " 人";
  $("o-salary").textContent = fmt(r.salary);
  $("o-labor").textContent = UI.minus(r.laborEmp);
  $("o-labor-why").textContent = $("over65").checked ? "不參加勞保" : "投保薪資 " + fmt(r.laborIns) + " 元 × 12.5% × 20%";
  $("o-health").textContent = UI.minus(r.healthEmp);
  $("o-health-why").textContent = "投保金額 " + fmt(r.healthIns) + " 元 × 5.17% × 30%" + (r.deps ? "，本人 " + fmt(r.healthPer) + " 元 ×（1＋" + r.deps + "）" : "");
  $("o-self").textContent = UI.minus(r.selfPension);
  $("o-self-why").textContent = r.selfPct ? "提繳工資 " + fmt(r.pensionWage) + " 元 × " + r.selfPct + "%，存進你的個人專戶" : "未自提";
  $("o-net").textContent = "NT$ " + fmt(r.takeHome);
  $("b-labor").textContent = fmt(r.laborBoss);
  $("b-health").textContent = fmt(r.healthBoss);
  $("b-pension").textContent = fmt(r.pensionBoss);
  $("b-note").textContent = "公司每月為你多付約 " + fmt(r.bossTotal) + " 元，你的實際人事成本約 " + fmt(r.salary + r.bossTotal) + " 元。";
  if (last !== r.takeHome) { UI.hit($("stamp")); last = r.takeHome; }
  window.__r = r;
}

UI.bindMoney($("salary"), render);
document.querySelectorAll("[data-dep]").forEach(b => b.addEventListener("click", () => { state.dep = Number(b.dataset.dep); setPressed("dep", state.dep); render(); }));
document.querySelectorAll("[data-self]").forEach(b => b.addEventListener("click", () => { state.self = Number(b.dataset.self); setPressed("self", state.self); render(); }));
$("pt").addEventListener("change", render);
$("over65").addEventListener("change", render);
$("form").addEventListener("submit", e => e.preventDefault());
$("copy").addEventListener("click", () => {
  const r = window.__r; if (!r) return;
  UI.copy(`【勞健保扣款試算 2026】\n每月薪資：${fmt(r.salary)} 元\n勞保自付：${fmt(r.laborEmp)} 元\n健保自付：${fmt(r.healthEmp)} 元（眷屬 ${r.deps} 人）\n勞退自提：${fmt(r.selfPension)} 元\n實際入帳：${fmt(r.takeHome)} 元`, $("toast"));
});
render();
