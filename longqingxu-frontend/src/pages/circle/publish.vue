<template>
  <view class="circle-publish-page">
    <!-- 状态栏 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶栏 -->
    <view class="circle-publish-header">
      <view class="publish-back-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="publish-page-title">发布动态</text>
      <view
        class="publish-submit-btn"
        :class="{ disabled: submitting || !canSubmit }"
        @click="onSubmit"
      >
        {{ submitting ? '发布中…' : '发布' }}
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view scroll-y class="circle-publish-body">
      <!-- 文本输入 -->
      <textarea
        class="publish-textarea"
        v-model="form.content"
        placeholder="分享你的生活故事…"
        :maxlength="500"
        auto-height
        :show-confirm-bar="false"
      />

      <!-- 图片选择区 -->
      <view class="publish-media-section">
        <text class="section-label">添加图片（最多9张）</text>
        <view class="media-grid">
          <view
            v-for="(img, idx) in form.images"
            :key="idx"
            class="media-item"
          >
            <image :src="img.filePath" mode="aspectFill" />
            <view class="remove-btn" @click="removeImage(idx)"><text>✕</text></view>
          </view>
          <view
            v-if="form.images.length < 9 && !form.video"
            class="media-add-btn"
            @click="chooseImage"
          >
            <text>＋</text>
          </view>
        </view>
      </view>

      <!-- 位置选项 -->
      <view class="publish-option-row" @click="chooseLocation">
        <text class="option-icon">📍</text>
        <text class="option-label">位置</text>
        <text class="option-value">{{ form.location?.name || '添加位置' }}</text>
        <text class="option-arrow">›</text>
      </view>

      <!-- 视频选项（与图片互斥） -->
      <view
        class="publish-option-row"
        :class="{ disabled: form.images.length > 0 }"
        @click="form.images.length === 0 ? chooseVideo() : null"
      >
        <text class="option-icon">🎬</text>
        <text class="option-label">{{ form.video ? '已选视频' : '添加视频' }}</text>
        <text class="option-value">
          {{ form.images.length > 0 ? '已选图片，不可同时添加' : (form.video ? form.video.fileName : '') }}
        </text>
        <text v-if="form.video" class="option-value" style="color:#ef4444;" @click.stop="removeVideo">✕</text>
        <text v-else class="option-arrow">›</text>
      </view>

      <!-- 可见性选择 -->
      <view class="visibility-picker">
        <text class="picker-label">谁可以看</text>
        <view class="picker-options">
          <view
            v-for="opt in visibilityOptions"
            :key="opt.value"
            class="picker-option"
            :class="{ selected: form.visibility === opt.value }"
            @click="form.visibility = opt.value"
          >
            <text class="option-icon">{{ opt.icon }}</text>
            <view class="option-info">
              <text class="option-title">{{ opt.title }}</text>
              <text class="option-desc">{{ opt.desc }}</text>
            </view>
            <view class="radio-dot" :class="{ selected: form.visibility === opt.value }" />
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCircleStore } from '@/stores/circle'
import { apiUploadMomentImage, apiUploadMomentVideo, apiCreatePost } from '@/services/api-moment'

const circleStore = useCircleStore()

const statusBarHeight = ref(0)
const submitting = ref(false)

const form = ref<{
  content: string
  images: { filePath: string; fileID: string }[]
  video: { filePath: string; fileID: string; duration?: number; fileName: string } | null
  location: { name: string; latitude?: number; longitude?: number } | null
  visibility: 'public' | 'login_only'
}>({
  content: '',
  images: [],
  video: null,
  location: null,
  visibility: 'public',
})

const visibilityOptions = [
  { value: 'public', icon: '🌏', title: '公开', desc: '所有人（包括未登录游客）均可浏览' },
  { value: 'login_only', icon: '🔐', title: '仅登录可见', desc: '游客看到占位卡，需登录后查看内容' },
]

const canSubmit = computed(() => {
  return !!form.value.content.trim() || form.value.images.length > 0 || !!form.value.video
})

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
})

function goBack() {
  uni.navigateBack()
}

async function chooseImage() {
  const remaining = 9 - form.value.images.length
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      uni.showLoading({ title: '上传中…', mask: true })
      try {
        for (const filePath of res.tempFilePaths) {
          const result = await apiUploadMomentImage(filePath)
          form.value.images.push({ filePath, fileID: result.fileID })
        }
      } catch {
        uni.showToast({ title: '上传失败，请重试', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
  })
}

function removeImage(idx: number) {
  form.value.images.splice(idx, 1)
}

async function chooseVideo() {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    success: async (res) => {
      if (res.duration && res.duration > 60) {
        uni.showToast({ title: '视频时长不超过60秒', icon: 'none' })
        return
      }
      uni.showLoading({ title: '上传视频中…', mask: true })
      try {
        const result = await apiUploadMomentVideo(res.tempFilePath, res.duration)
        const name = res.tempFilePath.split('/').pop() || 'video.mp4'
        form.value.video = {
          filePath: res.tempFilePath,
          fileID: result.fileID,
          duration: res.duration,
          fileName: name,
        }
      } catch {
        uni.showToast({ title: '视频上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
  })
}

function removeVideo() {
  form.value.video = null
}

function chooseLocation() {
  // #ifdef MP-WEIXIN
  wx.chooseLocation({
    success: (res: any) => {
      form.value.location = {
        name: res.name || res.address,
        latitude: res.latitude,
        longitude: res.longitude,
      }
    },
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '该功能仅微信小程序支持', icon: 'none' })
  // #endif
}

async function onSubmit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    const media = [
      ...form.value.images.map((img) => ({ type: 'image' as const, fileID: img.fileID })),
      ...(form.value.video
        ? [
            {
              type: 'video' as const,
              fileID: form.value.video.fileID,
              duration: form.value.video.duration,
            },
          ]
        : []),
    ]

    const newPost = await apiCreatePost({
      circleId: 'default_public',
      visibility: form.value.visibility,
      content: form.value.content.trim(),
      media,
      location: form.value.location,
    })

    circleStore.prependPost(newPost)
    uni.showToast({ title: '发布成功', icon: 'success' })

    setTimeout(() => uni.navigateBack(), 800)
  } catch (err: any) {
    uni.showToast({ title: err?.message || '发布失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>
