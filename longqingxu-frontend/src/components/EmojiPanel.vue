<template>
  <view class="emoji-panel" v-if="visible">
    <view class="emoji-grid">
      <view
        v-for="emoji in emojis"
        :key="emoji"
        class="emoji-item"
        @click="onSelect(emoji)"
      >
        <text>{{ emoji }}</text>
      </view>
    </view>
    <view class="emoji-category">
      <view
        v-for="cat in categories"
        :key="cat.key"
        class="cat-item"
        :class="{ active: currentCat === cat.key }"
        @click="currentCat = cat.key"
      >
        <text>{{ cat.icon }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  select: [emoji: string]
  delete: []
}>()

const currentCat = ref('smileys')

const categories = [
  { key: 'smileys', icon: '😀' },
  { key: 'animals', icon: '🐶' },
  { key: 'food', icon: '🍎' },
  { key: 'activities', icon: '⚽' },
  { key: 'objects', icon: '💡' },
  { key: 'symbols', icon: '❤️' },
]

const emojiMap: Record<string, string[]> = {
  smileys: [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
    '🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
    '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸',
    '🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️',
    '😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡',
    '🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓',
    '🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄',
    '😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵',
    '🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠',
  ],
  animals: [
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
    '🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒',
    '🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇',
    '🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜',
    '🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕',
    '🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳',
    '🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛',
    '🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖',
    '🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈',
  ],
  food: [
    '🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐',
    '🍈','🍒','🍑','🍍','🥝','🥥','🥑','🍆','🥔','🥕',
    '🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜',
    '🌰','🍞','🥐','🥖','🥨','🥯','🥞','🧇','🧀','🍖',
    '🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯',
    '🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗',
    '🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜',
    '🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠',
    '🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩',
  ],
  activities: [
    '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱',
    '🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁',
    '🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️',
    '🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺',
    '🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵',
    '🎪','🎯','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷',
    '🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰',
    '🧩','🎭','🎨','🎪','🎬','🎤','🎧','🎼','🎹','🥁',
  ],
  objects: [
    '⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️',
    '🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥',
    '📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️',
    '🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋',
    '🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴',
    '💶','💷','🪙','💰','💳','💎','⚖️','🦯','🧰','🔧',
    '🪛','🔨','⚒️','🛠️','⛏️','🪚','🔩','🪤','🦽','🦼',
    '🔫','🧱','🔮','🧿','🧸','🪆','💈','⚗️','🔭','🔬',
  ],
  symbols: [
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❣️',
    '💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️',
    '☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎',
    '♈','♉','♊','♋','♌','♍','♎','♏','♐','♑',
    '♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶',
    '🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️',
    '🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘',
    '❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷',
  ],
}

const emojis = computed(() => emojiMap[currentCat.value] || emojiMap.smileys)

function onSelect(emoji: string) {
  emit('select', emoji)
}

function onDelete() {
  emit('delete')
}
</script>

<style scoped lang="scss">
.emoji-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(196, 181, 253, 0.25) 100%);
  border-top: 1rpx solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  height: 600rpx;
  display: flex;
  flex-direction: column;
}

.emoji-grid {
  flex: 1;
  padding: 20rpx;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 16rpx;
  overflow-y: auto;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;

  text {
    font-size: 48rpx;
  }
}

.emoji-category {
  height: 88rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  gap: 32rpx;
  background: rgba(255, 255, 255, 0.35);
}

.cat-item {
  padding: 12rpx 16rpx;
  border-radius: 12rpx;

  text {
    font-size: 40rpx;
  }

  &.active {
    background: rgba(255, 255, 255, 0.55);
  }
}
</style>
