/**
 * Multi-Tab Coordination
 * Uses BroadcastChannel to coordinate state across browser tabs.
 * Prevents duplicate Firestore writes when multiple tabs are open.
 */

export type MultiTabEvent =
  | { type: 'VAULT_UPDATED';    collection: 'vault';    itemId: string  }
  | { type: 'TODO_UPDATED';     collection: 'todos';    itemId: string  }
  | { type: 'SPENDING_UPDATED'; collection: 'spending'; itemId: string  }
  | { type: 'ITEM_DELETED';     collection: string;     itemId: string  }
  | { type: 'SYNC_COMPLETED';   timestamp: string                       }
  | { type: 'AUTH_CHANGED';     userId: string | null                   }
  | { type: 'VAULT_LOCKED'                                              }
  | { type: 'VAULT_UNLOCKED'                                            }

type MultiTabHandler = (event: MultiTabEvent) => void

const CHANNEL_NAME = 'mwijay-cross-tab'
let channel: BroadcastChannel | null = null
const handlers: MultiTabHandler[] = []

// ─── Initialize channel ────────────────────────────────────
export function initMultiTab(): () => void {
  if (typeof window === 'undefined') return () => {}
  if (!('BroadcastChannel' in window)) {
    console.warn('[MultiTab] BroadcastChannel not supported — multi-tab sync disabled')
    return () => {}
  }

  try {
    channel = new BroadcastChannel(CHANNEL_NAME)

    channel.onmessage = (event) => {
      const data = event.data as MultiTabEvent
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (err) {
          console.warn('[MultiTab] Handler error:', err)
        }
      })
    }

    channel.onmessageerror = (err) => {
      console.warn('[MultiTab] Message error:', err)
    }

    console.log('[MultiTab] BroadcastChannel initialized')
  } catch (err) {
    console.warn('[MultiTab] Failed to initialize:', err)
  }

  return () => {
    channel?.close()
    channel = null
  }
}

// ─── Broadcast event to other tabs ────────────────────────
export function broadcastToTabs(event: MultiTabEvent): void {
  if (!channel) return
  try {
    channel.postMessage(event)
  } catch {
    // Channel may be closed — ignore
  }
}

// ─── Subscribe to events from other tabs ──────────────────
export function onTabMessage(handler: MultiTabHandler): () => void {
  handlers.push(handler)
  return () => {
    const index = handlers.indexOf(handler)
    if (index > -1) handlers.splice(index, 1)
  }
}

// ─── Broadcast vault update ────────────────────────────────
export function broadcastVaultUpdate(itemId: string): void {
  broadcastToTabs({ type: 'VAULT_UPDATED', collection: 'vault', itemId })
}

export function broadcastTodoUpdate(itemId: string): void {
  broadcastToTabs({ type: 'TODO_UPDATED', collection: 'todos', itemId })
}

export function broadcastSpendingUpdate(itemId: string): void {
  broadcastToTabs({ type: 'SPENDING_UPDATED', collection: 'spending', itemId })
}

export function broadcastItemDeleted(collection: string, itemId: string): void {
  broadcastToTabs({ type: 'ITEM_DELETED', collection, itemId })
}

export function broadcastSyncCompleted(): void {
  broadcastToTabs({
    type: 'SYNC_COMPLETED',
    timestamp: new Date().toISOString(),
  })
}

export function broadcastAuthChange(userId: string | null): void {
  broadcastToTabs({ type: 'AUTH_CHANGED', userId })
}

export function broadcastVaultLocked(): void {
  broadcastToTabs({ type: 'VAULT_LOCKED' })
}

export function broadcastVaultUnlocked(): void {
  broadcastToTabs({ type: 'VAULT_UNLOCKED' })
}

// ─── Check if this is the primary tab ─────────────────────
// Primary tab = the one that holds Firestore IndexedDB lock
let isPrimaryTab = false

export function claimPrimaryTab(): void {
  isPrimaryTab = true
  console.log('[MultiTab] This tab is now primary (holds Firestore lock)')
}

export function getIsPrimaryTab(): boolean {
  return isPrimaryTab
}
