<template>
  <div>
    <v-dialog v-model="showQueryDialog" width="1000" persistent>
      <create-query-form
        :objectives="objectives"
        :path-cost-functions="pathCostFunctions"
        :data-objects="dataObjects"
        :activities="activities"
        :id="queries.length"
        @created="(query) => onAdded(query)"
        @close="showQueryDialog = false"
      />
    </v-dialog>
    <v-card flat>
      <v-card-title>
        Your State Space Queries
        <v-spacer />
        <v-btn
          color="blue-grey"
          class="white--text"
          :disabled="!objectives.length || !pathCostFunctions.length"
          @click="onAddNew"
        >Create new</v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="(query, qIdx) in queries" :key="qIdx" flat cols="6">
            <v-textarea
              outlined
              height="400"
              :name="`query_${qIdx}`"
              :label="query.name"
              :value="query.formula"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import CreateQueryForm from "./CreateQueryForm.vue";
import { ref } from "@vue/composition-api";

export default {
  components: { CreateQueryForm },
  props: {
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
  setup() {
    const showQueryDialog = ref(false);

    const queries = ref([]);

    const onAdded = query => {
      queries.value.push(query);
      showQueryDialog.value = false;
    };

    const onAddNew = () => {
      showQueryDialog.value = true;
    };

    return { showQueryDialog, queries, onAdded, onAddNew };
  }
};
</script>
