import GameAnalytics from "gameanalytics";

const GA = GameAnalytics.GameAnalytics;

export function initGameAnalytics() {
  GA.configureBuild("web 0.1.0");
  GA.initialize("0dfdd6af9a494f3b72c223854a6c932b", "a7cdf4d321e4ce17d37291c9f4639cdca9bb9501");
}

export function gaProgressionStart(level: number) {
  GA.addProgressionEvent(GameAnalytics.EGAProgressionStatus.Start, "world01", `level${String(level).padStart(2, "0")}`);
}

export function gaProgressionComplete(level: number, score: number) {
  GA.addProgressionEvent(GameAnalytics.EGAProgressionStatus.Complete, "world01", `level${String(level).padStart(2, "0")}`, "", score);
}

export function gaProgressionFail(level: number, score: number) {
  GA.addProgressionEvent(GameAnalytics.EGAProgressionStatus.Fail, "world01", `level${String(level).padStart(2, "0")}`, "", score);
}
