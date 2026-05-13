import type { ActionId, HitboxData } from "../types";

export const hitboxes: Record<ActionId, HitboxData> = {
  "attack.punch.right": {
    attackId: "attack.punch.right",
    activeWindows: [{ fromMs: 90, toMs: 170, box: { x: 42, y: -142, w: 88, h: 34 } }]
  },
  "attack.punch.left": {
    attackId: "attack.punch.left",
    activeWindows: [{ fromMs: 120, toMs: 210, box: { x: 40, y: -134, w: 96, h: 38 } }]
  },
  "attack.kick.right": {
    attackId: "attack.kick.right",
    activeWindows: [{ fromMs: 170, toMs: 280, box: { x: 46, y: -76, w: 132, h: 40 } }]
  },
  "attack.kick.left": {
    attackId: "attack.kick.left",
    activeWindows: [{ fromMs: 150, toMs: 280, box: { x: 36, y: -58, w: 122, h: 38 } }]
  }
};
