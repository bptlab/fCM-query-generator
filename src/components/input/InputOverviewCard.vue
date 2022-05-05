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
      <div v-if="activities.length" class="d-flex">
        <activity v-for="(activity, aIdx) in activities" :key="aIdx" :activity="activity" />
      </div>
      <div v-else class="pa-4 pb-8">No Activities available. Please upload an fCM with Activities</div>
    </v-card-text>
  </v-card>
</template>
<script>
import DataObject from "./DataObject.vue";
import Activity from "./Activity.vue";

export default {
  components: { DataObject, Activity },
  props: {
    dataObjects: {
      type: Array,
      required: true
    },
    activities: {
      type: Array,
      required: true
    }
  }
};
</script>
