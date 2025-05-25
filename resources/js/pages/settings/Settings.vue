<template>
  <div class="max-w-xl mx-auto p-6 space-y-6">
    <h2 class="text-2xl font-semibold text-center">Game Settings</h2>

    <!-- Player 1 -->
    <div>
      <label class="block font-medium">Player 1 Name</label>
      <input
        v-model="player1"
        type="text"
        class="mt-1 w-full border rounded px-3 py-2"
        :class="{'border-red-500': player1Error}"
      />
      <div v-if="player1Error" class="text-red-500 text-sm mt-1">{{ player1Error }}</div>
      <label class="inline-flex items-center mt-2">
        <input type="radio" value="1" v-model="throwFirst" />
        <span class="ml-2">Player 1 Throws First</span>
      </label>
    </div>

    <!-- Player 2 -->
    <div>
      <label class="block font-medium">Player 2 Name</label>
      <input
        v-model="player2"
        type="text"
        class="mt-1 w-full border rounded px-3 py-2"
        :class="{'border-red-500': player2Error}"
      />
      <div v-if="player2Error" class="text-red-500 text-sm mt-1">{{ player2Error }}</div>
      <label class="inline-flex items-center mt-2">
        <input type="radio" value="2" v-model="throwFirst" />
        <span class="ml-2">Player 2 Throws First</span>
      </label>
    </div>

    <!-- Game Type -->
    <div>
      <label class="block font-medium mb-2">Game Type</label>
      <label class="inline-flex items-center mr-4">
        <input type="radio" value="301" v-model="gameType" />
        <span class="ml-2">301</span>
      </label>
      <label class="inline-flex items-center">
        <input type="radio" value="501" v-model="gameType" />
        <span class="ml-2">501</span>
      </label>
    </div>

    <!-- Format Section -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-2">Format</h3>
      <div class="mb-4">
        <label for="totalSets" class="block mb-1 font-medium">Sets:</label>
        <input
          id="totalSets"
          type="number"
          min="1"
          max="11"
          step="2"
          v-model.number="totalSets"
          class="w-24 px-2 py-1 border rounded"
          :class="{'border-red-500': setsError}"
        />
        <div v-if="setsError" class="text-red-500 text-sm mt-1">{{ setsError }}</div>
      </div>
      <div>
        <label for="totalLegs" class="block mb-1 font-medium">Legs:</label>
        <input
          id="totalLegs"
          type="number"
          min="1"
          max="11"
          step="2"
          v-model.number="totalLegs"
          class="w-24 px-2 py-1 border rounded"
          :class="{'border-red-500': legsError}"
        />
      <div v-if="legsError" class="text-red-500 text-sm mt-1">{{ legsError }}</div>  
      </div>
    </div>

    <!-- Play Button -->
    <div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        @click="startGame"
      >
        Play Now
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'

const player1 = ref('')
const player2 = ref('')
const throwFirst = ref('1')
const gameType = ref('501')
const totalSets = ref(1)
const totalLegs = ref(1)
const setsError = ref('');
const legsError = ref('');

// Error states
const player1Error = ref('')
const player2Error = ref('')

function startGame() {
  // Reset errors
  player1Error.value = '';
  player2Error.value = '';
  setsError.value = '';
  legsError.value = '';

  // Validation
  let hasError = false;
  if (!player1.value.trim()) {
    player1Error.value = 'Player 1 name is required.'
    hasError = true;
  }
  if (!player2.value.trim()) {
    player2Error.value = 'Player 2 name is required.'
    hasError = true;
  }

  // Sets Validation
  if (
    !Number.isInteger(totalSets.value) ||
    totalSets.value < 1 ||
    totalSets.value > 11
  ) {
    setsError.value = 'Sets must be an odd number between 1 and 11.';
    hasError = true;
  } 

  // Legs Validation
  if (
    !Number.isInteger(totalLegs.value) ||
    totalLegs.value < 1 ||
    totalLegs.value > 11
  ) {
    legsError.value = 'Legs must be an odd number between 1 and 11.';
    hasError = true;
  }

  // Odd number validation (since step=2 in UI, but user might type directly)
  if (totalSets.value % 2 !== 1) {
    setsError.value = 'Sets must be an odd number.';
    hasError = true;
  }
  if (totalLegs.value % 2 !== 1) {
    legsError.value = 'Legs must be an odd number.';
    hasError = true;
  }

  if (hasError) return;

  router.visit('/match', {
    data: {
      player1: player1.value,
      player2: player2.value,
      throwFirst: throwFirst.value,
      gameType: gameType.value,
      totalSets: totalSets.value,
      totalLegs: totalLegs.value,
    },
    method: 'post',
  })
}
</script>