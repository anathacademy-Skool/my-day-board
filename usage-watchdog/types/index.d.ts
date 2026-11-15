export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'usage-watchdog': {
      limits: Limit[]
      pretend: number | null
      goAnyway: boolean
      warned: string[]
    }
  }
}
