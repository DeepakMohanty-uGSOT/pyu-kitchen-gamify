# 🍳 Pyu's Kitchen

**Game 1 of the Learning Journey: Python Fundamentals.**
Students write **real Python** recipes for Chef Pyu. The code runs for real in the browser (Pyodide, CPython compiled to WebAssembly), and the cartoon kitchen replays exactly what the program did: jars fill, customers order, pots stir, bills print. If there's a mistake, you see that too.

- 9 chapters · 45 levels · 900 points (100 per chapter)
- Frontend only: no backend, database or API routes
- Progress is saved in `localStorage`

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a GitHub, GitLab or Bitbucket repository.
2. In Vercel, click **Add New → Project** and import the repository.
3. Keep the defaults. The framework preset is **Next.js**, and no environment variables are needed.
4. Click **Deploy**.

The app is a static export (`output: "export"` in `next.config.mjs`). `npm run build` writes a fully static site to `out/`, which any static host can serve.

Or, with the Vercel CLI: `npx vercel --prod`.

> Pyodide (~10 MB) and the Monaco editor load from the jsDelivr CDN on first visit, and the browser caches them after that. Students need an internet connection the first time.

## Verify every level

```bash
npm run verify
```

This runs every level through the real tracer (Pyodide in Node) and the real evaluator. It checks that:

- every reference solution passes,
- every starter recipe fails,
- common mistakes get the right helpful message.

Reference solutions live in `scripts/solutions.ts`, which the app never imports, so the answers never ship to students.

## How it works

```
Monaco editor ─► Web Worker (Pyodide) ─► tracer.py (sys.settrace) ─► event list
                                                                         │
     Kitchen animation ◄── playback (line highlight, shelf, customers) ◄─┤
     DISH PERFECT / Try again ◄── evaluator (final state, output, return values)
```

| Path | What it is |
|---|---|
| `public/tracer.py` | Runs the recipe, records line/call/return/print/input/error events and variable snapshots. Blocks imports, limits steps (10,000) and output. |
| `public/pyodide-worker.js` | Loads Pyodide from the CDN and runs the tracer off the main thread. The page restarts it if a recipe hangs. |
| `lib/levels/*.ts` | All 45 levels as data: story, order, starter code, customers (test cases), checks, hints. |
| `lib/evaluate.ts` | Decides success only from what the program actually did. It never string-matches the code. |
| `lib/errors.ts` | Turns real Python errors into friendly kitchen explanations. The real message is always shown too. |
| `components/kitchen/*` | SVG + CSS kitchen: Pyu, Byte, customers, station widgets bound to variables, jar shelf, recipe wall. |

### Adding a level

Add an object to one of the `lib/levels/ch*.ts` arrays. Give it customers with inputs or preset jars, and checks such as `var`, `output`, `funcTest`, `callCount`, `maxLines` or `defines`. Then add a reference solution in `scripts/solutions.ts` and run `npm run verify`. No engine code needs to change.

## Keyboard

- `Ctrl/Cmd + Enter`: Cook
- `F10`: Step
- Settings (⚙️): theme, sound, reset progress, and "unlock all levels" (a preview mode for teachers)
