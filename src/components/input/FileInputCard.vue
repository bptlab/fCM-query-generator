<template>
  <v-card class="ma-4">
    <v-card-title>Model-Input</v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <v-file-input accept="*.bpmn" label="fCM-Input" />
        </v-col>
        <v-col>
          <v-file-input accept="*.uml" label="UML-Input" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: "FormulasCard",
  setup() {
    return {};
  },
};
</script>
