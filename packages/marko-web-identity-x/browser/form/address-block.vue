<template>
  <fieldset v-if="showBlock" class="px-3 border mb-3 address-block">
    <legend class="h6 w-auto">
      Address
    </legend>

    <div v-if="street.visible" class="row">
      <street
        v-model="user.street"
        :required="street.required"
        :class-name="addressExtra.visible ? 'col-md-8' : 'col-md-12'"
      />
      <address-extra
        v-if="addressExtra.visible"
        v-model="user.addressExtra"
        :required="addressExtra.required"
      />
    </div>

    <div v-if="city.visible || regionCode.visible || postalCode.visible" class="row">
      <city
        v-if="city.visible"
        v-model="user.city"
        :required="city.required"
        :class-name="addressLineTwoFieldClass"
      />
      <region
        v-if="regionCode.visible"
        v-model="user.regionCode"
        :country-code="user.countryCode"
        :required="regionCode.required"
        :class-name="addressLineTwoFieldClass"
      />
      <postal-code
        v-if="postalCode.visible"
        v-model="user.postalCode"
        :required="postalCode.required"
        :class-name="addressLineTwoFieldClass"
      />
    </div>
  </fieldset>
</template>

<script>
import City from './fields/city.vue';
import Region from './fields/region.vue';
import PostalCode from './fields/postal-code.vue';
import Street from './fields/street.vue';
import AddressExtra from './fields/address-extra.vue';

export default {
  components: {
    City,
    Region,
    PostalCode,
    Street,
    AddressExtra,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    street: {
      type: Object,
      required: true,
    },
    addressExtra: {
      type: Object,
      required: true,
    },
    city: {
      type: Object,
      required: true,
    },
    regionCode: {
      type: Object,
      required: true,
    },
    postalCode: {
      type: Object,
      required: true,
    },
  },
  /**
   *
   */
  computed: {
    addressLineTwoFieldClass() {
      let fields = 0;
      // eslint-disable-next-line no-plusplus
      if (this.city.visible) fields++;
      // eslint-disable-next-line no-plusplus
      if (this.regionCode.visible) fields++;
      // eslint-disable-next-line no-plusplus
      if (this.postalCode.visible) fields++;
      if (fields === 0 || fields === 1) return 'col-md-12';
      return `col-md-${12 / fields}`;
    },
    showBlock() {
      if (
        this.street.visible
        || this.addressExtra.visible
        || this.addressExtra.visible
        || this.city.visible
        || this.regionCode.visible
        || this.postalCode.visible
      ) return true;
      return false;
    },
    classNames() {
      const classNames = ['form-group'];
      const { className } = this;
      if (className) classNames.push(className);
      return classNames;
    },
    countryCode() {
      const { user } = this;
      if (!user) return null;
      return user.countryCode;
    },
  },
};
</script>
