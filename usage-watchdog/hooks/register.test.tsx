import { expect, test } from 'claude-code/testing'

import { bar, heavyJob, resetsIn, withPretend, worst } from './register'

const BAND = { plugin: 'usage-watchdog', component: 'AbovePrompt', props: { hasSurvey: false } } as const
const NOW = Date.parse('2026-11-15T00:00:00Z')

const setup = (on: any, pct: number) => {
  on('session.usage', () => ({ value: { startedAt: 0, context: {}, rateLimits: [
    { kind: 'five_hour', percentUsed: pct, resetsAt: '2026-11-15T01:40:00Z' },
    { kind: 'seven_day', percentUsed: 62, resetsAt: '2026-11-19T09:00:00Z' },
  ] } }))
  on('clock.now', () => ({ value: NOW }))
  on('command.register', () => ({ value: { command: 'watchdog' } }))
  on('session.start', (_: unknown, e: any) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('prompt.submit', (_: unknown, e: any) => ({ text: e.text }))
  on('ui.render', ($: any, e: any) => { const { Text } = $.ui.resolve(e); return <Text>buttons</Text> })
}

test('the little helpers', () => {
  expect(bar(72)).toBe('███████░░░')
  expect(resetsIn('2026-11-15T01:40:00Z', NOW)).toBe('1h 40m')
  expect(heavyJob('Agent', {})).toBe('a helper agent')
  expect(heavyJob('Bash', { command: 'ffmpeg -i a.mp4 b.mp4' })).toBe('a video render or transcribing job')
  expect(heavyJob('Bash', { command: 'ls' })).toBe(null)
  expect(heavyJob('WebSearch', { mode: 'standard' })).toBe(null)
  expect(worst(withPretend([{ kind: 'seven_day', percentUsed: 62 }], 92))?.percentUsed).toBe(92)
})

test('the band shows the % above the buttons, which stay', async ($, on) => {
  setup(on, 38)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' } as any)
  expect((await ui.find({ type: 'Text', text: /38%/ }))?.text).toContain('5-hour')
  expect(await ui.find({ type: 'Text', text: /buttons/ })).toBeTruthy()
  expect(await ui.find({ type: 'Text', text: /Getting close/ })).toBeFalsy()
  await ui.unmount()
})

test('under 90% a helper agent runs', async ($, on) => {
  setup(on, 75)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const r: any = await $.tool.call({ tool: 'Agent', description: 'x', prompt: 'x' } as any)
  expect(r.deny).toBe(undefined)
})

test('at 92% a helper agent is paused, then "go anyway" lets it run', async ($, on) => {
  setup(on, 92)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const r: any = await $.tool.call({ tool: 'Agent', description: 'x', prompt: 'x' } as any)
  expect(r.deny).toContain('92%')
  const plain: any = await $.tool.call({ tool: 'Bash', command: 'ls' } as any)
  expect(plain.deny).toBe(undefined)
  await $.prompt.submit({ text: 'go anyway' } as any)
  const r2: any = await $.tool.call({ tool: 'Agent', description: 'x', prompt: 'x' } as any)
  expect(r2.deny).toBe(undefined)
})
