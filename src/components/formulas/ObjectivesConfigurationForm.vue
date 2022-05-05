<template>
  <div>
    <v-row
      v-for="(objectiveConfiguration, objectiveConfigurationIdx) in objectiveConfigurations"
      :key="objectiveConfigurationIdx"
      cols="auto"
    >
      <v-col cols="4">{{objectiveConfiguration.objective.name}}</v-col>
      <v-col cols="4">
        <v-slider
          v-model="objectiveConfiguration.weight"
          vertical
          min="0"
          max="100"
          thumb-label="always"
        >
          <template v-slot:thumb-label="{ value }">{{ value }}%</template>
        </v-slider>
      </v-col>
      <v-col cols="4">
        <v-checkbox v-model="objectiveConfiguration.required" label="required"></v-checkbox>
      </v-col>
    </v-row>
  </div>
</template>
<script>
export default {
  name: "ObjectivesConfigurationForm",
  props: {
    objectiveConfigurations: {
      type: Array,
      required: true
    }
  },
  setup() {
    return {};
  }
};
</script>
