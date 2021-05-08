<template>
  <v-card class="ma-4 mr-0" outlined height="90" width="150">
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col>
          <h3 class="black--text text-center">{{ task.name }}</h3>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<script>
export default {
  props: {
    task: Object,
    default: {}
  },
  setup() {}
};
</script>
