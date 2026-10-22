import { createRequire } from "module";
import assert from "assert/strict";
const require = createRequire(import.meta.url);
const TW = require("../assets/tw.js");
let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok", name); };

t("9A 30,000", () => { const r = TW.calc(30000, "9A", 2026); assert.equal(r.tax, 3000); assert.equal(r.premium, 633); assert.equal(r.net, 26367); });
t("9A 20,000 only premium", () => { const r = TW.calc(20000, "9A", 2026); assert.equal(r.tax, 0); assert.equal(r.premium, 422); });
t("9A 19,999 nothing", () => assert.equal(TW.calc(19999, "9A", 2026).net, 19999));
t("50 at min wage 2026", () => assert.equal(TW.calc(29500, "50", 2026).premium, 622));
t("50 under min wage 2027", () => assert.equal(TW.calc(30000, "50", 2027).premium, 0));
t("50 tax start", () => assert.equal(TW.calc(90501, "50", 2026).tax, 4525));
t("reverse 27,000", () => assert.equal(TW.reverse(27000, "9A", 2026).gross, 30719));
t("trap 20,500", () => assert.equal(TW.trap(20500, "9A", 2026).breakEven, 22755));

// 勞健保：29,500 元勞工自付勞健保合計 1,196 元（104 人力銀行 2026 試算）
t("payroll 29,500", () => { const r = TW.payroll(29500); assert.equal(r.laborEmp, 738); assert.equal(r.healthEmp, 458); assert.equal(r.laborEmp + r.healthEmp, 1196); });
t("payroll grade lookup", () => { const r = TW.payroll(29501); assert.equal(r.laborIns, 30300); assert.equal(r.healthIns, 30300); assert.equal(r.pensionWage, 30300); });
t("payroll caps", () => { const r = TW.payroll(500000); assert.equal(r.laborIns, 45800); assert.equal(r.healthIns, 313000); assert.equal(r.pensionWage, 150000); });
t("payroll dependents cap 3", () => { const a = TW.payroll(40000, { dependents: 5 }); assert.equal(a.healthEmp, a.healthPer * 4); });
t("payroll self pension", () => assert.equal(TW.payroll(40000, { selfPct: 6 }).selfPension, Math.round(40100 * 0.06)));
t("payroll part-time grade", () => assert.equal(TW.payroll(15000, { partTime: true }).laborIns, 15840));
t("payroll full-time floor", () => assert.equal(TW.payroll(15000).laborIns, 29500));

t("bonus under cap", () => assert.equal(TW.bonus(40100, 0, 100000).premium, 0));
t("bonus over cap", () => { const r = TW.bonus(40100, 0, 200000); assert.equal(r.over, 200000 - 160400); assert.equal(r.premium, Math.round(39600 * 0.0211)); });
t("bonus cumulative", () => { const r = TW.bonus(40100, 150000, 50000); assert.equal(r.over, 39600); });
t("bonus already over", () => assert.equal(TW.bonus(40100, 200000, 10000).over, 10000));

t("rent corp 25,000", () => { const r = TW.rent(25000, { corporateTenant: true }); assert.equal(r.tax, 2500); assert.equal(r.premium, 528); assert.equal(r.net, 21972); assert.equal(r.taxableIncome, Math.round(300000 * 0.57)); });
t("rent corp 20,000", () => { const r = TW.rent(20000, { corporateTenant: true }); assert.equal(r.tax, 0); assert.equal(r.premium, 422); });
t("rent individual", () => { const r = TW.rent(30000); assert.equal(r.tax + r.premium, 0); });

console.log(n, "tests passed");
