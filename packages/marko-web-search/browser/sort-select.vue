<template>
  <select :class="className" @change="onChange">
    <option
      v-for="item in nodes"
      :key="item.id"
      :selected="item.isSelected"
      :value="item.id"
    >
      Sort: {{ item.label }}
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
    nodes: {
      type: Array,
      required: true,
    },
  },
  methods: {
    onChange(e) {
      if (e.target.options.selectedIndex > -1) {
        const selected = e.target.options[e.target.options.selectedIndex];
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        params.sortBy = selected.value;
        const newUrlSearchParams = new URLSearchParams({ ...params });
        window.location.href = `${window.location.origin}/search?${newUrlSearchParams.toString()}`;
      }
    },
  },
};
</script>
