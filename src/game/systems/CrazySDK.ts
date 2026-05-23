/** Thin wrapper around CrazyGames SDK v3 (loaded via index.html script tag). */

declare global {
  interface Window {
    CrazyGames?: {
      SDK: {
        init(): Promise<void>;
        environment: "crazygames" | "local" | "disabled";
        game: {
          gameplayStart(): void;
          gameplayStop(): void;
        };
        ad: {
          requestAd(type: "midgame" | "rewarded"): Promise<void>;
        };
      };
    };
  }
}

function sdk() {
  return window.CrazyGames?.SDK;
}

function isActive() {
  const s = sdk();
  return s != null && s.environment !== "disabled";
}

export async function initCrazySDK(): Promise<void> {
  const s = sdk();
  if (!s) return;
  await s.init();
}

export function gameplayStart(): void {
  if (isActive()) sdk()!.game.gameplayStart();
}

export function gameplayStop(): void {
  if (isActive()) sdk()!.game.gameplayStop();
}

export async function showMidgameAd(): Promise<void> {
  if (!isActive()) return;
  await sdk()!.ad.requestAd("midgame");
}
