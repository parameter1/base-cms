<template>
  <div :class="blockName" :data-id="id">
    <div :class="element('header')">
      <div :class="element('display-name')">
        <span>Posted by {{ displayName }}</span>
      </div>
      <div>
        <span :class="element('created-at')">
          {{ postedAt }}
        </span>
        <span v-if="hasActiveUser && !flagged">
          <a
            href="#report-post"
            title="Report post as inappropriate."
            :disabled="isReporting"
            @click.prevent="reportComment"
          >
            Report
          </a>
          <span v-if="isReporting">Reporting...</span>
          <span v-if="error" class="text-danger">Error, try again</span>
        </span>
      </div>
    </div>
    <div :class="element('body')">
      <p v-if="flagged" :class="element('flagged')">
        This comment has been reported.
      </p>
      <!-- eslint-disable-next-line -->
      <div v-html="bodyHtml" />
    </div>
  </div>
</template>

<script>
import dayjs from '../dayjs';
import post from '../utils/post';
import FormError from '../errors/form';
import EventEmitter from '../mixins/global-event-emitter';

export default {
  /**
   *
   */
  mixins: [EventEmitter],

  /**
   *
   */
  props: {
    id: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Number,
      required: true,
    },
    approved: {
      type: Boolean,
      default: true,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    dateFormat: {
      type: String,
      default: 'MMM Do, YYYY h:mma',
    },
    activeUser: {
      type: Object,
      default: () => {},
    },
  },

  /**
   *
   */
  data: () => ({
    blockName: 'idx-comment-post',
    isReporting: false,
    error: null,
  }),

  /**
   *
   */
  computed: {
    /**
     *
     */
    postedAt() {
      const { createdAt } = this;
      if (!createdAt) return null;
      return dayjs(createdAt).format(this.dateFormat);
    },

    /**
     *
     */
    hasActiveUser() {
      return this.activeUser && this.activeUser.email;
    },

    /**
     *
     */
    bodyHtml() {
      return this.body.replace(/\n/g, '<br>');
    },
  },

  /**
   *
   */
  methods: {
    /**
     *
     */
    element(name) {
      return `${this.blockName}__${name}`;
    },

    async reportComment() {
      if (this.isReporting) return;
      this.error = null;
      this.isReporting = true;
      try {
        const res = await post(`/comment/flag/${this.id}`);
        const data = await res.json();
        if (!res.ok) throw new FormError(data.message, res.status);
        this.emit('comment-report-submitted', { id: this.id });
      } catch (e) {
        this.error = e;
        this.emit('comment-report-errored', { message: e.message, id: this.id });
      } finally {
        this.isReporting = false;
      }
    },
  },
};
</script>
