<template>
  <div>
    <div v-if="showFCMUpload">
      <file-input-card @fCMUploaded="onFCMUploaded" />
      <input-overview-card :data-objects="dataObjects" :activities="activities" />
    </div>
    <manual-input-card
      v-else
      :data-objects="dataObjects"
      :activities="activities"
      @addActivity="addActivity"
      @addState="(doIdx) => addState(doIdx)"
      @addDataObject="addDataObject"
      @dataObjectChanged="(doIdx, newVars) => dataObjectChanged(doIdx, newVars)"
      @activityChanged="(tIdx, newVars) => onActivityChanged(tIdx, newVars)"
    />
    <v-divider class="mx-4 my-2" color="black" />
    <objectives-card :data-objects="dataObjects" :activities="activities" :objectives="objectives" />
    <v-divider class="mx-4 my-2" color="grey" />
    <path-cost-functions-card
      :data-objects="dataObjects"
      :activities="activities"
      :path-cost-functions="pathCostFunctions"
    />
    <v-divider class="mx-4 my-2" color="grey" />
    <queries-card
      :data-objects="dataObjects"
      :activities="activities"
      :objectives="objectives"
      :path-cost-functions="pathCostFunctions"
    />
  </div>
</template>
<script>
import ObjectivesCard from "./formulas/ObjectivesCard.vue";
import QueriesCard from "./formulas/QueriesCard.vue";
import PathCostFunctionsCard from "./formulas/PathCostFunctionsCard.vue";
import FileInputCard from "./input/FileInputCard.vue";
import ManualInputCard from "./input/ManualInputCard.vue";
import InputOverviewCard from "./input/InputOverviewCard.vue";
import { ref } from "@vue/composition-api";
import xml2js from "xml2js";

export default {
  components: {
    QueriesCard,
    ObjectivesCard,
    FileInputCard,
    ManualInputCard,
    InputOverviewCard,
    PathCostFunctionsCard
  },
  setup() {
    const dataObjects = ref([]);

    const activities = ref([]);

    // The indicator if the user should use the fCM upload as input.
    const showFCMUpload = ref(true);

    const objectives = ref([]);

    const pathCostFunctions = ref([]);

    return {
      dataObjects,
      activities,
      objectives,
      pathCostFunctions,
      showFCMUpload,
      ...useManualInput(activities, dataObjects),
      ...useFCMUpload(activities, dataObjects)
    };
  }
};

function useManualInput(activities, dataObjects) {
  function addDataObject() {
    dataObjects.value.push({
      id: dataObjects.value.length,
      name: `Data Object ${dataObjects.value.length + 1}`,
      states: [{ id: 0, name: "State 1" }]
    });
  }

  function addState(doIdx) {
    const dataObject = dataObjects.value[doIdx];
    const newStateId = dataObject.states.length + 1;
    dataObject.states.push({
      id: newStateId,
      name: `State ${newStateId}`
    });
  }

  function addActivity() {
    activities.value.push({
      id: activities.value.length,
      name: `Activity ${activities.value.length + 1}`
    });
  }

  function onDataObjectChanged(doIdx, newVars) {
    dataObjects.value[doIdx] = newVars;
  }

  function onActivityChanged(tIdx, newVars) {
    activities.value[tIdx] = newVars;
  }

  return {
    addDataObject,
    addState,
    addActivity,
    onDataObjectChanged,
    onActivityChanged
  };
}

function useFCMUpload(activities, dataObjects) {
  function onFCMUploaded(fCMInput) {
    if (!fCMInput) return;

    var reader = new FileReader();

    reader.readAsText(fCMInput);
    reader.onload = () => {
      xml2js.parseString(reader.result, function(err, result) {
        const processElements = result.definitions.process[0];
        const uploadedDataObjects = [];
        processElements.dataObject.forEach((dataObject, dataObjectIdx) => {
          let existingClass = uploadedDataObjects.find(
            oldClass => oldClass.name === dataObject.$.name.replace("\n", "")
          );
          if (!existingClass) {
            existingClass = {
              id: dataObjectIdx,
              name: dataObject.$.name.replace("\n", ""),
              states: []
            };
            uploadedDataObjects.push(existingClass);
          }
          const dataObjectStates = processElements.dataObjectReference
            .filter(reference => reference.$.dataObjectRef === dataObject.$.id)
            .map((reference, referenceIdx) => ({
              id: referenceIdx,
              name: reference.dataState[0].$.name
                .replace("[", "")
                .replace("]", "")
                .replaceAll("\n", " ")
            }));
          dataObjectStates.forEach(dataObjectState => {
            if (
              !existingClass.states.find(
                existingState => existingState.name === dataObjectState.name
              )
            ) {
              existingClass.states.push(dataObjectState);
            }
          });
        });
        dataObjects.value = uploadedDataObjects;
        const uploadedActivities = processElements.task.map(
          (activity, activityIdx) => {
            let inputOutputCombinations = 0;
            activity.ioSpecification[0].inputSet.forEach(inputSet => {
              inputOutputCombinations += inputSet.outputSetRefs.length;
            });
            return {
              id: activityIdx,
              name: activity.$.name.replaceAll("\n", " "),
              inputOutputCombinations
            };
          }
        );
        activities.value = uploadedActivities;
      });
    };
  }

  return {
    onFCMUploaded
  };
}
</script>
