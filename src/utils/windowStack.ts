export type AppWindow = "finder" | "contacts" | "terminal";

export type FocusOrder = Record<AppWindow, number>;

export const INITIAL_FOCUS_ORDER: FocusOrder = {
  finder: 0,
  contacts: 0,
  terminal: 0,
};

export function bumpFocusOrder(
  prev: FocusOrder,
  app: AppWindow,
): FocusOrder {
  const m = Math.max(prev.finder, prev.contacts, prev.terminal);
  return { ...prev, [app]: m + 1 };
}

/** Stacking within the window layer (40–42) or fullscreen layer (110–112), below menu (100) when not fullscreen. */
export function windowStackZIndex(
  app: AppWindow,
  order: FocusOrder,
  fullscreen: boolean,
): number {
  const base = fullscreen ? 110 : 40;
  const apps: AppWindow[] = ["finder", "contacts", "terminal"];
  const sorted = [...apps].sort((a, b) => {
    const d = order[a] - order[b];
    if (d !== 0) return d;
    return a.localeCompare(b);
  });
  return base + sorted.indexOf(app);
}
