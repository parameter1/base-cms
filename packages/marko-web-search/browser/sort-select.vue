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
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      params.sortField = value;
      const newUrlSearchParams = new URLSearchParams({ ...params });
      window.location.href = `${window.location.origin}/search?${newUrlSearchParams.toString()}`;
    },
  },
};
</script>
