<template>
  <div>
    <h2>Game between {{ game.player1 }} and {{ game.player2 }}</h2>
    <pre>{{ game }}</pre>
    <!-- Display game state, buttons for actions, etc. -->
  </div>
</template>

<script setup>
defineProps({
  game: Object
})
</script>