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
    const { p1events } = window;
    if (!p1events) return;
    p1events('trackLinks', {
      ancestor: this.selector,
      linkType: this.linkType,
      handler: ({ element }) => {
        const url = element.getAttribute('href');
        if (!url) return null;
        return {
          action: 'Click',
          category: 'In-Body Content Link',
          entity: this.entity,
          props: { url },
        };
      },
    });
  },
};
</script>
