<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { initCloud } from './services/cloud'

onLaunch(() => {
  initCloud()
})
</script>

<style>
</style>
