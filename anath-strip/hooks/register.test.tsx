import { test, expect } from 'claude-code/testing'

import { lessonDone, workFromSetup, lastChecked, checkInDue, barDay } from './register'

const PROGRESS = (rows: string[]) => `# Progress\n\n| Lesson | Name | Needs | Test | Done |\n|---|---|---|---|---|\n${rows.join('\n')}\n`
const ROW = (n: string, done: boolean) => `| ${n} | x | y | z | ${done ? '2026-11-13' : ''} |`

// A pretend My brain folder: which files exist, and what's in them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const folder = (on: any, files: Record<string, string>) => {
  // The engine may hand the hook a full path: match on the end of it.
  const find = (path: string) => Object.keys(files).find(k => path === k || path.endsWith('/' + k))
  on('fs.exists', (_$: unknown, e: { path: string }) => ({ value: find(e.path) !== undefined }))
  on('fs.read', (_$: unknown, e: { path: string }) => {
    const k = find(e.path)
    if (k === undefined) throw new Error('missing: ' + e.path)
    return { value: files[k] }
  })
}

const STRIP = { plugin: 'anath-strip', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } } as const

test('lessonDone reads a dated row only', () => {
  const p = PROGRESS([ROW('4.1', true), ROW('4.6b', false), ROW('4.6c', true)])
  expect(lessonDone(p, '4.1')).toBe(true)
  expect(lessonDone(p, '4.6b')).toBe(false)
  expect(lessonDone(p, '4.6c')).toBe(true)
  expect(lessonDone(p, '4.6')).toBe(false)
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`outside a student folder it draws no buttons (${surface})`, async ($, on) => {
    folder(on, {})
    const ui = await $.ui.mount({ ...STRIP, surface })
    expect(await ui.find({ text: /Menu/ })).toBeUndefined()
    await ui.unmount()
  })

  test(`after 4.1 only: just Menu (${surface})`, async ($, on) => {
    folder(on, { 'START HERE.md': 'x', 'Progress.md': PROGRESS([ROW('4.1', true), ROW('4.6b', false), ROW('4.6c', false)]) })
    const ui = await $.ui.mount({ ...STRIP, surface })
    expect(await ui.find({ text: /Menu/ })).toBeDefined()
    expect(await ui.find({ text: /My day/ })).toBeUndefined()
    expect(await ui.find({ text: /Email/ })).toBeUndefined()
    expect(await ui.find({ text: /To-do/ })).toBeUndefined()
    await ui.unmount()
  })

  test(`buttons switch on as lessons are done, To-do after setup (${surface})`, async ($, on) => {
    folder(on, {
      'START HERE.md': 'x',
      'Progress.md': PROGRESS([ROW('4.1', true), ROW('4.6b', true), ROW('4.6c', true)]),
      '.anath/todo.json': '{"sound":"ping"}',
    })
    const ui = await $.ui.mount({ ...STRIP, surface })
    expect(await ui.find({ text: /Menu/ })).toBeDefined()
    expect(await ui.find({ text: /My day/ })).toBeDefined()
    expect(await ui.find({ text: /Email/ })).toBeDefined()
    expect(await ui.find({ text: /To-do/ })).toBeDefined()
    expect(await ui.find({ text: /Winning ads/ })).toBeUndefined()
    await ui.unmount()
  })

  test(`Winning ads shows once switched on (${surface})`, async ($, on) => {
    folder(on, {
      'START HERE.md': 'x',
      'Progress.md': PROGRESS([ROW('4.1', true)]),
      '.anath/strip.json': '{"buttons":{"ads":true}}',
    })
    const ui = await $.ui.mount({ ...STRIP, surface })
    expect(await ui.find({ text: /Winning ads/ })).toBeDefined()
    await ui.unmount()
  })

  const MON9 = new Date(2026, 10, 16, 9, 0).getTime()
  const SAT9 = new Date(2026, 10, 21, 9, 0).getTime()

  test(`day bar and check-in bar show by themselves once earned (${surface})`, async ($, on) => {
    on('clock.now', () => ({ value: MON9 }))
    folder(on, {
      'START HERE.md': 'x',
      'Progress.md': PROGRESS([ROW('4.1', true), ROW('4.6', true), ROW('4.6c', true)]),
      'CLAUDE.md': 'Last checked: 2026-11-05',
      'Business/my-day-setup.md': 'Days off: Saturday, Sunday',
    })
    const ui = await $.ui.mount({ ...STRIP, surface })
    expect(await ui.find({ text: /best day looking/ })).toBeDefined()
    expect(await ui.find({ text: /Time for your check-in/ })).toBeDefined()
    await ui.unmount()
  })

  test(`no bars before their lessons, none on a day off, none once checked in (${surface})`, async ($, on) => {
    on('clock.now', () => ({ value: SAT9 }))
    folder(on, {
      'START HERE.md': 'x',
      'Progress.md': PROGRESS([ROW('4.1', true), ROW('4.6', true), ROW('4.6c', true)]),
      'CLAUDE.md': 'Last checked: 2026-11-20',
      'Business/my-day-setup.md': 'Days off: Saturday, Sunday',
    })
    const ui = await $.ui.mount({ ...STRIP, surface })
    expect(await ui.find({ text: /best day looking/ })).toBeUndefined()
    expect(await ui.find({ text: /Time for your check-in/ })).toBeUndefined()
    expect(await ui.find({ text: /Menu/ })).toBeDefined()
    await ui.unmount()
  })

  test(`only Menu earned: no bars (${surface})`, async ($, on) => {
    on('clock.now', () => ({ value: MON9 }))
    folder(on, { 'START HERE.md': 'x', 'Progress.md': PROGRESS([ROW('4.1', true)]), 'CLAUDE.md': 'Last checked: 2026-10-01' })
    const ui = await $.ui.mount({ ...STRIP, surface })
    expect(await ui.find({ text: /best day looking/ })).toBeUndefined()
    expect(await ui.find({ text: /Time for your check-in/ })).toBeUndefined()
    await ui.unmount()
  })

  test(`Menu sends "menu" once (${surface})`, async ($, on) => {
    folder(on, { 'START HERE.md': 'x', 'Progress.md': PROGRESS([ROW('4.1', true)]) })
    const sent: string[] = []
    on('prompt.submit', async (_$: unknown, e: { text: string; origin?: unknown }) => {
      sent.push(e.text)
      return { text: e.text, origin: e.origin }
    })
    const ui = await $.ui.mount({ ...STRIP, surface, props: { hasSurvey: false, isWorking: true } })
    await ui.press({ key: 'menu' })
    await ui.press({ key: 'menu' })
    expect(sent).toEqual(['menu'])
    await ui.unmount()
  })
}

test('day bar: work days come from Days off', () => {
  expect(workFromSetup('Start: 5:45am · Finish: 6:00pm · Days off: Saturday, Sunday (made up) *(from step 3)*')).toEqual([1, 2, 3, 4, 5])
  expect(workFromSetup('Days off: Wednesday')).toEqual([0, 1, 2, 4, 5, 6])
  expect(workFromSetup('Start: not set · Finish: not set · Days off: not set *(x)*')).toBe(null)
  expect(workFromSetup('Days off: none')).toEqual([0, 1, 2, 3, 4, 5, 6])
})

test('day bar: the day starts at 4am', () => {
  expect(barDay(new Date(2026, 10, 16, 3, 0).getTime())).toBe('2026-11-15')
  expect(barDay(new Date(2026, 10, 16, 5, 0).getTime())).toBe('2026-11-16')
})

test('check-in bar: reads Last checked', () => {
  expect(lastChecked('# Rules\nLast checked: 2026-11-05\n')).toBe('2026-11-05')
  expect(lastChecked('nothing')).toBe(undefined)
})

test('check-in bar: due on their day, gone once done', () => {
  const mon9 = new Date(2026, 10, 16, 9, 0).getTime() // Monday 16 Nov, 9am
  expect(checkInDue('2026-11-09', mon9, 1, 8)).toBe(true)
  expect(checkInDue('2026-11-16', mon9, 1, 8)).toBe(false)
  expect(checkInDue('2026-11-09', new Date(2026, 10, 16, 7, 0).getTime(), 1, 8)).toBe(false)
  expect(checkInDue('2026-11-13', mon9, 1, 8)).toBe(true) // Friday's doesn't count for Monday's week
  expect(checkInDue('2026-11-16', new Date(2026, 10, 20, 9, 0).getTime(), 1, 8)).toBe(false) // done Monday, quiet till next Monday
})

test('check-in bar: no day saved = 7 days on', () => {
  const now = new Date(2026, 10, 16, 9, 0).getTime()
  expect(checkInDue('2026-11-05', now)).toBe(true)
  expect(checkInDue('2026-11-14', now)).toBe(false)
  expect(checkInDue(undefined, now)).toBe(true)
})
