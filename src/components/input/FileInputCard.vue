<template>
  <v-card flat>
    <v-card-text>
      <v-file-input v-model="fCMInput" accept="*.bpmn" label="fCM-Input" />
    </v-card-text>
  </v-card>
</template>
<script>
import { watch, ref } from "@vue/composition-api";

export default {
  name: "FileInputCard",
  setup(props, context) {
    const fCMInput = ref(null);

    watch(fCMInput, () => {
      if (!fCMInput) return;
      context.emit("fCMUploaded", fCMInput.value);
    });

    return {
      fCMInput,
    };
  },
};
</script>
