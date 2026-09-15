# Draft Fortress

A fortress for your fantasy football draft and roster. Mock snake drafts, need-based pick recommendations, start/sit advice, and waiver claims — local to your browser, no login.

**Brand:** [draftfortress.com](https://draftfortress.com)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## What you can do

1. **Draft room** — Configure a 4–32 team snake draft, take a seat, and pick from a ~300 player NFL pool (QB / RB / WR / TE / K / DST) with search and filters. CPU teams auto-draft. When you are on the clock, the recommender surfaces **top 3 targets** with short reasons based on roster holes, positional scarcity, and ADP value. Round count is capped so `teams × rounds` never exceeds the player pool.
2. **My Team** — Roster by slot plus a week-by-week start/sit advisor (projections, bye weeks, starter eligibility).
3. **Waivers** — Remaining players after (or during) the draft, pickup suggestions, and claim/drop.

State lives in `localStorage`. Reset the board from the draft room when you want a clean slate.

## Stack

Next.js App Router, TypeScript, Tailwind CSS. Client-side draft simulation.

## Out of scope (v0)

ESPN/Yahoo OAuth, betting/DFS, multi-sport.
