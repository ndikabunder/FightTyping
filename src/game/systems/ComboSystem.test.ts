import { describe, expect, it } from "vitest";
import { ComboSystem, createComboState } from "./ComboSystem";

describe("ComboSystem", () => {
  it("increments combo, best combo, serial, and tier on gain", () => {
    const system = new ComboSystem();

    let combo = createComboState();
    combo = system.gain(combo, 100);
    combo = system.gain(combo, 200);
    combo = system.gain(combo, 300);

    expect(combo.count).toBe(3);
    expect(combo.best).toBe(3);
    expect(combo.serial).toBe(3);
    expect(combo.event).toBe("gain");
    expect(combo.label).toBe("COMBO x3");
    expect(combo.tier).toBe("chain");
  });

  it("resets current combo on break without losing best combo", () => {
    const system = new ComboSystem();
    const combo = system.break(system.gain(system.gain(createComboState(), 100), 200), 300);

    expect(combo.count).toBe(0);
    expect(combo.best).toBe(2);
    expect(combo.serial).toBe(3);
    expect(combo.event).toBe("break");
    expect(combo.label).toBe("COMBO BREAK");
  });

  it("does not emit a break event when there is no active combo", () => {
    const system = new ComboSystem();
    const combo = system.break(createComboState(), 100);

    expect(combo.count).toBe(0);
    expect(combo.serial).toBe(0);
    expect(combo.event).toBeNull();
  });
});
