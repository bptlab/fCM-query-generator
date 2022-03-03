<template>
  <v-card flat>
    <div class="d-flex px-4 pt-2">
      <v-card-title class="pa-0">Data Objects</v-card-title>
    </div>
    <v-card-text class="pa-0">
      <div v-if="dataObjects.length" class="d-flex">
        <data-object
          v-for="(dataObject, doIdx) in dataObjects"
          :key="doIdx"
          :data-object="dataObject"
        />
      </div>
      <div
        v-else
        class="pa-4 pb-8"
      >No Data Objects available. Please upload an fCM with Data Objects</div>
    </v-card-text>
    <div class="d-flex px-4 pt-2">
      <v-card-title class="pa-0">Activities</v-card-title>
    </div>
    <v-card-text class="pa-0">
      <div v-if="tasks.length" class="d-flex">
        <task v-for="(task, tIdx) in tasks" :key="tIdx" :task="task" />
      </div>
      <div v-else class="pa-4 pb-8">No Activities available. Please upload an fCM with Activities</div>
    </v-card-text>
  </v-card>
</template>
<script>
import DataObject from "./DataObject.vue";
import Task from "./Task.vue";

export default {
  components: { DataObject, Task },
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
