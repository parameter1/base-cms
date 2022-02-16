<template>
  <fieldset class="p-3 border mb-2">
    <legend class="h5">
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

    <div class="row">
      <div v-if="displayRegionField" class="col-md-6">
        <region
          v-model="user.regionCode"
          :country-code="user.countryCode"
          :required="isFieldRequired('regionCode')"
        />
      </div>
    </div>

    <div v-if="isFieldVisible('city') || displayPostalCodeField" class="row">
      <div v-if="isFieldVisible('city')" class="col-md-6">
        <city
          v-model="user.city"
          :required="isFieldRequired('city')"
        />
      </div>
      <div v-if="displayPostalCodeField" class="col-md-6">
        <postal-code
          v-model="user.postalCode"
          :required="isFieldRequired('postalCode')"
        />
      </div>
    </div>
  </fieldset>
</template>

<script>
import regionCountryCodes from '../utils/region-country-codes';

import City from './fields/city.vue';
import Region from './fields/region.vue';
import PostalCode from './fields/postal-code.vue';
import Street from './fields/street.vue';
import AddressExtra from './fields/address-extra.vue';


/**
country (50)

*group fields, border, hr, etc, subhead with address*
*show block when country is selected*

street longer than extra (66/33) (w/o extra, 100)
city region postal code (33/33/33) or 50/50
postal code last even if by itself
 */

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
    displayRegionField() {
      return regionCountryCodes.includes(this.countryCode);
    },
    displayPostalCodeField() {
      return this.displayRegionField;
    },
  },
};
</script>
