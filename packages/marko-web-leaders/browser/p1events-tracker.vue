<template>
  <div class="marko-web-leaders-p1events-tracker" style="display: none;" />
</template>

<script>
export default {
  inject: ['EventBus'],
  props: {
    baseTenantKey: {
      type: String,
      required: true,
    },
    eventName: {
      type: String,
      default: 'leaders-action',
    },
  },

  created() {
    this.EventBus.$on(this.eventName, (event, payload) => {
      const { p1events } = window;
      if (!p1events) return;
      const { type, category, label } = event;

      const queue = [];
      const baseEvent = {
        action: type,
        category,
        label,
      };
      if (type === 'viewed' && category === 'Leaders Sections Nav' && label === 'Section Company Items') {
        payload.items.forEach((item) => {
          queue.push({
            ...baseEvent,
            action: 'View',
            entity: { id: item.id, ns: this.ns('content-company') },
            context: { id: payload.sectionId, ns: this.ns('website-section') },
          });
        });
      } else if (type === 'expand' && category === 'Leaders Sections Nav' && label === 'Section Item') {
        queue.push({
          ...baseEvent,
          action: 'Expand',
          entity: { id: payload.sectionId, ns: this.ns('website-section') },
        });
      } else if (type === 'open' && category === 'Leaders Data Card') {
        queue.push({
          ...baseEvent,
          action: 'Open',
          entity: { id: payload.companyId, ns: this.ns('content-company') },
          context: { id: payload.sectionId, ns: this.ns('website-section') },
        });
      } else if (type === 'click' && category === 'Leaders Data Card') {
        queue.push({
          ...baseEvent,
          action: 'Click',
          entity: { id: payload.companyId, ns: this.ns('content-company') },
          context: { id: payload.sectionId, ns: this.ns('website-section') },
          props: { url: payload.href },
        });
      } else if (type === 'click' && category === 'Leaders Company Profile') {
        const matches = /^Company Social - (.+)$/.exec(label);
        queue.push({
          ...baseEvent,
          category: 'Company Profile Page',
          ...(matches && { label: 'Company Social Link' }),
          action: 'Click',
          entity: { id: payload.companyId, ns: this.ns('content-company') },
          props: {
            url: payload.href,
            ...(matches && matches[1] && { provider: matches[1] }),
          },
        });
      }
      if (queue.length) p1events('track', queue);
    });
  },

  methods: {
    matches(event, type, category, label) {
      return event.category === category
        && event.label === label
        && event.type === type;
    },
    ns(type) {
      return `base.${this.baseTenantKey.replace('_', '-')}.${type}`;
    },
  },
};
</script>
