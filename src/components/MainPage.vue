<template>
  <div>
    <file-input-card @fCMUploaded="onFCMUploaded" />
    <manual-input-card
      v-if="useManualInput"
      :data-objects="dataObjects"
      :tasks="tasks"
      @addTask="addTask"
      @addState="(doIdx) => addState(doIdx)"
      @addDataObject="addDataObject"
      @dataObjectChanged="(doIdx, newVars) => dataObjectChanged(doIdx, newVars)"
      @taskChanged="(tIdx, newVars) => taskChanged(tIdx, newVars)"
    />
    <input-overview-card v-else :data-objects="dataObjects" :tasks="tasks" />
    <v-divider class="mx-4 my-2" color="grey" />
    <formula-card :data-objects="dataObjects" :tasks="tasks" />
  </div>
</template>
<script>
import FormulaCard from "./formulas/FormulaCard.vue";
import FileInputCard from "./input/FileInputCard.vue";
import ManualInputCard from "./input/ManualInputCard.vue";
import InputOverviewCard from "./input/InputOverviewCard.vue";
import { ref } from "@vue/composition-api";
import xml2js from "xml2js";

export default {
  components: {
    FormulaCard,
    FileInputCard,
    ManualInputCard,
    InputOverviewCard,
  },
  setup() {
    const dataObjects = ref([]);
    function addDataObject() {
      dataObjects.value.push({
        id: dataObjects.value.length,
        name: `Data Object ${dataObjects.value.length + 1}`,
        states: [{ id: 0, name: "State 1" }],
      });
    }
    function addState(doIdx) {
      const dataObject = dataObjects.value[doIdx];
      const newStateId = dataObject.states.length + 1;
      dataObject.states.push({
        id: newStateId,
        name: `State ${newStateId}`,
      });
    }

    const tasks = ref([]);
    function addTask() {
      tasks.value.push({
        id: tasks.value.length,
        name: `Task ${tasks.value.length + 1}`,
      });
    }

    function onDataObjectChanged(doIdx, newVars) {
      dataObjects.value[doIdx] = newVars;
    }

    function onTaskChanged(tIdx, newVars) {
      tasks.value[tIdx] = newVars;
    }

    // The indicator if the user should use the manual input. In favour of bpmn upload, this is disabled
    const useManualInput = ref(false);

    function onFCMUploaded(fCMInput) {
      if (!fCMInput) return;

      var reader = new FileReader();

      reader.readAsText(fCMInput);
      reader.onload = () => {
        xml2js.parseString(reader.result, function(err, result) {
          const processElements = result.definitions.process[0];
          console.log(processElements);
          const uploadedDataObjects = processElements.dataObject.map(
            (dataObject, dataObjectIdx) => ({
              id: dataObjectIdx,
              name: dataObject.$.name,
              states: processElements.dataObjectReference
                .filter(
                  (reference) => reference.$.dataObjectRef === dataObject.$.id
                )
                .map((reference, referenceIdx) => ({
                  id: referenceIdx,
                  name: reference.dataState[0].$.name
                    .replace("[", "")
                    .replace("]", "")
                    .replaceAll("\n", " "),
                })),
            })
          );
          dataObjects.value = uploadedDataObjects;
          console.log(uploadedDataObjects);
          const uploadedTasks = processElements.task.map((task, taskIdx) => ({
            id: taskIdx,
            name: task.$.name.replaceAll("\n", " "),
          }));
          tasks.value = uploadedTasks;
        });
      };
    }

    return {
      dataObjects,
      addDataObject,
      addState,
      tasks,
      addTask,
      onDataObjectChanged,
      onTaskChanged,
      onFCMUploaded,
      useManualInput,
    };
  },
};
</script>
