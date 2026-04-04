# 測試模式（Test Mode）

測試模式僅在**開發環境（development build）**中提供，用來進行局部功能驗證，避免每次都必須完整跑完一局遊戲。

當測試模式未啟用時，所有 test mode 相關邏輯皆為 **no-op**，不會影響正常遊戲流程。

## 啟用方式

### 方法一：透過網址參數啟用
1. 啟動 Vite 開發伺服器。
2. 在網址後加入 `?testMode=1` 開啟遊戲。

### 方法二：透過 localStorage 啟用
1. 開啟瀏覽器開發者工具 Console。
2. 執行以下指令：

```js
localStorage['phaser-survivor:test-mode'] = 'enabled'