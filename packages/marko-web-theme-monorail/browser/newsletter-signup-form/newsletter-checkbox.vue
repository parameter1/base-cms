<template>
  <div class="newsletter-checkbox-group custom-control custom-checkbox">
    <input
      :id="id"
      type="checkbox"
      class="custom-control-input"
      :value="deploymentTypeId"
      :disabled="disabled"
      @change="$emit('change', { newsletter, checked: $event.target.checked })"
      @focus="$emit('focus')"
    >
    <label
      class="d-flex flex-column custom-control-label custom-control-label--bg-white"
      :for="id"
    >
      <span class="newsletter-checkbox-group__name">
        {{ name }}
      </span>
      <span class="newsletter-checkbox-group__description">
        {{ description }}
      </span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    newsletter: {
      type: Object,
      required: true,
      validate: o => (o && o.name && o.deploymentTypeId),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    inPushdown: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    deploymentTypeId() {
      return this.newsletter.deploymentTypeId;
    },

    id() {
      const id = `deployment-type-id-${this.deploymentTypeId}`;
      return this.inPushdown ? `pushdown-${id}` : id;
    },

    name() {
      return this.newsletter.name;
    },

    description() {
      return this.newsletter.description;
    },
  },
};
</script>
