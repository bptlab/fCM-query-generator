<template>
  <div>
    <v-row cols="auto" class="pr-6">
      <v-col
      v-for="(objectiveConfiguration, objectiveConfigurationIdx) in objectiveConfigurations"
      :key="objectiveConfigurationIdx"
      class="py-4"
      >
      <v-row cols="auto" justify="space-between">
        <v-col class="text-body-1 font-weight-bold pt-5">{{objectiveConfiguration.objective.name}}</v-col>
        <v-col class="pa-0">  <v-checkbox v-model="objectiveConfiguration.required" label="required"></v-checkbox> </v-col>
      </v-row>
      <v-row>
        <v-slider
          v-model="objectiveConfiguration.weight"
          class="pt-8 pr-8 pl-2"
          horizontal
          min="0"
          max="100"
          thumb-label="always"
        >
          <template v-slot:thumb-label="{ value }">{{ value }}%</template>
        </v-slider>
      </v-row>
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
