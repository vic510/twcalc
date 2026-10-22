# twcalc 台灣試算

台灣常用的薪資、接案、獎金與租金試算小工具。純靜態網站，所有計算都在瀏覽器裡完成。

網站：https://vic510.github.io/twcalc/

| 工具 | 路徑 |
|---|---|
| 勞健保自付額試算 | `/payroll/` |
| 接案實拿試算 | `/freelance/` |
| 年終獎金補充保費試算 | `/bonus/` |
| 房東租金扣繳試算 | `/rent/` |

## 結構

- `assets/tw.js`：所有費率、分級表與試算函式（純函式，瀏覽器與 Node 共用）
- `assets/site.css`：共用樣式，淺色預設、可切換深色
- `src/*.html`：各頁內容；`tools/build.py` 套上頁首、導覽、頁尾後輸出各資料夾的 `index.html`
- `tests/tw.test.mjs`：試算單元測試

## 修改流程

```bash
python3 tools/build.py      # 重新產生頁面、sitemap.xml、robots.txt
node tests/tw.test.mjs      # 跑測試
```

## 每年要更新的數字

都在 `assets/tw.js`：基本工資、兼職所得扣繳起扣標準、勞保／健保／勞退分級表。2027 年分級表公告後需更新。
