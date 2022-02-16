<template>
  <fieldset class="px-3 border mb-3">
    <legend class="h6 w-auto">
      Address
    </legend>

    <div v-if="isFieldVisible('street')" class="row">
      <street
        v-model="user.street"
        :required="isFieldRequired('street')"
        :full-width="!isFieldVisible('addressExtra')"
      />
      <address-extra
        v-if="isFieldVisible('addressExtra')"
        v-model="user.addressExtra"
        :required="isFieldRequired('addressExtra')"
      />
    </div>

    <div v-if="isFieldVisible('city') || displayRegionField" class="row">
      <city
        v-if="isFieldVisible('city')"
        v-model="user.city"
        :required="isFieldRequired('city')"
        :half-width="!displayRegionField"
      />
      <region
        v-if="displayRegionField"
        v-model="user.regionCode"
        :country-code="user.countryCode"
        :required="isFieldRequired('regionCode')"
        :half-width="!isFieldVisible('city')"
      />
      <postal-code
        v-if="displayRegionField"
        v-model="user.postalCode"
        :required="isFieldRequired('postalCode')"
        :half-width="!isFieldVisible('city')"
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
    isFieldRequired: {
      type: Function,
      required: true,
    },
    isFieldVisible: {
      type: Function,
      required: true,
    },
    displayRegionField: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  computed: {
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
