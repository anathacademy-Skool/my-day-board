# 🛡️ Usage watchdog

A small line above your buttons that shows how much of your Claude limit you've used.

- **Green** under 70%. **Amber** from 70%: "Getting close. Use Sonnet for quick jobs, or say 'branch this'."
- **Red** from 90%: big jobs pause (helper agents, video renders, transcribing, deep web searches). Claude tells you the cheaper way. Say **"go anyway"** to run one.
- A pop-up at 70% and at 90%, once each time the limit resets.
- `/watchdog 92` shows what it looks like at 92% (a test). `/watchdog off` goes back to your real numbers.

It's its own mod. It never changes your buttons or any other mod. It reads only the usage numbers Claude already shows you; nothing is sent anywhere.

© 2026 Anath AI. For Anath AI Academy students only.
