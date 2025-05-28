<template>
  <Head title="Player Management" />

  <div class="max-w-lg mx-auto py-10">
    <h1 class="text-2xl font-bold mb-4">Manage Players</h1>

    <!-- Add Player Form -->
    <form @submit.prevent="addPlayer" class="flex gap-2 mb-6">
      <input
        v-model="name"
        type="text"
        placeholder="New player name"
        class="border rounded px-3 py-2 flex-1"
        required
      />
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
    </form>
    <div v-if="errors.name" class="text-red-500 mb-2">{{ errors.name }}</div>

    <!-- Player List -->
    <ul class="divide-y">
      <li v-for="player in players" :key="player.id" class="py-2 flex justify-between items-center">
        <span>{{ player.name }}</span>
        <div class="flex gap-2">
          <button @click="editPlayer(player.id)" class="text-blue-500 hover:underline">Edit</button>
          <button @click="deletePlayer(player.id)" class="text-red-500 hover:underline">Delete</button>
        </div>
      </li>
    </ul>

<!-- Edit Player Modal -->
<div v-if="editing" class="fixed z-50 inset-0 bg-black bg-opacity-30 flex items-center justify-center">
  <div class="bg-white p-6 rounded-lg shadow-lg min-w-[300px] text-black">
    <h2 class="text-xl mb-4">Edit Player</h2>
    <form @submit.prevent="updatePlayer" class="flex flex-col gap-3">
      <input v-model="editName" type="text" class="border px-3 py-2 rounded text-black" required />
      <div v-if="errors.name" class="text-red-500">{{ errors.name }}</div>
      <div class="flex gap-2 justify-end">
        <button type="button" @click="editing=false" class="px-4 py-2 bg-gray-300 rounded text-black">Cancel</button>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </form>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { router, Head } from '@inertiajs/vue3';

const props = defineProps({
  players: Array
});

const name = ref('');
const errors = ref({});
const editing = ref(false);
const editId = ref(null);
const editName = ref('');

// Add player
function addPlayer() {
  router.post('/players', { name: name.value }, {
    onError: (e) => { errors.value = e; },
    onSuccess: () => { name.value = ''; errors.value = {}; }
  });
}

// Delete player
function deletePlayer(id) {
  if (confirm('Delete this player?')) {
    router.delete(`/players/${id}`);
  }
}

// Open Edit
function editPlayer(id) {
  const player = props.players.find(p => p.id === id);
  if (player) {
    editId.value = id;
    editName.value = player.name;
    errors.value = {};
    editing.value = true;
  }
}

// Update Player
function updatePlayer() {
  router.put(`/players/${editId.value}`, { name: editName.value }, {
    onError: (e) => { errors.value = e; },
    onSuccess: () => {
      editing.value = false;
      editId.value = null;
      editName.value = '';
      errors.value = {};
    }
  });
}

import AppLayout from '@/layouts/AppLayout.vue';
defineOptions({ layout: AppLayout });

</script>