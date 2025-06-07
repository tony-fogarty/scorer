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

const props = defineProps({
  initialGameState: { type: [Object, String], required: true },
  gameId: [String, Number],
})
console.log('initialGameState:', props.initialGameState)

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
.game-play-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 24px 12px 40px 12px;
  background: #21222c;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.25);
  color: #f8f8f2;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.game-header {
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #44475a;
}
.game-header h1 {
  font-size: 2.1rem;
  margin: 0;
  color: #50fa7b;
}
.game-format {
  font-size: 1.2rem;
  margin: 10px 0 0 0;
  color: #bd93f9;
}
.game-id {
  color: #8be9fd;
  font-size: 1rem;
  margin-top: 4px;
}
.players-row {
  display: flex;
  gap: 24px;
  margin: 24px 0 12px 0;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.player-panel {
  flex: 1 1 220px;
  background: #282a36;
  border-radius: 9px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.11);
  padding: 11px 17px 13px 17px;
  margin-bottom: 12px;
  border: 2px solid #44475a;
  min-width: 200px;
  position: relative;
  transition: border 0.2s;
}
.player-panel.active {
  border-color: #50fa7b;
  background: #353653;
}
.player-panel.winner {
  border-color: #ffb86c;
  background: #2e2e2e;
}
.player-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #f8f8f2;
}
.score-input-row {
  display: flex;
  gap: 10px;
  margin: 10px 0 21px 0;
  align-items: center;
}
.score-input-row input[type="number"] {
  padding: 7px 12px;
  border-radius: 6px;
  border: 1.5px solid #44475a;
  background: #282a36;
  color: #f8f8f2;
  width: 110px;
  font-size: 1.1rem;
  margin-right: 6px;
}
.score-input-row button {
  background: #50fa7b;
  color: #282a36;
  border: none;
  border-radius: 5px;
  padding: 7px 15px;
  font-weight: bold;
  font-size: 1.04rem;
  cursor: pointer;
  margin-right: 3px;
  transition: background 0.18s;
}
.score-input-row button:disabled {
  background: #44475a;
  color: #bbb;
  cursor: not-allowed;
}
.game-notice {
  background: #ff5555;
  color: #fff;
  padding: 10px 18px;
  border-radius: 6px;
  margin: 8px 0 18px 0;
  font-size: 1.07rem;
}
.score-history {
  margin: 30px 0 22px 0;
}
.score-history table {
  width: 100%;
  border-collapse: collapse;
  background: #282a36;
  border-radius: 9px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
}
.score-history th, .score-history td {
  padding: 8px 10px;
  text-align: center;
  border-bottom: 1px solid #44475a;
}
.score-history th {
  background: #44475a;
  color: #50fa7b;
}
.score-history tr:last-child td {
  border-bottom: none;
}
.score-history input[type="number"] {
  background: #353653;
  color: #fff;
  border: 1px solid #44475a;
  border-radius: 5px;
  padding: 3px 8px;
}
.bust {
  color: #ff5555;
  font-weight: bold;
}
.stats-panel {
  margin: 27px 0 0 0;
  background: #282a36;
  padding: 12px 18px 12px 18px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}
.stats-panel h2 {
  font-size: 1.25rem;
  margin-bottom: 9px;
  color: #8be9fd;
}
.stats-panel button {
  background: #44475a;
  color: #f8f8f2;
  border: none;
  border-radius: 5px;
  padding: 6px 14px;
  font-size: 1rem;
  margin-right: 8px;
  cursor: pointer;
  transition: background 0.16s;
}
.stats-panel button.active, .stats-panel button:hover {
  background: #50fa7b;
  color: #282a36;
}
.stats-summary table {
  width: 100%;
  border-collapse: collapse;
}
.stats-summary th, .stats-summary td {
  padding: 7px 10px;
  border-bottom: 1px solid #44475a;
  text-align: center;
}
.stats-summary th {
  background: #44475a;
  color: #bd93f9;
}
.stats-summary tr:last-child td {
  border-bottom: none;
}
.winner-banner {
  background: #50fa7b;
  color: #282a36;
  padding: 18px 0 13px 0;
  border-radius: 10px;
  margin: 30px 0 0 0;
  text-align: center;
  font-weight: bold;
  font-size: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.winner-banner button {
  margin-top: 12px;
  background: #282a36;
  color: #50fa7b;
  border: none;
  padding: 9px 22px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.08rem;
  font-weight: bold;
  transition: background 0.16s;
}
.winner-banner button:hover {
  background: #44475a;
}
</style>