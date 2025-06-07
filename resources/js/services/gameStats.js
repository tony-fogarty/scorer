/**
 * gameStats.js
 * Pure stat/summary logic for darts set/leg play.
 * All functions are pure and take a gameState object and a "scope" (full game, set, or leg).
 * Inspired by your GameStatsService.php and the UI screenshot.
 * 
 * Usage:
 *   - getGameStats(gameState) // full game
 *   - getGameStats(gameState, { setIdx: 1 }) // single set
 *   - getGameStats(gameState, { setIdx: 1, legIdx: 2 }) // single leg
 */

function getPlayerIds(gameState) {
  return gameState.players.map(p => p.id)
}

function zeroStats() {
  return {
    totalScore: 0,
    dartsThrown: 0,
    scores_0_59: 0,
    scores_60_79: 0,
    scores_80_99: 0,
    scores_100_plus: 0,
    scores_140_plus: 0,
    scores_170_plus: 0,
    scores_180: 0,
    threeDartAverage: null,
    average: null,
    leastDarts: null,
    highFinish: null,
    legs_for: 0,
    legs_against: 0,
    sets_for: 0,
    sets_against: 0,
    firstNineAvg: null,
  }
}

/**
 * Returns an array of all throws in the selected scope for the specified player.
 * @param {object} gameState 
 * @param {number} playerId 
 * @param {object} scope - {setIdx, legIdx} (all zero-based, or undefined for full game)
 * @returns {array} array of throws
 */
export function getThrows(gameState, playerId, scope = {}) {
  let throws = []
  const sets = gameState.sets
  if (scope.setIdx !== undefined) {
    const set = sets[scope.setIdx]
    if (!set) return []
    if (scope.legIdx !== undefined) {
      const leg = set.legs[scope.legIdx]
      if (!leg) return []
      throws = leg.throws.filter(t => t.playerId === playerId)
    } else {
      for (const leg of set.legs) {
        throws = throws.concat(leg.throws.filter(t => t.playerId === playerId))
      }
    }
  } else {
    for (const set of sets) {
      for (const leg of set.legs) {
        throws = throws.concat(leg.throws.filter(t => t.playerId === playerId))
      }
    }
  }
  return throws
}

/**
 * Returns an array of all leg stats for the specified player in the selected scope.
 * Each stat: {darts, checkout, remaining, winner}
 */
export function getLegStats(gameState, playerId, scope = {}) {
  let stats = []
  const sets = gameState.sets
  if (scope.setIdx !== undefined) {
    const set = sets[scope.setIdx]
    if (!set) return []
    if (scope.legIdx !== undefined) {
      const leg = set.legs[scope.legIdx]
      if (!leg) return []
      if (leg.winner === playerId) {
        // Find the winning throw
        const winThrow = leg.throws[leg.winningTurn]
        stats.push({
          darts: leg.throws
            .slice(0, leg.winningTurn + 1)
            .filter(t => t.playerId === playerId)
            .reduce((acc, t) => acc + (t.darts || 3), 0),
          checkout: winThrow ? winThrow.checkout : null,
          remaining: winThrow ? winThrow.remaining : null,
          winner: playerId,
        })
      }
    } else {
      for (const leg of set.legs) {
        if (leg.winner === playerId) {
          const winThrow = leg.throws[leg.winningTurn]
          stats.push({
            darts: leg.throws
              .slice(0, leg.winningTurn + 1)
              .filter(t => t.playerId === playerId)
              .reduce((acc, t) => acc + (t.darts || 3), 0),
            checkout: winThrow ? winThrow.checkout : null,
            remaining: winThrow ? winThrow.remaining : null,
            winner: playerId,
          })
        }
      }
    }
  } else {
    for (const set of sets) {
      for (const leg of set.legs) {
        if (leg.winner === playerId) {
          const winThrow = leg.throws[leg.winningTurn]
          stats.push({
            darts: leg.throws
              .slice(0, leg.winningTurn + 1)
              .filter(t => t.playerId === playerId)
              .reduce((acc, t) => acc + (t.darts || 3), 0),
            checkout: winThrow ? winThrow.checkout : null,
            remaining: winThrow ? winThrow.remaining : null,
            winner: playerId,
          })
        }
      }
    }
  }
  return stats
}

/**
 * Main function: calculates stats for every player in the given scope.
 * @param {object} gameState 
 * @param {object} scope - {setIdx, legIdx} (optional)
 * @returns {object} { [playerId]: { ...stats }, ... }
 */
export function getGameStats(gameState, scope = {}) {
  const result = {}
  const playerIds = getPlayerIds(gameState)
  const sets = gameState.sets

  // For sets_for/against and legs_for/against, always calculate from full game state (not scope)
  function getSetsLegsForAgainst(playerId) {
    let sets_for = 0, sets_against = 0, legs_for = 0, legs_against = 0
    for (const set of sets) {
      if (set.winner === playerId) sets_for++
      if (set.winner && set.winner !== playerId) sets_against++
      for (const leg of set.legs) {
        if (leg.winner === playerId) legs_for++
        if (leg.winner && leg.winner !== playerId) legs_against++
      }
    }
    return { sets_for, sets_against, legs_for, legs_against }
  }

  for (const playerId of playerIds) {
    const stats = zeroStats()
    const throws = getThrows(gameState, playerId, scope)
    const legStats = getLegStats(gameState, playerId, scope)
    let totalDarts = 0
    let firstNine = 0
    let firstNineDarts = 0

    // Scoring bands
    for (let i = 0; i < throws.length; i++) {
      const s = parseInt(throws[i].scored ?? 0, 10)
      stats.totalScore += s

      if (s >= 0 && s <= 59) stats.scores_0_59++
      else if (s >= 60 && s <= 79) stats.scores_60_79++
      else if (s >= 80 && s <= 99) stats.scores_80_99++
      else if (s >= 100 && s <= 139) stats.scores_100_plus++
      else if (s >= 140 && s <= 169) stats.scores_140_plus++
      else if (s >= 170 && s <= 179) stats.scores_170_plus++
      else if (s === 180) stats.scores_180++

      totalDarts += throws[i].darts || 3
      if (i < 3) {
        firstNine += s
        firstNineDarts += throws[i].darts || 3
      }
      if (i < 6) {
        firstNine += s
        firstNineDarts += throws[i].darts || 3
      }
      if (i < 9) {
        firstNine += s
        firstNineDarts += throws[i].darts || 3
      }
    }
    stats.dartsThrown = totalDarts

    // Averages
    if (stats.dartsThrown > 0) {
      stats.average = Number((stats.totalScore / stats.dartsThrown).toFixed(2))
      stats.threeDartAverage = Number((stats.average * 3).toFixed(2))
    }
    if (firstNineDarts > 0) {
      stats.firstNineAvg = Number(((firstNine / firstNineDarts) * 3).toFixed(2))
    }

    // Least darts & highest finish (over all winning legs in scope)
    if (legStats.length > 0) {
      const dartsArr = legStats.map(l => l.darts).filter(v => v !== null && v !== undefined)
      if (dartsArr.length > 0) stats.leastDarts = Math.min(...dartsArr)
      const checkouts = legStats.map(l => l.checkout).filter(v => v !== null && v !== undefined)
      if (checkouts.length > 0) stats.highFinish = Math.max(...checkouts)
    }

    // Legs/sets for/against (always from global scope)
    const { sets_for, sets_against, legs_for, legs_against } = getSetsLegsForAgainst(playerId)
    stats.sets_for = sets_for
    stats.sets_against = sets_against
    stats.legs_for = legs_for
    stats.legs_against = legs_against

    result[playerId] = stats
  }
  return result
}