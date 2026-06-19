// ─── useShortcuts Hook ─────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useHistoryStore, useToolStore, useViewStore } from '../store/index'

export function useShortcuts() {
  const { undo, redo }  = useHistoryStore()
  const { setTool }     = useToolStore()
  const { setMode, mode } = useViewStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'v': case 'Escape': setTool('select'); break
        case 'w':                setTool('wall');   break
        case 'd':                setTool('door');   break
        case 'n':                setTool('window'); break
        case 'p':                setTool('pan');    break
        case '3':                setMode(mode === '2d' ? '3d' : '2d'); break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, setTool, setMode, mode])
}
