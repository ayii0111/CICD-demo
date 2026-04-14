# CICD 流程

本專案使用 **GitHub Actions** 實作 CI/CD，部署目標為 **GitHub Pages**。

---

## 額外新增的配置檔

| 檔案路徑 | 用途 |
|---|---|
| `.github/workflows/ci.yml` | CI 流程：每次 push / PR 自動執行 type-check、lint、build |
| `.github/workflows/cd.yml` | CD 流程：main 分支 push 後自動部署到 GitHub Pages |
| `vite.config.ts` | 已修改，加入 `base` 設定以支援 GitHub Pages 子路徑 |

---

## 什麼是 CI/CD？

- **CI（Continuous Integration，持續整合）**：每次有人 push 程式碼，自動跑測試、lint、build，確保程式碼品質沒有被破壞。
- **CD（Continuous Deployment，持續部署）**：CI 通過後，自動將最新版本部署到正式環境，不需要手動操作。

---

## Step 1：將專案推上 GitHub

如果還沒有 GitHub repo，先建立一個：

1. 前往 [https://github.com/new](https://github.com/new)
2. 建立一個新的 repository，名稱例如 `cicd-demo`（**不要**勾選 Initialize this repository）
3. 回到本地專案，執行以下指令：

```bash
git init
git add .
git commit -m "init: setup project"
git remote add origin https://github.com/你的帳號/cicd-demo.git
git branch -M main
git push -u origin main
```

---

## Step 2：修改 vite.config.ts 的 base 路徑

`vite.config.ts` 已經幫你加好了，但你需要把 `base` 裡的 repo 名稱改成你實際的 repo 名稱：

```ts
base: process.env.NODE_ENV === 'production' ? '/你的repo名稱/' : '/',
```

例如你的 repo 叫 `my-portfolio`，就改成：

```ts
base: process.env.NODE_ENV === 'production' ? '/my-portfolio/' : '/',
```

改完後 commit 並 push：

```bash
git add vite.config.ts
git commit -m "config: set base path for GitHub Pages"
git push
```

---

## Step 3：開啟 GitHub Pages 設定

1. 進入你的 GitHub repo 頁面
2. 點選上方的 **Settings** 分頁
3. 左側選單找到 **Pages**
4. 在 **Build and deployment** 區塊：
   - Source 選擇 **GitHub Actions**
5. 儲存設定

> 注意：Source 一定要選 **GitHub Actions**，不是 Deploy from a branch。

---

## Step 4：了解 CI 流程（.github/workflows/ci.yml）

每次你 push 到 `main` 或 `develop` 分支，或是發起 Pull Request 到 `main`，CI 就會自動觸發，依序執行：

```
Checkout → 安裝 pnpm → 安裝 Node.js → pnpm install → type-check → lint → build
```

任何一個步驟失敗，後續步驟就不會執行，GitHub 會在 PR 或 commit 上顯示紅色 ✗。

你可以在 GitHub repo 的 **Actions** 分頁即時查看每次執行的結果與 log。

---

## Step 5：了解 CD 流程（.github/workflows/cd.yml）

只有當程式碼 push 到 `main` 分支時，CD 才會觸發，流程分兩個 job：

```
[build job]
Checkout → 安裝環境 → pnpm install → pnpm build → 上傳 dist 產物

[deploy job]（等 build job 完成後才執行）
將 dist 部署到 GitHub Pages
```

部署完成後，你的網站會在以下網址上線：

```
https://你的帳號.github.io/你的repo名稱/
```

---

## Step 6：實際觸發一次完整流程

做一個小改動來驗證整個流程：

```bash
# 隨便改一個檔案，例如 src/views/HomeView.vue
# 加一行文字或改個標題

git add .
git commit -m "feat: trigger cicd demo"
git push
```

然後：

1. 前往 GitHub repo → **Actions** 分頁
2. 你會看到兩個 workflow 被觸發：**CI** 和 **CD**
3. 點進去可以看到每個 step 的執行狀態和 log
4. CD 完成後，點選 deploy job 裡的網址，就能看到你的網站

---

## Step 7：模擬 CI 攔截錯誤（進階練習）

這個練習讓你親眼看到 CI 的價值：

1. 故意在程式碼裡寫一個 TypeScript 型別錯誤，例如在 `src/main.ts` 加一行：

```ts
const x: number = "這是字串" // 型別錯誤
```

2. Push 上去：

```bash
git add .
git commit -m "test: introduce type error"
git push
```

3. 前往 Actions 分頁，你會看到 CI 在 `type-check` 步驟失敗，顯示紅色 ✗
4. CD 不會被觸發，網站不會被更新
5. 這就是 CI 的核心價值：**壞掉的程式碼不會進到正式環境**

練習完記得把錯誤移除再 push 一次。

---

## 常見問題

**Q：Actions 分頁看不到 workflow？**
確認 `.github/workflows/` 資料夾和 yml 檔案有正確 push 到 GitHub。

**Q：部署成功但網站是空白或 404？**
檢查 `vite.config.ts` 的 `base` 是否和你的 repo 名稱完全一致，包含大小寫。

**Q：GitHub Pages 的 Source 沒有 GitHub Actions 選項？**
確認你的 repo 是 public，或你的帳號有 GitHub Pages 的使用權限（免費帳號 private repo 不支援）。

**Q：想在 PR 合併前強制要求 CI 通過怎麼做？**
進入 repo Settings → Branches → Add branch protection rule，勾選 **Require status checks to pass before merging**，然後選擇 `CI` 這個 workflow。
