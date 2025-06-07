<template>
  <div class="flex flex-col min-h-screen">
    <!-- Modal for darts used -->
    <div v-if="showDartsModal" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white text-black rounded p-6 text-center max-w-xs">
        <p class="mb-4 text-xl font-semibold">How many darts were used to finish the leg?</p>
        <div class="flex justify-center gap-4 mb-4">
          <button @click.stop="finishLeg(1)" class="bg-blue-600 text-white px-4 py-2 rounded text-xl">1</button>
          <button @click.stop="finishLeg(2)" class="bg-blue-600 text-white px-4 py-2 rounded text-xl">2</button>
          <button @click.stop="finishLeg(3)" class="bg-blue-600 text-white px-4 py-2 rounded text-xl">3</button>
        </div>
        <button @click="cancelDartsModal" class="bg-gray-300 text-black px-4 py-2 rounded w-full">Cancel</button>
      </div>
    </div>

    <!-- Sticky Header -->
    <div class="sticky top-0 z-30 bg-blue-900">
      <div class="flex justify-between items-center p-4 text-white font-semibold">
        <div class="flex items-center space-x-4">
          <div :class="{'bg-green-500': activePlayer === 1, 'bg-white': activePlayer !== 1 }" class="w-6 h-6 rounded-full border border-white"></div>
          <span :class="['text-4xl', { 'font-bold': activePlayer === 1 }]">{{ gameObj.player1.name }}</span>
        </div>
        <div class="text-center">
          <div class="text-4xl">{{ setsScore[1] }} - {{ setsScore[2] }}</div>
          <div class="text-xl">Best of {{ totalSets }} sets</div>
          <div class="text-xl mt-1">{{ legsScore[1] }} - {{ legsScore[2] }}</div>
          <div class="text-lg">Best of {{ totalLegs }} legs</div>
        </div>
        <div class="flex items-center space-x-4">
          <span :class="['text-4xl', { 'font-bold': activePlayer === 2 }]">{{ gameObj.player2.name }}</span>
          <div :class="{'bg-green-500': activePlayer === 2, 'bg-white': activePlayer !== 2 }" class="w-6 h-6 rounded-full border border-white"></div>
        </div>
      </div>
      <!-- Grid header -->
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
            v-for="(entry, index) in currentLegThrows[1]"
            :key="'p1-score-' + index"
            class="text-6xl h-24 flex items-center justify-center"
            :class="scoreClass(entry)"
          >
            {{ entry }}
          </div>
        </div>
        <div class="bg-white text-black">
          <div class="text-6xl h-24 flex items-center justify-center">{{ startScore }}</div>
          <div v-for="(entry, index) in player1Remains" :key="'p1-remaining-' + index" class="text-6xl h-24 flex items-center justify-center">{{ entry }}</div>
        </div>
        <div>
          <div class="text-6xl h-24 flex items-center justify-center"></div>
          <div v-for="index in dartRows" :key="'dart-' + index" class="text-6xl h-24 flex items-center justify-center">{{ index * 3 }}</div>
        </div>
        <div class="bg-white text-black">
          <div class="text-6xl h-24 flex items-center justify-center">{{ startScore }}</div>
          <div v-for="(entry, index) in player2Remains" :key="'p2-remaining-' + index" class="text-6xl h-24 flex items-center justify-center">{{ entry }}</div>
        </div>
        <div class="bg-gray-200">
          <div class="text-6xl h-24 flex items-center justify-center">-</div>
          <div
            v-for="(entry, index) in currentLegThrows[2]"
            :key="'p2-score-' + index"
            class="text-6xl h-24 flex items-center justify-center"
            :class="scoreClass(entry)"
          >
            {{ entry }}
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Input Bar above actions -->
    <div class="sticky bottom-16 z-30 flex justify-around items-center p-4 bg-blue-900">
      <span :class="['text-white text-[10rem] px-4 py-2 rounded', activePlayer === 1 ? 'bg-blue-700' : '']">{{ currentLegRemain[1] }}</span>
      <div class="flex flex-col items-center">
        <!-- Error message -->
        <div v-if="scoreError" class="mb-2 flex items-center justify-center">
          <span class="flex items-center bg-red-700 text-white px-4 py-2 rounded">
            <svg class="w-6 h-6 mr-2 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.918-.816 1.995-1.85l.007-.15V6a2 2 0 00-1.85-1.995L18 4H6a2 2 0 00-1.995 1.85L4 6v12c0 1.054.816 1.918 1.85 1.995l.15.005z"/>
            </svg>
            {{ scoreError }}
          </span>
        </div>
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
      <span :class="['text-white text-[10rem] px-4 py-2 rounded', activePlayer === 2 ? 'bg-blue-700' : '']">{{ currentLegRemain[2] }}</span>
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
        <table class="w-full table-auto">
          <thead>
            <tr>
              <th></th>
              <th class="text-center">{{ gameObj.player1.name }}</th>
              <th class="text-center">{{ gameObj.player2.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-semibold">Total Score</td>
              <td class="text-center">{{ liveStats[1].total }}</td>
              <td class="text-center">{{ liveStats[2].total }}</td>
            </tr>
            <tr>
              <td class="font-semibold">Darts Thrown</td>
              <td class="text-center">{{ liveStats[1].darts }}</td>
              <td class="text-center">{{ liveStats[2].darts }}</td>
            </tr>
            <tr>
              <td class="font-semibold">Dart Average</td>
              <td class="text-center">{{ (liveStats[1].darts ? (liveStats[1].total / liveStats[1].darts).toFixed(2) : '0.00') }}</td>
              <td class="text-center">{{ (liveStats[2].darts ? (liveStats[2].total / liveStats[2].darts).toFixed(2) : '0.00') }}</td>
            </tr>
            <tr>
              <td class="font-semibold">3 Dart Avg</td>
              <td class="text-center">{{ (liveStats[1].darts ? ((liveStats[1].total / liveStats[1].darts)*3).toFixed(2) : '0.00') }}</td>
              <td class="text-center">{{ (liveStats[2].darts ? ((liveStats[2].total / liveStats[2].darts)*3).toFixed(2) : '0.00') }}</td>
            </tr>
            <tr>
              <td class="font-semibold">180s</td>
              <td class="text-center">{{ liveStats[1]['180'] }}</td>
              <td class="text-center">{{ liveStats[2]['180'] }}</td>
            </tr>
            <tr>
              <td class="font-semibold">140+</td>
              <td class="text-center">{{ liveStats[1]['140+'] }}</td>
              <td class="text-center">{{ liveStats[2]['140+'] }}</td>
            </tr>
            <tr>
              <td class="font-semibold">100+</td>
              <td class="text-center">{{ liveStats[1]['100+'] }}</td>
              <td class="text-center">{{ liveStats[2]['100+'] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { router } from '@inertiajs/vue3';
import axios from 'axios';
import { isValidScore } from '../../utils/scoreValidator';
import { isValidFinish } from '../../utils/finishValidator';

// --- NESTED GAME STRUCTURE ---
const props = defineProps({
  game: Object
});

const startScore = Number(props.game.settings.gameType) || 501;
const totalSets = Number(props.game.settings.totalSets) || 1;
const totalLegs = Number(props.game.settings.totalLegs) || 1;

const gameObj = ref({
  player1: props.game.player1,
  player2: props.game.player2,
  sets: [
    {
      setNumber: 1,
      legs: [
        {
          legNumber: 1,
          throws: { 1: [], 2: [] },
          winner: null,
          dartsThrown: { 1: 0, 2: 0 },
          checkout: { 1: null, 2: null }
        }
      ],
      setWinner: null
    }
  ],
  gameWinner: null
});

const currentSetIdx = ref(0);
const currentLegIdx = ref(0);
const activePlayer = ref(1);
const score = ref('');
const showDartsModal = ref(false);
const showStats = ref(false);

const setsScore = ref({ 1: 0, 2: 0 });
const legsScore = ref({ 1: 0, 2: 0 });
const currentLegRemain = ref({ 1: startScore, 2: startScore });

// --- Modal Cancel State Backup ---
const lastScore = ref(null);
const lastDarts = ref(null);
const lastRemain = ref(null);

// --- Score Error Message ---
const scoreError = ref('');

const currentLegThrows = computed(() => ({
  1: gameObj.value.sets[currentSetIdx.value].legs[currentLegIdx.value].throws[1],
  2: gameObj.value.sets[currentSetIdx.value].legs[currentLegIdx.value].throws[2]
}));

const player1Remains = computed(() => {
  let remains = [];
  let rem = startScore;
  for (let s of currentLegThrows.value[1]) {
    rem -= s;
    remains.push(rem);
  }
  return remains;
});
const player2Remains = computed(() => {
  let remains = [];
  let rem = startScore;
  for (let s of currentLegThrows.value[2]) {
    rem -= s;
    remains.push(rem);
  }
  return remains;
});

const dartRows = computed(() => {
  return Math.max(
    15,
    currentLegThrows.value[1].length,
    currentLegThrows.value[2].length
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

const focusScoreInput = () => {
  nextTick(() => {
    const el = document.querySelector('input[type="number"]');
    if (el) {
      el.focus();
      el.select();
    }
  });
};

function submitScore() {
  const s = parseInt(score.value);
  // Validate score
  if (!isValidScore(s, currentLegRemain.value[activePlayer.value])) {
    scoreError.value = 'Invalid score entered. Please check your input.';
    return;
  }
  scoreError.value = '';

  const set = gameObj.value.sets[currentSetIdx.value];
  const leg = set.legs[currentLegIdx.value];

  // Only increment darts thrown for non-finishing turns
  if (currentLegRemain.value[activePlayer.value] - s > 0) {
    leg.throws[activePlayer.value].push(s);
    leg.dartsThrown[activePlayer.value] += 3;
    currentLegRemain.value[activePlayer.value] -= s;
    // Bust check
    if (currentLegRemain.value[activePlayer.value] < 2) {
      scoreError.value = 'Bust!';
      leg.throws[activePlayer.value].pop();
      leg.dartsThrown[activePlayer.value] -= 3;
      currentLegRemain.value[activePlayer.value] += s;
      score.value = '';
      focusScoreInput();
      return;
    }
    // Toggle player
    activePlayer.value = activePlayer.value === 1 ? 2 : 1;
    score.value = '';
    focusScoreInput();
    return;
  }

  // If the score exactly reaches 0, show modal and backup state
  if (currentLegRemain.value[activePlayer.value] - s === 0) {
    // Save backup state in case of cancel
    lastScore.value = s;
    lastDarts.value = leg.dartsThrown[activePlayer.value];
    lastRemain.value = currentLegRemain.value[activePlayer.value];
    // Only push the score for now, don't assign winner/darts yet
    leg.throws[activePlayer.value].push(s);
    currentLegRemain.value[activePlayer.value] -= s;
    showDartsModal.value = true;
    score.value = '';
    return;
  }

  // Bust if below zero or below 2 (cannot finish)
  if (currentLegRemain.value[activePlayer.value] - s < 2) {
    scoreError.value = 'Bust!';
    score.value = '';
    focusScoreInput();
    return;
  }
}

function cancelDartsModal() {
  // Undo last score for the player who just tried to finish
  const set = gameObj.value.sets[currentSetIdx.value];
  const leg = set.legs[currentLegIdx.value];
  const player = activePlayer.value;

  // Remove last score entry
  if (leg.throws[player].length > 0) {
    leg.throws[player].pop();
    leg.dartsThrown[player] = lastDarts.value;
    currentLegRemain.value[player] = lastRemain.value;
    // Ensure winner and checkout are cleared (shouldn't be set yet)
    leg.winner = null;
    leg.checkout[player] = null;
  }
  showDartsModal.value = false;
  scoreError.value = '';
  focusScoreInput();
}

async function finishLeg(dartsUsed) {
  const set = gameObj.value.sets[currentSetIdx.value];
  const leg = set.legs[currentLegIdx.value];
  const player = activePlayer.value;

  const finishingScore = lastScore.value; // The checkout score
  if (!isValidFinish(finishingScore, dartsUsed)) {
    scoreError.value = `Finishing ${finishingScore} in ${dartsUsed} dart(s) is not possible under standard rules. Please check your entry.`;
    return;
  }

  // Assign winner, checkout, and correct darts thrown for last visit
  leg.winner = player;
  leg.checkout[player] = finishingScore;
  // Add the actual darts used for final visit (instead of a default 3)
  leg.dartsThrown[player] = lastDarts.value + dartsUsed;

  // Update legs score
  legsScore.value[player]++;

  // Next leg or set logic
  if (
    legsScore.value[1] >= Math.ceil(totalLegs / 2) ||
    legsScore.value[2] >= Math.ceil(totalLegs / 2)
  ) {
    // Set won
    set.setWinner = legsScore.value[1] > legsScore.value[2] ? 1 : 2;
    setsScore.value[set.setWinner]++;
    // Game win?
    if (
      setsScore.value[1] >= Math.ceil(totalSets / 2) ||
      setsScore.value[2] >= Math.ceil(totalSets / 2)
    ) {
      gameObj.value.gameWinner =
        setsScore.value[1] > setsScore.value[2] ? 1 : 2;
      await saveGameStats(); // PATCH to /game/:id/state
      router.visit(`/game/${props.game.id}/summary`);
      return;
    }
    // New set
    currentSetIdx.value++;
    gameObj.value.sets.push({
      setNumber: currentSetIdx.value + 1,
      legs: [
        {
          legNumber: 1,
          throws: { 1: [], 2: [] },
          winner: null,
          dartsThrown: { 1: 0, 2: 0 },
          checkout: { 1: null, 2: null }
        }
      ],
      setWinner: null
    });
    legsScore.value = { 1: 0, 2: 0 };
    currentLegIdx.value = 0;
    currentLegRemain.value = { 1: startScore, 2: startScore };
    activePlayer.value = 1;
    showDartsModal.value = false;
    scoreError.value = '';
    focusScoreInput();
    return;
  }
  // New leg in current set
  currentLegIdx.value++;
  set.legs.push({
    legNumber: currentLegIdx.value + 1,
    throws: { 1: [], 2: [] },
    winner: null,
    dartsThrown: { 1: 0, 2: 0 },
    checkout: { 1: null, 2: null }
  });
  currentLegRemain.value = { 1: startScore, 2: startScore };
  // Alternate who starts each leg
  activePlayer.value = set.legs.length % 2 === 1 ? 1 : 2;
  showDartsModal.value = false;
  scoreError.value = '';
  focusScoreInput();
}

function undoLastScore() {
  const leg = gameObj.value.sets[currentSetIdx.value].legs[currentLegIdx.value];
  const p = activePlayer.value === 1 ? 2 : 1; // last player to throw
  if (leg.throws[p].length === 0) return;
  const last = leg.throws[p].pop();
  leg.dartsThrown[p] = Math.max(0, leg.dartsThrown[p] - 3);
  currentLegRemain.value[p] += last;
  activePlayer.value = p;
  scoreError.value = '';
  focusScoreInput();
}

async function saveGameStats() {
  // Save the entire gameObj to the state column
  await axios.patch(`/game/${props.game.id}/state`, {
    state: gameObj.value,
  });
}

// --- SIMPLE LIVE MATCH STATS ---
const liveStats = computed(() => {
  // Aggregate all sets and legs for stats
  const stats = {
    1: { total: 0, darts: 0, '100+': 0, '140+': 0, '180': 0 },
    2: { total: 0, darts: 0, '100+': 0, '140+': 0, '180': 0 }
  };
  gameObj.value.sets.forEach(set => {
    set.legs.forEach(leg => {
      for (let pid of [1,2]) {
        leg.throws[pid].forEach(s => {
          stats[pid].total += s;
          stats[pid].darts += 3;
          if (s >= 180) stats[pid]['180']++;
          else if (s >= 140) stats[pid]['140+']++;
          else if (s >= 100) stats[pid]['100+']++;
        });
      }
    });
  });
  return stats;
});

function handleKeydown(e) {
  if (showDartsModal.value && ['1', '2', '3'].includes(e.key)) {
    e.preventDefault();
    finishLeg(Number(e.key));
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
})

onMounted(() => {
  focusScoreInput();
});
</script>

<style scoped>
body {
  background-color: #111;
}
</style>