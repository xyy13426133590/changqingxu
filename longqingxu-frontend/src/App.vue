<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { initCloud } from './services/cloud'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  initCloud()
  useUserStore().init()
})
</script>

<style lang="scss">
@import '@/styles/index.scss';
</style>
