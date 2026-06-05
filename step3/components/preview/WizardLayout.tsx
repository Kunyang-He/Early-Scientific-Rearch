/**
 * WizardLayout — 向导模式精简界面
 *
 * 自包含布局，不依赖 Proma 的 ChatView/Conversation 系统。
 * 左侧：对话区（内置消息列表 + 输入框 + 卡片选项）
 * 右侧：iframe 沙箱预览
 * 底部：时间轴
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { appModeAtom } from '@/atoms/app-mode'
import { WizardPreviewPanel } from '@/components/preview/WizardPreviewPanel'
import { WindowControls } from '@/components/WindowControls'
import { detectIsWindows } from '@/lib/platform'

/* ===== 消息类型 ===== */
interface Message {
  id: string
  role: 'system' | 'user'
  text: string
  options?: { label: string; value: string }[]
}

/* ===== 初始对话（演示用） ===== */
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'system',
    text: '你好！你想做什么？告诉我你的想法，我帮你实现。',
  },
  {
    id: '2',
    role: 'user',
    text: '帮我做一个日常记账应用',
  },
  {
    id: '3',
    role: 'system',
    text: '明白了。主要记录什么类型的开销？',
    options: [
      { label: '🍜 日常开销', value: 'daily' },
      { label: '💼 生意账目', value: 'business' },
      { label: '✨ 你帮我决定', value: 'auto' },
    ],
  },
  {
    id: '4',
    role: 'user',
    text: '日常开销',
  },
  {
    id: '5',
    role: 'system',
    text: '好的，让我先生成一个草图给你看看方向对不对……右边已经可以看到预览了。试试点击右侧预览中的任意元素，告诉我哪里不满意。',
  },
]

export function WizardLayout(): React.ReactElement {
  const appMode = useAtomValue(appModeAtom)
  const isWindows = React.useMemo(() => detectIsWindows(), [])

  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = React.useState('')
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  // 自动滚到底部
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (appMode !== 'wizard') return <div />

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')

    // 模拟向导 Agent 回复
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        text: '收到，正在根据你的反馈修改……改好了，你看看右边效果？',
      }
      setMessages(prev => [...prev, reply])
    }, 800)
  }

  const handleOptionClick = (label: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: label }
    setMessages(prev => [...prev, userMsg])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Windows 拖动区域 */}
      <div
        className={`titlebar-drag-region fixed top-0 left-0 h-[50px] z-50 ${isWindows ? 'right-[126px]' : 'right-0'}`}
      />
      <WindowControls />

      {/* === 顶部标题栏 === */}
      <div className="relative z-[60] flex items-center gap-3 px-5 py-2.5 shrink-0">
        <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">💰 记账应用</span>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold dark:bg-indigo-900 dark:text-indigo-300">
          快消型
        </span>
        <div className="flex-1" />
        <span className="text-xs text-zinc-400">向导 Agent 多智能体协同开发平台</span>
      </div>

      {/* === 主体：左对话 + 右预览 === */}
      <div className="flex-1 flex min-h-0 px-2 pb-2 gap-2 relative z-[60]">
        {/* === 左侧：对话区 === */}
        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          {/* 对话标题 */}
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">
            💬 对话
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-500 text-white rounded-br-md'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-bl-md border border-zinc-100 dark:border-zinc-700'
                  }`}
                >
                  {msg.role === 'system' && (
                    <div className="text-[11px] text-indigo-500 dark:text-indigo-400 mb-1 font-semibold">
                      🤖 向导 Agent
                    </div>
                  )}
                  <div>{msg.text}</div>

                  {/* 卡片选项 */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleOptionClick(opt.label)}
                          className="px-3.5 py-2 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* 输入区 */}
          <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0 flex gap-2.5">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的需求..."
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent text-sm outline-none focus:border-indigo-400 transition-colors placeholder:text-zinc-400"
            />
            <button
              onClick={handleSend}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              发送
            </button>
          </div>
        </div>

        {/* === 右侧：预览区 === */}
        <WizardPreviewPanel width={420} />
      </div>

      {/* === 底部时间轴 === */}
      <div className="relative z-[60] flex items-center gap-2 px-5 py-2.5 shrink-0 bg-white/80 dark:bg-zinc-900/80 mx-2 mb-2 rounded-xl shadow-sm">
        <span className="text-xs text-zinc-500">⏱ 时间轴</span>
        {[
          { label: '📐 验证草图 v1', active: true },
          { label: '🚀 MVP v1', active: false },
          { label: '📍 当前版本', active: false },
        ].map((node, i, arr) => (
          <React.Fragment key={node.label}>
            <span className="text-zinc-300">→</span>
            <span
              className={`text-xs px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                node.active
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {node.label}
            </span>
          </React.Fragment>
        ))}
        <span className="flex-1" />
        <span className="text-[11px] text-zinc-400">点击任意节点一键回退</span>
      </div>
    </div>
  )
}
