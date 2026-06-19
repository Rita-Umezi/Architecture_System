// ─── useCommand Hook ───────────────────────────────────────────────────────
// Bridge for dispatching commands and tracking undo/redo state.

import { useCallback } from 'react'
import { commandBus } from '../store/index'
import { useHistoryStore } from '../store/index'
import type { ICommand } from '../core/history/CommandBus'

export function useCommand() {
  const { canUndo, canRedo, undo, redo } = useHistoryStore()

  const dispatch = useCallback((command: ICommand): boolean => {
    return commandBus.dispatch(command)
  }, [])

  return { dispatch, canUndo, canRedo, undo, redo }
}
