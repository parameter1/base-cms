<template>
  <form :class="blockName" @submit.prevent="handleSubmit">
    <fieldset :disabled="isLoading">
      <display-name v-model="currentDisplayName" label="Posting As" />
      <comment-body v-model="body" />
      <button
        type="submit"
        class="btn btn-primary"
      >
        Submit
      </button>
    </fieldset>
    <p v-if="error" class="mb-0 mt-3">
      Error: {{ error.message }}
    </p>
  </form>
</template>

<script>
import post from '../utils/post';
import FormError from '../errors/form';
import DisplayName from '../form/fields/display-name.vue';
import CommentBody from '../form/fields/comment-body.vue';
import EventEmitter from '../mixins/global-event-emitter';

export default {
  /**
   *
   */
  components: { DisplayName, CommentBody },

  /**
   *
   */
  mixins: [EventEmitter],

  /**
   *
   */
  props: {
    stream: {
      type: Object,
      required: true,
    },

    displayName: {
      type: String,
      required: true,
    },
  },

  /**
   *
   */
  data: () => ({
    blockName: 'idx-create-comment',
    isLoading: false,
    error: null,
    body: '',
    updatedDisplayName: undefined,
  }),

  computed: {
    /**
     *
     */
    currentDisplayName: {
      get() {
        return this.updatedDisplayName || this.displayName;
      },
      set(displayName) {
        this.updatedDisplayName = displayName;
      },
    },
  },

  /**
   *
   */
  methods: {
    /**
     *
     */
    async handleSubmit() {
      this.error = null;
      this.isLoading = true;
      const { currentDisplayName, body, stream } = this;
      try {
        const res = await post('/comment', {
          displayName: currentDisplayName,
          body,
          stream,
        });
        const data = await res.json();
        if (!res.ok) throw new FormError(data.message, res.status);
        this.body = '';
        this.emit('comment-post-submitted');
      } catch (e) {
        this.error = e;
        this.emit('comment-post-errored', { message: e.message });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
