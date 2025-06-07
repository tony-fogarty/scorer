<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
    <h1 class="text-4xl font-bold mb-4">Game Summary</h1>
    <div class="mb-8">
      <h2 class="text-2xl">
        Winner: <span class="text-green-400 font-bold">{{ winnerName }}</span>
      </h2>
    </div>

    <!-- Totals Table -->
    <div class="w-full max-w-2xl mb-8">
      <table class="w-full text-lg bg-gray-800 rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-900">
            <th class="w-1/4 text-left py-2 px-4">{{ player1Name }}</th>
            <th class="w-1/2 text-center py-2 px-4 font-bold text-xl" colspan="1">Totals</th>
            <th class="w-1/4 text-right py-2 px-4">{{ player2Name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in totalsRows" :key="row.label" class="border-b border-gray-700">
            <td class="text-left py-2 px-4">{{ formatStat(p1Stats[row.key]) }}</td>
            <td class="text-center py-2 px-4 font-semibold">{{ row.label }}</td>
            <td class="text-right py-2 px-4">{{ formatStat(p2Stats[row.key]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Averages Table -->
    <div class="w-full max-w-2xl">
      <table class="w-full text-lg bg-gray-800 rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-900">
            <th class="w-1/4 text-left py-2 px-4">{{ player1Name }}</th>
            <th class="w-1/2 text-center py-2 px-4 font-bold text-xl" colspan="1">Averages</th>
            <th class="w-1/4 text-right py-2 px-4">{{ player2Name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-left py-2 px-4">{{ formatAverage(p1Stats.average) }}</td>
            <td class="text-center py-2 px-4 font-semibold">Dart Average</td>
            <td class="text-right py-2 px-4">{{ formatAverage(p2Stats.average) }}</td>
          </tr>
          <tr>
            <td class="text-left py-2 px-4">{{ formatAverage(p1Stats.three_dart_average) }}</td>
            <td class="text-center py-2 px-4 font-semibold">3 Dart Average</td>
            <td class="text-right py-2 px-4">{{ formatAverage(p2Stats.three_dart_average) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-10">
      <button
        class="bg-green-600 text-white px-8 py-3 rounded-lg text-xl shadow hover:bg-green-700"
        @click="finishGame"
        :disabled="finishing"
      >
        Finish Game
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { router } from '@inertiajs/vue3';
import axios from 'axios';

// Props: game object contains state (nested structure), plus player1 and player2 info
const props = defineProps({
  game: Object,
  player1: Object,
  player2: Object,
});

const finishing = ref(false);

// Use state as the source of truth for stats
const statsJson = computed(() => props.game.state || null);

// Player mapping
const player1Id = props.player1?.id;
const player2Id = props.player2?.id;
const player1Name = props.player1?.name || "Player 1";
const player2Name = props.player2?.name || "Player 2";

// Compute stats from nested state object
function computeStatsForPlayer(pid) {
  if (!statsJson.value) return {};

  let setsWon = 0;
  let legsWon = 0;
  let totalScore = 0;
  let dartsThrown = 0;
  let scores_0_59 = 0;
  let scores_60_79 = 0;
  let scores_80_99 = 0;
  let scores_100_plus = 0;
  let scores_140_plus = 0;
  let scores_170_plus = 0;
  let scores_180 = 0;
  let high_finish = 0;
  let least_darts = null;

  // Defensive: state may be saved as object or stringified JSON
  const data = typeof statsJson.value === "string"
    ? JSON.parse(statsJson.value)
    : statsJson.value;

  // Find which player number this pid is (1 or 2)
  let playerNum = null;
  if (data.player1?.id == pid) playerNum = 1;
  else if (data.player2?.id == pid) playerNum = 2;

  if (!playerNum) return {};

  // Loop sets, legs, throws for all stats
  for (const set of data.sets || []) {
    // Sets won
    if (set.setWinner === playerNum) setsWon++;

    for (const leg of set.legs || []) {
      // Legs won
      if (leg.winner === playerNum) legsWon++;

      // Throws
      for (const throwScore of leg.throws?.[playerNum] || []) {
        totalScore += throwScore;
        dartsThrown += 3;

        if (throwScore <= 59) scores_0_59++;
        else if (throwScore <= 79) scores_60_79++;
        else if (throwScore <= 99) scores_80_99++;
        else if (throwScore <= 139) scores_100_plus++;
        else if (throwScore <= 169) scores_140_plus++;
        else if (throwScore <= 179) scores_170_plus++;
        else if (throwScore === 180) scores_180++;
      }

      // High finish (checkout)
      const checkout = leg.checkout?.[playerNum];
      if (checkout && checkout > high_finish) high_finish = checkout;

      // Least darts for a leg win
      if (leg.winner === playerNum) {
        const darts = leg.dartsThrown?.[playerNum] || 0;
        if (!least_darts || (darts && darts < least_darts)) least_darts = darts;
      }
    }
  }

  const average = dartsThrown > 0 ? (totalScore / dartsThrown) : 0;
  const three_dart_average = average * 3;

  return {
    sets_for: setsWon,
    legs_for: legsWon,
    scores_0_59,
    scores_60_79,
    scores_80_99,
    scores_100_plus,
    scores_140_plus,
    scores_170_plus,
    scores_180,
    high_finish: high_finish || "—",
    least_darts: least_darts || "—",
    total_score: totalScore,
    darts_thrown: dartsThrown,
    average: dartsThrown > 0 ? average : "—",
    three_dart_average: dartsThrown > 0 ? three_dart_average : "—",
  };
}

const p1Stats = computed(() => computeStatsForPlayer(player1Id));
const p2Stats = computed(() => computeStatsForPlayer(player2Id));

const winnerId = computed(() => {
  if (!statsJson.value) return null;
  if (p1Stats.value.sets_for > p2Stats.value.sets_for) return player1Id;
  if (p2Stats.value.sets_for > p1Stats.value.sets_for) return player2Id;
  if (p1Stats.value.legs_for > p2Stats.value.legs_for) return player1Id;
  if (p2Stats.value.legs_for > p1Stats.value.legs_for) return player2Id;
  return null;
});
const winnerName = computed(() => {
  if (winnerId.value === player1Id) return player1Name;
  if (winnerId.value === player2Id) return player2Name;
  return 'Draw';
});

const totalsRows = [
  { label: 'Sets', key: 'sets_for' },
  { label: 'Legs', key: 'legs_for' },
  { label: '0-59', key: 'scores_0_59' },
  { label: '60-79', key: 'scores_60_79' },
  { label: '80-99', key: 'scores_80_99' },
  { label: '100+', key: 'scores_100_plus' },
  { label: '140+', key: 'scores_140_plus' },
  { label: '170+', key: 'scores_170_plus' },
  { label: "180's", key: 'scores_180' },
  { label: 'High Finish', key: 'high_finish' },
  { label: 'Least Darts', key: 'least_darts' },
  { label: 'Total Score', key: 'total_score' },
  { label: 'Darts Thrown', key: 'darts_thrown' },
];

function formatStat(val) {
  if (val === null || val === undefined || val === '') return '—';
  return val;
}
function formatAverage(val) {
  if (val === null || val === undefined || val === '' || isNaN(val)) return '—';
  return Number(val).toFixed(2);
}

function finishGame() {
  finishing.value = true;
  axios.patch(`/game/${props.game.id}/state`, { status: 'complete' })
    .then(() => {
      router.visit('/games');
    })
    .finally(() => {
      finishing.value = false;
    });
}

</script>