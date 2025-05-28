export function calculateScoreStats(history) {
  let scores_0_59 = 0;
  let scores_60_79 = 0;
  let scores_80_99 = 0;
  let scores_100_plus = 0;
  let scores_140_plus = 0;
  let scores_170_plus = 0;
  let scores_180 = 0;

  history.forEach(entry => {
    const s = Number(entry.scored ?? 0);
    if (s >= 0 && s <= 59) scores_0_59++;
    if (s >= 60 && s <= 79) scores_60_79++;
    if (s >= 80 && s <= 99) scores_80_99++;
    if (s >= 100) scores_100_plus++;
    if (s >= 140) scores_140_plus++;
    if (s >= 170) scores_170_plus++;
    if (s === 180) scores_180++;
  });

  return {
    scores_0_59,
    scores_60_79,
    scores_80_99,
    scores_100_plus,
    scores_140_plus,
    scores_170_plus,
    scores_180,
  };
}