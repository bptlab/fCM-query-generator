<template>
  <v-card class="ma-4 mr-0" outlined min-height="200" width="150">
    <v-card-text class="pb-2">
      <h3 class="black--text pb-4 text-center">{{ dataObject.name }}</h3>
      <div class="text-center">{{ stateString }}</div>
    </v-card-text>
  </v-card>
</template>
<script>
import { toRefs, computed } from "@vue/composition-api";
export default {
  props: {
    dataObject: Object,
    default: {}
  },
  setup(props) {
    const { dataObject } = toRefs(props);
    const stateString = computed(() => {
      if (!dataObject.value.states.length)
        return "This Data Object has no states.";

      const states = `${dataObject.value.states.map(state => state.name)}`;

      return `[ ${states.replaceAll(",", " | ")} ]`;
    });
    return { stateString };
  }
};
</script>
