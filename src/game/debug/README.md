# 測試模式（Test Mode）

測試模式可在以下情境使用，用來進行局部功能驗證，避免每次都必須完整跑完一局遊戲。

- 本機開發環境（`import.meta.env.DEV`）
- 明確開啟 `VITE_ENABLE_TEST_MODE=true` 的部署版本

當測試模式未啟用時，所有 test mode 相關邏輯皆為 **no-op**，不會影響正常遊戲流程。

## 啟用方式

### 方法一：透過網址參數啟用
1. 先確認目前這個 build 允許測試模式。
2. 在網址後加入 `?testMode=1` 開啟遊戲。

### 方法二：透過 localStorage 啟用
1. 開啟瀏覽器開發者工具 Console。
2. 執行以下指令：

```js
localStorage['phaser-survivor:test-mode'] = 'enabled'
```

## Dev 部署開法

本機開發時會自動讀取 `.env.development`。

正式打包時會自動讀取 `.env.production`。

若要打 dev／測試站版本，可使用 `.env.staging` 搭配：

```powershell
npm run build:staging
```

目前預設為：

- `.env.development` -> `VITE_ENABLE_TEST_MODE=true`
- `.env.staging` -> `VITE_ENABLE_TEST_MODE=true`
- `.env.production` -> `VITE_ENABLE_TEST_MODE=false`

因此正式 production build 即使加上 `?testMode=1` 也不會啟用。

## GitHub Pages 部署切換

專案的 GitHub Actions Pages workflow 支援兩種部署模式：

- `production`
- `staging`

### 自動部署

- `push` 到 `main` 時，會自動部署 `production`

### 手動切到 staging

1. 到 GitHub repository 的 `Actions`
2. 選 `Deploy to GitHub Pages`
3. 點 `Run workflow`
4. 將 `deploy_mode` 設成 `staging`
5. 執行 workflow，等待部署完成

部署完成後，可用以下網址開啟測試模式：

```text
https://imu0812.github.io/FirstGameApp/?testMode=1
```

### 切回 production

若 staging 已經部署到 GitHub Pages，想切回正式版時：

1. 到 `Actions`
2. 再次執行 `Deploy to GitHub Pages`
3. 將 `deploy_mode` 設成 `production`

### 注意

- GitHub Pages 同一時間只會提供一份目前部署的內容
- 手動部署 `staging` 會暫時覆蓋目前的 production 頁面
- 再部署一次 `production` 才會切回正式站內容

## 編碼備註

- 專案文字檔建議統一使用 UTF-8。
- VS Code 可在工作區設定中使用 `files.encoding = utf8`，並關閉 `files.autoGuessEncoding`，避免誤判編碼。
- 若在 PowerShell 中查看中文檔案時出現假性亂碼，可先設定：

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```
