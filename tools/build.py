"""把 src/ 的頁面內容套上共用頁首、導覽與頁尾，輸出成靜態 HTML。執行：python3 tools/build.py"""
import pathlib, json

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://vic510.github.io/twcalc/"
PACK_FREELANCE = "https://peterleaf8.gumroad.com/l/tw-freelance-pack"
PACK_SHOP = "https://peterleaf8.gumroad.com/l/tw-shop-listing-pack"

PAGES = [
    # slug, src, 標題, 描述, 導覽名稱
    ("", "home.html", "twcalc 台灣試算", "台灣人常用的薪資、接案、獎金與租金試算小工具：勞健保自付額、接案實拿、年終補充保費、房東租金扣繳。免費使用，資料只在瀏覽器裡運算。", "首頁"),
    ("freelance/", "freelance.html", "接案實拿試算", "台灣接案者報酬試算：輸入報價，算出代扣所得稅、二代健保補充保費與實拿金額；也能反推想實拿多少該報價多少。", "接案實拿"),
    ("payroll/", "payroll.html", "勞健保自付額試算", "輸入月薪，算出 2026 年勞保、健保、勞退自提要扣多少，實際入帳多少，以及公司幫你負擔多少。", "勞健保"),
    ("bonus/", "bonus.html", "年終獎金補充保費試算", "年終、三節獎金會不會被扣二代健保補充保費？輸入投保金額與獎金，算出超過 4 倍門檻要扣多少。", "年終獎金"),
    ("rent/", "rent.html", "房東租金扣繳試算", "房子租給公司要扣多少稅和補充保費？輸入月租金，算出每月實收、全年租賃所得與報稅前要知道的數字。", "租金"),
]

THEME_INIT = "<script>try{document.documentElement.dataset.theme=localStorage.getItem('twcalc-theme')||'light'}catch(e){document.documentElement.dataset.theme='light'}</script>"
FAVICON = "data:image/svg+xml," + "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%231B2B4B'/%3E%3Ctext x='16' y='22' font-size='17' text-anchor='middle' fill='white' font-family='monospace'%3Etw%3C/text%3E%3C/svg%3E"


def page(slug, src, title, desc, nav_name):
    up = "../" * slug.count("/")
    body = (ROOT / "src" / src).read_text()
    body = body.replace("{{UP}}", up).replace("{{PACK_FREELANCE}}", PACK_FREELANCE).replace("{{PACK_SHOP}}", PACK_SHOP)
    links = "".join(
        f'<a href="{up}{s}"{" aria-current=\"page\"" if s == slug else ""}{" class=\"keep\"" if s == "" else ""}>{n}</a>'
        for s, _, _, _, n in PAGES)
    full_title = title if slug == "" else f"{title}｜twcalc 台灣試算"
    ld = json.dumps({"@context": "https://schema.org", "@type": "WebApplication", "name": title, "url": BASE + slug,
                     "applicationCategory": "FinanceApplication", "operatingSystem": "Any", "inLanguage": "zh-Hant-TW",
                     "offers": {"@type": "Offer", "price": "0", "priceCurrency": "TWD"}, "description": desc}, ensure_ascii=False)
    return f"""<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{full_title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{BASE}{slug}">
<meta property="og:type" content="website">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{BASE}{slug}">
<meta property="og:locale" content="zh_TW">
<meta name="theme-color" content="#1B2B4B">
<link rel="icon" href="{FAVICON}">
{THEME_INIT}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700&family=Noto+Sans+TC:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{up}assets/site.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<div class="wrap">
<nav class="nav" aria-label="主要">
  <a class="brand" href="{up}"><b>twcalc</b><span>台灣試算</span></a>
  <div class="nav-r"><div class="links">{links}</div><button class="theme" id="theme" type="button"></button></div>
</nav>
{body}
<footer class="foot">
  <span>所有試算都在你的瀏覽器裡完成，不會上傳任何數字。結果依 2026 年 10 月的公開規定計算，僅供參考，實際金額以扣繳單位與主管機關認定為準。</span>
  <span>依據：財政部各類所得扣繳率標準、薪資所得扣繳辦法；衛福部中央健康保險署投保金額分級表與補充保險費規定；勞動部勞保、勞退分級表與最低工資公告。</span>
</footer>
</div>
<script src="{up}assets/tw.js"></script>
<script src="{up}assets/ui.js"></script>
<script src="{up}assets/{src.replace('.html', '.js')}" defer></script>
</body>
</html>
"""


for slug, src, title, desc, nav in PAGES:
    out = ROOT / slug / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page(slug, src, title, desc, nav))

(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"  <url><loc>{BASE}{s}</loc></url>\n" for s, *_ in PAGES) + "</urlset>\n")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
print("built", len(PAGES), "pages")
