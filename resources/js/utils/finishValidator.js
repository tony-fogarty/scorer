// src/utils/finishValidator.js

// Valid single dart scores: 0 (miss), 1-20, 25 (outer bull), 50 (bullseye), all valid doubles and trebles
const validSingles = [
  0,
  ...Array.from({ length: 20 }, (_, i) => i + 1), // 1-20
  25, 50, // bulls
  // Doubles 2-40, even numbers
  ...Array.from({ length: 20 }, (_, i) => 2 * (i + 1)),
  // Trebles 3-60, multiples of 3
  ...Array.from({ length: 20 }, (_, i) => 3 * (i + 1)),
];

// Remove duplicates (e.g., 6, 12, etc.)
const uniqueSingles = Array.from(new Set(validSingles)).sort((a, b) => a - b);

// Valid finishing doubles
const validDoubles = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 50];

export function isValidFinish(score, darts) {
  if (darts === 1) {
    // Must be a double
    return validDoubles.includes(score);
  }
  if (darts === 2) {
    for (let s1 of uniqueSingles) {
      if (validDoubles.includes(score - s1)) return true;
    }
    return false;
  }
  if (darts === 3) {
    for (let s1 of uniqueSingles) {
      for (let s2 of uniqueSingles) {
        if (validDoubles.includes(score - s1 - s2)) return true;
      }
    }
    return false;
  }
  return false;
}