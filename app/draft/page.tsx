"use client";

import { DraftRoom } from "@/components/DraftRoom";
import { DraftSetup } from "@/components/DraftSetup";
import { useDraft } from "@/lib/store";

export default function DraftPage() {
  const { state, hydrated } = useDraft();

  if (!hydrated) {
    return <p className="text-fortress-muted">Raising the gate…</p>;
  }

  if (state.status === "idle" || !state.settings) {
    return <DraftSetup />;
  }

  return <DraftRoom />;
}
