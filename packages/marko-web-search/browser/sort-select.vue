<template>
  <select :class="className" @change="onChange">
    <option
      v-for="option in options"
      :key="option.id"
      :selected="option.id === selectedId"
      :value="option.id"
    >
      Sort: {{ option.label }}
    </option>
  </select>
</template>

<script>
export default {
  props: {
    className: {
      type: String,
      default: 'custom-select',
    },
    options: {
      type: Array,
      required: true,
    },
    selectedId: {
      type: String,
      default: 'PUBLISHED',
    },
  },
  methods: {
    onChange(event) {
      const { value } = event.target;
      const url = new URL(window.location);
      const params = new URLSearchParams(window.location.search);
      params.set('sortField', value);
      url.search = `${params}`;
      window.location.href = `${url}`;
    },
  },
};
</script>
