const BASE_ELO = 1200;
const HUMAN_K = 32;
const DIFFICULTY_K = {
  easy: 16,
  medium: 24,
  hard: 32,
  impossible: 40,
};

const clampElo = (value) => Math.max(0, Math.round(value));

const expectedScore = (playerElo, opponentElo) =>
  1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

const scoreFromResult = (result) => {
  if (result === "win") return 1;
  if (result === "draw") return 0.5;
  if (result === "loss") return 0;
  throw new Error("Invalid match result");
};

const calculateElo = (playerElo, opponentElo, result, difficulty = "human") => {
  const normalizedDifficulty = (difficulty || "").toLowerCase();

  // AI difficulty buckets use static K-factors and a neutral opponent rating
  if (normalizedDifficulty && normalizedDifficulty !== "human") {
    const k = DIFFICULTY_K[normalizedDifficulty] || DIFFICULTY_K.medium;
    const delta = k * (scoreFromResult(result) - 0.5); // AI treated as equal strength
    return clampElo(playerElo + delta);
  }

  // Human vs human ELO using standard expected-score model
  const k = HUMAN_K;
  const expected = expectedScore(playerElo, opponentElo);
  const actual = scoreFromResult(result);
  const newRating = playerElo + k * (actual - expected);
  return clampElo(newRating);
};

module.exports = {
  BASE_ELO,
  HUMAN_K,
  DIFFICULTY_K,
  calculateElo,
  clampElo,
  expectedScore,
  scoreFromResult,
};
