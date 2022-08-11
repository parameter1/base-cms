<template>
  <div id="marko-web-reveal-ad-handler" />
</template>

<script>
import $ from '@parameter1/base-cms-marko-web/browser/jquery';

const parseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
};

const parseMessagePayload = (event) => {
  const obj = parseJSON(event.data);
  if (!obj) return null;
  if (['adImagePath', 'adTitle', 'backgroundImagePath', 'adClickUrl'].every(k => obj[k])) {
    return obj;
  }
  return null;
};

const target = '_blank';
const rel = 'noopener noreferrer';

const { warn } = console;

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      default: '.document-container > .page',
    },
    displayFrequency: {
      type: Number,
      default: 2,
    },
    defaults: {
      type: Object,
      default: () => ({ backgroundColor: 'transparent' }),
    },
    selectAllTargets: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    observed: 0,
    observer: null,
    payload: {},
  }),

  mounted() {
    if (!this.id || !this.path) {
      this.warn('The Ad Unit ID and path are required. Bailing early.');
      return;
    }

    const { googletag } = window;
    if (!googletag) {
      warn('The googletag object was not found. Bailing early.');
    }

    window.addEventListener('message', this.listener);
    googletag.cmd.push(() => {
      const slot = googletag.defineOutOfPageSlot(this.path, this.id).addService(googletag.pubads());
      const div = document.createElement('div');
      div.id = this.id;
      div.dataset.path = this.path;
      this.$el.appendChild(div);
      googletag.pubads().refresh([slot], { changeCorrelator: false });
    });
  },

  beforeDestroy() {
    window.removeEventListener('message', this.listener);
    if (this.observer) this.observer.disconnect();
  },

  methods: {
    displayBackground() {
      const {
        adClickUrl,
        backgroundColor,
        backgroundImagePath,
      } = this.payload;

      const backgroundImage = `url("${backgroundImagePath}")`;
      const revealBackground = $('<a>', { href: adClickUrl, target, rel }).addClass('reveal-ad-background').css({ backgroundImage });
      $('body').css({ backgroundColor }).prepend(revealBackground);
      $('body').addClass('with-reveal-ad');
    },
    displayAd(element) {
      if (!element) return;
      const {
        adClickUrl,
        adImagePath,
        adTitle,
        boxShadow,
      } = this.payload;

      const adContainer = $('<div>').addClass('reveal-ad');
      if (boxShadow) adContainer.addClass(`reveal-ad--${boxShadow}-shadow`);
      adContainer.html($('<a>', {
        href: adClickUrl,
        title: adTitle,
        target,
        rel,
      }).append($('<img>', { src: adImagePath, alt: adTitle })));
      $(element).before(adContainer);
    },
    shouldDisplay() {
      const { displayFrequency } = this;
      this.observed += 1;
      return this.observed % displayFrequency > 0;
    },
    observeMutations() {
      if (!window.MutationObserver) return;
      this.observer = new MutationObserver((mutationList) => {
        for (let i = 0; i < mutationList.length; i += 1) {
          const mutation = mutationList[i];
          if (mutation.type === 'childList') {
            for (let x = 0; x < mutation.addedNodes.length; x += 1) {
              const added = mutation.addedNodes[x];
              if (added.matches && added.matches(this.target)) {
                if (this.shouldDisplay()) this.displayAd(added);
              }
            }
          }
        }
      });
      const node = document.querySelector(this.target);
      if (node && node.parentNode) {
        this.observer.observe(node.parentNode, { childList: true, subtree: true });
      }
    },

    listener(event) {
      const payload = parseMessagePayload(event);
      if (!payload) return;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function fn() {
          document.removeEventListener('DOMContentLoaded', fn);
          this.execute(payload);
        });
      } else {
        this.execute(payload);
      }
    },
    execute(payload) {
      const elements = this.selectAllTargets
        ? document.querySelectorAll(this.target) : [document.querySelector(this.target)];
      this.payload = { ...this.defaults, ...payload };
      this.displayBackground();
      for (let i = 0; i < elements.length; i += 1) {
        this.displayAd(elements[i]);
      }
      this.observeMutations();
      window.removeEventListener('message', this.listener);
    },

    warn(...args) {
      warn('Reveal Ad Listener:', ...args);
    },
  },
};
</script>
