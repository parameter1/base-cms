<template>
  <div :class="classNames">
    <div :class="element('header')">
      {{ headerText }}
    </div>

    <div :class="element('body')">
      <div
        v-if="hasActiveUser"
        :class="element('create-post')"
      >
        <p :class="element('login-message')">
          <span :class="element(`login-message--cta`)">
            Post a Comment
          </span>
        </p>
        <div v-if="archived" :class="element('archived')">
          This thread is archived and is no longer accepting comments.
        </div>
        <create
          v-else
          :display-name="activeUser.displayName"
          :stream="{ identifier, title, description, url }"
          @comment-post-submitted="load"
        />
      </div>
      <div v-else :class="element('login-form-wrapper')">
        <p v-if="showLoginMessage" :class="element('login-message')">
          <span :class="element(`login-message--cta`)">
            Post a Comment
          </span>
          You must be signed in to leave a comment.
          To sign in or create an account,
          enter your email address and we'll send you a one-click sign-in link.
        </p>
        <login
          :class="element('login-form')"
          :additional-event-data="{
            ...additionalEventData,
            actionSource: 'comments', // Always set source to comments
          }"
          :active-user="activeUser"
          :endpoints="endpoints"
          :consent-policy="consentPolicy"
          :app-context-id="appContextId"
          :regional-consent-policies="regionalConsentPolicies"
          :button-labels="loginButtonLabels"
          @login-link-sent="showLoginMessage = false"
        />
      </div>

      <h5 v-if="latestCommentsHeader && comments.length" :class="element('latest-comments')">
        {{ latestCommentsHeader }} ({{ totalCount }})
      </h5>
    </div>
    <div v-if="isLoading" :class="element('loading')">
      Loading comments...
    </div>
    <div v-else-if="error" :class="element('error')">
      Unable to load comments: {{ error.message }}
    </div>
    <div v-else-if="comments.length === 0" :class="element('no-posts')">
      {{ noCommentsMessage }}
    </div>
    <div v-else :class="element('posts')">
      <div
        v-for="comment in comments"
        :key="comment.id"
        :class="element('post')"
      >
        <post
          :id="comment.id"
          :additional-event-data="additionalEventData"
          :body="comment.body"
          :display-name="comment.user.displayName"
          :created-at="comment.createdAt"
          :approved="comment.approved"
          :flagged="comment.flagged"
          :date-format="dateFormat"
          :active-user="activeUser"
          @comment-report-submitted="load"
        />
      </div>
      <div v-if="hasNextPage" :class="element('post')">
        <button :class="loadMoreButtonClass" :disabled="isLoadingMore" @click.prevent="loadMore">
          <span v-if="isLoadingMore">Loading...</span>
          <span v-else>{{ loadMoreCommentsMessage }}</span>
        </button>
      </div>
    </div>
    <div :class="element('bottom')" />
  </div>
</template>

<script>
import get from '../utils/get';
import Login from '../login.vue';
import Post from './post.vue';
import Create from './create.vue';
import EventEmitter from '../mixins/global-event-emitter';

export default {
  /**
   *
   */
  components: { Login, Post, Create },

  /**
   *
   */
  mixins: [EventEmitter],

  /**
   *
   */
  props: {
    activeUser: {
      type: Object,
      default: () => {},
    },
    identifier: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: undefined,
    },
    description: {
      type: String,
      default: undefined,
    },
    url: {
      type: String,
      default: undefined,
    },
    endpoints: {
      type: Object,
      required: true,
    },
    headerText: {
      type: String,
      default: 'Comments',
    },
    loadMoreButtonClass: {
      type: String,
      default: 'btn btn-primary',
    },
    loadMoreCommentsMessage: {
      type: String,
      default: 'Show More Comments',
    },
    latestCommentsHeader: {
      type: String,
      default: 'All Comments',
    },
    loginButtonLabels: {
      type: Object,
      default: () => ({
        submit: 'Login / Register',
        continue: 'Continue',
        logout: 'Logout',
      }),
    },
    noCommentsMessage: {
      type: String,
      default: 'This article hasn’t received any comments yet. Want to start the conversation?',
    },
    modifiers: {
      type: Array,
      default: () => [],
    },
    consentPolicy: {
      type: String,
      default: null,
    },
    dateFormat: {
      type: String,
      default: undefined,
    },
    appContextId: {
      type: String,
      default: null,
    },
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    blockName: 'idx-comment-stream',
    isLoading: false,
    isLoadingMore: false,
    showLoginMessage: true,
    error: null,
    comments: [],
    archived: false,
    hasNextPage: false,
    endCursor: null,
    totalCount: 0,
  }),

  computed: {
    /**
     *
     */
    classNames() {
      const { blockName } = this;
      const classNames = [blockName];
      this.modifiers.map(mod => classNames.push(`${blockName}--${mod}`));
      classNames.push(`${blockName}__counter--${this.comments.length}`);
      return classNames;
    },

    /**
     *
     */
    hasActiveUser() {
      return this.activeUser && this.activeUser.email;
    },
  },

  /**
   *
   */
  created() {
    this.load();
  },

  /**
   *
   */
  mounted() {
    this.emit('comment-stream-mounted', { identifier: this.identifier });
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

    /**
     *
     */
    async load() {
      this.error = null;
      this.isLoading = true;
      try {
        const res = await get(`/comments/${this.identifier}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        this.totalCount = data.totalCount;
        this.comments = data.edges.map(edge => edge.node);
        this.hasNextPage = data.pageInfo.hasNextPage;
        this.endCursor = data.pageInfo.endCursor;
        this.archived = data.stream ? data.stream.archived : false;
        this.emit('comment-stream-loaded', { hasNextPage: this.hasNextPage });
      } catch (e) {
        this.error = e;
        this.emit('comment-stream-errored', { message: e.message });
      } finally {
        this.isLoading = false;
      }
    },

    /**
     *
     */
    async loadMore() {
      this.error = null;
      this.isLoadingMore = true;
      try {
        const res = await get(`/comments/${this.identifier}?after=${this.endCursor}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        this.totalCount = data.totalCount;
        const comments = data.edges.map(edge => edge.node);
        this.comments.push(...comments);
        this.hasNextPage = data.pageInfo.hasNextPage;
        this.endCursor = data.pageInfo.endCursor;
        this.emit('comment-stream-loaded-more', { hasNextPage: this.hasNextPage });
      } catch (e) {
        this.error = e;
        this.emit('comment-stream-errored', { message: e.message });
      } finally {
        this.isLoadingMore = false;
      }
    },
  },
};
</script>
