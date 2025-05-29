<template>
  <div class="flex flex-col min-h-screen">
    <!-- Modal for darts used -->
    <div v-if="showDartsModal" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white text-black rounded p-6 text-center max-w-xs">
        <p class="mb-4 text-xl font-semibold">How many darts were used to finish the leg?</p>
        <div class="flex justify-center gap-4">
          <button @click.stop="finishLeg(1)" class="bg-blue-600 text-white px-4 py-2 rounded text-xl">1</button>
          <button @click.stop="finishLeg(2)" class="bg-blue-600 text-white px-4 py-2 rounded text-xl">2</button>
          <button @click.stop="finishLeg(3)" class="bg-blue-600 text-white px-4 py-2 rounded text-xl">3</button>
        </div>
      </div>
    </div>

    <!-- Sticky Header with embedded grid labels -->
    <div class="sticky top-0 z-30 bg-blue-900">
      <div class="flex justify-between items-center p-4 text-white font-semibold">
        <div class="flex items-center space-x-4">
          <div :class="{'bg-green-500': currentThrower === 1, 'bg-white': currentThrower !== 1 }" class="w-6 h-6 rounded-full border border-white"></div>
          <span :class="['text-4xl', { 'font-bold': activePlayer === 1 }]">{{ player1.name }}</span>
        </div>
        <div class="text-center">
          <div class="text-4xl">{{ sets1 }} - {{ sets2 }}</div>
          <div class="text-xl">Best of {{ totalSets }} sets</div>
          <div class="text-xl mt-1">{{ legs1 }} - {{ legs2 }}</div>
          <div class="text-lg">Best of {{ totalLegs }} legs</div>
        </div>
        <div class="flex items-center space-x-4">
          <span :class="['text-4xl', { 'font-bold': activePlayer === 2 }]">{{ player2.name }}</span>
          <div :class="{'bg-green-500': currentThrower === 2, 'bg-white': currentThrower !== 2 }" class="w-6 h-6 rounded-full border border-white"></div>
        </div>
      </div>
      <!-- Darker grid header with darts column background color -->
      <div class="grid grid-cols-[1fr_1fr_0.5fr_1fr_1fr] bg-black divide-x divide-gray-800 text-center text-white font-semibold text-2xl px-4 pb-2">
        <div>Scored</div>
        <div>To Go</div>
        <div>Darts</div>
        <div>To Go</div>
        <div>Scored</div>
      </div>
    </div>

    <!-- Scrollable History -->
    <div class="flex-1 overflow-y-auto bg-gray-800">
      <div class="grid grid-cols-[1fr_1fr_0.5fr_1fr_1fr] divide-x text-center text-gray-300 text-2xl">
        <div class="bg-gray-200">
          <div class="text-6xl h-24 flex items-center justify-center">-</div>
          <div
            v-for="(entry, index) in player1History"
            :key="'p1-score-' + index"
            class="text-6xl h-24 flex items-center justify-center"
            :class="scoreClass(entry.scored)"
          >
            {{ entry.scored }}
          </div>
        </div>
        <div class="bg-white text-black">
          <div class="text-6xl h-24 flex items-center justify-center">{{ gameType }}</div>
          <div v-for="(entry, index) in player1History" :key="'p1-remaining-' + index" class="text-6xl h-24 flex items-center justify-center">{{ entry.remaining }}</div>
        </div>
        <div>
          <div class="text-6xl h-24 flex items-center justify-center"></div>
          <div v-for="index in dartRows" :key="'dart-' + index" class="text-6xl h-24 flex items-center justify-center">{{ index * 3 }}</div>
        </div>
        <div class="bg-white text-black">
          <div class="text-6xl h-24 flex items-center justify-center">{{ gameType }}</div>
          <div v-for="(entry, index) in player2History" :key="'p2-remaining-' + index" class="text-6xl h-24 flex items-center justify-center">{{ entry.remaining }}</div>
        </div>
        <div class="bg-gray-200">
          <div class="text-6xl h-24 flex items-center justify-center">-</div>
          <div
            v-for="(entry, index) in player2History"
            :key="'p2-score-' + index"
            class="text-6xl h-24 flex items-center justify-center"
            :class="scoreClass(entry.scored)"
          >
            {{ entry.scored }}
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Input Bar above actions -->
    <div class="sticky bottom-16 z-30 flex justify-around items-center p-4 bg-blue-900">
      <span
        :class="[
          'text-white text-[10rem] px-4 py-2 rounded',
          activePlayer === 1 ? 'bg-blue-700' : ''
        ]"
      >
        {{ score1 }}
      </span>
      <div class="flex flex-col items-center">
        <input
          ref="scoreInput"
          v-model="score"
          type="number"
          class="text-black bg-white rounded px-4 py-2 text-6xl w-48 text-center mb-2"
          placeholder="Enter score"
          @keyup.enter="submitScore"
        />
        <button @click="submitScore" class="bg-blue-700 text-white px-2 py-1 text-base rounded">Submit</button>
      </div>
      <span
        :class="[
          'text-white text-[10rem] px-4 py-2 rounded',
          activePlayer === 2 ? 'bg-blue-700' : ''
        ]"
      >
        {{ score2 }}
      </span>
    </div>

    <!-- Sticky Actions Bar -->
    <div class="sticky bottom-0 z-20 flex justify-center items-center gap-2 p-4 bg-black">
      <button @click="undoLastScore" class="bg-gray-600 text-white px-4 py-2 rounded">Undo</button>
      <button class="bg-red-700 text-white px-4 py-2 rounded">Exit</button>
      <button class="bg-green-700 text-white px-4 py-2 rounded">Finish</button>
      <button @click="showStats = !showStats" class="bg-gray-300 text-black px-4 py-2 rounded">Stats</button>
    </div>

    <!-- Live stats modal -->
    <div v-if="showStats" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div class="bg-white rounded p-8 max-w-lg w-full text-black">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Live Stats</h2>
          <button @click="showStats = false" class="text-xl font-bold text-red-600">✗</button>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <span></span>
          <span class="font-semibold text-center">{{ player1.name }}</span>
          <span class="font-semibold text-center">{{ player2.name }}</span>
          <span class="font-semibold">Total Score</span>
          <span class="text-center">{{ liveStats.totalScores[1] }}</span>
          <span class="text-center">{{ liveStats.totalScores[2] }}</span>
          <span class="font-semibold">Darts Thrown</span>
          <span class="text-center">{{ liveStats.totalDarts[1] }}</span>
          <span class="text-center">{{ liveStats.totalDarts[2] }}</span>
          <span class="font-semibold">Dart Average</span>
          <span class="text-center">{{ liveStats.averages[1] }}</span>
          <span class="text-center">{{ liveStats.averages[2] }}</span>
          <span class="font-semibold">3 Dart Avg</span>
          <span class="text-center">{{ liveStats.threeDartAvg[1] }}</span>
          <span class="text-center">{{ liveStats.threeDartAvg[2] }}</span>
          <span class="font-semibold">180s</span>
          <span class="text-center">{{ liveStats.scoresBands[1]['180'] }}</span>
          <span class="text-center">{{ liveStats.scoresBands[2]['180'] }}</span>
          <span class="font-semibold">140+</span>
          <span class="text-center">{{ liveStats.scoresBands[1]['140+'] }}</span>
          <span class="text-center">{{ liveStats.scoresBands[2]['140+'] }}</span>
          <span class="font-semibold">100+</span>
          <span class="text-center">{{ liveStats.scoresBands[1]['100+'] }}</span>
          <span class="text-center">{{ liveStats.scoresBands[2]['100+'] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onBeforeUnmount } from 'vue';
import { router } from '@inertiajs/vue3';
import axios from 'axios';

const props = defineProps({
  game: Object
});

// Use the game data from props
const player1 = ref(props.game.player1 || '');
const player2 = ref(props.game.player2 || '');
const throwFirst = ref(Number(props.game.settings.throwFirst) || 1);
const gameType = ref(Number(props.game.settings.gameType) || 501);
const totalSets = ref(Number(props.game.settings.totalSets) || 1);
const totalLegs = ref(Number(props.game.settings.totalLegs) || 1);

const score = ref('');
const score1 = ref(gameType.value);
const score2 = ref(gameType.value);
const legs1 = ref(0);
const legs2 = ref(0);
const sets1 = ref(0);
const sets2 = ref(0);
const activePlayer = ref(1);
const currentThrower = ref(1);
const player1History = ref([]);
const player2History = ref([]);
const scoreInput = ref(null);
const showDartsModal = ref(false);
const winner = ref(null);
const showStats = ref(false);

// For all-legs-in-game stats, these arrays are NEVER reset except on new game
const player1GameHistory = ref([]);
const player2GameHistory = ref([]);
const player1GameLegs = ref([]);
const player2GameLegs = ref([]);

// For current leg stats (reset after each leg)
const player1Legs = ref([]); // Array of {darts, remaining, checkout}
const player2Legs = ref([]);
let player1CurrentLegDarts = 0;
let player2CurrentLegDarts = 0;

const legsToWin = computed(() => Math.ceil(totalLegs.value / 2));
const setsToWin = computed(() => Math.ceil(totalSets.value / 2));

// --- LIVE STATS CALCULATION ---
const liveStats = computed(() => {
  const allHistory = {
    1: player1GameHistory.value,
    2: player2GameHistory.value,
  };
  const totalScores = { 1: 0, 2: 0 };
  const totalDarts = { 1: 0, 2: 0 };
  const scoresBands = {
    1: { '0-59': 0, '60-79': 0, '80-99': 0, '100+': 0, '140+': 0, '180': 0 },
    2: { '0-59': 0, '60-79': 0, '80-99': 0, '100+': 0, '140+': 0, '180': 0 }
  };
  for (const pid of [1,2]) {
    allHistory[pid].forEach(({scored}) => {
      if (scored <= 59) scoresBands[pid]['0-59']++;
      else if (scored <= 79) scoresBands[pid]['60-79']++;
      else if (scored <= 99) scoresBands[pid]['80-99']++;
      else if (scored <= 139) scoresBands[pid]['100+']++;
      else if (scored <= 179) scoresBands[pid]['140+']++;
      if (scored === 180) scoresBands[pid]['180']++;
      totalScores[pid] += scored;
      totalDarts[pid] += 3;
    });
  }
  const averages = {
    1: totalDarts[1] ? (totalScores[1] / totalDarts[1]).toFixed(2) : '0.00',
    2: totalDarts[2] ? (totalScores[2] / totalDarts[2]).toFixed(2) : '0.00'
  };
  const threeDartAvg = {
    1: totalDarts[1] ? ((totalScores[1] / totalDarts[1]) * 3).toFixed(2) : '0.00',
    2: totalDarts[2] ? ((totalScores[2] / totalDarts[2]) * 3).toFixed(2) : '0.00'
  };
  return { totalScores, totalDarts, averages, threeDartAvg, scoresBands };
});
// --- END LIVE STATS ---

function saveGameState(status = null) {
  const state = {
    score1: score1.value,
    score2: score2.value,
    legs1: legs1.value,
    legs2: legs2.value,
    sets1: sets1.value,
    sets2: sets2.value,
    activePlayer: activePlayer.value,
    currentThrower: currentThrower.value,
    player1History: player1History.value,
    player2History: player2History.value,
    player1Legs: player1Legs.value,
    player2Legs: player2Legs.value,
    player1GameHistory: player1GameHistory.value,
    player2GameHistory: player2GameHistory.value,
    player1GameLegs: player1GameLegs.value,
    player2GameLegs: player2GameLegs.value,
    player1CurrentLegDarts,
    player2CurrentLegDarts,
  };
  const data = {
    state: JSON.stringify(state)
  };
  if (status) data.status = status;
  axios.patch(`/game/${props.game.id}/state`, data);
}

const focusScoreInput = () => {
  nextTick(() => {
    if (scoreInput.value) {
      scoreInput.value.focus();
      scoreInput.value.select();
    }
  });
};

// Determine current thrower based on set and leg number
const updateThrower = () => {
  const setNumber = sets1.value + sets2.value + 1;
  const legNumber = legs1.value + legs2.value + 1;
  const firstInSet = (setNumber % 2 === 1)
    ? throwFirst.value
    : (throwFirst.value === 1 ? 2 : 1);
  currentThrower.value = (legNumber % 2 === 1)
    ? firstInSet
    : (firstInSet === 1 ? 2 : 1);
  activePlayer.value = currentThrower.value;
};

const resetGame = () => {
  score1.value = score2.value = gameType.value;
  player1History.value = [];
  player2History.value = [];
  player1Legs.value = [];
  player2Legs.value = [];
  player1CurrentLegDarts = 0;
  player2CurrentLegDarts = 0;
  score.value = '';
  updateThrower();
  focusScoreInput();
  saveGameState();
  // DO NOT reset playerXGameHistory or playerXGameLegs here!
};

const resetSet = () => {
  legs1.value = 0;
  legs2.value = 0;
  resetGame();
};

// Save stats to backend, including per-leg arrays
async function savePlayerStats(dartsUsed) {
  await axios.post(`/game/${props.game.id}/save-stats`, {
    stats: [
      {
        player_id: player1.value.id,
        legs_for: legs1.value,
        legs_against: legs2.value,
        sets_for: sets1.value,
        sets_against: sets2.value,
        history: player1GameHistory.value,
        leg_stats: player1GameLegs.value
      },
      {
        player_id: player2.value.id,
        legs_for: legs2.value,
        legs_against: legs1.value,
        sets_for: sets2.value,
        sets_against: sets1.value,
        history: player2GameHistory.value,
        leg_stats: player2GameLegs.value
      }
    ]
  });
}

// Helper to record per-leg stats when a leg ends
function recordLegStats(dartsUsed) {
  const winnerId = winner.value;
  const winnerHistory = winnerId === 1 ? player1History : player2History;
  const loserHistory = winnerId === 1 ? player2History : player1History;
  const winnerLegs = winnerId === 1 ? player1Legs : player2Legs;
  const loserLegs = winnerId === 1 ? player2Legs : player1Legs;
  const winnerGameLegs = winnerId === 1 ? player1GameLegs : player2GameLegs;
  const loserGameLegs = winnerId === 1 ? player2GameLegs : player1GameLegs;
  let winnerCurrentLegDarts = winnerId === 1 ? player1CurrentLegDarts : player2CurrentLegDarts;
  let loserCurrentLegDarts = winnerId === 1 ? player2CurrentLegDarts : player1CurrentLegDarts;

  // Winner: add darts from modal to current leg count
  winnerCurrentLegDarts += dartsUsed;

  // Find the checkout (the score that brought to exactly 0)
  let checkout = null;
  for (let i = winnerHistory.value.length - 1; i >= 0; i--) {
    if (String(winnerHistory.value[i].remaining) === "0") {
      checkout = winnerHistory.value[i].scored;
      break;
    }
  }

  // Always push remaining: "0" as a string for winner
  const winnerLegObj = { darts: winnerCurrentLegDarts, remaining: "0", checkout: checkout };
  winnerLegs.value.push(winnerLegObj);
  winnerGameLegs.value.push(winnerLegObj);

  // Record leg for loser (remaining as string for safety)
  let loserLegRemaining = loserHistory.value.length
    ? loserHistory.value[loserHistory.value.length - 1].remaining
    : (winnerId === 1 ? score2.value : score1.value);
  const loserLegObj = { darts: loserCurrentLegDarts, remaining: String(loserLegRemaining), checkout: null };
  loserLegs.value.push(loserLegObj);
  loserGameLegs.value.push(loserLegObj);

  // Reset leg darts counters for next leg
  player1CurrentLegDarts = 0;
  player2CurrentLegDarts = 0;
}

const finishLeg = async (dartsUsed) => {
  // Record per-leg stats before resetting
  recordLegStats(dartsUsed);

  if (winner.value === 1) {
    legs1.value++;
    if (legs1.value >= legsToWin.value) {
      sets1.value++;
      if (sets1.value >= setsToWin.value) {
        await savePlayerStats(dartsUsed); // <-- call this before redirect!
        router.visit(`/game/${props.game.id}/summary`);
        return;
      }
      resetSet();
      showDartsModal.value = false;
      saveGameState();
      return;
    }
  } else if (winner.value === 2) {
    legs2.value++;
    if (legs2.value >= legsToWin.value) {
      sets2.value++;
      if (sets2.value >= setsToWin.value) {
        await savePlayerStats(dartsUsed); // <-- call this before redirect!
        router.visit(`/game/${props.game.id}/summary`);
        return;
      }
      resetSet();
      showDartsModal.value = false;
      saveGameState();
      return;
    }
  }
  resetGame();
  showDartsModal.value = false;
  saveGameState();
};

const keyHandler = (e) => {
  if (showDartsModal.value && ['1', '2', '3'].includes(e.key)) {
    e.preventDefault();
    finishLeg(parseInt(e.key));
  }
};

const submitScore = () => {
  const s = parseInt(score.value);
  if (isNaN(s) || s < 0 || s > 180) {
    alert('Invalid score');
    return;
  }

  if (activePlayer.value === 1) {
    const newRemaining = score1.value - s;
    if (newRemaining === 0) {
      player1History.value.push({ scored: s, remaining: 0 });
      player1GameHistory.value.push({ scored: s, remaining: 0 });
      score1.value = 0;
      winner.value = 1;
      showDartsModal.value = true;
      saveGameState();
      return;
    } else if (newRemaining < 2) {
      alert('Bust!');
      score.value = '';
      focusScoreInput();
      return;
    } else {
      score1.value = newRemaining;
      player1History.value.push({ scored: s, remaining: newRemaining });
      player1GameHistory.value.push({ scored: s, remaining: newRemaining });
    }
    player1CurrentLegDarts += 3;
  } else {
    const newRemaining = score2.value - s;
    if (newRemaining === 0) {
      player2History.value.push({ scored: s, remaining: 0 });
      player2GameHistory.value.push({ scored: s, remaining: 0 });
      score2.value = 0;
      winner.value = 2;
      showDartsModal.value = true;
      saveGameState();
      return;
    } else if (newRemaining < 2) {
      alert('Bust!');
      score.value = '';
      focusScoreInput();
      return;
    } else {
      score2.value = newRemaining;
      player2History.value.push({ scored: s, remaining: newRemaining });
      player2GameHistory.value.push({ scored: s, remaining: newRemaining });
    }
    player2CurrentLegDarts += 3;
  }

  // toggle thrower within leg
  activePlayer.value = activePlayer.value === 1 ? 2 : 1;
  score.value = '';
  focusScoreInput();
  saveGameState();
};

const undoLastScore = () => {
  if (activePlayer.value === 1) {
    if (!player2History.value.length) return;
    const last = player2History.value.pop();
    player2GameHistory.value.pop();
    score2.value += last.scored;
    player2CurrentLegDarts = Math.max(0, player2CurrentLegDarts - 3);
    activePlayer.value = 2;
  } else {
    if (!player1History.value.length) return;
    const last = player1History.value.pop();
    player1GameHistory.value.pop();
    score1.value += last.scored;
    player1CurrentLegDarts = Math.max(0, player1CurrentLegDarts - 3);
    activePlayer.value = 1;
  }
  focusScoreInput();
  saveGameState();
};

const INITIAL_ROW_COUNT = 15;  // 15 rows × 3 darts = 45 darts

const dartRows = computed(() => {
  // ensure at least INITIAL_ROW_COUNT rows, extend if history longer
  return Math.max(
    INITIAL_ROW_COUNT,
    player1History.value.length, 
    player2History.value.length
  );
});

const scoreClass = (sc) => {
  if (sc <= 59) return 'text-black';
  if (sc <= 79) return 'text-blue-400';
  if (sc <= 99) return 'text-blue-700';
  if (sc <= 119) return 'text-red-500';
  if (sc <= 139) return 'text-pink-400';
  if (sc <= 169) return 'text-purple-600';
  return 'text-orange-500 font-bold';
};

onMounted(() => {
  // Hydrate state from DB if present
  if (props.game.state && props.game.state !== '[]') {
    try {
      const saved = JSON.parse(props.game.state);
      score1.value = saved.score1 ?? gameType.value;
      score2.value = saved.score2 ?? gameType.value;
      legs1.value = saved.legs1 ?? 0;
      legs2.value = saved.legs2 ?? 0;
      sets1.value = saved.sets1 ?? 0;
      sets2.value = saved.sets2 ?? 0;
      activePlayer.value = saved.activePlayer ?? 1;
      currentThrower.value = saved.currentThrower ?? 1;
      player1History.value = saved.player1History ?? [];
      player2History.value = saved.player2History ?? [];
      player1Legs.value = saved.player1Legs ?? [];
      player2Legs.value = saved.player2Legs ?? [];
      player1GameHistory.value = saved.player1GameHistory ?? [];
      player2GameHistory.value = saved.player2GameHistory ?? [];
      player1GameLegs.value = saved.player1GameLegs ?? [];
      player2GameLegs.value = saved.player2GameLegs ?? [];
      player1CurrentLegDarts = saved.player1CurrentLegDarts ?? 0;
      player2CurrentLegDarts = saved.player2CurrentLegDarts ?? 0;
    } catch (e) {
      // ignore and just use default
    }
  }
  focusScoreInput();
  updateThrower();
  window.addEventListener('keydown', keyHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyHandler);
});
</script>

<style scoped>
body {
  background-color: #111;
}
</style>