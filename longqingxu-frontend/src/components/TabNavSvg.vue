<template>
  <view class="tab-nav-svg" :class="{ inactive: !active }">
    <!-- #ifdef MP-WEIXIN -->
    <uni-icons :type="iconType" :size="iconPx" :color="iconColor" />
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN -->
    <svg
      v-if="name === 'discover'"
      class="svg-root"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="ids.discRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DDD6FE" />
          <stop offset="55%" stop-color="#A78BFA" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
        <linearGradient :id="ids.discNeedle" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#C4B5FD" />
          <stop offset="100%" stop-color="#7C3AED" />
        </linearGradient>
      </defs>
      <g transform="translate(24,24) scale(0.9) translate(-24,-24)">
        <circle cx="24" cy="24" r="17" fill="none" :stroke="u(ids.discRing)" stroke-width="3" />
        <circle cx="24" cy="24" r="3" fill="#2d1b69" stroke="#8B5CF6" stroke-width="1.5" />
        <path d="M24 10 L26 22 L24 20 L22 22 Z" :fill="u(ids.discNeedle)" opacity="0.96" />
        <path d="M24 38 L22 26 L24 28 L26 26 Z" fill="#EDE9FE" opacity="0.7" />
        <path d="M10 24 L22 22 L20 24 L22 26 Z" fill="#EDE9FE" opacity="0.7" />
        <path d="M38 24 L26 26 L28 24 L26 22 Z" fill="#EDE9FE" opacity="0.7" />
      </g>
    </svg>

    <svg
      v-else-if="name === 'filter'"
      class="svg-root"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="ids.filKnob" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F0ABFC" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
        <linearGradient :id="ids.filBar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#DDD6FE" />
          <stop offset="100%" stop-color="#A78BFA" />
        </linearGradient>
      </defs>
      <g transform="translate(24,23) scale(1.12) translate(-24,-23)">
        <rect x="14" y="14" width="26" height="4" rx="2" :fill="u(ids.filBar)" opacity="0.95" />
        <circle cx="18" cy="16" r="5" :fill="u(ids.filKnob)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" />
        <rect x="14" y="22" width="26" height="4" rx="2" :fill="u(ids.filBar)" opacity="0.95" />
        <circle cx="28" cy="24" r="5" :fill="u(ids.filKnob)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" />
        <rect x="14" y="30" width="26" height="4" rx="2" :fill="u(ids.filBar)" opacity="0.95" />
        <circle cx="22" cy="32" r="5" :fill="u(ids.filKnob)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" />
      </g>
    </svg>

    <!-- 圈子：同心圆光圈图标 -->
    <svg
      v-else-if="name === 'circle'"
      class="svg-root"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="ids.cirOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C4B5FD" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
        <linearGradient :id="ids.cirInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#A78BFA" />
          <stop offset="100%" stop-color="#7C3AED" />
        </linearGradient>
        <linearGradient :id="ids.cirStar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F0ABFC" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>
      <!-- 外圈 -->
      <circle cx="24" cy="24" r="18" fill="none" :stroke="u(ids.cirOuter)" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.7" />
      <!-- 中圈 -->
      <circle cx="24" cy="24" r="12" fill="none" :stroke="u(ids.cirInner)" stroke-width="2" opacity="0.85" />
      <!-- 中心星形✦ -->
      <text x="24" y="29" text-anchor="middle" font-size="14" :fill="u(ids.cirStar)" font-weight="bold">✦</text>
    </svg>

    <svg
      v-else-if="name === 'messages'"
      class="svg-root"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="ids.msgFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DDD6FE" />
          <stop offset="40%" stop-color="#A78BFA" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
        <linearGradient :id="ids.msgTail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#9333EA" />
          <stop offset="100%" stop-color="#6D28D9" />
        </linearGradient>
      </defs>
      <g transform="translate(24,24) scale(1.02) translate(-24,-24)">
        <rect x="9" y="9" width="28" height="24" rx="9" :fill="u(ids.msgFill)" />
        <polygon points="14,33 22,26 30,33" :fill="u(ids.msgTail)" />
        <circle cx="18" cy="21" r="2.2" fill="rgba(255,255,255,0.9)" />
        <circle cx="24" cy="21" r="2.2" fill="rgba(255,255,255,0.9)" />
        <circle cx="30" cy="21" r="2.2" fill="rgba(255,255,255,0.9)" />
      </g>
    </svg>

    <svg
      v-else-if="name === 'mine'"
      class="svg-root"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="ids.mineHead" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E9D5FF" />
          <stop offset="100%" stop-color="#C4B5FD" />
        </linearGradient>
        <linearGradient :id="ids.mineBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#A78BFA" />
          <stop offset="100%" stop-color="#7C3AED" />
        </linearGradient>
      </defs>
      <g transform="translate(24,24) scale(0.92) translate(-24,-24)">
        <circle cx="24" cy="17" r="9" :fill="u(ids.mineHead)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
        <path
          d="M12 40 C12 32 17 28 24 28 C31 28 36 32 36 40 Z"
          :fill="u(ids.mineBody)"
          stroke="rgba(255,255,255,0.1)"
          stroke-width="1"
          stroke-linejoin="round"
        />
        <ellipse cx="24" cy="17" rx="3" ry="2" fill="rgba(255,255,255,0.3)" />
      </g>
    </svg>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

const props = defineProps<{
  name: 'discover' | 'filter' | 'circle' | 'messages' | 'mine'
  active: boolean
}>()

const TAB_ICON_ACTIVE = '#A78BFA'
const TAB_ICON_INACTIVE = '#c4b5fd'

const iconPx = 26

const iconType = computed(() => {
  const filled = props.active
  if (props.name === 'discover') return filled ? 'navigate-filled' : 'navigate'
  if (props.name === 'filter') return filled ? 'tune-filled' : 'tune'
  if (props.name === 'circle') return filled ? 'circle-filled' : 'circle'
  if (props.name === 'messages') return filled ? 'chatbubble-filled' : 'chatbubble'
  return filled ? 'person-filled' : 'person'
})

const iconColor = computed(() => (props.active ? TAB_ICON_ACTIVE : TAB_ICON_INACTIVE))

const inst = getCurrentInstance()
const uidNum = inst != null && inst.uid != null ? inst.uid : Math.floor(Math.random() * 1e9)
const uid = String(uidNum)
const ids = {
  discRing: `tb-dr-${uid}`,
  discNeedle: `tb-dn-${uid}`,
  filKnob: `tb-fk-${uid}`,
  filBar: `tb-fb-${uid}`,
  cirOuter: `tb-co-${uid}`,
  cirInner: `tb-ci-${uid}`,
  cirStar: `tb-cs-${uid}`,
  msgFill: `tb-mf-${uid}`,
  msgTail: `tb-mt-${uid}`,
  mineHead: `tb-mh-${uid}`,
  mineBody: `tb-mb-${uid}`,
}

function u(id: string) {
  return `url(#${id})`
}
</script>

<style scoped lang="scss">
.tab-nav-svg {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .svg-root {
    width: 48rpx;
    height: 48rpx;
    display: block;
  }

  &.inactive {
    opacity: 0.92;
    filter: saturate(0.85) brightness(1);
  }
}
</style>
