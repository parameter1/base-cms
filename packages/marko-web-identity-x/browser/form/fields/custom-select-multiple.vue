<template>
  <fieldset :disabled="disabled" class="csmulti">
    <legend class="csmulti-legend">
      {{ label }}
      <strong v-if="required" class="text-danger">*</strong>
    </legend>

    <div class="csmulti-wrapper border p-2">
      <div class="csmulti-inner">
        <label class="text-muted">
          Select all that apply...
        </label>

        <template v-for="option in options">
          <custom-select-group
            v-if="option.options && option.options.length"
            :key="option.id"
            :label="option.label"
          >
            <checkbox-group
              :options="option.options"
              :selected="selected"
              :required="required"
              :group-id="groupId"
              :can-write-in="canWriteIn"
              :write-in-label="writeInLabel"
              :write-in-answer="writeInAnswer"
              @change="$emit('change', $event)"
            />
          </custom-select-group>
          <checkbox-group
            v-else
            :key="option.id"
            :options="[option]"
            :selected="selected"
            :required="required"
            :group-id="groupId"
            :can-write-in="canWriteIn"
            :write-in-label="writeInLabel"
            :write-in-answer="writeInAnswer"
            @change="$emit('change', $event)"
          />
        </template>
      </div>
    </div>
  </fieldset>
</template>

<script>
import CheckboxGroup from '../common/checkbox-group.vue';
import CustomSelectGroup from './custom-select-group.vue';

export default {
  components: {
    CheckboxGroup,
    CustomSelectGroup,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    groupId: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    selected: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    canWriteIn: {
      type: Boolean,
      default: false,
    },
    writeInLabel: {
      type: String,
      default: 'Other',
    },
    writeInAnswer: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style>
.csmulti-legend {
  font-size: 1rem;
}
.csmulti-wrapper {
  max-height: 150px;
  overflow: hidden;
}
.csmulti-inner {
  overflow-y: auto;
  max-height: 132px;
}
.csmulti + .input-group {
  margin-top: 0.5rem;
}
</style>
