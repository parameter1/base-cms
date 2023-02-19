<template>
  <form-group>
    <div class="custom-control custom-checkbox">
      <input
        :id="`custom-boolean-${id}`"
        v-model="receiveEmail"
        :disabled="disabled"
        :required="required"
        type="checkbox"
        class="custom-control-input"
      >
      <form-label class="custom-control-label" :for="`custom-boolean-${id}`" :required="required">
        <!-- eslint-disable-next-line -->
        <span v-html="emailConsentRequest" />
      </form-label>
    </div>
  </form-group>
</template>

<script>
import FormGroup from '../common/form-group.vue';
import FormLabel from '../common/form-label.vue';

export default {
  components: { FormGroup, FormLabel },
  props: {
    emailConsentRequest: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    id: 'sign-on-receive-email',
  }),
  computed: {
    receiveEmail: {
      get() {
        return this.value;
      },
      set(receiveEmail) {
        this.$emit('input', receiveEmail);
      },
    },
  },
};
</script>
