"use strict";
const state = { mode: "fwd", type: "9A", year: 2026 };
const { calc, reverse, trap, fmt, RULES, TYPES } = TW;
const { $, parse, setPressed } = UI;

$("types").innerHTML = ["9A","9B","50"].map(k => [k, TYPES[k]]).map(([k, t]) =>
  `<label class="type"><input type="radio" name="type" id="type-${k}" value="${k}" ${k === state.type ? "checked" : ""}><strong>${t.name}</strong><span>${t.desc}</span></label>`).join("");


let lastNet = null;
function render() {
  const opts = { premiumExempt: $("exempt").checked };
  const amt = parse($("amount").value);
  const res = state.mode === "fwd" ? calc(amt, state.type, state.year, opts) : reverse(amt, state.type, state.year, opts);
  const r = RULES[state.year];
  $("amount-l").textContent = state.mode === "fwd" ? "報酬總額（含扣繳前）" : "我想實際入帳";
  $("amount-h").textContent = state.mode === "fwd" ? "發案方開給你的單次給付金額。分期付款請一期一期算。" : "算出你最少該報的單次金額。";
  $("slip-code").textContent = "所得類別 " + state.type + "・" + state.year;
  $("o-gross").textContent = fmt(res.gross);
  $("o-tax").textContent = res.tax ? "− " + fmt(res.tax) : "0";
  $("o-prem").textContent = res.premium ? "− " + fmt(res.premium) : "0";
  $("o-tax-why").textContent = res.taxRule;
  $("o-prem-why").textContent = res.premiumRule;
  $("o-net").textContent = "NT$ " + fmt(res.net);
  $("c-tax").textContent = fmt(res.tax);
  $("c-prem").textContent = fmt(res.premium);
  $("c-pct").textContent = res.gross ? (res.net / res.gross * 100).toFixed(1) + "%" : "–";
  $("stamp").textContent = state.mode === "fwd" ? "實拿" : "達標";
  $("gross-k").textContent = state.mode === "fwd" ? "報酬總額" : "建議報價（最低）";
  $("year-note").hidden = !r.note; $("year-note").textContent = r.note;
  $("t-start").textContent = fmt(r.partTimeTaxStart); $("t-wage").textContent = fmt(r.minWage);

  const t = trap(res.gross, state.type, state.year, opts);
  if (t) {
    $("trap").hidden = false;
    $("trap").innerHTML = `<strong>門檻提醒</strong>報 ${fmt(t.lowerGross)} 元能入帳 ${fmt(t.lowerNet)} 元，比現在還多。要報到 ${fmt(t.breakEven)} 元以上，當下入帳才會超過它。預扣的稅報稅時會結算，差額主要影響現金流。`;
  } else $("trap").hidden = true;

  if (lastNet !== res.net) { UI.hit($("stamp")); lastNet = res.net; }
  window.__res = res;
}

UI.bindMoney($("amount"), render);
document.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { state.mode = b.dataset.mode; setPressed("mode", state.mode); render(); }));
document.querySelectorAll("[data-year]").forEach(b => b.addEventListener("click", () => { state.year = Number(b.dataset.year); setPressed("year", state.year); render(); }));
$("types").addEventListener("change", e => { state.type = e.target.value; render(); });
$("exempt").addEventListener("change", render);
$("form").addEventListener("submit", e => e.preventDefault());

$("copy").addEventListener("click", () => {
  const r = window.__res;
  const text = `【勞務報酬試算】所得類別 ${state.type}（${state.year}）\n報酬總額：${fmt(r.gross)} 元\n代扣所得稅：${fmt(r.tax)} 元（${r.taxRule}）\n代扣補充保費：${fmt(r.premium)} 元（${r.premiumRule}）\n實際入帳：${fmt(r.net)} 元`;
  UI.copy(text, $("toast"));
});


render();
