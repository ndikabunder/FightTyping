import type { ComboState, ComboTier } from "../types";

export function createComboState(): ComboState {
  return {
    count: 0,
    best: 0,
    serial: 0,
    event: null,
    label: "",
    tier: "none",
    changedAtMs: 0
  };
}

export class ComboSystem {
  gain(current: ComboState, nowMs: number): ComboState {
    const count = current.count + 1;

    return {
      count,
      best: Math.max(current.best, count),
      serial: current.serial + 1,
      event: "gain",
      label: `COMBO x${count}`,
      tier: tierFor(count),
      changedAtMs: nowMs
    };
  }

  break(current: ComboState, nowMs: number): ComboState {
    if (current.count <= 0) {
      return {
        ...current,
        event: null,
        label: "",
        tier: "none",
        changedAtMs: nowMs
      };
    }

    return {
      count: 0,
      best: current.best,
      serial: current.serial + 1,
      event: "break",
      label: "COMBO BREAK",
      tier: "none",
      changedAtMs: nowMs
    };
  }
}

function tierFor(count: number): ComboTier {
  if (count >= 10) {
    return "mega";
  }
  if (count >= 5) {
    return "power";
  }
  if (count >= 3) {
    return "chain";
  }
  return count > 0 ? "fresh" : "none";
}
