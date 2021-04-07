<template>
  <div>
    <file-input-card v-if="useFileInput" />
    <manual-input-card
      v-else
      :data-objects="dataObjects"
      :tasks="tasks"
      @addTask="addTask"
      @addState="(doIdx) => addState(doIdx)"
      @addDataObject="addDataObject"
      @dataObjectChanged="(doIdx, newVars) => dataObjectChanged(doIdx, newVars)"
      @taskChanged="(tIdx, newVars) => taskChanged(tIdx, newVars)"
    />
    <v-divider class="mx-4 my-2" color="grey" />
    <formula-card :data-objects="dataObjects" :tasks="tasks" />
  </div>
</template>
<script>
import FormulaCard from "./formulas/FormulaCard.vue";
import FileInputCard from "./input/FileInputCard.vue";
import ManualInputCard from "./input/ManualInputCard.vue";
import { ref } from "@vue/composition-api";

export default {
  components: { FormulaCard, FileInputCard, ManualInputCard },
  setup() {
    const dataObjects = ref([]);
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

    const tasks = ref([]);
    function addTask() {
      tasks.value.push({
        id: tasks.value.length,
        name: `Task ${tasks.value.length + 1}`
      });
    }

    function onDataObjectChanged(doIdx, newVars) {
      dataObjects.value[doIdx] = newVars;
    }

    function onTaskChanged(tIdx, newVars) {
      tasks.value[tIdx] = newVars;
    }

    // For now this feature is disabled. In the future it should be possible to upload files for the fragments and for the DO classes.
    const useFileInput = ref(false);

    return {
      useFileInput,
      dataObjects,
      addDataObject,
      addState,
      tasks,
      addTask,
      onDataObjectChanged,
      onTaskChanged
    };
  }
};
</script>
