<template>
  <v-card class="ma-4 mr-0" outlined height="120" width="200">
    <v-card-text class="pb-2">
      <h3 class="black--text">
        {{ task.name }}
      </h3>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  props: {
    task: Object,
    default: {},
  },
  setup() {},
};
</script>
