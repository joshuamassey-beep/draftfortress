import Link from "next/link";
import { ShieldMark } from "@/components/ShieldMark";

const PILLARS = [
  {
    href: "/draft",
    kicker: "Draft room",
    title: "Own the snake",
    copy: "8–14 team board, full player pool, and a need-based recon that names the next three bricks in the wall.",
  },
  {
    href: "/team",
    kicker: "My team",
    title: "Hold the line",
    copy: "Roster by slot plus a start/sit call built on projections, byes, and who actually belongs in the lineup.",
  },
  {
    href: "/waivers",
    kicker: "Waivers",
    title: "Raid the wire",
    copy: "See who is still available and which pickups close holes before the week opens a gap.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12 pb-10">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fortress-gold">
            draftfortress.com
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] tracking-wide sm:text-6xl">
            A fortress for your draft and roster.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-fortress-steel">
            Fantasy weeks die in messy drafts and soft start/sit calls. Draft Fortress keeps you in
            control — dark, solid, sports-forward. No clutter. No gimmicks. You hold the board.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/draft"
              className="bg-fortress-gold px-6 py-3 font-display text-lg uppercase tracking-[0.16em] text-fortress-bg hover:bg-fortress-gold-bright"
            >
              Enter the draft room
            </Link>
            <Link
              href="/team"
              className="border border-fortress-border px-6 py-3 font-display text-lg uppercase tracking-[0.16em] text-fortress-ink"
            >
              Inspect roster
            </Link>
          </div>
        </div>
        <div className="border border-fortress-border bg-fortress-surface p-8 shadow-fortress">
          <ShieldMark className="h-16 w-14" />
          <p className="mt-6 font-display text-3xl uppercase">Hold the line. Own every pick.</p>
          <ul className="mt-5 space-y-2 text-fortress-steel">
            <li>— Snake simulator with CPU managers who draft to need</li>
            <li>— ~300 ranked NFL players with ADP, team, and bye</li>
            <li>— Recommender, start/sit, and waiver claims — all local, no login</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.href}
            href={pillar.href}
            className="border border-fortress-border bg-fortress-surface p-5 transition hover:border-fortress-gold/50"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-gold">
              {pillar.kicker}
            </p>
            <h2 className="mt-2 font-display text-2xl uppercase">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-fortress-steel">{pillar.copy}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
