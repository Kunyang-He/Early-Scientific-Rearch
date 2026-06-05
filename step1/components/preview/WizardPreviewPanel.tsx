/**
 * WizardPreviewPanel — 向导模式右侧预览面板
 *
 * 使用 sandbox iframe 安全渲染 AI 生成的 Web 应用。
 * Phase 1：静态预览（srcdoc 注入 HTML）
 * Phase 2+：接入接口 5 WebSocket 推送 + 接口 6 postMessage 点选纠错
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { appModeAtom } from '@/atoms/app-mode'

/** 预览区默认占右侧宽度（px），可通过拖拽调整 */
const DEFAULT_PREVIEW_WIDTH = 420

/** 调试用假 HTML，证明画板可渲染 */
const MOCK_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f5f5f5;
    display: flex; justify-content: center; align-items: center;
    min-height: 100vh; padding: 20px;
  }
  .card {
    background: white; border-radius: 16px; padding: 32px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 480px; width: 100%;
  }
  h1 { font-size: 24px; color: #1a1a2e; margin-bottom: 24px; text-align: center; }
  .input-group { display: flex; gap: 8px; margin-bottom: 20px; }
  input {
    flex: 1; padding: 10px 14px; border: 2px solid #e0e0e0;
    border-radius: 10px; font-size: 15px; outline: none;
    transition: border-color 0.2s;
  }
  input:focus { border-color: #6366f1; }
  button {
    padding: 10px 20px; background: #6366f1; color: white;
    border: none; border-radius: 10px; font-size: 15px; cursor: pointer;
    font-weight: 600; transition: background 0.2s;
  }
  button:hover { background: #4f46e5; }
  .record-list { list-style: none; }
  .record-list li {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; background: #f8f9ff; border-radius: 10px;
    margin-bottom: 8px; font-size: 15px;
  }
  .record-list .amount { font-weight: 700; color: #6366f1; }
  .record-list .category {
    font-size: 12px; color: #888; background: #eef0ff;
    padding: 2px 8px; border-radius: 6px;
  }
  .empty { text-align: center; color: #999; padding: 40px 0; font-size: 14px; }
</style>
</head>
<body>
  <div class="card">
    <h1>💰 记账应用</h1>
    <div class="input-group">
      <input type="text" placeholder="金额" id="amount">
      <input type="text" placeholder="分类（如餐饮）" id="category" style="flex:1.5">
      <button id="saveBtn">保存</button>
    </div>
    <ul class="record-list" id="recordList">
      <li>
        <span>🍜 午餐</span>
        <span class="category">餐饮</span>
        <span class="amount">¥30</span>
      </li>
      <li>
        <span>🚇 地铁</span>
        <span class="category">交通</span>
        <span class="amount">¥15</span>
      </li>
      <li>
        <span>☕ 咖啡</span>
        <span class="category">餐饮</span>
        <span class="amount">¥22</span>
      </li>
    </ul>
  </div>
  <script>
    // 简单的交互逻辑，验证 JS 在 iframe 中正常运行
    document.getElementById('saveBtn').addEventListener('click', function() {
      var amount = document.getElementById('amount').value.trim()
      var category = document.getElementById('category').value.trim() || '其他'
      if (!amount) { alert('请输入金额'); return }
      var li = document.createElement('li')
      li.innerHTML = '<span>📝 ' + category + '</span>' +
        '<span class="category">' + category + '</span>' +
        '<span class="amount">¥' + amount + '</span>'
      document.getElementById('recordList').appendChild(li)
      document.getElementById('amount').value = ''
      document.getElementById('category').value = ''
    })
  </script>
</body>
</html>`

export interface WizardPreviewPanelProps {
  /** 面板宽度（px） */
  width?: number
}

export function WizardPreviewPanel({ width }: WizardPreviewPanelProps): React.ReactElement {
  const appMode = useAtomValue(appModeAtom)
  const [previewHtml, setPreviewHtml] = React.useState(MOCK_HTML)

  // TODO Phase 2：通过 WebSocket 接收后端推送的代码更新
  // TODO Phase 2：注入 postMessage 监听，实现元素点击纠错（接口 6）

  if (appMode !== 'wizard') {
    return <div />
  }

  return (
    <div
      className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden"
      style={{ width: width ?? DEFAULT_PREVIEW_WIDTH }}
    >
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm font-medium text-zinc-700">预览</span>
        </div>
        <span className="text-xs text-zinc-400">沙箱运行中</span>
      </div>

      {/* iframe 预览区 */}
      <div className="flex-1 min-h-0 bg-white">
        <iframe
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={previewHtml}
          title="应用预览"
        />
      </div>

      {/* 底部占位：时间轴入口（Phase 2） */}
      <div className="shrink-0 px-4 py-2 border-t border-zinc-200 bg-zinc-50">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>时间轴 — 即将上线</span>
        </div>
      </div>
    </div>
  )
}
