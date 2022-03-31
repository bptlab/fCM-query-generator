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
          v-model="selectedObjectives"
          :items="displayedObjectives"
          :menu-props="{ maxHeight: '400' }"
          label="Objectives"
          multiple
        ></v-select>
      </div>
      <objectives-configuration-form :objective-configurations="newQuery.objectiveConfigs" />
      <div>
        <v-select
          v-model="newQuery.pathCostFunction"
          :items="displayedPathCostFunctions"
          :menu-props="{ maxHeight: '400' }"
          label="Path Cost Function"
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
        :disabled="!newQuery.objectiveConfigs.length || !newQuery.pathCostFunction"
        @click="onSave"
      >Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { ref, toRefs, watch, computed } from "@vue/composition-api";
import { copmileStateSpaceQuery } from "../../compiler/compiler";
import ObjectivesConfigurationForm from "./ObjectivesConfigurationForm.vue";

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
    activities: {
      type: Array,
      required: true
    },
    objectives: {
      type: Array,
      required: true
    },
    pathCostFunctions: {
      type: Array,
      required: true
    }
  },
  components: { ObjectivesConfigurationForm },
  setup(props, context) {
    const {
      objectives,
      pathCostFunctions,
      id,
      dataObjects,
      activities
    } = toRefs(props);

    const showDialog = ref(false);

    const selectedObjectives = ref([]);

    watch(selectedObjectives, () => {
      newQuery.value.objectiveConfigs = selectedObjectives.value.map(
        selectedObjective => ({
          objective: selectedObjective,
          weight: 100,
          required: true
        })
      );
    });

    const getIinitialQuery = () => {
      return {
        name: `Query ${id.value + 1}`,
        initialState: 1,
        objectiveConfigs: [],
        pathCostFunction: null,
        formula: "-"
      };
    };

    const newQuery = ref(getIinitialQuery());

    watch(
      [objectives, pathCostFunctions],
      () => {
        newQuery.value = getIinitialQuery();
      },
      { deep: true }
    );

    const onSave = () => {
      const newFormula = copmileStateSpaceQuery(
        newQuery.value,
        dataObjects.value,
        activities.value
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

    const displayedPathCostFunctions = computed(() =>
      pathCostFunctions.value.map(costFunction => ({
        text: costFunction.name,
        value: costFunction
      }))
    );

    return {
      showDialog,
      displayedObjectives,
      displayedPathCostFunctions,
      onSave,
      selectedObjectives,
      newQuery
    };
  }
};
</script>
