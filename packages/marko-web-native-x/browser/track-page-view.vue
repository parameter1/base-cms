<template>
  <div />
</template>

<script>
import { get } from '@parameter1/base-cms-object-path';
import { pageLoad } from '../utils/gtm-events';

export default {
  props: {
    story: {
      type: Object,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    preview: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    const dl = window.dataLayerNativeX || [];
    dl.push({
      story_id: this.story.id,
      page_path: this.path,
      page_title: this.story.title,
      publisher_id: get(this.story, 'publisher.id'),
      advertiser_id: get(this.story, 'advertiser.id'),
      preview_mode: this.preview,
    });
    pageLoad(window);
  },
};
</script>
