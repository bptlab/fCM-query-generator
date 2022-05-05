<template>
  <v-card flat>
    <div class="d-flex px-4 pt-2">
      <v-card-title class="pa-0">Data Object Input</v-card-title>
      <v-spacer></v-spacer>
      <v-btn class="pa-4" icon size="30" color="blue-grey" @click="$emit('addDataObject')">
        <v-icon>add_box</v-icon>
      </v-btn>
    </div>
    <v-card-text class="pa-0">
      <div class="d-flex">
        <data-object-input
          v-for="(dataObject, doIdx) in dataObjects"
          :key="doIdx"
          :data-object="dataObject"
          @addState="$emit('addState', doIdx)"
          @variablesChanged="
              (newVars) => $emit('dataObjectChanged', doIdx, newVars)
            "
        />
      </div>
    </v-card-text>
    <div class="d-flex px-4 pt-2">
      <v-card-title class="pa-0">Activity Input</v-card-title>
      <v-spacer></v-spacer>
      <v-btn class="pa-4" icon size="30" color="blue-grey" @click="$emit('addTask')">
        <v-icon>add_box</v-icon>
      </v-btn>
    </div>
    <v-card-text class="pa-0">
      <div class="d-flex">
        <task-input
          v-for="(task, tIdx) in tasks"
          :key="tIdx"
          :task="task"
          @variablesChanged="
              (newVars) => $emit('taskChanged', tIdx, newVars)
            "
        />
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
import DataObjectInput from "./DataObjectInput.vue";
import TaskInput from "./TaskInput.vue";

export default {
  components: { DataObjectInput, TaskInput },
  props: {
    dataObjects: {
      type: Array,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    }
  }
};
</script>
