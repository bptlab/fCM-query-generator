<template>
  <v-card class="ma-4 mr-0" outlined min-height="250" width="200">
    <v-card-title class="pb-0">
      <v-text-field v-model="variables.name" label="Data Object Name" />
    </v-card-title>
    <v-card-text class="pb-2">
      <h3>States</h3>
      <div v-for="(state, stateIdx) in variables.states" :key="stateIdx">
        <v-text-field class="pa-0 ma-0" v-model="state.name" />
      </div>
      <v-card-actions class="justify-center py-0">
        <v-btn icon color="blue-grey" @click="addState">
          <v-icon>add_box</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>
<script>
import { ref, toRefs, watch } from "@vue/composition-api";
export default {
  props: {
    dataObject: Object,
    default: {}
  },
  setup(props, context) {
    const { dataObject } = toRefs(props);
    const variables = ref(dataObject.value);
    function addState() {
      context.emit("addState");
    }

    watch(variables, () => {
      context.emit("variablesChanged", variables);
    });

    return {
      variables,
      addState
    };
  }
};
</script>
