<template>
  <v-app>
    <v-app-bar app color="blue-grey" dark>
      <h2 class="d-flex align-center">Objective Framework</h2>
    </v-app-bar>
    <v-main>
      <MainPage />
    </v-main>
  </v-app>
</template>

<script>
import MainPage from "./components/MainPage";

export default {
  name: "App",

  components: {
    MainPage
  },

  data: () => ({})
};
</script>
