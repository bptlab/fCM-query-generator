<template>
  <v-dialog v-model="showDialog" width="800" persistent>
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="blue-grey" v-bind="attrs" v-on="on" class="white--text">Create new</v-btn>
    </template>
    <v-card>
      <v-card-title>
        Create a new Objective
        <v-spacer />
        <v-icon size="24" @click="showDialog = false">close</v-icon>
      </v-card-title>
      <v-card-text class="pb-0">
        <div>
          <v-text-field v-model="newFormula.name" label="Name" clearable />
        </div>
        <v-card flat outlined>
          <div class="pa-4 pb-0 d-flex">
            <h3>State 1</h3>
            <v-spacer />
            <v-icon>delete</v-icon>
          </div>
          <v-card-text class="pb-0 pt-2">
            <div>
              <h4 class="py-2">Choose the desired Data Object States:</h4>
              <v-select
                v-model="selectedDataObjectStates"
                label="Data Object States"
                outlined
                multiple
                clearable
                :items="dataObjectStateInputs"
              >
                <template slot="selection" slot-scope="data">
                  <v-chip>{{ data.item.name }} [{{ data.item.state }}]</v-chip>
                </template>
                <template slot="item" slot-scope="data">
                  <v-checkbox :value="selectedDataObjectStates.includes(data.item)" />
                  {{ data.item.name }} [{{ data.item.state}}]
                </template>
              </v-select>
            </div>
            <div>
              <h4 class="py-2">Choose Tasks that should be enabled:</h4>
              <v-select
                v-model="selectedTasks"
                label="Tasks"
                outlined
                multiple
                chips
                clearable
                :items="taskInputs"
              />
            </div>
          </v-card-text>
        </v-card>
        <v-divider class="mt-4" color="grey" />
        <h3 class="py-2">The resulting ASK-CTL formula:</h3>
        <v-textarea
          v-model="newFormula.formula"
          outlined
          :name="`new_formula`"
          :label="newFormula.name"
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="showDialog = false">Abort</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-grey" class="white--text" min-width="200" @click="onSave">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref, toRefs, watch } from "@vue/composition-api";
import { compileAskCTLFormula } from "../../compiler/compiler";
export default {
  name: "CreateFormulaForm",
  props: {
    id: {
      type: Number,
      default: 0
    },
    dataObjects: {
      type: Array,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    }
  },
  setup(props, context) {
    const { dataObjects, tasks, id } = toRefs(props);

    const showDialog = ref(false);

    const getIinitialValues = () => {
      return {
        name: `Objective ${id.value + 1}`,
        formula: `-`
      };
    };

    const newFormula = ref(getIinitialValues());

    const dataObjectStateInputs = ref([]);

    watch(
      dataObjects,
      () => {
        dataObjectStateInputs.value = [];
        dataObjects.value.forEach(dataObject => {
          dataObject.states.forEach(state => {
            dataObjectStateInputs.value.push({
              name: dataObject.name,
              state: state.name
            });
          });
        });
      },
      { deep: true }
    );

    const taskInputs = ref([]);

    watch(
      tasks,
      () => {
        taskInputs.value = [];
        tasks.value.forEach(task => {
          taskInputs.value.push(task.name);
        });
      },
      { deep: true }
    );

    const onSave = () => {
      context.emit("created", newFormula.value);
      showDialog.value = false;
      newFormula.value = getIinitialValues();
    };

    const selectedDataObjectStates = ref([]);

    const selectedTasks = ref([]);

    watch([selectedDataObjectStates, selectedTasks], () => {
      newFormula.value.formula = compileAskCTLFormula(
        newFormula.value.name,
        selectedDataObjectStates.value,
        selectedTasks.value
      );
    });

    return {
      showDialog,
      dataObjectStateInputs,
      taskInputs,
      selectedDataObjectStates,
      selectedTasks,
      onSave,
      newFormula
    };
  }
};
</script>
