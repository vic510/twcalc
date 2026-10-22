/* 共用介面：主題切換、數字輸入、複製、印章動畫 */
(function () {
  "use strict";
  const KEY = "twcalc-theme";
  const root = document.documentElement;
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function paintToggle() {
    const b = document.getElementById("theme");
    if (!b) return;
    const dark = root.dataset.theme === "dark";
    b.innerHTML = (dark ? SUN : MOON) + "<span>" + (dark ? "淺色" : "深色") + "</span>";
    b.setAttribute("aria-label", dark ? "切換為淺色" : "切換為深色");
  }
  document.addEventListener("DOMContentLoaded", () => {
    paintToggle();
    const b = document.getElementById("theme");
    if (b) b.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paintToggle();
    });
  });

  const UI = {
    $: id => document.getElementById(id),
    parse: s => Number(String(s).replace(/[^\d]/g, "")) || 0,
    bindMoney(el, cb) {
      el.addEventListener("input", () => { const n = UI.parse(el.value); el.value = n ? n.toLocaleString("zh-TW") : ""; cb(); });
    },
    setPressed(attr, val) {
      document.querySelectorAll("[data-" + attr + "]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val))));
    },
    hit(el) { el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); },
    copy(text, toast) {
      const done = msg => { toast.textContent = msg; setTimeout(() => (toast.textContent = ""), 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => done("已複製"), () => done("無法自動複製，請手動選取"));
      else done("無法自動複製，請手動選取");
    },
    minus: n => (n ? "− " + TW.fmt(n) : "0")
  };
  window.UI = UI;
})();
