"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldMark } from "@/components/ShieldMark";
import { useDraft } from "@/lib/store";
import { formatPickLabel, totalPicks } from "@/lib/draft";

const LINKS = [
  { href: "/draft", label: "Draft Room" },
  { href: "/team", label: "My Team" },
  { href: "/waivers", label: "Waivers" },
];

export function Header() {
  const pathname = usePathname();
  const { state, hydrated } = useDraft();
  const settings = state.settings;
  const statusLabel = !hydrated
    ? ""
    : state.status === "live" && settings
      ? `Rd ${Math.ceil((state.picks.length + 1) / settings.teamCount)} · ${formatPickLabel(state.picks.length + 1, settings.teamCount)}`
      : state.status === "complete"
        ? "Board locked"
        : "Idle";

  return (
    <header className="sticky top-0 z-40 border-b border-fortress-border bg-fortress-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-fortress-ink">
          <ShieldMark className="h-8 w-7" />
          <span className="font-display text-lg uppercase tracking-[0.14em] sm:text-xl">
            Draft Fortress
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider sm:text-sm">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-sm px-3 py-1.5 ${
                  active
                    ? "bg-fortress-gold text-fortress-bg"
                    : "text-fortress-steel hover:text-fortress-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          {settings && state.status !== "idle" ? (
            <span className="rounded-sm border border-fortress-border px-2.5 py-1 font-mono text-xs text-fortress-steel">
              {statusLabel}
              {state.status === "live" ? ` · ${state.picks.length}/${totalPicks(settings)}` : ""}
            </span>
          ) : (
            <span className="text-xs uppercase tracking-widest text-fortress-muted">
              Hold the line
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
