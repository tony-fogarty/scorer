<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
    <h1 class="text-4xl font-bold mb-4">Game Summary</h1>
    <div class="mb-8">
      <h2 class="text-2xl">
        Winner:
        <span class="text-green-400 font-bold">{{ winnerName }}</span>
      </h2>
    </div>

    <!-- Flash message for success -->
    <div v-if="$page.props.flash && $page.props.flash.success" class="mb-6 px-6 py-3 rounded bg-green-700 font-bold text-white shadow">
      {{ $page.props.flash.success }}
    </div>

    <div class="flex flex-col md:flex-row gap-10">
      <div v-for="p in stats" :key="p.player_id" class="bg-gray-800 rounded-lg p-6 w-80 shadow">
        <h3 class="text-xl font-bold mb-4 text-center">
          {{ playerName(p.player_id) }}
          <span v-if="winnerId === p.player_id" class="ml-2 text-green-400">🏆</span>
        </h3>
        <ul class="space-y-2 text-lg">
          <li><span class="font-semibold">Sets:</span> {{ p.sets_for }} - {{ p.sets_against }}</li>
          <li><span class="font-semibold">Legs:</span> {{ p.legs_for }} - {{ p.legs_against }}</li>
          <li><span class="font-semibold">0-59 scores:</span> {{ p.scores_0_59 ?? 0 }}</li>
          <li><span class="font-semibold">60-79 scores:</span> {{ p.scores_60_79 ?? 0 }}</li>
          <li><span class="font-semibold">80-99 scores:</span> {{ p.scores_80_99 ?? 0 }}</li>
          <li><span class="font-semibold">100+ scores:</span> {{ p.scores_100_plus ?? 0 }}</li>
          <li><span class="font-semibold">140+ scores:</span> {{ p.scores_140_plus ?? 0 }}</li>
          <li><span class="font-semibold">170+ scores:</span> {{ p.scores_170_plus ?? 0 }}</li>
          <li><span class="font-semibold">180s:</span> {{ p.scores_180 ?? 0 }}</li>
          <li>
            <span class="font-semibold">High finish:</span>
            <span>{{ p.high_finish !== null && p.high_finish !== undefined ? p.high_finish : '—' }}</span>
          </li>
          <li>
            <span class="font-semibold">Least darts:</span>
            <span>{{ p.least_darts !== null && p.least_darts !== undefined ? p.least_darts : '—' }}</span>
          </li>
          <li><span class="font-semibold">Total score:</span> {{ p.total_score ?? 0 }}</li>
          <li><span class="font-semibold">Darts thrown:</span> {{ p.darts_thrown ?? 0 }}</li>
          <li><span class="font-semibold">Average:</span> {{ p.average ?? 'N/A' }}</li>
        </ul>
      </div>
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
import { router, usePage } from '@inertiajs/vue3';

const props = defineProps({
  game: Object,
  player1: Object,
  player2: Object,
  stats: Array,
});

const finishing = ref(false);

const winnerId = computed(() => {
  // Winner is the one with more sets_for, or fallback to more legs, etc.
  if (!props.stats || props.stats.length < 2) return null;
  if (props.stats[0].sets_for > props.stats[1].sets_for) return props.stats[0].player_id;
  if (props.stats[1].sets_for > props.stats[0].sets_for) return props.stats[1].player_id;
  // fallback to legs
  if (props.stats[0].legs_for > props.stats[1].legs_for) return props.stats[0].player_id;
  if (props.stats[1].legs_for > props.stats[0].legs_for) return props.stats[1].player_id;
  return null;
});

const winnerName = computed(() => {
  if (winnerId.value === props.player1.id) return props.player1.name;
  if (winnerId.value === props.player2.id) return props.player2.name;
  return 'Draw';
});

const playerName = (id) => {
  if (id === props.player1.id) return props.player1.name;
  if (id === props.player2.id) return props.player2.name;
  return 'Unknown';
};

function finishGame() {
  finishing.value = true;
  router.patch(`/game/${props.game.id}/state`, { status: 'complete' }, {
    onFinish: () => {
      finishing.value = false;
    }
  });
}
</script>