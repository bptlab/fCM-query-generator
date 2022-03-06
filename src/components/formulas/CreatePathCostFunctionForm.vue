<template>
  <v-card>
    <v-card-title>
      Create a new Path Cost Function
      <v-spacer />
      <v-icon size="24" @click="$emit('close')">close</v-icon>
    </v-card-title>
    <v-card-text>
      <div>
        <v-text-field v-model="newFunction.name" label="Name" />
      </div>
      <div class="my-2">
        <div>Select a cost for the path's length</div>
        <v-radio-group v-model="newFunction.length" row class="mt-0 pt-0 mb-n8">
          <v-radio v-for="n in ['none', 'length', 'squared']" :key="n" :label="n" :value="n"></v-radio>
        </v-radio-group>
      </div>
      <div class="mt-8">
        <div>Select a cost for each executed activity</div>
      </div>
      <div class="mt-8">
        <div>Select a cost for each existing data object</div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn text @click="$emit('close')">Abort</v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="blue-grey"
        class="white--text"
        min-width="200"
        :disabled="!newFunction.name"
        @click="onSave"
      >Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { ref, toRefs, watch } from "@vue/composition-api";

export default {
  name: "CreatePathCostFunctionForm",
  props: {
    id: {
      type: Number,
      required: true
    },
    dataObjects: {
      type: Array,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    },
    pathCostFunctions: {
      type: Array,
      required: true
    }
  },
  setup(props, context) {
    const { pathCostFunctions, id } = toRefs(props);

    const showDialog = ref(false);

    const getIinitialPathCostFunction = () => {
      return {
        name: `Path Cost Function ${id.value + 1}`,
        length: "none"
      };
    };

    const newFunction = ref(getIinitialPathCostFunction());

    watch(
      pathCostFunctions,
      () => {
        newFunction.value = getIinitialPathCostFunction();
      },
      { deep: true }
    );

    const onSave = () => {
      context.emit("created", newFunction.value);
      showDialog.value = false;
      newFunction.value = getIinitialPathCostFunction();
    };

    return {
      showDialog,
      onSave,
      newFunction
    };
  }
};
</script>
