<template>
  <view class="tab-nav-svg" :class="{ inactive: !active }">
    <!-- 微信小程序模板内 <svg> 支持差，用字符图标保证可见 -->
    <!-- #ifdef MP-WEIXIN -->
    <text class="tab-emoji">{{ tabEmoji(name) }}</text>
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
          <stop offset="0%" stop-color="#A78BFA" />
          <stop offset="50%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#EC4899" />
        </linearGradient>
        <linearGradient :id="ids.discNeedle" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F472B6" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>
      <g transform="translate(24,24) scale(0.9) translate(-24,-24)">
        <circle cx="24" cy="24" r="17" fill="none" :stroke="u(ids.discRing)" stroke-width="3" />
        <circle cx="24" cy="24" r="3" fill="#F9FAFB" stroke="#8B5CF6" stroke-width="1.5" />
        <path d="M24 10 L26 22 L24 20 L22 22 Z" :fill="u(ids.discNeedle)" opacity="0.95" />
        <path d="M24 38 L22 26 L24 28 L26 26 Z" fill="#C4B5FD" opacity="0.85" />
        <path d="M10 24 L22 22 L20 24 L22 26 Z" fill="#DDD6FE" opacity="0.9" />
        <path d="M38 24 L26 26 L28 24 L26 22 Z" fill="#DDD6FE" opacity="0.9" />
      </g>
    </svg>

    <svg
      v-else-if="name === 'filter'"
      class="svg-root"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="ids.filKnob" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#22D3EE" />
          <stop offset="100%" stop-color="#6366F1" />
        </linearGradient>
        <linearGradient :id="ids.filBar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#A5B4FC" />
          <stop offset="100%" stop-color="#818CF8" />
        </linearGradient>
      </defs>
      <g transform="translate(24,23) scale(1.12) translate(-24,-23)">
        <rect x="14" y="14" width="26" height="4" rx="2" :fill="u(ids.filBar)" opacity="0.85" />
        <circle cx="18" cy="16" r="5" :fill="u(ids.filKnob)" stroke="#fff" stroke-width="1.2" />
        <rect x="14" y="22" width="26" height="4" rx="2" :fill="u(ids.filBar)" opacity="0.85" />
        <circle cx="28" cy="24" r="5" :fill="u(ids.filKnob)" stroke="#fff" stroke-width="1.2" />
        <rect x="14" y="30" width="26" height="4" rx="2" :fill="u(ids.filBar)" opacity="0.85" />
        <circle cx="22" cy="32" r="5" :fill="u(ids.filKnob)" stroke="#fff" stroke-width="1.2" />
      </g>
    </svg>

    <svg
      v-else-if="name === 'messages'"
      class="svg-root"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="ids.msgFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F472B6" />
          <stop offset="45%" stop-color="#EC4899" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
        <linearGradient :id="ids.msgTail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#BE185D" />
          <stop offset="100%" stop-color="#6D28D9" />
        </linearGradient>
      </defs>
      <g transform="translate(24,24) scale(1.02) translate(-24,-24)">
        <rect x="9" y="9" width="28" height="24" rx="9" :fill="u(ids.msgFill)" />
        <polygon points="14,33 22,26 30,33" :fill="u(ids.msgTail)" />
        <circle cx="18" cy="21" r="2.2" fill="#fff" opacity="0.92" />
        <circle cx="24" cy="21" r="2.2" fill="#fff" opacity="0.92" />
        <circle cx="30" cy="21" r="2.2" fill="#fff" opacity="0.92" />
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
          <stop offset="0%" stop-color="#FBBF24" />
          <stop offset="100%" stop-color="#F97316" />
        </linearGradient>
        <linearGradient :id="ids.mineBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#A78BFA" />
          <stop offset="100%" stop-color="#6366F1" />
        </linearGradient>
      </defs>
      <g transform="translate(24,24) scale(0.92) translate(-24,-24)">
        <circle cx="24" cy="17" r="9" :fill="u(ids.mineHead)" stroke="#fff" stroke-width="1.5" />
        <path
          d="M12 40 C12 32 17 28 24 28 C31 28 36 32 36 40 Z"
          :fill="u(ids.mineBody)"
          stroke="#E9D5FF"
          stroke-width="1"
          stroke-linejoin="round"
        />
        <ellipse cx="24" cy="17" rx="3" ry="2" fill="#fff" opacity="0.35" />
      </g>
    </svg>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

defineProps<{
  name: 'discover' | 'filter' | 'messages' | 'mine'
  active: boolean
}>()

function tabEmoji(name: 'discover' | 'filter' | 'messages' | 'mine') {
  const map: Record<string, string> = {
    discover: '🧭',
    filter: '⚙',
    messages: '💬',
    mine: '👤',
  }
  return map[name] || '·'
}

const inst = getCurrentInstance()
const uidNum = inst != null && inst.uid != null ? inst.uid : Math.floor(Math.random() * 1e9)
const uid = String(uidNum)
const ids = {
  discRing: `tb-dr-${uid}`,
  discNeedle: `tb-dn-${uid}`,
  filKnob: `tb-fk-${uid}`,
  filBar: `tb-fb-${uid}`,
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

  .tab-emoji {
    font-size: 44rpx;
    line-height: 1;
  }

  .svg-root {
    width: 48rpx;
    height: 48rpx;
    display: block;
  }

  &.inactive {
    opacity: 0.72;
    filter: saturate(0.75);
  }
}
</style>
