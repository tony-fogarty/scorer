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
            <th class="w-1/4 text-left py-2 px-4">{{ player1.name }}</th>
            <th class="w-1/2 text-center py-2 px-4 font-bold text-xl" colspan="1">Totals</th>
            <th class="w-1/4 text-right py-2 px-4">{{ player2.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in totalsRows" :key="row.label" class="border-b border-gray-700">
            <td class="text-left py-2 px-4">{{ formatStat(p1[row.key]) }}</td>
            <td class="text-center py-2 px-4 font-semibold">{{ row.label }}</td>
            <td class="text-right py-2 px-4">{{ formatStat(p2[row.key]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Averages Table -->
    <div class="w-full max-w-2xl">
      <table class="w-full text-lg bg-gray-800 rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-900">
            <th class="w-1/4 text-left py-2 px-4">{{ player1.name }}</th>
            <th class="w-1/2 text-center py-2 px-4 font-bold text-xl" colspan="1">Averages</th>
            <th class="w-1/4 text-right py-2 px-4">{{ player2.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-left py-2 px-4">{{ formatAverage(p1.average) }}</td>
            <td class="text-center py-2 px-4 font-semibold">Dart Average</td>
            <td class="text-right py-2 px-4">{{ formatAverage(p2.average) }}</td>
          </tr>
          <tr>
            <td class="text-left py-2 px-4">{{ formatAverage(p1.three_dart_average) }}</td>
            <td class="text-center py-2 px-4 font-semibold">3 Dart Average</td>
            <td class="text-right py-2 px-4">{{ formatAverage(p2.three_dart_average) }}</td>
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

const props = defineProps({
  game: Object,
  player1: Object,
  player2: Object,
  stats: Array,
});
const finishing = ref(false);

const p1 = computed(() => props.stats?.[0] || {});
const p2 = computed(() => props.stats?.[1] || {});

const winnerId = computed(() => {
  if (!props.stats || props.stats.length < 2) return null;
  if (props.stats[0].sets_for > props.stats[1].sets_for) return props.stats[0].player_id;
  if (props.stats[1].sets_for > props.stats[0].sets_for) return props.stats[1].player_id;
  if (props.stats[0].legs_for > props.stats[1].legs_for) return props.stats[0].player_id;
  if (props.stats[1].legs_for > props.stats[0].legs_for) return props.stats[1].player_id;
  return null;
});
const winnerName = computed(() => {
  if (winnerId.value === props.player1.id) return props.player1.name;
  if (winnerId.value === props.player2.id) return props.player2.name;
  return 'Draw';
});

// Adjust labels/keys to match your stat keys or new labels
const totalsRows = [
  { label: 'Sets', key: 'sets_for' },
  { label: 'Legs', key: 'legs_for' },
  { label: '0-59', key: 'scores_0_59' },
  { label: '60+', key: 'scores_60_79' },
  { label: '80+', key: 'scores_80_99' },
  { label: '100+', key: 'scores_100_plus' },
  { label: '140+', key: 'scores_140_plus' },
  { label: '170+', key: 'scores_170_plus' },
  { label: "180's", key: 'scores_180' },
  { label: 'High Finish', key: 'high_finish' },    // <-- backend value
  { label: 'Least Darts', key: 'least_darts' },    // <-- backend value
  { label: 'Total Score', key: 'total_score' },
  { label: 'Darts Thrown', key: 'darts_thrown' },
];

// Format stats for table display
function formatStat(val) {
  if (val === null || val === undefined || val === '') return '—';
  return val;
}

// Format average to 2 decimal places if it's a number
function formatAverage(val) {
  if (val === null || val === undefined || val === '' || isNaN(val)) return '—';
  return Number(val).toFixed(2);
}

function finishGame() {
  finishing.value = true;
  router.patch(`/game/${props.game.id}/state`, { status: 'complete' }, {
    onFinish: () => {
      finishing.value = false;
    }
  });
}
</script>