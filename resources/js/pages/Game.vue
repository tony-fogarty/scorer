<template>
  <div class="p-8">
    <!-- Flash message for success -->
<div v-if="$page.props.flash && $page.props.flash.success" class="mb-6 px-6 py-3 rounded bg-green-700 font-bold text-white shadow">
  {{ $page.props.flash.success }}
</div>
    <h1 class="text-3xl font-bold mb-6">All Games</h1>
    <table class="w-full text-left">
      <thead>
        <tr>
          <th>Date</th>
          <th>Player 1</th>
          <th>Player 2</th>
          <th>Winner</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="game in games" :key="game.id">
          <td>{{ new Date(game.created_at).toLocaleString() }}</td>
          <td>{{ game.player1?.name }}</td>
          <td>{{ game.player2?.name }}</td>
          <td>
            <!-- Add winner logic here if you want -->
          </td>
          <td>{{ game.status }}</td>
          <td>
            <router-link :href="`/game/${game.id}/summary`" class="text-blue-400 underline">View</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({ games: Array })
import AppLayout from '@/layouts/AppLayout.vue';
defineOptions({ layout: AppLayout });
</script>