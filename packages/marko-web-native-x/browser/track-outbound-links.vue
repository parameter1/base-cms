<template>
  <div />
</template>

<script>
import { outboundLink } from '../utils/gtm-events';

export default {
  props: {
    container: {
      type: String,
      required: true,
    },
  },
  created() {
    const elements = document.querySelectorAll(`${this.container} a[href]`);
    elements.forEach((element) => {
      const url = element.getAttribute('href');
      element.addEventListener('click', (e) => {
        e.preventDefault();
        outboundLink(window, url);
      });
    });
  },
};
</script>
