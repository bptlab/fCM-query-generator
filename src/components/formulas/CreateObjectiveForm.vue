<template>
  <v-card>
    <v-card-title class="pa-2 pb-0">
      Create a new Objective
      <v-spacer />
      <v-icon size="24" @click="$emit('close')">close</v-icon>
    </v-card-title>
    <v-card-text class="px-2 pb-0">
      <div>
        <v-text-field v-model="newObjective.name" label="Name" />
      </div>
      <v-card-text class="pb-0 pt-1 px-2">
        <div v-for="(condition, conditionIdx) in newObjective.conditions" :key="conditionIdx">
          <v-row align="center">
            <v-col cols="1">
              <v-card flat>
                <v-checkbox v-model="condition.not" label="NOT"></v-checkbox>
              </v-card>
            </v-col>
            <v-col cols="11" class="py-1">
              <v-card>
                <div class="pa-2 pb-0 d-flex">
                  <h3>Condition {{conditionIdx + 1}}</h3>
                  <v-spacer />
                  <v-radio-group
                    v-model="condition.type"
                    row
                    class="mt-0 pt-0 mb-n8"
                    @change="condition.selectedDataObjectState = null; condition.selectedActivity = null"
                  >
                    <v-radio
                      v-for="n in ['DATA_OBJECT', 'ACTIVITY']"
                      :key="n"
                      :label="`type: ${n}`"
                      :value="n"
                    ></v-radio>
                  </v-radio-group>
                </div>
                <v-card-text class="pa-2" v-if="condition.type === 'DATA_OBJECT'" flat outlined>
                  <v-row class="pt-2">
                    <v-col cols="7">
                      <h4>Choose the desired Data Object State:</h4>
                      <v-select
                        v-model="condition.selectedDataObjectState"
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
                    <v-col cols="3">
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
                <v-card-text
                  class="pa-2 pb-0"
                  v-else-if="condition.type === 'ACTIVITY'"
                  flat
                  outlined
                >
                  <h4 class="pt-2">Choose the desired enabled Activity:</h4>
                  <v-select
                    v-model="condition.selectedActivity"
                    outlined
                    clearable
                    :items="taskInputs"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div v-if="newObjective.logicConcatenations[conditionIdx]" class="d-flex">
            <v-spacer></v-spacer>
            <v-radio-group
              v-model="newObjective.logicConcatenations[conditionIdx]"
              class="py-0"
              row
            >
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
    </v-card-text>
    <v-card-actions class="px-2">
      <v-btn text @click="$emit('close')">Abort</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="blue-grey" class="white--text" min-width="200" @click="onSave">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { ref, toRefs, watch } from "@vue/composition-api";
import { copy } from "../../utils/main";

export default {
  name: "CreateObjectiveForm",
  props: {
    id: {
      type: Number,
      required: true
    },
    objective: {
      type: Object,
      default: null
    },
    dataObjects: {
      type: Array,
      required: true
    },
    activities: {
      type: Array,
      required: true
    }
  },
  setup(props, context) {
    const { dataObjects, activities, id, objective } = toRefs(props);

    const getIinitialObjective = () => {
      return {
        name: `Objective ${id.value + 1}`,
        conditions: [getInitialCondition()],
        logicConcatenations: []
      };
    };

    const newObjective = ref(getIinitialObjective());

    const dataObjectStateInputs = ref([]);

    watch(
      objective,
      () => {
        if (objective.value) newObjective.value = copy(objective.value);
        else newObjective.value = getIinitialObjective();
      },
      { immediate: true }
    );

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
      { deep: true, immediate: true }
    );

    const taskInputs = ref([]);

    watch(
      activities,
      () => {
        taskInputs.value = [];
        activities.value.forEach(activity => {
          taskInputs.value.push(activity.name);
        });
      },
      { deep: true, immediate: true }
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
        selectedActivity: null
      };
    }

    function onAddCondition() {
      newObjective.value.conditions.push(getInitialCondition());
      newObjective.value.logicConcatenations.push("andalso");
    }

    const onSave = () => {
      context.emit("created", newObjective.value);
      newObjective.value = {
        name: `Objective ${id.value + 2}`,
        conditions: [getInitialCondition()],
        logicConcatenations: []
      };
    };

    return {
      dataObjectStateInputs,
      taskInputs,
      onSave,
      newObjective,
      onAddCondition
    };
  }
};
</script>
