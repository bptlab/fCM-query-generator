<template>
  <div>
    <v-dialog v-model="showFunctionDialog" width="1000" persistent>
      <create-path-cost-function-form
        :path-cost-functions="pathCostFunctions"
        :data-objects="dataObjects"
        :tasks="tasks"
        :id="pathCostFunctions.length"
        @created="(pathCostFunction) => onAdded(pathCostFunction)"
        @close="showFunctionDialog = false"
      />
    </v-dialog>
    <v-card flat>
      <v-card-title>
        Your Path Cost Functions
        <v-spacer />
        <v-btn color="blue-grey" class="white--text" @click="onAddNew">Create new</v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="(pathCostFunction, oIdx) in pathCostFunctions" :key="oIdx" flat cols="3">
            <v-card @click="onEdit(pathCostFunction, oIdx)">
              <v-card-title>{{pathCostFunction.name}}</v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import CreatePathCostFunctionForm from "./CreatePathCostFunctionForm.vue";
import { ref, toRefs } from "@vue/composition-api";
import { copy } from "../../utils/main";

export default {
  components: { CreatePathCostFunctionForm },
  props: {
    dataObjects: {
      type: Array,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    },
    pathCostFunctions: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const { pathCostFunctions } = toRefs(props);

    const showFunctionDialog = ref(false);

    const newFunction = ref(null);

    const editedFunction = ref(null);

    const onAddNew = () => {
      newFunction.value = null;
      editedFunction.value = null;
      showFunctionDialog.value = true;
    };

    const onEdit = (pathCostFunction, oIdx) => {
      newFunction.value = pathCostFunction;
      editedFunction.value = oIdx;
      showFunctionDialog.value = true;
    };

    const onAdded = pathCostFunction => {
      if (editedFunction.value === null)
        pathCostFunctions.value.push(copy(pathCostFunction));
      else pathCostFunctions.value[editedFunction.value] = pathCostFunction;
      showFunctionDialog.value = false;
    };

    return {
      showFunctionDialog,
      newFunction,
      onAddNew,
      onAdded,
      onEdit
    };
  }
};
</script>
