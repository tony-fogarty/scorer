<template>
  <div class="min-h-screen bg-slate-800 text-white font-sans p-0 flex flex-col items-center">
    <h1 class="text-4xl font-bold mt-8 mb-2 text-center">Game Summary</h1>
    <div class="flex flex-row justify-between items-center w-full max-w-4xl mb-2">
      <div class="ml-2 text-sm">
        <span>Game ID:</span>
        <span class="font-mono">#{{ game.id }}</span>
      </div>
      <div class="flex flex-col items-center">
        <div class="text-lg">Best of {{ game.settings.totalSets }} Sets</div>
        <div class="text-base text-slate-300">Best of {{ game.settings.totalLegs }} Legs</div>
      </div>
      <div class="mr-2">
        <label class="font-semibold mr-2">Show Stats for:</label>
        <button class="px-3 py-1 bg-slate-700 border border-white rounded text-white font-bold cursor-pointer">Full Game</button>
        <!-- Placeholder for dropdown/select in future -->
      </div>
    </div>

    <!-- Result Row -->
    <div class="w-full max-w-4xl border border-slate-500 rounded bg-slate-900 mb-4 overflow-hidden">
      <div class="grid grid-cols-7 text-center font-semibold">
        <div class="col-span-2 bg-red-700 text-white py-2">LOSS</div>
        <div class="bg-slate-800 py-2"></div>
        <div class="col-span-2 bg-green-700 text-white py-2">WIN</div>
        <div class="bg-slate-800 py-2"></div>
        <div class="bg-slate-800 py-2"></div>
      </div>
      <div class="grid grid-cols-7 text-center items-center text-xl font-semibold bg-slate-800">
        <div class="py-3 border-b border-slate-700 bg-slate-800">
          <div class="text-base text-slate-300">3DA</div>
          <div class="font-mono text-lg">{{ stats[1].threeDartAvg }}</div>
        </div>
        <div class="py-3 border-b border-slate-700">
          <span class="font-bold text-lg">{{ player1.name }}</span>
        </div>
        <div class="py-3 border-b border-slate-700 text-3xl">{{ result[1] }}</div>
        <div class="py-3 border-b border-slate-700 text-3xl">{{ result[2] }}</div>
        <div class="py-3 border-b border-slate-700">
          <span class="font-bold text-lg">{{ player2.name }}</span>
        </div>
        <div class="py-3 border-b border-slate-700 bg-slate-800">
          <div class="text-base text-slate-300">3DA</div>
          <div class="font-mono text-lg">{{ stats[2].threeDartAvg }}</div>
        </div>
        <div></div>
      </div>
    </div>

    <!-- Scoring Section -->
    <div class="w-full max-w-4xl border border-slate-500 rounded bg-slate-900 mb-4">
      <div class="text-lg font-bold text-center py-2 border-b border-slate-700">Scoring</div>
      <div class="grid grid-cols-3 text-center">
        <div class="py-1 font-mono text-xl">{{ stats[1].ranges['0-59'] }}</div>
        <div class="py-1 text-slate-300">0-59</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].ranges['0-59'] }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].ranges['60-79'] }}</div>
        <div class="py-1 text-slate-300">60-79</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].ranges['60-79'] }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].ranges['80-99'] }}</div>
        <div class="py-1 text-slate-300">80-99</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].ranges['80-99'] }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].ranges['100+'] }}</div>
        <div class="py-1 text-slate-300">100+</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].ranges['100+'] }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].ranges['140+'] }}</div>
        <div class="py-1 text-slate-300">140+</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].ranges['140+'] }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].ranges['170+'] }}</div>
        <div class="py-1 text-slate-300">170+</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].ranges['170+'] }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].ranges['180'] }}</div>
        <div class="py-1 text-slate-300">180's</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].ranges['180'] }}</div>
      </div>
    </div>

    <!-- Highlights Section -->
    <div class="w-full max-w-4xl border border-slate-500 rounded bg-slate-900 mb-4">
      <div class="text-lg font-bold text-center py-2 border-b border-slate-700">Highlights</div>
      <div class="grid grid-cols-3 text-center">
        <div class="py-1 font-mono text-xl">{{ stats[1].highFinish || '-' }}</div>
        <div class="py-1 text-slate-300">Highest Finish</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].highFinish || '-' }}</div>
        <div class="py-1 font-mono text-xl">{{ stats[1].leastDarts || '-' }}</div>
        <div class="py-1 text-slate-300">Least Darts</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].leastDarts || '-' }}</div>
      </div>
    </div>

    <!-- Averages Section -->
    <div class="w-full max-w-4xl border border-slate-500 rounded bg-slate-900 mb-8">
      <div class="text-lg font-bold text-center py-2 border-b border-slate-700">Averages</div>
      <div class="grid grid-cols-3 text-center">
        <div class="py-1 font-mono text-xl">{{ stats[1].threeDartAvg }}</div>
        <div class="py-1 text-slate-300">3 Dart Avg</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].threeDartAvg }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].firstNineAvg }}</div>
        <div class="py-1 text-slate-300">First Nine Avg</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].firstNineAvg }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].oneDartAvg }}</div>
        <div class="py-1 text-slate-300">1 Dart Avg</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].oneDartAvg }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].totalScored }}</div>
        <div class="py-1 text-slate-300">Total Scored</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].totalScored }}</div>

        <div class="py-1 font-mono text-xl">{{ stats[1].dartsThrown }}</div>
        <div class="py-1 text-slate-300">Total Darts Thrown</div>
        <div class="py-1 font-mono text-xl">{{ stats[2].dartsThrown }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// --- Props: Game data structure ---
const props = defineProps({
  game: Object,
});

// Game/player info
const game = props.game;
const player1 = game.player1;
const player2 = game.player2;

// --- Results (sets/legs) ---
const result = computed(() => {
  // Result: total sets/legs won (you can adjust this to sets or legs)
  let player1Wins = 0;
  let player2Wins = 0;
  // Option: use sets, or sum all legs
  let totalLegs1 = 0;
  let totalLegs2 = 0;
  game.sets.forEach(set => {
    set.legs.forEach(leg => {
      if (leg.winner === 1) totalLegs1++;
      if (leg.winner === 2) totalLegs2++;
    });
  });
  return { 1: totalLegs1, 2: totalLegs2 };
});

// --- Stats calculations ---
function calculateStats(game, player) {
  let totalScored = 0;
  let dartsThrown = 0;
  let scoringRanges = {
    '0-59': 0, '60-79': 0, '80-99': 0, '100+': 0, '140+': 0, '170+': 0, '180': 0
  };
  let highFinish = null;
  let leastDarts = null;

  // For first 9 average
  let firstNineTotals = [];
  let firstNineDarts = [];

  game.sets.forEach(set => {
    set.legs.forEach(leg => {
      if (!leg.throws[player] || leg.throws[player].length === 0) return;

      // Scoring breakdown per throw
      leg.throws[player].forEach(score => {
        if (score >= 0 && score <= 59) scoringRanges['0-59']++;
        else if (score >= 60 && score <= 79) scoringRanges['60-79']++;
        else if (score >= 80 && score <= 99) scoringRanges['80-99']++;
        else if (score >= 100 && score <= 139) scoringRanges['100+']++;
        else if (score >= 140 && score <= 169) scoringRanges['140+']++;
        else if (score >= 170 && score <= 179) scoringRanges['170+']++;
        else if (score === 180) scoringRanges['180']++;
        totalScored += score;
      });

      // High finish/least darts
      if (leg.winner === player) {
        if (leg.checkout && leg.checkout[player]) {
          if (!highFinish || leg.checkout[player] > highFinish) highFinish = leg.checkout[player];
        }
        if (leg.dartsThrown && leg.dartsThrown[player]) {
          if (!leastDarts || leg.dartsThrown[player] < leastDarts) leastDarts = leg.dartsThrown[player];
        }
      }

      // First 9 darts in this leg
      let scores = leg.throws[player].slice(0, 3);
      let sum = scores.reduce((a, b) => a + b, 0);
      let darts = scores.length * 3;
      // If the leg was finished in fewer than 3 throws, adjust darts
      if (leg.dartsThrown && leg.dartsThrown[player] && leg.throws[player].length < 3) {
        // Last turn may have fewer than 3 darts
        darts = leg.dartsThrown[player] > 9 ? 9 : leg.dartsThrown[player];
      }
      if (scores.length > 0) {
        firstNineTotals.push(sum);
        firstNineDarts.push(darts);
      }

      // Darts thrown (from leg stats for player)
      if (leg.dartsThrown && leg.dartsThrown[player]) dartsThrown += leg.dartsThrown[player];
    });
  });

  // Averages
  let oneDartAvg = dartsThrown > 0 ? (totalScored / dartsThrown) : 0;
  let threeDartAvg = dartsThrown > 0 ? ((totalScored / dartsThrown) * 3) : 0;
  let firstNineAvg = 0;
  if (firstNineTotals.length > 0 && firstNineDarts.length > 0) {
    let total = firstNineTotals.reduce((a, b) => a + b, 0);
    let darts = firstNineDarts.reduce((a, b) => a + b, 0);
    if (darts > 0) firstNineAvg = ((total / darts) * 3);
  }

  return {
    totalScored,
    dartsThrown,
    oneDartAvg: oneDartAvg.toFixed(2),
    threeDartAvg: threeDartAvg.toFixed(2),
    firstNineAvg: firstNineAvg.toFixed(2),
    highFinish,
    leastDarts,
    ranges: scoringRanges,
  };
}

// --- Calculated stats for both players ---
const stats = computed(() => {
  return {
    1: calculateStats(game, 1),
    2: calculateStats(game, 2),
  };
});
</script>

<style scoped>
body {
  background: #183447;
}
.bg-slate-800 {
  background-color: #183447;
}
.bg-slate-900 {
  background-color: #142633;
}
.border-slate-500 {
  border-color: #334155;
}
.text-slate-300 {
  color: #cbd5e1;
}
.text-slate-700 {
  color: #64748b;
}
.bg-slate-700 {
  background-color: #334155;
}
.bg-green-700 {
  background-color: #15803d;
}
.bg-red-700 {
  background-color: #b91c1c;
}
.border-slate-700 {
  border-color: #334155;
}
</style>