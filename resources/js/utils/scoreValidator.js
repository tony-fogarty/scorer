// Use the same valid dart scores as finishValidator for consistency
const validDartScores = [
  0,
  ...Array.from({ length: 20 }, (_, i) => i + 1), // 1-20, singles
  25, 50, // bulls
  ...Array.from({ length: 20 }, (_, i) => 2 * (i + 1)), // Doubles 2-40
  ...Array.from({ length: 20 }, (_, i) => 3 * (i + 1)), // Trebles 3-60
];
// Remove duplicates (e.g., 6, 12, etc. appear as both double and treble)
const uniqueDartScores = Array.from(new Set(validDartScores)).sort((a, b) => a - b);

export function isPossibleWithThreeDarts(score) {
  // Try all combinations of 1, 2, or 3 darts
  for (let i = 0; i < uniqueDartScores.length; i++) {
    if (uniqueDartScores[i] === score) return true;
    for (let j = 0; j < uniqueDartScores.length; j++) {
      if (uniqueDartScores[i] + uniqueDartScores[j] === score) return true;
      for (let k = 0; k < uniqueDartScores.length; k++) {
        if (uniqueDartScores[i] + uniqueDartScores[j] + uniqueDartScores[k] === score) return true;
      }
    }
  }
  return false;
}

// General score validation
export function isValidScore(score, remain) {
  // Score must be a number between 0 and 180 (or the current remaining)
  if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 180) return false;
  if (score > remain) return false;
  // If this score would leave the player on 1 or below (not a finish), it's a bust
  if (remain - score < 2 && remain - score !== 0) return false;
  // Advanced: Check if possible with up to 3 darts
  if (!isPossibleWithThreeDarts(score)) return false;
  return true;
}