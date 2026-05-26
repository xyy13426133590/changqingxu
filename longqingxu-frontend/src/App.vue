<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { initCloud } from '@/services/cloud'

onLaunch(() => {
  console.log('App Launch')
  const userStore = useUserStore()
  userStore.init()
   initCloud()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import "@/styles/index.scss";
</style>