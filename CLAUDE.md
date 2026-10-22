# twcalc 台灣試算（公開網站）

純靜態網站，GitHub Pages 從 `main` 的根目錄部署：https://vic510.github.io/twcalc/

- 改內容改 `src/*.html` 與 `assets/*`，然後 `python3 tools/build.py` 重新產生各資料夾的 `index.html`、`sitemap.xml`、`robots.txt`。
- 所有費率、分級表與試算函式都在 `assets/tw.js`。改完一定要跑 `node tests/tw.test.mjs`。
- Gumroad 商品連結在 `tools/build.py` 的 `PACK_*` 常數；留空時網站顯示「即將上架」。

付費商品、產生程式與完整交接說明在私人 repo `vic510/twcalc-products`，請讀它的 `CLAUDE.md`。**那個 repo 的任何檔案都不能放進這裡**，這個 repo 是公開的。
