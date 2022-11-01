<template>
  <div class="marko-web-p1-events-content-body-links" style="display: none;" />
</template>

<script>
export default {
  props: {
    entity: {
      type: String,
      required: true,
    },
    selector: {
      type: String,
      default: '.page-contents__content-body',
    },
    linkSelector: {
      type: String,
      default: null,
    },
    linkType: {
      type: String,
      default: 'external',
    },
    action: {
      type: String,
      default: 'Click',
    },
    category: {
      type: String,
      default: 'In-Body Content Link',
    },
  },

  created() {
    if (!window.p1events) return;
    window.p1events('trackLinks', {
      ancestor: this.selector,
      selector: this.linkSelector,
      linkType: this.linkType,
      handler: ({ element }) => {
        const url = element.getAttribute('href');
        if (!url) return null;
        return {
          action: this.action,
          category: this.category,
          entity: this.entity,
          props: { url },
        };
      },
    });
  },
};
</script>
