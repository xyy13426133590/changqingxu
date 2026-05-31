<template>
  <view class="circle-publish-page">
    <!-- 顶栏（与微信胶囊对齐，右侧避让） -->
    <view :style="capsuleNavOuterStyle">
      <view class="circle-publish-header" :style="capsuleNavRowStyle">
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
import { ref, computed } from 'vue'
import { useCircleStore } from '@/stores/circle'
import { useMyMomentsStore } from '@/stores/my-moments'
import { apiUploadMomentImage, apiUploadMomentVideo, apiCreatePost } from '@/services/api-moment'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'

const circleStore = useCircleStore()
const myMomentsStore = useMyMomentsStore()

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())
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
  const applyLocation = (res: UniApp.ChooseLocationSuccess) => {
    const name = (res.name || res.address || '').trim()
    if (!name) {
      uni.showToast({ title: '未获取到位置名称', icon: 'none' })
      return
    }
    form.value.location = {
      name,
      latitude: res.latitude,
      longitude: res.longitude,
    }
  }

  uni.getSetting({
    success: (settingRes) => {
      const granted = settingRes.authSetting?.['scope.userLocation']
      const openPicker = () => {
        uni.chooseLocation({
          success: applyLocation,
          fail: (err) => {
            const msg = err?.errMsg || ''
            if (msg.includes('cancel')) return
            if (msg.includes('auth deny') || msg.includes('authorize')) {
              uni.showModal({
                title: '需要位置权限',
                content: '请在设置中开启位置权限后，再选择发布位置',
                confirmText: '去设置',
                success: (m) => {
                  if (m.confirm) uni.openSetting({})
                },
              })
              return
            }
            uni.showToast({ title: '选择位置失败，请重试', icon: 'none' })
          },
        })
      }

      if (granted === false) {
        uni.showModal({
          title: '需要位置权限',
          content: '用于在动态中展示你选中的地点',
          confirmText: '去设置',
          success: (m) => {
            if (m.confirm) uni.openSetting({})
          },
        })
        return
      }

      if (granted === true) {
        openPicker()
        return
      }

      uni.authorize({
        scope: 'scope.userLocation',
        success: openPicker,
        fail: openPicker,
      })
    },
    fail: () => {
      uni.chooseLocation({ success: applyLocation })
    },
  })
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
    myMomentsStore.prependPost(newPost)

    uni.showModal({
      title: '发布成功 🎉',
      content: '动态已发布，是否查看我的动态？',
      confirmText: '我的动态',
      cancelText: '返回广场',
      success: (res) => {
        if (res.confirm) {
          uni.redirectTo({ url: '/pages/mine/my-moments' })
        } else {
          uni.navigateBack()
        }
      },
    })
  } catch (err: any) {
    const msg = err?.message || '发布失败，请重试'
    uni.showModal({
      title: '发布失败',
      content: msg,
      showCancel: false,
    })
  } finally {
    submitting.value = false
  }
}
</script>
