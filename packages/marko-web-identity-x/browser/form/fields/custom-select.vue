<template>
  <form-group>
    <form-label :for="fieldId" :required="required">
      {{ label }}
    </form-label>
    <treeselect
      v-model="value"
      :multiple="multiple"
      :options="options"
      :disable-branch-nodes="true"
      :default-expand-level="1"
      :clearable="!required"
      :searchable="false"
      :required="required"
      :normalizer="(n) => ({ children: n.options })"
      @input="$emit('change', $event)"
    />
    <custom-select-write-in
      v-if="canWriteIn"
      :label="writeInLabel"
      :answer="writeInAnswer"
      :required="required"
      @clear="clearWriteIn($event)"
    />
  </form-group>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CustomSelectWriteIn from './custom-select-write-in.vue';
import FormGroup from '../common/form-group.vue';
import FormLabel from '../common/form-label.vue';

export default {
  components: {
    Treeselect,
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

<style>
.vue-treeselect + .input-group {
  margin-top: 0.5rem;
}
</style>
