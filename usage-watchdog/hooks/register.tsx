import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Limit } from '../types'

// 🛡️ Usage watchdog (Anath AI, 2026-11-15). Its own mod: it never touches the buttons or any other mod.
// Shows how much of the Claude limit is used, warns at 70% and 90%,
// and from 90% pauses the big jobs (helper agents, video renders, transcribing, deep web searches)
// until the owner says "go anyway".

const limitsA = atom({ plugin: 'usage-watchdog', key: 'limits' } as const, [] as Limit[])
const pretendA = atom({ plugin: 'usage-watchdog', key: 'pretend' } as const, null as number | null)
const goAnywayA = atom({ plugin: 'usage-watchdog', key: 'goAnyway' } as const, false)
const warnedA = atom({ plugin: 'usage-watchdog', key: 'warned' } as const, [] as string[])

export const WARN = 70
export const PAUSE = 90

const NAMES: Record<string, string> = { five_hour: '5-hour', seven_day: 'Week', spend_limit: 'Spend' }
export const nameOf = (kind: string) => NAMES[kind] ?? kind

// The pretend number (for showing it working) stands in for the 5-hour window.
export const withPretend = (limits: Limit[], pretend: number | null): Limit[] => {
  if (pretend === null) return limits
  const rest = limits.filter(l => l.kind !== 'five_hour')
  const five = limits.find(l => l.kind === 'five_hour')
  return [{ kind: 'five_hour', percentUsed: pretend, resetsAt: five?.resetsAt }, ...rest]
}

// The window closest to running out.
export const worst = (limits: Limit[]): Limit | null =>
  limits.reduce<Limit | null>((a, l) => (a === null || l.percentUsed > a.percentUsed ? l : a), null)

export const bar = (p: number, width = 10) => {
  const full = Math.max(0, Math.min(width, Math.round((p / 100) * width)))
  return '█'.repeat(full) + '░'.repeat(width - full)
}

export const resetsIn = (resetsAt: string | undefined, now: number): string => {
  if (!resetsAt) return ''
  const mins = Math.max(0, Math.round((Date.parse(resetsAt) - now) / 60000))
  if (mins >= 48 * 60) return `${Math.round(mins / 1440)} days`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const HEAVY_BASH = /\b(ffmpeg|whisper|faster[-_]whisper|transcribe|remotion|yt-dlp)\b/i

// Which jobs count as big. Returns what to call it, or null for a normal job.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const heavyJob = (tool: string, input: any): string | null => {
  if (tool === 'Agent' || tool === 'Task') return 'a helper agent'
  if (tool === 'Bash' && typeof input?.command === 'string' && HEAVY_BASH.test(input.command)) return 'a video render or transcribing job'
  if (tool === 'WebSearch' && input?.mode === 'extended') return 'a deep web search'
  return null
}

export const pauseMessage = (job: string, l: Limit, now: number) => {
  const when = resetsIn(l.resetsAt, now)
  return (
    `Usage watchdog: paused ${job}. The owner has used ${Math.round(l.percentUsed)}% of their ${nameOf(l.kind)} Claude limit` +
    (when ? ` (it resets in ${when})` : '') +
    `. Don't retry it. Tell them in plain words that this job would use a lot of what's left, and offer the cheaper way: ` +
    `do it a lighter way here without the big job, switch to Sonnet for quick jobs, say "branch this" to carry on in a fresh chat, ` +
    `or wait for the reset. If they still want it, they just say "go anyway".`
  )
}

async function refresh($: EngineInterface) {
  try {
    const u = await $.session.usage()
    await update($, limitsA, () => u.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })))
  } catch {
    // No reading yet; the band waits for the first one.
  }
}

// Pop-ups at 70% and 90%, once per window.
async function warn($: EngineInterface) {
  const limits = withPretend(await read($, limitsA), await read($, pretendA))
  const warned = await read($, warnedA)
  const fresh: string[] = []
  const now = await $.clock.now()
  for (const l of limits) {
    for (const level of [PAUSE, WARN]) {
      if (l.percentUsed < level) continue
      const key = `${l.kind}:${l.resetsAt ?? ''}:${level}`
      if (!warned.includes(key) && !fresh.includes(key)) {
        fresh.push(key)
        const when = resetsIn(l.resetsAt, now)
        $.ui.toast(
          level === PAUSE
            ? `🛑 ${Math.round(l.percentUsed)}% of your ${nameOf(l.kind)} limit used. Big jobs are paused. Say "go anyway" to run one.`
            : `⚠️ ${Math.round(l.percentUsed)}% of your ${nameOf(l.kind)} limit used${when ? `, resets in ${when}` : ''}. Sonnet for quick jobs, or say "branch this".`,
        )
      }
      break
    }
  }
  if (fresh.length) await update($, warnedA, w => [...w, ...fresh].slice(-40))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command.register({ name: 'watchdog', description: 'Usage watchdog: /watchdog 92 to show it at 92%, /watchdog off to go back to real numbers' })
    await refresh($)
    return r
  })

  on('session.measure', async ($, e, next) => {
    await update($, limitsA, () => e.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })))
    await warn($)
    $.ui.invalidate('ui.render')
    return next(e)
  })

  // "go anyway" lets the big jobs through for that one turn.
  on('prompt.submit', async ($, e, next) => {
    if (/\bgo anyway\b/i.test(e.text)) await update($, goAnywayA, () => true)
    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    await update($, goAnywayA, () => false)
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const job = heavyJob(e.tool, e)
    if (job === null || (await read($, goAnywayA))) return next(e)
    const top = worst(withPretend(await read($, limitsA), await read($, pretendA)))
    if (top === null || top.percentUsed < PAUSE) return next(e)
    return { deny: pauseMessage(job, top, await $.clock.now()) }
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'watchdog' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const n = Number(arg.replace('%', ''))
    if (arg === 'off' || arg === '') {
      await update($, pretendA, () => null)
      await refresh($)
    } else if (Number.isFinite(n) && n >= 0 && n <= 100) {
      await update($, pretendA, () => n)
      await warn($)
    } else {
      return { text: 'Try /watchdog 92 to see it at 92%, or /watchdog off for the real numbers.' }
    }
    $.ui.invalidate('ui.render')
    const top = worst(withPretend(await read($, limitsA), await read($, pretendA)))
    return { text: top ? `🛡️ Watchdog: ${nameOf(top.kind)} ${Math.round(top.percentUsed)}%${arg !== 'off' && arg !== '' ? ' (pretend, for testing)' : ''}` : '🛡️ Watchdog: no reading yet. It shows after the next reply.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // Whatever the other mods draw (the buttons, the day bar) always stays, untouched, underneath.
    const below = await next(e)
    if (e.props.hasSurvey) return below
    const pretend = await read($, pretendA)
    const limits = withPretend(await read($, limitsA), pretend)
    const five = limits.find(l => l.kind === 'five_hour')
    const week = limits.find(l => l.kind === 'seven_day')
    const main = five ?? worst(limits)
    if (!main) return below
    const top = worst(limits) ?? main
    const now = await $.clock.now()
    const p = Math.round(main.percentUsed)
    const colour = top.percentUsed >= PAUSE ? 'error' : top.percentUsed >= WARN ? 'warning' : 'success'
    const when = resetsIn(main.resetsAt, now)
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        <Box flexDirection="column" paddingX={1}>
          <Text>
            <Text color={colour}>🛡️ {nameOf(main.kind)} {bar(main.percentUsed)} {p}%</Text>
            <Text dimColor>
              {when ? `  resets in ${when}` : ''}
              {week && week !== main ? `  ·  Week ${Math.round(week.percentUsed)}%` : ''}
              {pretend !== null ? '  ·  test' : ''}
            </Text>
          </Text>
          {top.percentUsed >= PAUSE ? (
            <Text color="error">Nearly out. Big jobs are paused. Say "go anyway" to run one, or "branch this" for a fresh chat.</Text>
          ) : top.percentUsed >= WARN ? (
            <Text color="warning">Getting close. Use Sonnet for quick jobs, or say "branch this".</Text>
          ) : null}
        </Box>
        {below}
      </Box>
    )
  })
}
