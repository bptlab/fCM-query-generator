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
        <div class="text-h6">Path Length</div>
        <div>How should the length of the path be weighted?</div>
        <v-radio-group v-model="newFunction.length.weight" row class="mt-0 pt-0 mb-n8">
          <v-radio v-for="n in ['none', 'length', 'squared']" :key="n" :label="n" :value="n"></v-radio>
        </v-radio-group>
        <div
          class="mt-8"
        >Should the path length's cost be added to or multiplied with the other costs?</div>
        <v-radio-group v-model="newFunction.length.concatenation" row class="mt-0 pt-0 mb-n8">
          <v-radio v-for="n in ['addition', 'multiplication']" :key="n" :label="n" :value="n"></v-radio>
        </v-radio-group>
      </div>
      <div class="mt-8">
        <div class="text-h6">Activity Costs</div>
        <div>Select a cost for each executed activity</div>
        <v-row cols="auto">
          <v-col v-for="activity in newFunction.activityCosts" :key="activity.name" cols="2">
            <v-text-field v-model="activity.value" type="number" :label="activity.name"></v-text-field>
          </v-col>
        </v-row>
      </div>
      <div>
        <div class="text-h6">Data Object Costs</div>
        <div>Select a cost for each existing data object in a specific state</div>
        <v-row cols="auto">
          <v-col
            v-for="(object, objectIdx) in newFunction.dataObjectCosts"
            :key="objectIdx"
            cols="2"
          >
            <v-text-field v-model="object.value" type="number" :label="`${object.dataObject}`"></v-text-field>
          </v-col>
        </v-row>
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
import { copy } from "../../utils/main";

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
    activities: {
      type: Array,
      required: true
    },
    pathCostFunction: {
      type: Object,
      default: null
    }
  },
  setup(props, context) {
    const { pathCostFunction, id, activities, dataObjects } = toRefs(props);

    const showDialog = ref(false);

    const getIinitialPathCostFunction = () => {
      return {
        name: `Path Cost Function ${id.value + 1}`,
        length: { weight: "length", concatenation: "addition" },
        activityCosts: activities.value.map(activity => ({
          name: activity.name,
          value: 0
        })),
        dataObjectCosts: dataObjects.value.map(dataObject => ({
          dataObject: dataObject.name,
          value: 0
        }))
      };
    };

    const newFunction = ref(getIinitialPathCostFunction());

    watch(
      [pathCostFunction, id],
      () => {
        if (pathCostFunction.value)
          newFunction.value = copy(pathCostFunction.value);
        else newFunction.value = getIinitialPathCostFunction();
      },
      { immediate: true }
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
