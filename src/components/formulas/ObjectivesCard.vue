<template>
  <div>
    <v-dialog v-model="showObjectiveDialog" width="1000" persistent>
      <create-objective-form
        :objective="newObjective"
        :data-objects="dataObjects"
        :activities="activities"
        :id="objectives.length"
        @created="(objective) => onAdded(objective)"
        @close="showObjectiveDialog = false"
      />
    </v-dialog>
    <v-card flat>
      <v-card-title>
        Your Objectives
        <v-spacer />
        <v-btn
          color="blue-grey"
          class="white--text"
          :disabled="!activities.length"
          @click="onAddNew"
        >Create new</v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="(objective, oIdx) in objectives" :key="oIdx" flat cols="3">
            <v-card @click="onEdit(objective, oIdx)">
              <v-card-title>{{objective.name}}</v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import CreateObjectiveForm from "./CreateObjectiveForm.vue";
import { ref, toRefs } from "@vue/composition-api";
import { copy } from "../../utils/main";

export default {
  components: { CreateObjectiveForm },
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
    }
  },
  setup(props) {
    const { objectives } = toRefs(props);

    const showObjectiveDialog = ref(false);

    const newObjective = ref(null);

    const editedObjective = ref(null);

    const onAddNew = () => {
      newObjective.value = null;
      editedObjective.value = null;
      showObjectiveDialog.value = true;
    };

    const onEdit = (objective, oIdx) => {
      newObjective.value = objective;
      editedObjective.value = oIdx;
      showObjectiveDialog.value = true;
    };

    const onAdded = objective => {
      if (editedObjective.value === null)
        objectives.value.push(copy(objective));
      else objectives.value[editedObjective.value] = objective;
      showObjectiveDialog.value = false;
    };

    return {
      showObjectiveDialog,
      newObjective,
      onAddNew,
      onAdded,
      onEdit
    };
  }
};
</script>
