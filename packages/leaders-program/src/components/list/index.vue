<template>
  <div class="leaders-list">
    <navbar>
      <nav-container ref="nav" :direction="navDirection">
        <nav-item
          v-for="(item, index) in items"
          :key="index"
        >
          <nav-link
            v-slot="{ isActive }"
            tag="button"
            :index="index"
            :active-index="activeIndex"
            @focusin="onLinkFocus"
            @pointer-enter="onLinkEnter"
            @pointer-end="onLinkEnd"
            @pointer-leave="onLinkLeave"
          >
            <slot name="nav-link" :item="item" :is-active="isActive" />
          </nav-link>
        </nav-item>
      </nav-container>
    </navbar>
    <mounting-portal
      v-if="!isOpenDisabled"
      mount-to="#leaders-dropdown-portal-target"
      :name="portalName"
      append
    >
      <dropdown
        :direction="navDirection"
        :open="openDirection"
        :transitions-disabled="transitionsDisabled"
        :is-active="isDropdownActive"
        :data-identifier="identifier"
      >
        <dropdown-background :styles="styles.background" />
        <dropdown-arrow ref="arrow" :styles="styles.arrow" />
        <dropdown-container
          :styles="styles.container"
          @pointer-enter="onContainerEnter"
          @pointer-end="onContainerEnd"
          @pointer-leave="onContainerLeave"
        >
          <dropdown-section
            v-for="(item, index) in items"
            ref="sections"
            :key="index"
            :index="index"
            :active-index="activeIndex"
            :last-active-index="lastActiveIndex"
          >
            <slot name="dropdown" :item="item" :is-active="index === activeIndex" />
          </dropdown-section>
        </dropdown-container>
      </dropdown>
    </mounting-portal>
  </div>
</template>

<script>
import { get } from 'object-path';
import { MountingPortal } from 'portal-vue';

import { buildFlags } from '../../utils/link-tracking';
import ElementCalculus from './element-calculus';
import ArrowPosition from './positions/arrow-position';
import MenuPosition from './positions/menu-position';
import Dropdown from './dropdown.vue';
import DropdownArrow from './dropdown/arrow.vue';
import DropdownBackground from './dropdown/background.vue';
import DropdownContainer from './dropdown/container.vue';
import DropdownSection from './dropdown/section.vue';
import Navbar from './navbar.vue';
import NavContainer from './nav/container.vue';
import NavItem from './nav/item.vue';
import NavLink from './nav/link.vue';
import pointerEvents from './pointer-events';

const pointerEvent = pointerEvents();

export default {
  components: {
    Dropdown,
    DropdownArrow,
    DropdownBackground,
    DropdownContainer,
    DropdownSection,
    MountingPortal,
    Navbar,
    NavContainer,
    NavItem,
    NavLink,
  },

  props: {
    identifier: {
      type: [String, Number],
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    itemHrefPath: {
      type: String,
      default: 'siteContext.path',
    },
    navDirection: {
      type: String,
      default: null,
    },
    open: {
      type: String,
      default: 'below',
      validator: (v) => ['above', 'below', 'left', 'right', 'auto', null].includes(v),
    },
    closeTimeoutMS: {
      type: Number,
      default: 250,
      validator: (v) => v > 0,
    },
    openTimeoutMS: {
      type: Number,
      default: 50,
      validator: (v) => v > 0,
    },
    offsetBottom: {
      type: Number,
      default: 0,
    },
    offsetTop: {
      type: Number,
      default: 0,
    },
  },

  data: () => ({
    activeIndex: null,
    lastActiveIndex: null,
    isDragging: false,
    isDropdownActive: false,
    transitionsDisabled: true,

    closeTimeout: null,
    openTimeout: null,
    enableTransitionTimeout: null,
    disableTransitionTimeout: null,

    openDirection: 'right',

    styles: {
      arrow: {},
      container: {},
      background: {},
    },
  }),

  computed: {
    portalName() {
      return `leaders-dropdown-${this.identifier}`;
    },
    activeSection() {
      const { activeIndex } = this;
      if (activeIndex == null) return null;
      return this.sections[activeIndex];
    },
    isOpenDisabled() {
      return this.open == null;
    },
    sections() {
      return this.$refs.sections || [];
    },
    isMenuClosed() {
      return this.activeIndex == null;
    },
  },

  mounted() {
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchstart', this.onTouchStart);
    document.body.addEventListener(pointerEvent.end, this.onPointerEnd);
    this.$emit('mounted', this.items);
  },

  beforeDestroy() {
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchstart', this.onTouchStart);
    document.body.removeEventListener(pointerEvent.end, this.onPointerEnd);
  },

  methods: {
    getItemHref(item) {
      return get(item, this.itemHrefPath);
    },

    onLinkFocus({ index, element }) {
      this.clearCloseTimeout();
      this.setOpenTimeout({ link: element, activeIndex: index });
    },

    onLinkEnter({ index, element, event }) {
      if (event.pointerType !== 'touch') {
        this.clearCloseTimeout();
        this.setOpenTimeout({ link: element, activeIndex: index });
      }
    },

    onLinkEnd({ index, element, event }) {
      if (!this.isOpenDisabled) {
        event.preventDefault();
        event.stopPropagation();
        this.toggleDropdownFor({ link: element, activeIndex: index });
      } else {
        const company = this.items[index];
        const href = this.getItemHref(company);
        this.$emit('link-action', {
          type: 'click',
          label: 'Profile Page',
          category: 'Leaders Company List Item',
        }, {
          href,
          companyId: company.id,
          companyName: company.name,
          flags: buildFlags(),
          date: Date.now(),
        }, event);
        window.location.href = href;
      }
    },

    onLinkLeave({ event }) {
      if (event.pointerType !== 'touch') {
        this.setCloseTimeout();
        this.clearOpenTimeout();
      }
    },

    onContainerEnter({ event }) {
      if (event.pointerType !== 'touch') {
        this.clearCloseTimeout();
        this.clearOpenTimeout();
      }
    },

    onContainerEnd({ event }) {
      event.stopPropagation();
    },

    onContainerLeave({ event }) {
      if (event.pointerType !== 'touch') this.setCloseTimeout();
    },

    toggleDropdownFor({ link, activeIndex }) {
      if (this.isOpenDisabled) return;
      if (this.activeIndex === activeIndex) {
        this.closeDropdown();
      } else {
        this.openDropdownFor({ link, activeIndex });
      }
    },

    openDropdownFor({ link, activeIndex }) {
      if (this.activeIndex === activeIndex) return;

      // Set active dropdown id.
      this.activeIndex = activeIndex;

      if (this.isOpenDisabled) return;

      this.isDropdownActive = true;
      // Set last active index
      this.lastActiveIndex = activeIndex;

      const { activeSection } = this;
      if (!activeSection) throw new Error(`No dropdown section was found for index ${activeIndex}`);
      const content = activeSection.content.$el;
      const linkRect = link.getBoundingClientRect();
      const navRect = this.$refs.nav.$el.getBoundingClientRect();
      const arrowRect = this.$refs.arrow.$el.getBoundingClientRect();

      const { open } = this;
      if (open === 'auto') {
        this.openDirection = this.getAutoOpenDirection(content, linkRect);
      } else {
        this.openDirection = open;
      }

      const { openDirection, offsetTop, offsetBottom } = this;
      // Create element calculus info.
      const calcs = new ElementCalculus({
        content,
        linkRect,
        navRect,
        arrowRect,
      });
      // Calculate dropdown menu position.
      const menu = new MenuPosition({
        openDirection,
        calculus: calcs,
        offsetTop,
        offsetBottom,
      });
      // Calculate arrow position.
      const arrow = new ArrowPosition({ openDirection, calculus: calcs });

      this.clearDisableTransitionTimeout();
      this.setEnableTransitionTimeout();

      // This works for horizontal and vertical downward open
      const menuStyles = {
        transform: `translate(${menu.xPx}, ${menu.yPx})`,
        width: calcs.menu('w', { px: true }),
        height: calcs.menu('h', { px: true }),
      };
      this.styles.container = menuStyles;
      this.styles.background = menuStyles;
      this.styles.arrow = { transform: `translate(${arrow.xPx}, ${arrow.yPx}) rotate(45deg)` };
    },

    getAutoOpenDirection(content, linkRect) {
      const avaiableRight = window.innerWidth - linkRect.right;
      const shouldOpen = (avaiableRight >= window.innerWidth / 2) ? 'right' : 'left';
      // Check there is enough space to open the content left/right or push below
      // Right:
      // ContentWidth + Link's Right Position can not exceed avaiable window width
      const canOpenRight = shouldOpen === 'right' && (content.getBoundingClientRect().width + linkRect.right) < window.innerWidth + 30;
      // Left:
      // ContentWidth + 30px can not exceed link's left position
      const canOpenLeft = shouldOpen === 'left' && (linkRect.left - content.getBoundingClientRect().width) >= 30;
      if (canOpenRight || canOpenLeft) return shouldOpen;
      return 'below';
    },

    closeDropdown() {
      if (this.activeIndex == null) return;

      this.clearEnableTransitionTimeout();
      this.setDisableTransitionTimeout();

      this.isDropdownActive = false;

      // Unset active dropdown (but leave the last active)
      this.activeIndex = null;
    },

    setOpenTimeout({ link, activeIndex }) {
      this.openTimeout = setTimeout(() => {
        this.openDropdownFor({ link, activeIndex });
      }, this.openTimeoutMS);
    },

    clearOpenTimeout() {
      clearTimeout(this.openTimeout);
    },

    setCloseTimeout() {
      this.closeTimeout = setTimeout(() => this.closeDropdown(), this.closeTimeoutMS);
    },

    clearCloseTimeout() {
      clearTimeout(this.closeTimeout);
    },

    setEnableTransitionTimeout() {
      this.enableTransitionTimeout = setTimeout(() => {
        this.transitionsDisabled = false;
      }, 50);
    },

    clearEnableTransitionTimeout() {
      clearTimeout(this.enableTransitionTimeout);
    },

    setDisableTransitionTimeout() {
      this.disableTransitionTimeout = setTimeout(() => {
        this.transitionsDisabled = true;
      }, 50);
    },

    clearDisableTransitionTimeout() {
      clearTimeout(this.disableTransitionTimeout);
    },

    onPointerEnd() {
      if (!this.isDragging) this.closeDropdown();
    },

    onTouchMove() {
      this.isDragging = true;
    },

    onTouchStart() {
      this.isDragging = false;
    },
  },
};
</script>
