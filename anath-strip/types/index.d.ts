export type Phase = 'idle' | 'sent' | 'running'
export type Pressed = 'none' | 'menu' | 'myday' | 'email' | 'ads'
export type DoneItem = { text: string; date: string }
export type Grown = { name: string; colour: number; date: string }
export type Dog = { name: string; colour: number; stage: number; biscuits: number; stageStart: number; total: number; fedAt: number; streak: number; lastDay: string; days: string[]; fed?: string[]; wall: Grown[] }
export type Board = { one: string | null; list: string[]; long: string[]; done: DoneItem[] }

declare module 'claude-code' {
  interface PluginState {
    'anath-strip': { phase: Phase; pressed: Pressed; board: Shaped<Board>; dog: Shaped<Dog> }
  }
}
