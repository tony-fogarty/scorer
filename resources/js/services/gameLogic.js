/**
 * Core game logic for darts set/leg play.
 * Pure functions only: no side-effects, no UI, no Axios.
 * This module expects a gameState object as defined in models/gameState.example.js
 * (See that file for full schema)
 * 
 * Integrates finishValidator and scoreValidator as provided.
 */

import { isValidFinish } from '../utils/finishValidator'
import { isValidScore } from '../utils/scoreValidator'


/** 
 * Helper: Determine who throws first for a given set and leg.
 * Alternates starting player by set, and by odd/even leg within set.
 * @param {number} setIdx - zero-based set index
 * @param {number} legIdx - zero-based leg index
 * @param {number} throwFirst - playerId who starts the first leg of the first set
 * @returns {number} playerId (1 or 2)
 */
export function getStartingPlayer(setIdx, legIdx, throwFirst) {
  // Odd-numbered sets: throwFirst starts legs 1,3,5; other player starts 2,4
  // Even-numbered sets: other player starts 1,3,5; throwFirst starts 2,4
  const oddSet = setIdx % 2 === 0
  const oddLeg = legIdx % 2 === 0
  if (oddSet) {
    return oddLeg ? throwFirst : otherPlayer(throwFirst)
  } else {
    return oddLeg ? otherPlayer(throwFirst) : throwFirst
  }
}

function otherPlayer(playerId) {
  return playerId === 1 ? 2 : 1
}

/**
 * Create a new leg object
 */
export function createLeg(startScore) {
  return {
    throws: [],
    winner: null,
    winningTurn: null,
    startScore: startScore,
  }
}

/**
 * Create a new set object
 */
export function createSet(legsPerSet, startScore) {
  return {
    legs: Array.from({length: legsPerSet}, () => createLeg(startScore)),
    winner: null,
  }
}

/**
 * Start a new gameState object
 * @param {object} players - [{id, name}, ...]
 * @param {object} settings - {sets, legsPerSet, suddenDeath, startScore, throwFirst}
 * @returns {object} gameState
 */
export function createGameState(players, settings) {
  const sets = Array.from({length: settings.sets}, () =>
    createSet(settings.legsPerSet, settings.startScore)
  )
  return {
    players,
    settings,
    current: {
      set: 0,
      leg: 0,
      turn: getStartingPlayer(0, 0, settings.throwFirst),
    },
    sets,
    winner: null,
    stats: null,
  }
}

/**
 * Apply a score to the current turn.
 * - Validates the score.
 * - Handles bust logic (if bust, record bust=true, score=0, remaining unchanged).
 * - Handles finish logic (if score == remaining and valid finish, marks leg as won).
 * - Advances the turn or leg as appropriate.
 * @param {object} gameState (WILL BE CLONED - DO NOT MUTATE IN PLACE)
 * @param {number} score
 * @param {number} darts (default 3, or 1-3 if finishing)
 * @returns {object} newGameState
 */
export function applyScore(gameState, score, darts = 3) {
  // Clone deeply to avoid mutation (you may want to use lodash.cloneDeep or structuredClone)
  const state = JSON.parse(JSON.stringify(gameState))
  const {current, sets, settings} = state
  const set = sets[current.set]
  const leg = set.legs[current.leg]
  const playerId = current.turn

  // Calculate remaining before this throw
  let remaining = leg.startScore
  for (const t of leg.throws) {
    remaining -= t.scored
  }

  // Validate score
  let bust = false
  let finish = false
  let checkout = null

  if (!isValidScore(score, remaining)) {
    bust = true
    score = 0
  }

  // Check for finish
  if (!bust && remaining - score === 0) {
    // Must be valid finish
    finish = isValidFinish(score, darts)
    if (!finish) {
      bust = true
      score = 0
    }
  }

  // If bust or invalid finish, treat as bust: record bust, score=0, don't change remaining
  const throwObj = {
    playerId,
    scored: score,
    remaining: bust ? remaining : remaining - score,
    darts,
    bust,
    checkout: finish ? score : null,
  }
  leg.throws.push(throwObj)

  // If finished, set winner
  if (finish) {
    leg.winner = playerId
    leg.winningTurn = leg.throws.length - 1
    // Check if set is won
    const legsWon = set.legs.filter(l => l.winner === playerId).length
    const legsForSet = settings.legsPerSet
    const legsToWin = Math.ceil(legsForSet/2)

    // Sudden death logic (in deciding set)
    let setComplete = false
    if (
      settings.suddenDeath &&
      state.current.set === settings.sets - 1 // last set
    ) {
      const legScores = set.legs.reduce(
        (acc, l) => {
          if (l.winner === playerId) acc.for++
          if (l.winner === otherPlayer(playerId)) acc.against++
          return acc
        },
        {for:0, against:0}
      )
      // Win by 2 clear legs, unless max legs (tiebreak)
      if (
        (legScores.for >= legsToWin || legScores.against >= legsToWin) &&
        Math.abs(legScores.for - legScores.against) >= 2
      ) {
        setComplete = true
      } else if (
        set.legs.length === settings.legsPerSet &&
        Math.abs(legScores.for - legScores.against) === 1
      ) {
        setComplete = true // tiebreak
      }
    } else {
      if (legsWon >= legsToWin) setComplete = true
    }

    if (setComplete) {
      set.winner = playerId
      // Check for match win
      const setsWon = state.sets.filter(s => s.winner === playerId).length
      const setsToWin = Math.ceil(settings.sets / 2)
      if (setsWon >= setsToWin) {
        state.winner = playerId
      } else {
        // Advance to next set
        state.current.set++
        state.current.leg = 0
        state.current.turn = getStartingPlayer(state.current.set, 0, settings.throwFirst)
        return state
      }
    } else {
      // Start next leg in set
      state.current.leg++
      state.current.turn = getStartingPlayer(state.current.set, state.current.leg, settings.throwFirst)
      return state
    }
  } else {
    // If leg not finished, advance turn
    state.current.turn = otherPlayer(playerId)
    return state
  }

  return state
}

/**
 * Undo the last throw in the current leg (or previous leg/set if at start).
 * @param {object} gameState
 * @returns {object} newGameState
 */
export function undoLastThrow(gameState) {
  const state = JSON.parse(JSON.stringify(gameState))
  const {current, sets} = state
  let set = sets[current.set]
  let leg = set.legs[current.leg]

  // If there are throws in this leg, remove last
  if (leg.throws.length > 0) {
    leg.throws.pop()
    // Reset winner if any
    leg.winner = null
    leg.winningTurn = null
    // Set current.turn to the player whose throw was removed
    if (leg.throws.length > 0) {
      state.current.turn = otherPlayer(leg.throws[leg.throws.length - 1].playerId)
    } else {
      state.current.turn = getStartingPlayer(current.set, current.leg, state.settings.throwFirst)
    }
    return state
  }

  // If no throws in this leg, move to previous leg (or previous set)
  if (current.leg > 0) {
    state.current.leg--
    let prevLeg = set.legs[state.current.leg]
    if (prevLeg.throws.length > 0) {
      prevLeg.throws.pop()
      prevLeg.winner = null
      prevLeg.winningTurn = null
      state.current.turn = otherPlayer(prevLeg.throws[prevLeg.throws.length - 1].playerId)
    } else {
      state.current.turn = getStartingPlayer(current.set, state.current.leg, state.settings.throwFirst)
    }
    return state
  } else if (current.set > 0) {
    // Go to previous set
    state.current.set--
    set = sets[state.current.set]
    state.current.leg = set.legs.length - 1
    let prevLeg = set.legs[state.current.leg]
    if (prevLeg.throws.length > 0) {
      prevLeg.throws.pop()
      prevLeg.winner = null
      prevLeg.winningTurn = null
      state.current.turn = otherPlayer(prevLeg.throws[prevLeg.throws.length - 1].playerId)
    } else {
      state.current.turn = getStartingPlayer(state.current.set, state.current.leg, state.settings.throwFirst)
    }
    return state
  }
  // Already at very first throw, nothing to undo
  return state
}

/**
 * Edit a specific score in the history.
 * Edits the score for setIdx, legIdx, throwIdx, recalculates all remaining, busts, finishes, winners, stats, and advances accordingly.
 * @param {object} gameState
 * @param {number} setIdx
 * @param {number} legIdx
 * @param {number} throwIdx
 * @param {number} newScore
 * @param {number} darts (optional, defaults to 3)
 * @returns {object} newGameState
 */
export function editScore(gameState, setIdx, legIdx, throwIdx, newScore, darts = 3) {
  // Clone deeply to avoid mutation
  const state = JSON.parse(JSON.stringify(gameState))
  const { sets, settings } = state
  const set = sets[setIdx]
  const leg = set.legs[legIdx]

  // Edit the score
  if (!leg.throws[throwIdx]) return state // Out of bounds
  leg.throws[throwIdx].scored = newScore
  leg.throws[throwIdx].darts = darts

  // Recalculate all throws in this leg, and all legs and sets after if needed
  // We'll recompute remaining, bust, finish, winner, etc.
  let running = leg.startScore
  let finished = false
  let finishingTurn = null
  let winner = null

  for (let i = 0; i < leg.throws.length; i++) {
    let t = leg.throws[i]
    // Validate score
    let bust = false
    let finish = false
    if (!isValidScore(t.scored, running)) {
      bust = true
      t.scored = 0
    }
    if (!bust && running - t.scored === 0) {
      finish = isValidFinish(t.scored, t.darts)
      if (!finish) {
        bust = true
        t.scored = 0
      }
    }
    t.bust = bust
    t.checkout = finish ? t.scored : null
    t.remaining = bust ? running : running - t.scored
    running = t.remaining
    if (finish && !finished) {
      finished = true
      finishingTurn = i
      winner = t.playerId
    }
  }
  leg.winner = winner
  leg.winningTurn = finishingTurn

  // If a finish occurs, all subsequent throws should be wiped
  if (finished) {
    leg.throws = leg.throws.slice(0, finishingTurn + 1)
  }

  // TODO: To be robust, you may want to regenerate all subsequent legs and sets as well (score edits that change winner may change who starts next leg, or set)
  // For now: only recalc this leg.

  // (Advanced: For full recalculation, you'd want to walk every leg/set from the edit forward.)

  return state
}

export function getPlayerName(players, playerId) {
  const p = (players || []).find(p => p.id === playerId);
  return p ? p.name : `Player ${playerId}`;
}

export function getPlayerCurrentScore(leg, playerId) {
  let remain = leg.startScore ?? 501;
  for (const t of (leg.throws || [])) {
    if (t.playerId === playerId) remain -= t.scored;
  }
  return remain;
}

export function getPlayerLegsWon(set, playerId) {
  return (set.legs || []).filter(l => l.winner === playerId).length;
}

export function getPlayerSetsWon(sets, playerId) {
  return (sets || []).filter(s => s.winner === playerId).length;
}