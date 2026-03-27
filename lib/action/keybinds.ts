type KeyEvent = {
  key: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
};

const isMac = (globalThis.navigator?.userAgent.toLowerCase().indexOf("mac") !== -1);

export function bindingSymbols(key?: string): string[] {
  if (!key) return [];
  const symbols = {
    "backspace": "⌫",
    "shift": "⇧",
    "meta": "⌘",
    "tab": "↹",
    "ctrl": "⌃",
    "arrowup": "↑",
    "arrowdown": "↓",
    "arrowleft": "←",
    "arrowright": "→",
    "enter": "⏎"
  } as const;
  const keys = key.toLowerCase().split("+");
  return keys
    .map(filterKeyForNonMacMeta)
    .map(k => (k in symbols) ? symbols[k as keyof typeof symbols] : k);
}

// if key is meta and not on a mac, change it to ctrl,
// otherwise return the key as is
function filterKeyForNonMacMeta(key: string): string {
  return (!isMac && key === "meta") ? "ctrl": key;
}

export interface Binding {
  command: string;
  key: string;
  //when
  //args
}

export class KeyBindings {
  bindings: Binding[];

  constructor() {
    this.bindings = [];
  }

  registerBinding(binding: Binding) {
    this.bindings.push(binding);
  }

  getBinding(commandId: string): Binding|null {
    for (const b of this.bindings) {
      if (b.command === commandId) {
        return b;
      }
    }
    return null;
  }

  evaluateEvent(event: KeyEvent): Binding|null {
    bindings: for (const b of this.bindings) {
      let modifiers = b.key.toLowerCase().split("+");
      let key = modifiers.pop();
      if (key !== event.key.toLowerCase()) {
        continue;
      }
      for (const checkMod of ["shift", "ctrl", "alt", "meta"]) {
        let hasMod = modifiers.includes(checkMod);
        if (!isMac) {
          if (checkMod === "meta") continue;
          if (checkMod === "ctrl") {
            hasMod = modifiers.includes("meta") || modifiers.includes("ctrl");
          }
        }
        const modState = Boolean((event as Record<string, boolean | string>)[`${filterKeyForNonMacMeta(checkMod)}Key`]);
        if (!modState && hasMod) {
          continue bindings;
        }
        if (modState && !hasMod) {
          continue bindings;
        }
      }
      return b;
    }
    return null;
  }
}
