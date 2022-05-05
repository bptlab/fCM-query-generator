<template>
  <v-card class="ma-4 mr-0" outlined height="120" width="200">
    <v-card-title>
      <v-text-field v-model="variables.name" label="Activity Name" />
    </v-card-title>
  </v-card>
</template>
<script>
import { ref, toRefs, watch } from "@vue/composition-api";
export default {
  props: {
    task: Object,
    default: {}
  },
  setup(props, context) {
    const { task } = toRefs(props);
    const variables = ref(task.value);

    watch(variables, () => {
      context.emit("variablesChanged", variables);
    });

    return {
      variables
    };
  }
};
</script>
