<template>
  <v-card flat width="400">
    <div class="d-flex px-4 pt-2">
      <v-card-title class="pa-0">File Upload</v-card-title>
    </div>
    <v-card-text class="pt-0">
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
