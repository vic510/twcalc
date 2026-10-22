/* twcalc 試算核心：純函式，瀏覽器與 Node 共用。規則依 2026 年 10 月公開規定。 */
(function (root) {
  "use strict";

  const fmt = n => Math.round(n).toLocaleString("zh-TW");
  const PREMIUM_RATE = 0.0211;          // 二代健保補充保費率
  const PREMIUM_CAP = 10000000;         // 補充保費單次計費上限

  // ---------- 接案報酬 ----------
  const RULES = {
    2026: { minWage: 29500, partTimeTaxStart: 90501, note: "" },
    2027: { minWage: 30900, partTimeTaxStart: 90501, note: "2027 年兼職所得扣繳起扣標準尚未公告，暫用 2026 年的 90,501 元。" }
  };
  const TYPES = {
    "9A": { name: "9A 執行業務所得", desc: "設計、程式、攝影、顧問等以技藝自力營生的接案收入" },
    "9B": { name: "9B 稿費、演講費等", desc: "稿費、版稅、翻譯、演講鐘點費、審查費" },
    "50": { name: "50 兼職薪資所得", desc: "臨時工資、兼職鐘點費等有僱傭性質的報酬" }
  };
  const prem = g => Math.round(Math.min(g, PREMIUM_CAP) * PREMIUM_RATE);

  function calc(gross, type, year, opts) {
    opts = opts || {};
    const r = RULES[year];
    gross = Math.max(0, Math.floor(Number(gross) || 0));
    let tax = 0, taxRule, premium = 0, premiumRule;
    if (type === "50") {
      if (gross >= r.partTimeTaxStart) { tax = Math.floor(gross * 0.05); taxRule = "單次給付達 " + fmt(r.partTimeTaxStart) + " 元，扣繳 5%"; }
      else taxRule = "單次給付未達 " + fmt(r.partTimeTaxStart) + " 元，免扣繳";
      if (opts.premiumExempt) premiumRule = "符合免扣取資格";
      else if (gross >= r.minWage) { premium = prem(gross); premiumRule = "單次給付達基本工資 " + fmt(r.minWage) + " 元，扣 2.11%"; }
      else premiumRule = "單次給付未達基本工資 " + fmt(r.minWage) + " 元，免扣";
    } else {
      if (gross * 0.10 > 2000) { tax = Math.floor(gross * 0.10); taxRule = "應扣稅額超過 2,000 元（報酬超過 20,000 元），扣繳 10%"; }
      else taxRule = "應扣稅額未超過 2,000 元，免扣繳";
      if (opts.premiumExempt) premiumRule = "符合免扣取資格";
      else if (gross >= 20000) { premium = prem(gross); premiumRule = "單次給付達 20,000 元，扣 2.11%"; }
      else premiumRule = "單次給付未達 20,000 元，免扣";
    }
    return { gross, tax, premium, net: gross - tax - premium, taxRule, premiumRule };
  }

  function reverse(target, type, year, opts) {
    target = Math.max(0, Math.ceil(Number(target) || 0));
    if (target === 0) return calc(0, type, year, opts);
    const cands = new Set([target]);
    for (const rate of [0, 0.0211, 0.05, 0.0711, 0.10, 0.1211]) {
      const g = Math.ceil(target / (1 - rate));
      for (let d = -3; d <= 3; d++) cands.add(g + d);
    }
    for (const g of [...cands].sort((a, b) => a - b)) {
      if (g < 0) continue;
      const res = calc(g, type, year, opts);
      if (res.net >= target) return res;
    }
    return null;
  }

  function trap(gross, type, year, opts) {
    const res = calc(gross, type, year, opts);
    const r = RULES[year];
    const points = type === "50" ? [r.minWage - 1, r.partTimeTaxStart - 1] : [19999, 20000];
    for (const p of points) {
      if (p < gross) {
        const lower = calc(p, type, year, opts);
        if (lower.net >= res.net) {
          const need = reverse(lower.net + 1, type, year, opts);
          return { lowerGross: p, lowerNet: lower.net, breakEven: need ? need.gross : null };
        }
      }
    }
    return null;
  }

  // ---------- 勞健保、勞退（2026 年分級表） ----------
  // 勞保部分工時級距（低於基本工資，限部分工時者）
  const LABOR_PT = [11100, 12540, 13500, 15840, 16500, 17280, 17880, 19047, 20008, 21009, 22000, 23100, 24000, 25250, 26400, 27600, 28590];
  const LABOR_FT = [29500, 30300, 31800, 33300, 34800, 36300, 38200, 40100, 42000, 43900, 45800];
  const HEALTH = [29500, 30300, 31800, 33300, 34800, 36300, 38200, 40100, 42000, 43900, 45800, 48200, 50600, 53000, 55400, 57800,
    60800, 63800, 66800, 69800, 72800, 76500, 80200, 83900, 87600, 92100, 96600, 101100, 105600, 110100, 115500, 120900, 126300,
    131700, 137100, 142500, 147900, 150000, 156400, 162800, 169200, 175600, 182000, 189500, 197000, 204500, 212000, 219500, 228200,
    236900, 245600, 254300, 263000, 273000, 283000, 293000, 303000, 313000];
  const PENSION = [1500, 3000, 4500, 6000, 7500, 8700, 9900, 11100, 12540, 13500, 15840, 16500, 17280, 17880, 19047, 20008, 21009,
    22000, 23100, 24000, 25250, 26400, 27600, 29500, 30300, 31800, 33300, 34800, 36300, 38200, 40100, 42000, 43900, 45800, 48200,
    50600, 53000, 55400, 57800, 60800, 63800, 66800, 69800, 72800, 76500, 80200, 83900, 87600, 92100, 96600, 101100, 105600, 110100,
    115500, 120900, 126300, 131700, 137100, 142500, 147900, 150000];
  const INS = {
    laborOrdinary: 0.115, laborEmployment: 0.01,   // 普通事故 11.5%、就業保險 1%
    laborEmpShare: 0.2, laborBossShare: 0.7,
    healthRate: 0.0517, healthEmpShare: 0.3, healthBossShare: 0.6, avgDependents: 0.56,
    pensionBoss: 0.06
  };
  const grade = (list, pay) => { for (const g of list) if (pay <= g) return g; return list[list.length - 1]; };

  function payroll(salary, opts) {
    opts = opts || {};
    salary = Math.max(0, Math.floor(Number(salary) || 0));
    const deps = Math.min(3, Math.max(0, Math.floor(opts.dependents || 0)));
    const selfPct = Math.min(6, Math.max(0, Number(opts.selfPct) || 0));
    if (!salary) return null;
    const laborList = opts.partTime ? LABOR_PT.concat(LABOR_FT) : LABOR_FT;
    const laborIns = grade(laborList, salary);
    const healthIns = grade(HEALTH, Math.max(salary, opts.partTime ? 0 : 0));
    const pensionWage = grade(PENSION, salary);
    const noLabor = !!opts.over65;
    const laborEmp = noLabor ? 0 : Math.round(laborIns * INS.laborOrdinary * INS.laborEmpShare) + Math.round(laborIns * INS.laborEmployment * INS.laborEmpShare);
    const healthPer = Math.round(healthIns * INS.healthRate * INS.healthEmpShare);
    const healthEmp = healthPer * (1 + deps);
    const selfPension = Math.round(pensionWage * selfPct / 100);
    const laborBoss = noLabor ? 0 : Math.round(laborIns * INS.laborOrdinary * INS.laborBossShare) + Math.round(laborIns * INS.laborEmployment * INS.laborBossShare);
    const healthBoss = Math.round(healthIns * INS.healthRate * INS.healthBossShare * (1 + INS.avgDependents));
    const pensionBoss = Math.round(pensionWage * INS.pensionBoss);
    return {
      salary, laborIns, healthIns, pensionWage, deps, selfPct,
      laborEmp, healthPer, healthEmp, selfPension,
      takeHome: salary - laborEmp - healthEmp - selfPension,
      laborBoss, healthBoss, pensionBoss,
      bossTotal: laborBoss + healthBoss + pensionBoss
    };
  }

  // ---------- 獎金補充保費、預扣所得稅 ----------
  // 全年累計獎金超過「當月投保金額 4 倍」的部分 × 2.11%，單次以 1,000 萬為上限
  // 所得稅：非每月給付之薪資，單次給付達起扣標準（2026 年 90,501 元）扣 5%（居住者）
  function bonus(insured, paidBefore, thisBonus, year) {
    const start = RULES[year || 2026].partTimeTaxStart;
    insured = Math.max(0, Math.floor(Number(insured) || 0));
    paidBefore = Math.max(0, Math.floor(Number(paidBefore) || 0));
    thisBonus = Math.max(0, Math.floor(Number(thisBonus) || 0));
    const cap = insured * 4;
    const over = Math.max(0, paidBefore + thisBonus - cap) - Math.max(0, paidBefore - cap);
    const base = Math.min(over, PREMIUM_CAP);
    const premium = Math.round(base * PREMIUM_RATE);
    const room = Math.max(0, cap - paidBefore);
    const tax = thisBonus >= start ? Math.floor(thisBonus * 0.05) : 0;
    const taxRule = tax ? "單次給付達 " + fmt(start) + " 元，預扣 5%" : "單次給付未達 " + fmt(start) + " 元，免扣繳";
    return { insured, cap, paidBefore, thisBonus, room, over: base, premium, afterPremium: thisBonus - premium,
      taxStart: start, tax, taxRule, net: thisBonus - premium - tax };
  }

  // ---------- 房東租金 ----------
  // 承租人為公司、機關等扣繳義務人：租金超過 20,000 元扣繳 10%；單次達 20,000 元扣 2.11% 補充保費
  // 個人承租：不代扣。租賃所得 = 租金 × (1 − 43%)
  const RENT_EXPENSE = 0.43;
  function rent(monthly, opts) {
    opts = opts || {};
    monthly = Math.max(0, Math.floor(Number(monthly) || 0));
    const months = Math.min(12, Math.max(1, Math.floor(opts.months || 12)));
    const corp = !!opts.corporateTenant;
    let tax = 0, taxRule, premium = 0, premiumRule;
    if (!corp) { taxRule = "個人承租，不代扣"; premiumRule = "個人承租，不代扣"; }
    else {
      if (monthly * 0.10 > 2000) { tax = Math.floor(monthly * 0.10); taxRule = "租金超過 20,000 元，扣繳 10%"; }
      else taxRule = "應扣稅額未超過 2,000 元，免扣繳";
      if (opts.premiumExempt) premiumRule = "符合免扣取資格";
      else if (monthly >= 20000) { premium = prem(monthly); premiumRule = "單次給付達 20,000 元，扣 2.11%"; }
      else premiumRule = "單次給付未達 20,000 元，免扣";
    }
    const annual = monthly * months;
    return {
      monthly, months, corp, tax, premium, net: monthly - tax - premium, taxRule, premiumRule,
      annual, annualTax: tax * months, annualPremium: premium * months,
      taxableIncome: Math.round(annual * (1 - RENT_EXPENSE))
    };
  }

  // ---------- 股利：補充保費、合併／分開計稅 ----------
  // 補充保費：單次給付的股利所得（ETF 看 54C 部分）達 20,000 元，全額 × 2.11%
  // 綜所稅：2026 年領的股利於 2027 年 5 月申報（115 年度）。只用標準扣除額，不含列舉、基本生活費差額與基本稅額
  const TAX = {
    2026: { exemption: 101000, stdSingle: 136000, stdMarried: 272000, salaryDed: 227000,
      brackets: [[610000, 0.05], [1380000, 0.12], [2770000, 0.20], [5190000, 0.30], [Infinity, 0.40]] }
  };
  const DIV = { premiumStart: 20000, credit: 0.085, creditCap: 80000, separate: 0.28 };

  function incomeTax(net, year) {
    let tax = 0, lower = 0;
    for (const [upper, rate] of TAX[year || 2026].brackets) {
      if (net > lower) tax += (Math.min(net, upper) - lower) * rate;
      lower = upper;
    }
    return Math.round(tax);
  }

  function divPremium(amount) {
    amount = Math.max(0, Math.floor(Number(amount) || 0));
    return amount >= DIV.premiumStart ? prem(amount) : 0;
  }

  function dividend(opts) {
    opts = opts || {};
    const t = TAX[opts.year || 2026];
    const n = x => Math.max(0, Math.floor(Number(x) || 0));
    const perPay = n(opts.perPayment), times = Math.max(1, n(opts.times) || 1), other = n(opts.otherDividend);
    const married = !!opts.married, deps = n(opts.dependents);
    const salary = n(opts.salary), spouseSalary = married ? n(opts.spouseSalary) : 0;
    const premiumEach = divPremium(perPay);
    const annualDiv = perPay * times + other;
    const salaryNet = salary - Math.min(salary, t.salaryDed) + spouseSalary - Math.min(spouseSalary, t.salaryDed);
    const deductions = t.exemption * ((married ? 2 : 1) + deps) + (married ? t.stdMarried : t.stdSingle);
    const baseNet = Math.max(0, salaryNet - deductions);
    const credit = Math.min(Math.round(annualDiv * DIV.credit), DIV.creditCap);
    const combined = incomeTax(Math.max(0, salaryNet + annualDiv - deductions), opts.year) - credit;
    const separate = incomeTax(baseNet, opts.year) + Math.round(annualDiv * DIV.separate);
    return {
      perPay, times, other, annualDiv, premiumEach, annualPremium: premiumEach * times,
      baseNet, credit, combined, separate, baseTax: incomeTax(baseNet, opts.year),
      best: combined <= separate ? "combined" : "separate", saving: Math.abs(separate - combined)
    };
  }

  const api = { fmt, RULES, TYPES, calc, reverse, trap, LABOR_PT, LABOR_FT, HEALTH, PENSION, INS, grade, payroll, bonus, rent, RENT_EXPENSE,
    TAX, DIV, incomeTax, divPremium, dividend };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TW = api;
})(typeof window !== "undefined" ? window : globalThis);
