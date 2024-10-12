<template>
  <div style="display: none;" />
</template>

<script>
import cookies from 'js-cookie';

export default {
  props: {
    cookieName: {
      type: String,
      required: true,
    },
    cookieValue: {
      type: Number,
      default: 1,
    },
    cookieValueToMatch: {
      type: Number,
      default: 1,
    },
    hasCookie: {
      type: Boolean,
      required: true,
    },
  },
  created() {
    const initialValue = 1;
    setTimeout(() => {
      const newsletterSignupModalElement = document.getElementById('newsletter-signup-modal');
      if (!window.location.pathname.match(/^\/user|\/page/)) {
        if (
          (!this.hasCookie && Number(this.cookieValueToMatch) === 0)
          || (
            this.hasCookie
            && Number(this.cookieValue) === Number(this.cookieValueToMatch)
            && window.dataLayer.find((dataEvent) => dataEvent['identity-x']
            && dataEvent['identity-x'].newsletterSignupType === 'modal')
          )
        ) {
          newsletterSignupModalElement.classList.add('newsletter-signup-modal-fade-in');
          const value = !this.hasCookie ? initialValue : (Number(this.cookieValue) + 1);
          // Set cookie, expires is in days so we have to divide by 24 for hours
          cookies.set(this.cookieName, value, { expires: 1 / 24 });
        } else if (
          this.hasCookie
          && Number(this.cookieValue) < Number(this.cookieValueToMatch)
        ) {
          cookies.set(this.cookieName, (Number(this.cookieValue) + 1), { expires: 1 });
        } else if (
          !this.hasCookie
        ) {
          cookies.set(this.cookieName, initialValue, { expires: 1 });
        }
      }
    }, 2500);
  },
};
</script>
