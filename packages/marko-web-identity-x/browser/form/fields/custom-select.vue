<template>
  <form-group>
    <form-label v-if="!multiple" :for="fieldId" :required="required">
      {{ label }}
    </form-label>
    <custom-select-multiple
      v-if="multiple"
      :group-id="id"
      :options="options"
      :selected="selectedOptionIds"
      :required="required"
      :label="label"
      :field-id="fieldId"
      :can-write-in="canWriteIn"
      :write-in-label="writeInLabel"
      :write-in-answer="writeInAnswer"
      @change="$emit('change', $event)"
    />
    <select
      v-else-if="!canWriteIn"
      :id="fieldId"
      class="custom-select"
      :required="required"
      @change="$emit('change', [$event.target.value])"
    >
      <option value="">
        Please select...
      </option>
      <template v-for="option in options">
        <optgroup
          v-if="option.options"
          :key="option.id"
          :label="option.label"
        >
          <option
            v-for="child in option.options"
            :key="child.id"
            :value="child.id"
            :selected="child.id === selectedOptionId"
          >
            {{ child.label }}
          </option>
        </optgroup>
        <option
          v-else
          :key="option.id"
          :value="option.id"
          :selected="option.id === selectedOptionId"
        >
          {{ option.label }}
        </option>
      </template>
    </select>
    <custom-select-write-in
      v-else
      :label="writeInLabel"
      :answer="writeInAnswer"
      :required="required"
      @clear="clearWriteIn($event)"
    />
  </form-group>
</template>

<script>
import CustomSelectMultiple from './custom-select-multiple.vue';
import CustomSelectWriteIn from './custom-select-write-in.vue';
import FormGroup from '../common/form-group.vue';
import FormLabel from '../common/form-label.vue';

export default {
  components: {
    CustomSelectMultiple,
    CustomSelectWriteIn,
    FormGroup,
    FormLabel,
  },

  props: {
    /**
     * The unique field id.
     */
    id: {
      type: String,
      required: true,
    },

    /**
     * The field display label.
     */
    label: {
      type: String,
      required: true,
    },

    /**
     * Whether the field is required.
     */
    required: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether the custom question supports multiple answers.
     */
    multiple: {
      type: Boolean,
      default: false,
    },

    /**
     * The field options (the possible answers).
     */
    options: {
      type: Array,
      default: () => [],
    },

    /**
     * Since all custom select answers are arrays mimic this behavior.
     */
    selected: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    value: {
      get() {
        return this.multiple ? this.selectedOptionIds : this.selectedOptionId;
      },
      set() {
        // noop, re-render caused by emit/prop update
      },
    },
    fieldId() {
      return `custom-select-${this.id}`;
    },

    selectedOptionIds() {
      return this.selected.map(item => item.id);
    },

    selectedOptionId() {
      const { selectedOptionIds, multiple } = this;
      if (!multiple) return selectedOptionIds[0] || undefined;
      return selectedOptionIds.slice();
    },

    selectedOptions() {
      const { selectedOptionIds: sids } = this;
      return this.options.reduce((arr, option) => ([
        ...arr,
        ...(sids.includes(option.id) ? [option] : []),
        ...(option.options ? option.options.filter(opt => sids.includes(opt.id)) : []),
      ]), []);
    },

    canWriteIn() {
      const { selectedOptions } = this;
      if (selectedOptions.length) {
        const canWriteIn = selectedOptions.find(o => o.canWriteIn);
        return Boolean(canWriteIn);
      }
      return false;
    },
    writeInAnswer() {
      const { selectedOptions, selected: answers } = this;
      return answers.find((a) => {
        const opt = selectedOptions.find(o => o.id === a.id);
        return opt && opt.canWriteIn;
      });
    },
    showWriteIn() {
      return this.selected && this.canWriteIn;
    },
    writeInLabel() {
      const selected = this.selectedOptions.find(option => option.canWriteIn);
      return selected && selected.label;
    },
  },

  methods: {
    clearWriteIn(optionId) {
      const selected = this.selected.filter(item => item.id !== optionId);
      this.$emit('change', selected);
    },
  },
};
</script>
