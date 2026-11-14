import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Board, Dog, Phase, Pressed } from '../types'

// Anath AI Academy buttons, above the typing box. One install (lesson 4.1), then each button shows once its
// lesson is done. Only inside a student's My brain folder (it has START HERE.md and Progress.md): anywhere else,
// this mod draws nothing. All files are read from the folder Claude is open in; nothing personal lives in this mod.

const phase = atom({ plugin: 'anath-strip', key: 'phase' } as const, 'idle' as Phase)
const pressed = atom({ plugin: 'anath-strip', key: 'pressed' } as const, 'none' as Pressed)

const TODO_FILE = 'Business/My to-do.md'
const SETUP_FILE = '.anath/todo.json'
const STRIP_FILE = '.anath/strip.json'
const OWN_SOUND = '.anath/my-sound.wav'
const PANE = 'todo'

const EMPTY: Board = { one: null, list: [], long: [], done: [] }
const board = atom({ plugin: 'anath-strip', key: 'board' } as const, EMPTY, { shape: 'board-1' })

const TEMPLATE = `# My to-do

⏱️ **Time matters.** Every job gets a start and a finish.

Say *"add to my to-do: …"*, *"my one thing today is …"* or *"add to my long-term to-do: … by [date]"*. Tick them off on
the 🎯 To-do board, above the typing box.

## 🎯 One thing

## ✅ To-do

## 🗓️ Long-term to-do
`

// Which lesson switches on which button: its row in Progress.md has a date.
const LESSON: Record<string, string> = { menu: '4.1', email: '4.6b', myday: '4.6c' }

export const lessonDone = (progress: string, lesson: string): boolean =>
  progress.split('\n').some(line => line.startsWith(`| ${lesson} |`) && /\d{4}-\d{2}-\d{2}/.test(line))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isStudentFolder = async ($: any): Promise<boolean> =>
  (await $.fs.exists('START HERE.md').catch(() => false)) && (await $.fs.exists('Progress.md').catch(() => false))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const readJson = async ($: any, path: string): Promise<any> => {
  try {
    return JSON.parse(String(await $.fs.read(path)))
  } catch {
    return {}
  }
}

export type Earned = { menu: boolean; email: boolean; myday: boolean; todo: boolean; ads: boolean; checkin: boolean }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const earned = async ($: any): Promise<Earned> => {
  const progress = String(await $.fs.read('Progress.md').catch(() => ''))
  const extra = (await readJson($, STRIP_FILE)).buttons ?? {}
  const on = (k: string) => extra[k] === true || (LESSON[k] ? lessonDone(progress, LESSON[k]) : false)
  return {
    menu: on('menu'),
    email: on('email'),
    myday: on('myday'),
    todo: extra.todo === true || (await $.fs.exists(SETUP_FILE).catch(() => false)),
    ads: extra.ads === true,
    checkin: extra.checkin === true || lessonDone(progress, '4.6'),
  }
}

// Their tick sound, picked at "Give me my to-do": ping (default), chime, pop, none, or own (their recording).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const playTick = async ($: any) => {
  const sound = String((await readJson($, SETUP_FILE)).sound ?? 'ping')
  if (sound === 'none') return
  if (sound === 'own') {
    try {
      const { base64 } = await $.fs.read(OWN_SOUND, { as: 'bytes' })
      await $.audio.play({ base64, mime: 'audio/wav' })
      return
    } catch {
      // their recording is missing: fall back to the ping
    }
  }
  const asset = sound === 'chime' ? 'sounds/chime.wav' : sound === 'pop' ? 'sounds/pop.wav' : 'sounds/ping.wav'
  await $.audio.play({ asset })
}

// 🐶 The puppy (added 2026-11-06): every hit on the to-do board drops a biscuit in his mouth and he grows a little.
// Students aren't told the rules, it's a surprise: a new stage needs 30 biscuits AND 7 days at the stage he's in.
// Tiny puppy → puppy (ball) → young dog (collar) → grown dog (bandana). A grown dog goes on the 🐾 wall, a new puppy arrives.
const DOG_FILE = '.anath/puppy.json'
const NEED = 30
const DAYS = 7
const DAY = 24 * 60 * 60 * 1000
// [fur, dark, light]. The first is Biscuit's tan; each new puppy takes the next.
const COATS: Array<[string, string, string]> = [
  ['#d9a066', '#9c6b3c', '#f6e3c8'],
  ['#3b3b3b', '#1c1c1c', '#f2f2f2'],
  ['#e8b84a', '#b5832a', '#fbe9bb'],
  ['#9aa3ab', '#5f6870', '#e6eaed'],
  ['#7a4a2a', '#4e2c17', '#dcbfa3'],
  ['#efdcb8', '#c29f6c', '#fff8ea'],
]
const NEW_DOG: Dog = { name: 'Biscuit', colour: 0, stage: 0, biscuits: 0, stageStart: 0, total: 0, fedAt: 0, streak: 0, lastDay: '', days: [], wall: [] }
const dog = atom({ plugin: 'anath-strip', key: 'dog' } as const, NEW_DOG, { shape: 'dog-2' })
// Which days they work (0 Sunday … 6 Saturday). Days off never break the streak. Default Monday to Friday.
const DAYS_FILE = '.anath/my-days.json'
const WORK_DEFAULT = [1, 2, 3, 4, 5]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadWork = async ($: any): Promise<number[]> => {
  try {
    const w = JSON.parse(String(await $.fs.read(DAYS_FILE))).work
    return Array.isArray(w) && w.every((n: unknown) => typeof n === 'number' && n >= 0 && n <= 6) ? w : WORK_DEFAULT
  } catch {
    return WORK_DEFAULT
  }
}

export const cleanDog = (raw: unknown, now: number): Dog => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = raw && typeof raw === 'object' ? raw : {}
  const num = (v: unknown, fallback: number) => (typeof v === 'number' && isFinite(v) ? v : fallback)
  return {
    name: typeof d.name === 'string' && d.name.trim() ? d.name.trim() : 'Biscuit',
    colour: Math.abs(Math.round(num(d.colour, 0))) % COATS.length,
    stage: Math.min(3, Math.max(0, Math.round(num(d.stage, 0)))),
    biscuits: Math.max(0, Math.round(num(d.biscuits, 0))),
    stageStart: num(d.stageStart, now) || now,
    total: Math.max(0, Math.round(num(d.total, 0))),
    fedAt: num(d.fedAt, 0),
    streak: Math.max(0, Math.round(num(d.streak, 0))),
    lastDay: typeof d.lastDay === 'string' ? d.lastDay : '',
    days: Array.isArray(d.days) ? d.days.filter((k: unknown) => typeof k === 'string') : typeof d.lastDay === 'string' && d.lastDay ? [d.lastDay] : [],
    fed: Array.isArray(d.fed) ? d.fed.filter((k: unknown) => typeof k === 'string') : undefined,
    wall: Array.isArray(d.wall)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d.wall.filter((g: any) => g && typeof g.name === 'string').map((g: any) => ({
          name: g.name,
          colour: Math.abs(Math.round(num(g.colour, 0))) % COATS.length,
          date: typeof g.date === 'string' ? g.date : '',
        }))
      : [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saveDog = async ($: any, d: Dog) => {
  await $.fs.write(DOG_FILE, JSON.stringify(d, null, 2) + '\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadDog = async ($: any): Promise<Dog> => {
  const now = await $.clock.now()
  const text = await $.fs.read(DOG_FILE).catch(() => undefined)
  let raw: unknown = undefined
  try {
    raw = typeof text === 'string' ? JSON.parse(text) : undefined
  } catch {
    raw = undefined
  }
  const d = cleanDog(raw, now)
  if (raw === undefined) await saveDog($, d).catch(() => undefined)
  return d
}

const dayLabel = (now: number) =>
  new Date(now).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

// The day, as 2026-11-06, in their own time.
export const dayKey = (now: number) => {
  const d = new Date(now)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 🔥 Streak: work days in a row with at least one thing ticked off. Miss a work day and it's back to 0. Days off don't count or break it. Fed today = lit; not yet today = grey (today isn't over).
export const streakNow = (d: Dog, now: number, work: number[] = WORK_DEFAULT): { days: number; lit: boolean } => {
  const fed = new Set(d.days)
  const lit = fed.has(dayKey(now))
  const t = new Date(now)
  t.setHours(12, 0, 0, 0)
  if (!lit) t.setDate(t.getDate() - 1)
  let count = 0
  for (let i = 0; i < 800; i++, t.setDate(t.getDate() - 1)) {
    const k = dayKey(t.getTime())
    if (fed.has(k)) {
      count++
      continue
    }
    if (!work.includes(t.getDay())) continue
    break
  }
  return { days: count, lit }
}

// One biscuit. Answers the new dog, and a surprise line when he grows.
// `at` is when the job was ticked (a catch-up tick can be yesterday's); `now` is when he eats.
export const feed = (d: Dog, now: number, at: number = now): { dog: Dog; surprise: string } => {
  const day = dayKey(at)
  const days = d.days.includes(day) ? d.days : [...d.days, day].sort().slice(-400)
  const fed: Dog = { ...d, biscuits: d.biscuits + 1, total: d.total + 1, fedAt: now, days, lastDay: day > d.lastDay ? day : d.lastDay }
  const daysIn = Math.floor((now - fed.stageStart) / DAY)
  if (fed.biscuits < NEED || daysIn < DAYS) return { dog: fed, surprise: '' }
  if (fed.stage < 3) return { dog: { ...fed, stage: fed.stage + 1, biscuits: 0, stageStart: now }, surprise: `🎉 Surprise! ${fed.name} just grew!` }
  const wall = [...fed.wall, { name: fed.name, colour: fed.colour, date: dayLabel(now) }]
  const pup: Dog = { ...fed, name: 'New puppy', colour: (fed.colour + 1) % COATS.length, stage: 0, biscuits: 0, stageStart: now, wall }
  return { dog: pup, surprise: `🐾 ${fed.name} is all grown up and on your wall! A new puppy just arrived. Name him: "call my puppy …"` }
}

// Every crossed-off line on the board feeds him once, whether they clicked it or Claude ticked it in the chat.
// Reads the file before the 4am sweep, so last night's catch-up ticks still count. The first time, it only
// remembers what's already crossed off (those were fed already).
export const feedFromText = (d: Dog, text: string, now: number): { dog: Dog; ate: number; surprise: string } => {
  const lines: Array<[number, string]> = []
  for (const line of text.split('\n')) {
    const crossed = CROSSED.exec(line)
    if (crossed) lines.push([Number(crossed[1]), `${crossed[1]}·${crossed[2]}`])
  }
  if (d.fed === undefined) return { dog: { ...d, fed: lines.map(([, k]) => k) }, ate: 0, surprise: '' }
  let dog = d
  let ate = 0
  let surprise = ''
  const seen = new Set(d.fed)
  for (const [at, key] of lines) {
    if (seen.has(key)) continue
    const r = feed(dog, now, Math.min(at, now))
    dog = { ...r.dog, fed: [...(dog.fed ?? []), key].slice(-400) }
    seen.add(key)
    ate++
    if (r.surprise) surprise = r.surprise
  }
  return { dog, ate, surprise }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const syncFeed = async ($: any): Promise<string> => {
  const text = await $.fs.read(TODO_FILE).catch(() => undefined)
  if (typeof text !== 'string') return ''
  const before = await loadDog($)
  const r = feedFromText(before, text, await $.clock.now())
  if (r.ate > 0 || before.fed === undefined) await saveDog($, r.dog).catch(() => undefined)
  await update($, dog, () => r.dog).catch(() => undefined)
  return r.surprise
}

// Bringing a hit back takes its biscuit back (never below 0, never shrinks a stage).
export const unfeed = (d: Dog): Dog => ({ ...d, biscuits: Math.max(0, d.biscuits - 1), total: Math.max(0, d.total - 1) })

// The dog himself: the same picture between biscuits, so he never blinks out. He wags and blinks.
export const dogSvg = (colour: number, stage: number, still = false): string => {
  const [fur, dark, light] = COATS[colour % COATS.length]
  const headR = [27, 25, 23, 22][stage]
  const headY = [46, 43, 40, 38][stage]
  const bodyRx = [17, 21, 25, 28][stage]
  const bodyRy = [15, 18, 21, 24][stage]
  const bodyY = 108 - bodyRy - 4
  const mouthY = headY + headR * 0.55
  const tx = 60 + bodyRx - 4
  const wag = still ? '' : `<animateTransform attributeName="transform" type="rotate" values="-18 ${tx} ${bodyY};18 ${tx} ${bodyY};-18 ${tx} ${bodyY}" dur="0.9s" repeatCount="indefinite"/>`
  const blink = still ? '' : `<animate attributeName="ry" values="3.6;3.6;0.4;3.6" keyTimes="0;0.92;0.96;1" dur="4s" repeatCount="indefinite"/>`
  const p: string[] = []
  p.push(`<g>${wag}<path d="M ${tx} ${bodyY} q 18 -6 16 -24" stroke="${dark}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`)
  p.push(`<ellipse cx="60" cy="${bodyY}" rx="${bodyRx}" ry="${bodyRy}" fill="${fur}"/>`)
  p.push(`<ellipse cx="60" cy="${bodyY + 3}" rx="${bodyRx * 0.55}" ry="${bodyRy * 0.7}" fill="${light}"/>`)
  p.push(`<ellipse cx="${60 - bodyRx * 0.5}" cy="103" rx="7" ry="4.5" fill="${light}"/><ellipse cx="${60 + bodyRx * 0.5}" cy="103" rx="7" ry="4.5" fill="${light}"/>`)
  if (stage === 1) p.push(`<circle cx="${60 - bodyRx - 12}" cy="100" r="7" fill="#e5484d"/><path d="M ${60 - bodyRx - 19} 100 q 7 -5 14 0" stroke="#fff" stroke-width="1.6" fill="none"/>`)
  p.push(`<ellipse cx="${60 - headR * 0.85}" cy="${headY + 2}" rx="${headR * 0.32}" ry="${headR * 0.62}" fill="${dark}" transform="rotate(18 ${60 - headR * 0.85} ${headY + 2})"/>`)
  p.push(`<ellipse cx="${60 + headR * 0.85}" cy="${headY + 2}" rx="${headR * 0.32}" ry="${headR * 0.62}" fill="${dark}" transform="rotate(-18 ${60 + headR * 0.85} ${headY + 2})"/>`)
  p.push(`<circle cx="60" cy="${headY}" r="${headR}" fill="${fur}"/>`)
  p.push(`<ellipse cx="60" cy="${headY + headR * 0.42}" rx="${headR * 0.55}" ry="${headR * 0.4}" fill="${light}"/>`)
  if (stage === 2) p.push(`<rect x="${60 - headR * 0.75}" y="${headY + headR * 0.9}" width="${headR * 1.5}" height="5" rx="2.5" fill="#3b82f6"/><circle cx="60" cy="${headY + headR * 0.9 + 9}" r="3.5" fill="#f5c518"/>`)
  if (stage === 3) p.push(`<path d="M ${60 - headR * 0.8} ${headY + headR * 0.88} L ${60 + headR * 0.8} ${headY + headR * 0.88} L 60 ${headY + headR * 0.88 + 16} Z" fill="#e5484d"/><circle cx="55" cy="${headY + headR * 0.88 + 5}" r="1.4" fill="#fff"/><circle cx="64" cy="${headY + headR * 0.88 + 8}" r="1.4" fill="#fff"/>`)
  p.push(`<ellipse cx="${60 - headR * 0.36}" cy="${headY - headR * 0.12}" rx="3.4" ry="3.6" fill="#1c1c1c">${blink}</ellipse>`)
  p.push(`<ellipse cx="${60 + headR * 0.36}" cy="${headY - headR * 0.12}" rx="3.4" ry="3.6" fill="#1c1c1c">${blink}</ellipse>`)
  p.push(`<circle cx="${60 - headR * 0.36 + 1.2}" cy="${headY - headR * 0.12 - 1.3}" r="1.1" fill="#fff"/><circle cx="${60 + headR * 0.36 + 1.2}" cy="${headY - headR * 0.12 - 1.3}" r="1.1" fill="#fff"/>`)
  p.push(`<ellipse cx="60" cy="${headY + headR * 0.25}" rx="4.6" ry="3.4" fill="#1c1c1c"/>`)
  p.push(`<path d="M 54 ${mouthY - 2} q 6 5 12 0" stroke="#1c1c1c" stroke-width="1.6" fill="none"/>`)
  p.push(`<ellipse cx="60" cy="${mouthY + 3}" rx="3" ry="3.6" fill="#ef7a8b"/>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 112">${p.join('')}</svg>`
}

// Beside him: the biscuit drops, then "+1" floats up and fades. Drawn fresh on each biscuit; the dog stays put.
export const biscuitSvg = (show: boolean): string => {
  if (!show) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56"></svg>`
  const bone = `<g fill="#d9a35b"><circle cx="13" cy="-2.5" r="3.2"/><circle cx="13" cy="2.5" r="3.2"/><circle cx="27" cy="-2.5" r="3.2"/><circle cx="27" cy="2.5" r="3.2"/><rect x="13" y="-2.6" width="14" height="5.2"/></g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56">` +
    `<g><animateTransform attributeName="transform" type="translate" values="0 2;0 46" dur="0.7s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.5 0 1 1"/>` +
    `<animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur="0.9s" fill="freeze"/>${bone}</g>` +
    `<text x="20" y="30" text-anchor="middle" font-size="15" font-family="sans-serif" font-weight="700" fill="#2f9e44" opacity="0">+1` +
    `<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.3;0.4;0.8;1" dur="2.2s" fill="freeze"/>` +
    `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -16" keyTimes="0;0.3;1" dur="2.2s" fill="freeze"/></text></svg>`
}

// The two counters, like a game's coins: 🦴 biscuits eaten and 🔥 streak, in soft grey pills.
// A third pill (🐶 + how many dogs grown) shows once the first dog is fully grown. One day these may be cashed in.
export const pillsSvg = (total: number, streak: number, lit: boolean, dogs = 0): string => {
  const a = String(total)
  const b = String(streak)
  const w1 = 58 + a.length * 14
  const w2 = 50 + b.length * 14
  const gap = 10
  const w3 = dogs > 0 ? 50 + String(dogs).length * 14 : 0
  const x3 = w1 + gap + w2 + gap
  const third = dogs > 0
    ? `<rect x="${x3}" y="0" width="${w3}" height="40" rx="20" fill="#f1f2f4"/>` +
      `<g transform="translate(${x3 + 22} 21)"><ellipse cx="-9" cy="-3" rx="4.5" ry="8" fill="#9c6b3c" transform="rotate(20 -9 -3)"/><ellipse cx="9" cy="-3" rx="4.5" ry="8" fill="#9c6b3c" transform="rotate(-20 9 -3)"/>` +
      `<circle cx="0" cy="0" r="11" fill="#d9a066"/><ellipse cx="0" cy="4.5" rx="6.5" ry="5" fill="#f6e3c8"/>` +
      `<circle cx="-4" cy="-2" r="1.8" fill="#1c1c1c"/><circle cx="4" cy="-2" r="1.8" fill="#1c1c1c"/><ellipse cx="0" cy="2.5" rx="2.6" ry="2" fill="#1c1c1c"/></g>` +
      `<text x="${x3 + 40}" y="27.5" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="21" font-weight="800" fill="#141a2e">${dogs}</text>`
    : ''
  // Orange = fed today · grey = still alive, not fed yet today · black = the streak's gone (0).
  const flame = lit ? ['#ff7a1a', '#ffc53d'] : streak > 0 ? ['#9aa0a6', '#c9cdd2'] : ['#1c1c1c', '#4a4a4a']
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w1 + gap + w2 + (dogs > 0 ? gap + w3 : 0)} 40">` +
    `<rect x="0" y="0" width="${w1}" height="40" rx="20" fill="#eef1f6"/>` +
    `<circle cx="22" cy="20" r="13" fill="#f5c542"/><circle cx="22" cy="20" r="10" fill="none" stroke="#e0a81e" stroke-width="1.5"/>` +
    `<g fill="#ffffff" transform="rotate(-30 22 20)"><circle cx="16" cy="18" r="2.6"/><circle cx="16" cy="22" r="2.6"/><circle cx="28" cy="18" r="2.6"/><circle cx="28" cy="22" r="2.6"/><rect x="16" y="18" width="12" height="4"/></g>` +
    `<text x="44" y="27.5" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="21" font-weight="800" fill="#141a2e">${a}</text>` +
    `<rect x="${w1 + gap}" y="0" width="${w2}" height="40" rx="20" fill="#f1f2f4"/>` +
    `<g transform="translate(${w1 + gap + 12} 6)"><path d="M10 0 C12 6 19 9 19 18 C19 24 15 28 10 28 C5 28 1 24 1 18 C1 12 6 10 6 4 C8 6 9 8 9 10 C10 7 10 3 10 0 Z" fill="${flame[0]}"/>` +
    `<path d="M10 13 C12 17 15 18 15 22 C15 25 13 27 10 27 C7 27 5 25 5 22 C5 19 8 17 10 13 Z" fill="${flame[1]}"/></g>` +
    `<text x="${w1 + gap + 36}" y="27.5" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="21" font-weight="800" fill="#141a2e">${b}</text>${third}</svg>`
}
export const pillsWidth = (total: number, streak: number, dogs = 0) =>
  58 + String(total).length * 14 + 10 + 50 + String(streak).length * 14 + (dogs > 0 ? 10 + 50 + String(dogs).length * 14 : 0)

// 🏡 His yard: grass along the bottom, a little kennel on the right, and him in the middle. Drawn once per size, as a
// picture (never a frame), so he never blinks out when he eats.
export const sceneSvg = (colour: number, stage: number, size: number): string => {
  const inner = dogSvg(colour, stage).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
  const s = (size / 120) * 1.4
  const blades: string[] = []
  for (let x = 4; x < 240; x += 9) blades.push(`<path d="M${x} 113 q 2 -7 4 -9 q -1 5 1 9 Z" fill="#5fae4e"/>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 130">` +
    // grass
    `<rect x="0" y="112" width="240" height="18" rx="6" fill="#7cc46a"/>${blades.join('')}` +
    `<circle cx="28" cy="117" r="2.2" fill="#f5d547"/><circle cx="62" cy="121" r="2" fill="#ffffff"/><circle cx="214" cy="120" r="2.2" fill="#f28fb0"/>` +
    // kennel
    `<g transform="translate(168 58)"><path d="M-6 22 L30 -4 L66 22 Z" fill="#c0392b"/><rect x="0" y="20" width="60" height="36" fill="#d9a066"/>` +
    `<rect x="0" y="20" width="60" height="4" fill="#b98a55"/><path d="M18 56 L18 40 A12 12 0 0 1 42 40 L42 56 Z" fill="#3d2a1c"/>` +
    `<rect x="20" y="25" width="20" height="7" rx="2" fill="#fff4e0"/><circle cx="30" cy="28.5" r="1.6" fill="#c0392b"/></g>` +
    // him, standing on the grass in the middle
    `<g transform="translate(${120 - 60 * s} ${114 - 108 * s}) scale(${s})">${inner}</g></svg>`
}

// Above him when he eats: the biscuit drops, a "Yum yum yum!" bubble pops up, and "+1" floats away. Empty otherwise
// (same size, so nothing jumps).
export const yumSvg = (show: boolean): string => {
  if (!show) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 40"></svg>`
  const bone = `<g fill="#d9a35b"><circle cx="-7" cy="-2.5" r="3.2"/><circle cx="-7" cy="2.5" r="3.2"/><circle cx="7" cy="-2.5" r="3.2"/><circle cx="7" cy="2.5" r="3.2"/><rect x="-7" y="-2.6" width="14" height="5.2"/></g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 40">` +
    `<g><animateTransform attributeName="transform" type="translate" values="120 0;120 40" dur="0.6s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.5 0 1 1"/>` +
    `<animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur="0.65s" fill="freeze"/>${bone}</g>` +
    `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.15;0.25;0.85;1" dur="4s" fill="freeze"/>` +
    `<rect x="56" y="2" width="128" height="26" rx="13" fill="#ffffff" stroke="#e2e5ea" stroke-width="1.5"/>` +
    `<path d="M114 27 L120 37 L126 27 Z" fill="#ffffff" stroke="#e2e5ea" stroke-width="1.5"/><rect x="113" y="25" width="14" height="3" fill="#ffffff"/>` +
    `<text x="120" y="20" text-anchor="middle" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#141a2e" textLength="104" lengthAdjust="spacingAndGlyphs">Yum yum! 😋</text></g>` +
    `<text x="192" y="22" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="14" font-weight="800" fill="#2f9e44" opacity="0">+1` +
    `<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.15;0.25;0.7;1" dur="3s" fill="freeze"/>` +
    `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -12" keyTimes="0;0.15;1" dur="3s" fill="freeze"/></text></svg>`
}

// Small: tiny at the start, a touch bigger with every biscuit.
export const dogWidth = (d: Dog) => [40, 50, 60, 70][d.stage] + Math.round(10 * Math.min(1, d.biscuits / NEED))

type Section = 'one' | 'list' | 'long' | 'done' | 'other'

const sectionOf = (heading: string): Section =>
  /one thing/i.test(heading) ? 'one' : /long/i.test(heading) ? 'long' : /done/i.test(heading) ? 'done' : /to-?do/i.test(heading) ? 'list' : 'other'

const OPEN = /^\s*[-*] \[ \] (.+?)\s*$/
// A crossed-off line carries the moment it was shot (ms), so it can be cleared the next morning (4am).
const CROSSED = /^\s*[-*] \[[xX]\] (\d{10,}) · (.+?)\s*$/

export const parse = (text: string): Board => {
  const result: Board = { one: null, list: [], long: [], done: [] }
  let section: Section = 'other'

  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      section = sectionOf(line)
      continue
    }

    const open = OPEN.exec(line)
    if (open && section === 'one' && result.one === null) {
      result.one = open[1]
    } else if (open && (section === 'list' || section === 'one')) {
      result.list.push(open[1])
    } else if (open && section === 'long') {
      result.long.push(open[1])
    }

    const crossed = CROSSED.exec(line)
    if (crossed) {
      result.done.push({ date: crossed[1], text: crossed[2] })
    }
  }

  return result
}

// Crosses one item off: the line stays where it is, marked done with the moment it was shot.
// Answers undefined when the item isn't there any more (already crossed, or edited away).
export const tick = (text: string, item: string, now: number): string | undefined => {
  const lines = text.split('\n')
  const at = lines.findIndex(line => OPEN.exec(line)?.[1] === item)
  if (at < 0) {
    return undefined
  }

  lines[at] = `- [x] ${now} · ${item}`

  return lines.join('\n')
}

// Uncrosses one item: back to an open line in the same place.
export const untick = (text: string, item: string): string | undefined => {
  const lines = text.split('\n')
  const at = lines.findIndex(line => CROSSED.exec(line)?.[2] === item)
  if (at < 0) {
    return undefined
  }

  lines[at] = `- [ ] ${item}`

  return lines.join('\n')
}

// A new day starts at 4am: anything crossed off before the latest 4am is erased, so mornings start clean.
const morningOf = (now: number): number => {
  const d = new Date(now)
  d.setHours(4, 0, 0, 0)
  if (d.getTime() > now) d.setDate(d.getDate() - 1)
  return d.getTime()
}

// Erases every crossed-off line from before this morning. No Done list, no history.
export const sweep = (text: string, now: number): string =>
  text
    .split('\n')
    .filter(line => {
      const crossed = CROSSED.exec(line)

      return !(crossed && Number(crossed[1]) < morningOf(now))
    })
    .join('\n')

// Reads their to-do file and erases anything crossed off before this morning (4am), then answers the clean text.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const readClean = async ($: any): Promise<string | undefined> => {
  const text = await $.fs.read(TODO_FILE).catch(() => undefined)
  if (typeof text !== 'string') {
    return undefined
  }

  const clean = sweep(text, await $.clock.now())
  if (clean !== text) {
    await $.fs.write(TODO_FILE, clean).catch(() => undefined)
  }

  return clean
}

// ☀️ The day bar and 🔔 the check-in bar (added 2026-11-15). They show above the buttons, by themselves:
// the day bar once My day (4.6c) is done, the check-in bar once the check-in (4.6) is done. Nothing runs by itself.
const DAYBAR_FILE = '.anath/day-bar.json'
const CHECKIN_FILE = '.anath/check-in.json'
const SETUP_DAY = 'Business/my-day-setup.md'
const WEEKDAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// The bar's day starts at 4am, the same as the to-do board.
export const barDay = (now: number): string => {
  const d = new Date(now)
  if (d.getHours() < 4) d.setDate(d.getDate() - 1)
  return dayKey(d.getTime())
}
export const barWeekday = (now: number): number => {
  const d = new Date(now)
  if (d.getHours() < 4) d.setDate(d.getDate() - 1)
  return d.getDay()
}

// Their work days from "Days off: Saturday, Sunday" in my-day-setup.md (saved in 4.6c). Not set: Monday to Friday.
export const workFromSetup = (text: string): number[] | null => {
  const m = /Days off:\s*([^·*\n]*)/i.exec(text)
  if (!m || /not set/i.test(m[1])) return null
  const off = WEEKDAY_NAMES.map((n, i) => (new RegExp('\\b' + n, 'i').test(m[1]) ? i : -1)).filter(i => i >= 0)
  if (/none|no days/i.test(m[1])) return [0, 1, 2, 3, 4, 5, 6]
  return off.length ? [0, 1, 2, 3, 4, 5, 6].filter(i => !off.includes(i)) : null
}

// "Last checked: 2026-11-05" in their CLAUDE.md: the check-in sets it each time it runs.
export const lastChecked = (text: string): string | undefined => /Last checked:\s*(\d{4}-\d{2}-\d{2})/.exec(text)?.[1]

// Check-in due? With a check-in day saved: from that day and hour each week, until it's done.
// No day saved yet: once it's 7 days since the last one.
export const checkInDue = (last: string | undefined, now: number, day?: number, hour = 8): boolean => {
  if (!last) return true
  const [y, mo, dd] = last.split('-').map(Number)
  const lastEnd = new Date(y, mo - 1, dd, 23, 59).getTime()
  if (typeof day !== 'number' || day < 0 || day > 6) return now - lastEnd >= 6 * 86400000
  const d = new Date(now)
  d.setHours(hour, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() - day + 7) % 7))
  if (d.getTime() > now) d.setDate(d.getDate() - 7)
  return lastEnd < d.getTime()
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    if (e.origin?.kind === 'plugin' && e.origin.name === 'anath-strip') {
      await update($, phase, () => 'running').catch(() => undefined)
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if ((await read($, phase)) !== 'idle') {
      await update($, phase, () => 'idle')
      await update($, pressed, () => 'none')
    }
    if (await isStudentFolder($)) {
      if (await $.fs.exists(SETUP_FILE).catch(() => false)) {
        const surprise = await syncFeed($).catch(() => '')
        if (surprise) $.ui.toast(surprise)
      }
      const panes = await $.ui.panes().catch(() => [])
      if (panes.some(pane => pane.id === PANE)) {
        const text = await readClean($)
        if (typeof text === 'string') await update($, board, () => parse(text)).catch(() => undefined)
      }
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const above = await next(e).catch(() => null)
    if (!(await isStudentFolder($))) return above
    const has = await earned($)
    if (!has.menu && !has.email && !has.myday && !has.todo && !has.ads && !has.checkin) return above

    // 🔔 Check-in bar: their check-in day (or 7 days on), until the check-in runs.
    let nowMs = Date.now()
    try {
      nowMs = await $.clock.now()
    } catch {
      // no clock: use the computer's
    }
    const ci = await readJson($, CHECKIN_FILE)
    const rules = String(await $.fs.read('CLAUDE.md').catch(() => ''))
    const showCheckIn = has.checkin && checkInDue(lastChecked(rules), nowMs, ci.day, typeof ci.hour === 'number' ? ci.hour : 8)
    // ☀️ Day bar: each work day, until they press ✕. Never on a day off.
    const today = barDay(nowMs)
    const setupWork = workFromSetup(String(await $.fs.read(SETUP_DAY).catch(() => '')))
    const workDays = (await $.fs.exists(DAYS_FILE).catch(() => false)) ? await loadWork($) : (setupWork ?? WORK_DEFAULT)
    const showDay = has.myday && workDays.includes(barWeekday(nowMs)) && (await readJson($, DAYBAR_FILE)).done !== today

    const isBusy = (await read($, phase)) !== 'idle'
    const which = await read($, pressed)
    const { Box, Button, Text } = $.ui.resolve(e)

    // A second press while it's loading is ignored, so a job never runs twice.
    const send = (key: Pressed, text: string) => async () => {
      if ((await read($, phase)) !== 'idle' && (await read($, pressed)) === key && e.props.isWorking) return
      await update($, pressed, () => key)
      await update($, phase, () => 'sent')
      try {
        await $.prompt.submit({ text, asUser: true })
      } catch {
        await update($, phase, () => 'idle')
        await update($, pressed, () => 'none')
      }
    }

    const toggleTodo = async () => {
      try {
        const panes = await $.ui.panes()
        if (panes.some(pane => pane.id === PANE)) {
          await $.ui.close({ id: PANE })
          return
        }
        if (!(await $.fs.exists(TODO_FILE))) await $.fs.write(TODO_FILE, TEMPLATE)
        await syncFeed($).catch(() => '')
        const text = await readClean($)
        await update($, board, () => parse(text ?? ''))
        const opened = await $.ui.open({ id: PANE, title: '🎯 To-do' })
        if (!opened.isPlaced) $.ui.toast('The to-do board needs a wider window. Make the app a bit wider and press To-do again.')
      } catch {
        $.ui.toast("Couldn't open the to-do board. Type: my to-do")
      }
    }

    const label = (key: Pressed, normal: string) => (isBusy && which === key ? '✓ On its way' : normal)

    const hideDay = async () => {
      const fresh = await readJson($, DAYBAR_FILE)
      await $.fs.write(DAYBAR_FILE, JSON.stringify({ ...fresh, done: today }) + '\n').catch(() => undefined)
      try {
        $.ui.invalidate('ui.render')
      } catch {
        $.ui.toast('Hidden till tomorrow.')
      }
    }

    return (
      <Box flexDirection="column" gap={1}>
        {above}
        {showCheckIn ? (
          <Box flexDirection="row" gap={1} alignItems="center" borderStyle="round" borderColor="red" paddingX={1}>
            <Box flexDirection="column" flexGrow={1}>
              <Text bold color="red">🔔 Time for your check-in</Text>
              <Text color="red">5 minutes. Keeps your prices right and your business up to date.</Text>
            </Box>
            <Button key="checkin-now" label={label('checkin', 'Do it now')} onPress={send('checkin', 'check-in')} />
          </Box>
        ) : null}
        {showDay ? (
          <Box flexDirection="row" gap={1} alignItems="flex-start" borderStyle="round" borderColor="green" paddingX={1}>
            <Box flexDirection="column" flexGrow={1}>
              <Text>☀️ What's your best day looking like today? Let's go get it.</Text>
              <Text dimColor>Press ☀️ My day, or just speak it, and I'll add it to your to-do list.</Text>
            </Box>
            <Button key="day-close" label="✕" onPress={hideDay} />
          </Box>
        ) : null}
        <Box flexDirection="row" gap={1}>
          {has.menu ? <Button key="menu" label={label('menu', '☰ Menu')} onPress={send('menu', 'menu')} /> : null}
          {has.myday ? <Button key="myday" label={label('myday', '☀️ My day')} onPress={send('myday', 'my day')} /> : null}
          {has.todo ? <Button key="todo" label="🎯 To-do" onPress={toggleTodo} /> : null}
          {has.email ? <Button key="email" label={label('email', '📧 Email')} onPress={send('email', 'check my email')} /> : null}
          {has.ads ? <Button key="ads" label={label('ads', '🏆 Winning ads')} onPress={send('ads', 'open my winning ads board')} /> : null}
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Svg } = $.ui.resolve(e)
    const { one, list, long = [], done } = await read($, board)
    const pup = await read($, dog)
    const nowMs = await $.clock.now()
    const justFed = nowMs - pup.fedAt < 6000
    const work = await loadWork($)
    const fire = streakNow(pup, nowMs, work)
    const hungry = !fire.lit && work.includes(new Date(nowMs).getDay())

    // Tick one off: their sound plays at once, the line is crossed off (erased at 4am), and the puppy eats.
    const tickOff = (item: string, isOne: boolean) => async () => {
      void playTick($).catch(() => undefined)
      try {
        const fresh = (await readClean($)) ?? ''
        const changed = tick(fresh, item, await $.clock.now())
        if (changed === undefined) {
          await update($, board, () => parse(fresh))
          return
        }
        await $.fs.write(TODO_FILE, changed)
        const after = parse(changed)
        await update($, board, () => after)
        const surprise = await syncFeed($).catch(() => '')
        if (surprise) {
          $.ui.toast(surprise)
          return
        }
        const isCleared = after.one === null && after.list.length === 0
        $.ui.toast(isCleared ? '🎉 All done for today. Well done!' : isOne ? `⭐ One thing done: ${item}` : `✅ Done: ${item}`)
      } catch {
        $.ui.toast("Couldn't tick that one. Try again, or tell me in the chat.")
      }
    }

    const bringBack = (item: string) => async () => {
      try {
        const fresh = (await readClean($)) ?? ''
        const changed = untick(fresh, item)
        if (changed === undefined) {
          await update($, board, () => parse(fresh))
          return
        }
        await $.fs.write(TODO_FILE, changed)
        await update($, board, () => parse(changed))
        const back = unfeed(await loadDog($))
        await saveDog($, back).catch(() => undefined)
        await update($, dog, () => back)
        $.ui.toast(`↩️ Back on the list: ${item}`)
      } catch {
        $.ui.toast("Couldn't bring that one back. Try again, or tell me in the chat.")
      }
    }

    return (
      <Box flexDirection="column" gap={1} padding={1}>
        <Box flexDirection="row" justifyContent="flex-end">
          <Svg key={`pills-${pup.total}-${fire.days}-${fire.lit}-${pup.wall.length}`} source={pillsSvg(pup.total, fire.days, fire.lit, pup.wall.length)} alt={`${pup.total} biscuits, ${fire.days} day streak${pup.wall.length ? `, ${pup.wall.length} dogs grown` : ''}`} width={Math.round(pillsWidth(pup.total, fire.days, pup.wall.length) * 0.5)} height={20} />
        </Box>
        <Box flexDirection="column" alignItems="center">
          <Text dimColor>{hungry ? `${pup.name}'s hungry. Tick one off to feed me.` : 'I grow every time you feed me.'}</Text>
          <Svg key={`yum-${pup.fedAt}`} source={yumSvg(justFed)} alt={justFed ? 'Yum yum yum! +1' : ' '} width={168} height={28} />
          <Svg key="yard" source={sceneSvg(pup.colour, pup.stage, dogWidth(pup))} alt={`${pup.name} in his yard`} width={168} height={91} />
        </Box>

        <Text bold>🎯 One thing</Text>
        {one === null ? (
          <Text dimColor>No one thing yet. Tell me in the chat: "my one thing today is …"</Text>
        ) : (
          <Box flexDirection="row" gap={1} alignItems="center">
            <Button key="one" label="✅" onPress={tickOff(one, true)} />
            <Text bold color="claude">{one}</Text>
          </Box>
        )}

        <Text bold>✅ To-do</Text>
        {list.length === 0 && <Text dimColor>Nothing on the list. Tell me: "add to my to-do: …"</Text>}
        {list.map((item, i) => (
          <Box key={`row-${i}`} flexDirection="row" gap={1} alignItems="center">
            <Button key={`hit-${i}`} label="✅" onPress={tickOff(item, false)} />
            <Text>{item}</Text>
          </Box>
        ))}

        <Text bold>🗓️ Long-term to-do</Text>
        {long.length === 0 && <Text dimColor>Nothing long-term yet. Tell me: "add to my long-term to-do: … by [date]"</Text>}
        {long.map((item, i) => (
          <Box key={`long-row-${i}`} flexDirection="row" gap={1} alignItems="center">
            <Button key={`long-hit-${i}`} label="✅" onPress={tickOff(item, false)} />
            <Text>{item}</Text>
          </Box>
        ))}

        <Text bold>🏆 Done today</Text>
        {done.length === 0 && <Text dimColor>Nothing ticked yet. Click a ticked one to bring it back.</Text>}
        {done.map((item, i) => (
          <Box key={`back-row-${i}`} flexDirection="row" gap={1} alignItems="center">
            <Button key={`back-${i}`} label="↩️" onPress={bringBack(item.text)} />
            <Text dimColor strikethrough>{item.text}</Text>
          </Box>
        ))}
      </Box>
    )
  })
}
