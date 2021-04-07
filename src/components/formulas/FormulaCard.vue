<template>
  <v-card flat>
    <v-card-title>
      Your Objectives
      <v-spacer />
      <create-formula-form
        :data-objects="dataObjects"
        :tasks="tasks"
        :id="askCTLformulas.length"
        @created="(newFormula) => onAdded(newFormula)"
      />
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col v-for="(formula, fIdx) in askCTLformulas" :key="fIdx" flat cols="4">
          <v-textarea
            outlined
            :name="`formula_${fIdx}`"
            :label="formula.name"
            :value="formula.formula"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import CreateFormulaForm from "./CreateFormulaForm.vue";
import { ref } from "@vue/composition-api";

export default {
  components: { CreateFormulaForm },
  props: {
    dataObjects: {
      type: Array,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    }
  },
  setup() {
    const askCTLformulas = ref([]);

    const onAdded = newFormula => {
      askCTLformulas.value.push(copy(newFormula));
    };
    return {
      askCTLformulas,
      onAdded
    };
  }
};

function copy(object) {
  return JSON.parse(JSON.stringify(object));
}
</script>
