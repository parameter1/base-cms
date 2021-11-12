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
        <div v-if="archived" :class="element('archived')">
          This thread is archived and is no longer accepting comments.
        </div>
        <create
          v-else
          :display-name="activeUser.displayName"
          :stream="{ identifier, title, description, url }"
          @complete="load"
        />
      </div>
      <div v-else :class="element('login-form-wrapper')">
        <p :class="element('login-message')">
          You must be signed in to leave a comment.
        </p>
        <p :class="element('login-message')">
          To sign in or create an account,
          enter your email address and we'll send you a one-click sign-in link.
        </p>
        <login
          :class="element('login-form')"
          :active-user="activeUser"
          :endpoints="endpoints"
          :consent-policy="consentPolicy"
          :app-context-id="appContextId"
          :regional-consent-policies="regionalConsentPolicies"
        />
      </div>

      <h5 v-if="latestCommentsHeader && comments.length" :class="element('latest-comments')">
        {{ latestCommentsHeader }}
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
          :body="comment.body"
          :display-name="comment.user.displayName"
          :created-at="comment.createdAt"
          :approved="comment.approved"
          :flagged="comment.flagged"
          :date-format="dateFormat"
          :active-user="activeUser"
          @reported="load"
        />
      </div>
      <div v-if="hasNextPage" :class="element('post')">
        <button :class="loadMoreButtonClass" :disabled="isLoadingMore" @click.prevent="loadMore">
          <span v-if="isLoadingMore">Loading...</span>
          <span v-else>{{ loadMoreCommentsMessage }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import get from '../utils/get';
import Login from '../login.vue';
import Post from './post.vue';
import Create from './create.vue';

export default {
  /**
   *
   */
  components: { Login, Post, Create },

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
      default: 'Leave a Comment',
    },
    latestCommentsHeader: {
      type: String,
      default: 'Comments',
    },
    loadMoreCommentsMessage: {
      type: String,
      default: 'Show More Comments',
    },
    loadMoreButtonClass: {
      type: String,
      default: 'btn btn-primary',
    },
    noCommentsMessage: {
      type: String,
      default: 'No comments have been added yet. Want to start the conversation?',
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
      } catch (e) {
        this.error = e;
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
      } catch (e) {
        this.error = e;
      } finally {
        this.isLoadingMore = false;
      }
    },
  },
};
</script>
