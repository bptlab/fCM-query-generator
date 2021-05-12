<template>
  <v-dialog v-model="showDialog" width="1000" persistent>
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
          </div>
          <v-card-text class="pb-0 pt-2">
            <div v-for="(condition, conditionIdx) in conditions" :key="conditionIdx">
              <v-row align="center">
                <v-col cols="2">
                  <v-card flat>
                    <v-checkbox v-model="condition.not" label="NOT"></v-checkbox>
                  </v-card>
                </v-col>
                <v-col cols="10">
                  <v-card>
                    <div class="pa-4 pb-0 d-flex">
                      <h3>Condition {{conditionIdx + 1}}</h3>
                      <v-spacer />
                      <v-radio-group
                        v-model="condition.type"
                        row
                        class="mt-0 pt-0 mb-n8"
                        @change="condition.selectedDataObjectState = null; condition.selectedTask = null"
                      >
                        <v-radio
                          v-for="n in ['DATA_OBJECT', 'TASK']"
                          :key="n"
                          :label="`type: ${n}`"
                          :value="n"
                        ></v-radio>
                      </v-radio-group>
                    </div>
                    <v-card-text v-if="condition.type === 'DATA_OBJECT'" flat outlined>
                      <h4 class="py-2">Choose the desired Data Object State:</h4>
                      <v-row>
                        <v-col cols="6">
                          <v-select
                            v-model="condition.selectedDataObjectState"
                            label="Data Object State"
                            outlined
                            clearable
                            :items="dataObjectStateInputs"
                          >
                            <template slot="selection" slot-scope="data">
                              <v-chip>{{ data.item.name }} [{{ data.item.state }}]</v-chip>
                            </template>
                            <template
                              slot="item"
                              slot-scope="data"
                            >{{ data.item.name }} [{{ data.item.state}}]</template>
                          </v-select>
                        </v-col>
                        <v-col cols="4">
                          <v-radio-group v-model="condition.quantor" column class="pl-4 mt-0 pt-0">
                            <v-radio
                              v-for="n in ['ALL', 'EXISTS', 'AMOUNT']"
                              :key="n"
                              :label="`quantor: ${n}`"
                              :value="n"
                            ></v-radio>
                          </v-radio-group>
                        </v-col>
                        <v-col v-if="condition.quantor === 'AMOUNT'" cols="2" class="pl-4">
                          <v-text-field
                            v-model="condition.amount.lowerBound"
                            class="pt-0 ma-0"
                            type="number"
                            label="lower bound"
                          ></v-text-field>
                          <v-text-field
                            v-model="condition.amount.upperBound"
                            class="pt-0 ma-0"
                            type="number"
                            label="upper bound"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-text v-else-if="condition.type === 'TASK'" flat outlined>
                      <h4 class="py-2">Choose the desired enabled Task:</h4>
                      <v-select
                        v-model="condition.selectedTask"
                        label="Task"
                        outlined
                        clearable
                        :items="taskInputs"
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <div v-if="logicConcatenations[conditionIdx]" class="d-flex">
                <v-spacer></v-spacer>
                <v-radio-group v-model="logicConcatenations[conditionIdx]" row>
                  <v-radio
                    v-for="operator in [{label: 'AND', value: 'andalso'}, {label: 'OR', value: 'orelse'}]"
                    :key="operator.value"
                    :label="`${operator.label}`"
                    :value="operator.value"
                  ></v-radio>
                </v-radio-group>
                <v-spacer></v-spacer>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn icon color="blue-grey" @click="onAddCondition">
              <v-icon>add_box</v-icon>
            </v-btn>
          </v-card-actions>
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

    function getInitialCondition() {
      return {
        type: "DATA_OBJECT",
        not: false,
        quantor: "ALL",
        amount: {
          lowerBound: null,
          upperBound: null
        },
        selectedDataObjectState: null,
        selectedTask: null
      };
    }

    const conditions = ref([getInitialCondition()]);

    const logicConcatenations = ref([]);

    function onAddCondition() {
      conditions.value.push(getInitialCondition());
      logicConcatenations.value.push("andalso");
    }

    const onSave = () => {
      context.emit("created", newFormula.value);
      showDialog.value = false;
      newFormula.value = getIinitialValues();
      conditions.value = [getInitialCondition()];
      logicConcatenations.value = [];
    };

    watch(
      [conditions, logicConcatenations],
      () => {
        if (
          conditions.value.find(
            condition =>
              !condition.selectedDataObjectState && !condition.selectedTask
          )
        )
          return;
        newFormula.value.formula = compileAskCTLFormula(
          newFormula.value.name,
          dataObjects.value,
          tasks.value,
          conditions.value,
          logicConcatenations.value
        );
      },
      { deep: true }
    );

    return {
      showDialog,
      dataObjectStateInputs,
      taskInputs,
      onSave,
      newFormula,
      conditions,
      logicConcatenations,
      onAddCondition
    };
  }
};
</script>
