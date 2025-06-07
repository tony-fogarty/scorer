<template>
  <div class="game-play-container">
    <!-- Header -->
    <header class="game-header">
      <h1>Game Summary</h1>
      <div class="game-format">
        Best of {{ gameState.settings?.sets ?? 1 }} Sets |
        Best of {{ gameState.settings?.legsPerSet ?? 1 }} Legs
        <span v-if="gameState.settings?.suddenDeath">| Sudden Death Enabled</span>
      </div>
      <div class="game-id">Game ID: #{{ gameId }}</div>
    </header>

    <!-- Players & Current Leg/Set -->
    <div class="players-row">
      <div
        v-for="p in gameState.players || []"
        :key="p.id"
        :class="['player-panel', { active: currentPlayerId === p.id, winner: gameState.winner === p.id }]"
      >
        <div class="player-name">{{ p.name }}</div>
        <div>Score: {{ getPlayerCurrentScore(p.id) }}</div>
        <div>Sets: {{ getPlayerSetsWon(p.id) }} | Legs: {{ getPlayerLegsWon(p.id) }}</div>
        <div>3DA: {{ stats[p.id]?.threeDartAverage }}</div>
      </div>
    </div>

    <!-- Score Input (only if game not finished) -->
    <div v-if="!gameState.winner" class="score-input-row">
      <input
        type="number"
        v-model.number="scoreInput"
        :placeholder="currentPlayer ? `Score for ${currentPlayer.name}` : 'Score'"
        :disabled="!isMyTurn"
        min="0"
        max="180"
        @keyup.enter="onScoreSubmit({ score: scoreInput, darts: 3 })"
      />
      <button @click="onScoreSubmit({ score: scoreInput, darts: 3 })" :disabled="!isMyTurn">Submit</button>
      <button @click="undo" :disabled="!canUndo">Undo</button>
    </div>

    <!-- Bust/Finish Notice -->
    <div v-if="notice" class="game-notice">{{ notice }}</div>

    <!-- Score History with In-place Editing -->
    <div class="score-history">
      <h2>Score History (Set {{ currentSetIdx + 1 }}, Leg {{ currentLegIdx + 1 }})</h2>
      <table>
        <thead>
          <tr>
            <th>Throw #</th>
            <th>Player</th>
            <th>Score</th>
            <th>Remaining</th>
            <th>Darts</th>
            <th>Bust</th>
            <th>Checkout</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(t, idx) in (currentLeg.throws || [])"
            :key="idx"
          >
            <td>{{ idx + 1 }}</td>
            <td>{{ getPlayerName(t.playerId) }}</td>
            <td>
              <span v-if="editIdx !== idx">{{ t.scored }}</span>
              <input
                v-else
                type="number"
                v-model.number="editScoreVal"
                @keyup.enter="saveEditScore(idx)"
                @blur="cancelEdit"
                min="0"
                max="180"
                style="width: 50px"
              />
            </td>
            <td>{{ t.remaining }}</td>
            <td>{{ t.darts }}</td>
            <td v-if="t.bust" class="bust">BUST</td>
            <td v-else>-</td>
            <td>{{ t.checkout || '-' }}</td>
            <td>
              <button v-if="editIdx !== idx" @dblclick="beginEdit(idx, t.scored)" :disabled="gameState.winner">
                Edit
              </button>
              <button v-else @click="saveEditScore(idx)">Save</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stats Panel -->
    <div class="stats-panel">
      <h2>
        Show Stats for:
        <button @click="statsScope = 'full'" :class="{active: statsScope==='full'}">Full Game</button>
        <button @click="statsScope = 'set'" :class="{active: statsScope==='set'}">Set {{ currentSetIdx + 1 }}</button>
        <button @click="statsScope = 'leg'" :class="{active: statsScope==='leg'}">Leg {{ currentLegIdx + 1 }}</button>
      </h2>
      <!-- Stats Table (inline) -->
      <div class="stats-summary">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>3DA</th>
              <th>1DA</th>
              <th>Total Score</th>
              <th>Darts Thrown</th>
              <th>Legs For</th>
              <th>Legs Against</th>
              <th>Sets For</th>
              <th>Sets Against</th>
              <th>Least Darts</th>
              <th>High Finish</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in gameState.players || []" :key="p.id">
              <td>{{ p.name }}</td>
              <td>{{ displayStats[p.id]?.threeDartAverage }}</td>
              <td>{{ displayStats[p.id]?.average }}</td>
              <td>{{ displayStats[p.id]?.totalScore }}</td>
              <td>{{ displayStats[p.id]?.dartsThrown }}</td>
              <td>{{ displayStats[p.id]?.legs_for }}</td>
              <td>{{ displayStats[p.id]?.legs_against }}</td>
              <td>{{ displayStats[p.id]?.sets_for }}</td>
              <td>{{ displayStats[p.id]?.sets_against }}</td>
              <td>{{ displayStats[p.id]?.leastDarts }}</td>
              <td>{{ displayStats[p.id]?.highFinish }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Winner Banner -->
    <div v-if="gameState.winner" class="winner-banner">
      <h2>{{ getPlayerName(gameState.winner) }} WINS!</h2>
      <button @click="resetGame">New Game</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { applyScore, undoLastThrow, editScore } from '../../services/gameLogic.js'
import { getGameStats } from '../../services/gameStats.js'
console.log('initialGameState:', props.initialGameState)
const props = defineProps({
  initialGameState: { type: [Object, String], required: true },
  gameId: [String, Number],
})

// ---- Add a default game state shape ----
const defaultGameState = {
  settings: {
    sets: 1,
    legsPerSet: 1,
    suddenDeath: false,
  },
  current: {
    set: 0,
    leg: 0,
    turn: null,
  },
  players: [],
  sets: [],
  winner: null,
}

// ---- Deep merge utility ----
function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] || {}, source[key])
    } else if (Array.isArray(source[key])) {
      target[key] = source[key].slice()
    } else if (source[key] !== undefined) {
      target[key] = source[key]
    }
  }
  return target
}

// ---- Parse/merge state ----
const parsedGameState =
  typeof props.initialGameState === 'string'
    ? JSON.parse(props.initialGameState)
    : props.initialGameState || {}

const gameState = ref(deepMerge(structuredClone(defaultGameState), parsedGameState))

const notice = ref(null)
const editIdx = ref(null)
const editScoreVal = ref(0)
const scoreInput = ref(null)
const statsScope = ref('full')

const currentSetIdx = computed(() => (gameState.value.current?.set ?? 0))
const currentLegIdx = computed(() => (gameState.value.current?.leg ?? 0))
const currentSet = computed(() =>
  (gameState.value.sets && gameState.value.sets[currentSetIdx.value]) || {}
)
const currentLeg = computed(() =>
  (currentSet.value.legs && currentSet.value.legs[currentLegIdx.value]) || {}
)
const currentPlayerId = computed(() => gameState.value.current?.turn)
const currentPlayer = computed(() =>
  (gameState.value.players || []).find(p => p.id === currentPlayerId.value)
)
const isMyTurn = computed(() => !gameState.value.winner)
const canUndo = computed(() =>
  (currentLeg.value.throws && currentLeg.value.throws.length > 0)
  || currentLegIdx.value > 0
  || currentSetIdx.value > 0
)

const stats = computed(() => getGameStats(gameState.value, {}))
const setStats = computed(() => getGameStats(gameState.value, { setIdx: currentSetIdx.value }))
const legStats = computed(() => getGameStats(gameState.value, { setIdx: currentSetIdx.value, legIdx: currentLegIdx.value }))
const displayStats = computed(() => {
  if (statsScope.value === 'full') return stats.value
  if (statsScope.value === 'set') return setStats.value
  if (statsScope.value === 'leg') return legStats.value
})

function getPlayerName(pid) {
  const p = (gameState.value.players || []).find(p => p.id === pid)
  return p ? p.name : `Player ${pid}`
}
function getPlayerCurrentScore(pid) {
  let remain = currentLeg.value.startScore ?? 501
  for (const t of (currentLeg.value.throws || [])) {
    if (t.playerId === pid) remain -= t.scored
  }
  return remain
}
function getPlayerLegsWon(pid) {
  return (currentSet.value.legs || []).filter(l => l.winner === pid).length
}
function getPlayerSetsWon(pid) {
  return (gameState.value.sets || []).filter(s => s.winner === pid).length
}

function onScoreSubmit({ score, darts }) {
  if (score === null || isNaN(score) || score < 0 || score > 180) {
    notice.value = "Please enter a valid score (0-180)."
    return
  }
  const nextState = applyScore(gameState.value, score, darts)
  const lastThrow = (nextState.sets?.[currentSetIdx.value]?.legs?.[currentLegIdx.value]?.throws || []).slice(-1)[0]
  if (lastThrow?.bust) {
    notice.value = "BUST! Next player's turn."
    setTimeout(() => (notice.value = null), 2000)
  } else if (lastThrow?.checkout) {
    notice.value = "LEG WON! 🎯"
    setTimeout(() => (notice.value = null), 2000)
  }
  gameState.value = nextState
  scoreInput.value = null
}
function undo() {
  gameState.value = undoLastThrow(gameState.value)
  notice.value = null
}
function beginEdit(idx, score) {
  editIdx.value = idx
  editScoreVal.value = score
}
function cancelEdit() {
  editIdx.value = null
  editScoreVal.value = 0
}
function saveEditScore(idx) {
  const setIdx = currentSetIdx.value
  const legIdx = currentLegIdx.value
  const newScore = editScoreVal.value
  gameState.value = editScore(gameState.value, setIdx, legIdx, idx, newScore, 3)
  editIdx.value = null
  editScoreVal.value = 0
  notice.value = "Score updated"
  setTimeout(() => (notice.value = null), 1000)
}
function resetGame() {
  window.location.reload()
}
</script>

<style scoped>
/* ... your existing styles ... */
</style>