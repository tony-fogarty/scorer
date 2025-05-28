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
      <button class="bg-gray-300 text-black px-4 py-2 rounded">Stats</button>
    </div>
  </div>
</template>

<script setup>
function calculateScoreStats(history) {
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

const legsToWin = computed(() => Math.ceil(totalLegs.value / 2));
const setsToWin = computed(() => Math.ceil(totalSets.value / 2));

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
  score.value = '';
  updateThrower();
  focusScoreInput();
  saveGameState();
};

const resetSet = () => {
  legs1.value = 0;
  legs2.value = 0;
  resetGame();
};

async function savePlayerStats(dartsUsed) {
  // Calculate per-player score breakdowns
  const stats1Ranges = calculateScoreStats(player1History.value);
  const stats2Ranges = calculateScoreStats(player2History.value);

  const stats1 = {
    game_id: props.game.id,
    player_id: player1.value.id,
    legs_for: legs1.value,
    legs_against: legs2.value,
    sets_for: sets1.value,
    sets_against: sets2.value,
    total_score: player1History.value.reduce((sum, entry) => sum + (entry.scored || 0), 0),
    darts_thrown: player1History.value.length * 3,
    average: player1History.value.length
      ? (player1History.value.reduce((sum, entry) => sum + (entry.scored || 0), 0) / (player1History.value.length * 3)).toFixed(2)
      : null,
    ...stats1Ranges,
    least_darts: winner.value === 1 ? dartsUsed : null, // only winner gets it
    high_finish: null, // set this up later!
  };

  const stats2 = {
    game_id: props.game.id,
    player_id: player2.value.id,
    legs_for: legs2.value,
    legs_against: legs1.value,
    sets_for: sets2.value,
    sets_against: sets1.value,
    total_score: player2History.value.reduce((sum, entry) => sum + (entry.scored || 0), 0),
    darts_thrown: player2History.value.length * 3,
    average: player2History.value.length
      ? (player2History.value.reduce((sum, entry) => sum + (entry.scored || 0), 0) / (player2History.value.length * 3)).toFixed(2)
      : null,
    ...stats2Ranges,
    least_darts: winner.value === 2 ? dartsUsed : null,
    high_finish: null,
  };

  await axios.post(`/game/${props.game.id}/save-stats`, {
    stats: [stats1, stats2]
  });
}

const finishLeg = async (dartsUsed) => {
  if (winner.value === 1) {
    legs1.value++;
    if (legs1.value >= legsToWin.value) {
      sets1.value++;
      if (sets1.value >= setsToWin.value) {
        await savePlayerStats(dartsUsed); // <-- call this before redirect!
        router.visit(`/game/${props.game.id}/summary`);
        return;
    };
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
      };
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
    }
  } else {
    const newRemaining = score2.value - s;
    if (newRemaining === 0) {
      player2History.value.push({ scored: s, remaining: 0 });
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
    }
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
    score2.value += last.scored;
    activePlayer.value = 2;
  } else {
    if (!player1History.value.length) return;
    const last = player1History.value.pop();
    score1.value += last.scored;
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