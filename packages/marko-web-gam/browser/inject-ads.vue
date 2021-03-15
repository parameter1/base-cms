<template>
  <div :id="elementId" style="display: none;" />
</template>

<script>
import $ from '@parameter1/base-cms-marko-web/browser/jquery';

export default {
  props: {
    selector: {
      type: String,
      required: true,
    },
    childSelector: {
      type: String,
      default: 'p',
    },
    toInject: {
      type: Object,
      default: () => ({}),
    },
    detectEmbeds: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    hasInjected: {},
  }),

  computed: {
    elementId() {
      return `marko-web-gam-inject-ads-${Date.now()}`;
    },
    targetLengths() {
      return Object.keys(this.toInject).map(n => parseInt(n, 10)).filter(n => n && n >= 1);
    },
  },

  mounted() {
    let totalLength = 0;
    const { childSelector } = this;
    const component = this;
    const $el = $(this.selector);
    // Remove empty tags
    $(':empty', $el).remove();
    const $children = $(`> ${childSelector}`, $el);

    $children.each(function injectAds(index) {
      const $child = $(this);
      const { length } = $child.text();
      const $nextChild = $(this).next(childSelector);

      component.targetLengths.forEach((targetLength) => {
        if (component.canInject({
          targetLength,
          totalLength,
          childLength: length,
          childIndex: index,
          childrenLength: $children.length,
        })) {
          const contents = component.toInject[targetLength];
          if (contents) {
            // Unescape closing HTML tags.
            const cleaned = contents.replace(/<\\\/(.+?)>/g, '</$1>');
            const headlineTags = 'h1,h2,h3,h4,h5,h6';
            if ($nextChild.text().length <= 1) {
              // eslint-disable-next-line consistent-return
              $child.nextAll(childSelector).each(function handleBefore() {
                if ($(this).text().length > 1) {
                  const $previous = $(this).prev();
                  if ($previous.is(headlineTags)) {
                    $previous.before(cleaned);
                  } else if ($previous.attr('data-embed-type')) {
                    $(this).after(cleaned);
                  } else {
                    $(this).before(cleaned);
                  }
                  return false;
                }
              });
            } else {
              const $next = $(this).next();
              if ($next.attr('data-embed-type')) {
                if ($child.prev().is(headlineTags)) {
                  $child.prev().before(cleaned);
                } else {
                  $child.before(cleaned);
                }
              } else if ($child.is(headlineTags)) {
                $child.before(cleaned);
              } else {
                $child.after(cleaned);
              }
            }
          }
          component.hasInjected[targetLength] = true;
        }
      });
      totalLength += length;
    });
  },

  methods: {
    canInject({
      targetLength,
      totalLength,
      childLength,
      childIndex,
      childrenLength,
    } = {}) {
      const hasInjected = this.hasInjected[targetLength];
      if (hasInjected || !targetLength) return false;
      return totalLength <= targetLength
        && totalLength + childLength >= targetLength
        && childIndex + 1 !== childrenLength;
    },
  },
};
</script>
