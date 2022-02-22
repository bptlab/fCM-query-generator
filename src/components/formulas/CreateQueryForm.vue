<template>
  <v-card>
    <v-card-title>
      Create a new State Space Query
      <v-spacer />
      <v-icon size="24" @click="$emit('close')">close</v-icon>
    </v-card-title>
    <v-card-text>
      <div>
        <v-text-field v-model="newQuery.name" label="Name" />
      </div>
      <div>
        <v-select
          v-model="newQuery.objectives"
          :items="displayedObjectives"
          :menu-props="{ maxHeight: '400' }"
          label="Objectives"
          multiple
        ></v-select>
      </div>
      <div class="mt-4">
        <v-text-field
          v-model="newQuery.initialState"
          class="pt-0 ma-0"
          type="number"
          label="Current State"
        ></v-text-field>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn text @click="$emit('close')">Abort</v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="blue-grey"
        class="white--text"
        min-width="200"
        :disabled="!newQuery.objectives.length"
        @click="onSave"
      >Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { ref, toRefs, watch, computed } from "@vue/composition-api";
import { copmileStateSpaceQuery } from "../../compiler/compiler";

export default {
  name: "CreateQueryForm",
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
    objectives: {
      type: Array,
      required: true
    }
  },
  setup(props, context) {
    const { objectives, id, dataObjects, tasks } = toRefs(props);

    const showDialog = ref(false);

    const getIinitialQuery = () => {
      return {
        name: `Query ${id.value + 1}`,
        initialState: 1,
        objectives: [],
        pathCostFunction: null,
        formula: "-"
      };
    };

    const newQuery = ref(getIinitialQuery());

    watch(
      objectives,
      () => {
        newQuery.value = getIinitialQuery();
      },
      { deep: true }
    );

    const onSave = () => {
      const newFormula = copmileStateSpaceQuery(
        newQuery.value,
        dataObjects.value,
        tasks.value
      );
      context.emit("created", { ...newQuery.value, formula: newFormula });
      showDialog.value = false;
      newQuery.value = getIinitialQuery();
    };

    const displayedObjectives = computed(() =>
      objectives.value.map(objective => ({
        text: objective.name,
        value: objective
      }))
    );

    return {
      showDialog,
      displayedObjectives,
      onSave,
      newQuery
    };
  }
};
</script>
