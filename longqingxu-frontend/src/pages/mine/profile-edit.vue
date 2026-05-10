<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航 -->
    <view class="profile-header">
      <view class="back-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="title">完善资料</text>
    </view>

    <!-- 表单内容 -->
    <scroll-view class="profile-content" scroll-y show-scrollbar="false">
      <!-- 头像上传 -->
      <view class="avatar-upload">
        <view class="avatar-wrap" @click="uploadAvatar">
          <image class="avatar-img" :src="formData.avatar" mode="aspectFill" />
          <view class="camera-btn">
            <text>📷</text>
          </view>
        </view>
      </view>

      <!-- 基础信息 -->
      <view class="form-section profile-form-card">
        <view class="section-title">
          <text>基础信息</text>
        </view>
        <input
          class="form-input"
          v-model="formData.nickname"
          placeholder="昵称（2-16字符）"
          maxlength="16"
        />
        <view class="form-row">
          <picker class="form-select" mode="selector" :range="genderOptions" :value="genderIndex" @change="onGenderChange">
            <view class="form-select-label">{{ genderLabel }}</view>
          </picker>
          <picker class="form-select" mode="date" :value="formData.birthday" @change="onBirthdayChange">
            <view class="form-select-label">{{ formData.birthday || '生日' }}</view>
          </picker>
        </view>
        <view class="form-row">
          <input
            class="form-input"
            v-model="formData.height"
            type="number"
            placeholder="身高(cm)"
          />
          <input
            class="form-input"
            v-model="formData.weight"
            type="number"
            placeholder="体重(kg，可选)"
          />
        </view>
        <picker class="form-select" mode="region" @change="onHometownChange">
          <view class="form-select-label">{{ formData.hometown || '籍贯（省市区）' }}</view>
        </picker>
        <picker class="form-select" mode="region" @change="onLocationChange">
          <view class="form-select-label">{{ formData.location || '现居地（省市区）' }}</view>
        </picker>
      </view>

      <!-- 生辰信息 -->
      <view class="form-section profile-form-card">
        <view class="section-title">
          <text class="icon">✨</text>
          <text>生辰信息（自动生成）</text>
        </view>
        <view class="auto-info-grid">
          <view class="auto-info-item">
            <view class="auto-info-icon-slot">
              <text class="auto-info-icon-text">{{ getZodiacEmojiSafe(autoInfo.zodiac) }}</text>
            </view>
            <view class="info-value">{{ autoInfo.zodiac }}</view>
            <view class="info-label">生肖</view>
          </view>
          <view class="auto-info-item">
            <view class="auto-info-icon-slot">
              <text class="auto-info-icon-text auto-info-icon-symbol">{{ getZodiacSignSymbol(autoInfo.zodiacSign) }}</text>
            </view>
            <view class="info-value">{{ autoInfo.zodiacSign }}</view>
            <view class="info-label">星座</view>
          </view>
          <view class="auto-info-item">
            <view class="auto-info-icon-slot">
              <text class="auto-info-icon-text">🧩</text>
            </view>
            <view class="info-value font-mono">{{ autoInfo.mbti }}</view>
            <view class="info-label">MBTI</view>
          </view>
        </view>
        <view class="hint-box">
          <text>以上信息基于生日自动生成，仅供娱乐交友使用，不代表命理测算</text>
        </view>
        <picker class="form-select" mode="selector" :range="riyuanOptions" :value="riyuanIndex" @change="onRiyuanChange">
          <view class="form-select-label">{{ formData.riyuan || '日元（暂不填写）' }}</view>
        </picker>
      </view>

      <!-- 教育与职业 -->
      <view class="form-section profile-form-card">
        <view class="section-title">
          <text>教育与职业</text>
        </view>
        <picker class="form-select" mode="selector" :range="educationOptions" :value="educationIndex" @change="onEducationChange">
          <view class="form-select-label">{{ formData.education || '学历' }}</view>
        </picker>
        <view class="school-input-wrap">
          <view class="school-hint">支持模糊搜索匹配院校；若为 985 / 211 院校将自动展示对应标签，否则不展示。</view>
          <view class="school-tags">
            <view v-if="formData.schoolTier === '985'" class="tier-tag tag-985">985</view>
            <view v-if="formData.schoolTier === '211'" class="tier-tag tag-211">211</view>
          </view>
          <input
            class="form-input"
            v-model="formData.school"
            placeholder="毕业院校（可选），输入如「清华」「北工大」"
            @input="onSchoolInput"
          />
        </view>
        <picker class="form-select" mode="selector" :range="occupationOptions" :value="occupationIndex" @change="onOccupationChange">
          <view class="form-select-label">{{ formData.occupation || '职业' }}</view>
        </picker>
        <picker class="form-select" mode="selector" :range="jobLevelOptions" :value="jobLevelIndex" @change="onJobLevelChange">
          <view class="form-select-label">{{ formData.jobLevel || '职级（可选）' }}</view>
        </picker>
        <input
          class="form-input"
          v-model="formData.company"
          placeholder="公司/单位（可选）"
        />
        <picker class="form-select" mode="selector" :range="incomeOptions" :value="incomeIndex" @change="onIncomeChange">
          <view class="form-select-label">{{ formData.income || '年收入' }}</view>
        </picker>
      </view>

      <!-- 兴趣爱好 -->
      <view class="form-section profile-form-card">
        <view class="section-title">
          <text>兴趣爱好</text>
        </view>
        <view class="hobby-tags">
          <view
            v-for="hobby in hobbyOptions"
            :key="hobby"
            class="hobby-tag"
            :class="{ active: formData.hobbies.includes(hobby) }"
            @click="toggleHobby(hobby)"
          >
            {{ hobby }}
          </view>
        </view>
      </view>

      <!-- 自我介绍 -->
      <view class="form-section profile-form-card">
        <view class="section-title">
          <text>自我介绍</text>
        </view>
        <textarea
          class="form-textarea"
          v-model="formData.bio"
          placeholder="介绍一下自己吧（200字以内）"
          maxlength="200"
        />
        <view class="char-count">{{ formData.bio.length }}/200</view>
      </view>

      <!-- 保存按钮 -->
      <view class="save-btn" @click="saveProfile">
        <text>保存并进入首页</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { avatarUrl } from '@/utils/avatar'
import { getBirthInfo, getZodiacEmoji as getZodiacEmojiFromDate, getZodiacSignSymbol } from '@/utils/date'

// 安全的 emoji 获取函数
function getZodiacEmojiSafe(zodiac: string): string {
  return getZodiacEmojiFromDate(zodiac) || '🐰'
}

const userStore = useUserStore()

// 表单数据
const formData = reactive({
  avatar:
    userStore.profile.avatar ||
    avatarUrl('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'),
  nickname: userStore.profile.nickname || '',
  gender: userStore.profile.gender || '',
  birthday: userStore.profile.birthday || '',
  height: userStore.profile.height?.toString() || '',
  weight: userStore.profile.weight?.toString() || '',
  hometown: userStore.profile.hometown || '',
  location: userStore.profile.location || '',
  riyuan: userStore.profile.riyuan || '',
  education: userStore.profile.education || '',
  school: userStore.profile.school || '',
  schoolTier: userStore.profile.schoolTier || null,
  occupation: userStore.profile.occupation || '',
  jobLevel: userStore.profile.jobLevel || '',
  company: userStore.profile.company || '',
  income: userStore.profile.income || '',
  bio: userStore.profile.bio || '',
  hobbies: userStore.profile.hobbies || [],
})

// 自动生成信息
const autoInfo = computed(() => {
  if (!formData.birthday) {
    return {
      zodiac: userStore.profile.zodiac || '兔',
      zodiacSign: userStore.profile.zodiacSign || '天秤座',
      mbti: userStore.profile.mbti || 'INFP',
    }
  }
  const birthDate = new Date(formData.birthday)
  const info = getBirthInfo(birthDate)
  return {
    zodiac: info.zodiac,
    zodiacSign: info.zodiacSign,
    mbti: info.mbti,
  }
})

// 选项列表
const genderOptions = ['男', '女']
const genderIndex = computed(() => {
  if (formData.gender === 'male') return 0
  if (formData.gender === 'female') return 1
  return 0
})

const genderLabel = computed(() => {
  if (formData.gender === 'male') return '男'
  if (formData.gender === 'female') return '女'
  return '性别'
})

const riyuanOptions = ['暂不填写', '甲木 🌲', '乙木 🌿', '丙火 🔥', '丁火 🕯️', '戊土 ⛰️', '己土 🌾', '庚金 ⚔️', '辛金 💎', '壬水 🌊', '癸水 💧']
const riyuanIndex = computed(() => {
  const map: Record<string, number> = { '甲木': 1, '乙木': 2, '丙火': 3, '丁火': 4, '戊土': 5, '己土': 6, '庚金': 7, '辛金': 8, '壬水': 9, '癸水': 10 }
  return map[formData.riyuan || ''] || 0
})

const educationOptions = ['大专及以下', '本科', '硕士及以上']
const educationIndex = computed(() => educationOptions.indexOf(formData.education))

const occupationOptions = ['IT互联网', '金融', '教育', '医疗', '制造业', '服务业', '公务员', '自由职业', '其他']
const occupationIndex = computed(() => occupationOptions.indexOf(formData.occupation))

const jobLevelOptions = ['一线 / 执行', '骨干 / 资深', '主管 / 组长', '经理 / 中级管理', '总监及以上 / 高管', '创始人 / 合伙人', '自由职业 / 其他']
const jobLevelIndex = computed(() => jobLevelOptions.indexOf(formData.jobLevel))

const incomeOptions = ['5万及以下', '5万-10万', '10万-20万', '20万-30万', '30万-50万', '50万以上']
const incomeIndex = computed(() => incomeOptions.indexOf(formData.income))

const hobbyOptions = ['旅行', '美食', '摄影', '运动', '阅读', '音乐', '电影', '游戏']

// 模拟985/211院校数据
const tier985Schools = ['清华', '北大', '复旦', '上交', '浙大', '南大', '中科大', '人大', '北航', '同济']
const tier211Schools = ['北工大', '北邮', '北交', '北科', '北化', '北林', '北中医', '对外经贸', '中财', '上财']

// 事件处理
function onGenderChange(e: { detail: { value: number } }) {
  formData.gender = e.detail.value === 0 ? 'male' : 'female'
}

function onBirthdayChange(e: { detail: { value: string } }) {
  formData.birthday = e.detail.value
}

function onHometownChange(e: { detail: { value: string[] } }) {
  formData.hometown = e.detail.value.join(' ')
}

function onLocationChange(e: { detail: { value: string[] } }) {
  formData.location = e.detail.value.join(' ')
}

function onRiyuanChange(e: { detail: { value: number } }) {
  const map = ['', '甲木', '乙木', '丙火', '丁火', '戊土', '己土', '庚金', '辛金', '壬水', '癸水']
  formData.riyuan = map[e.detail.value]
}

function onEducationChange(e: { detail: { value: number } }) {
  formData.education = educationOptions[e.detail.value]
}

function onSchoolInput() {
  // 模拟模糊搜索检测985/211
  const input = formData.school.toLowerCase()
  formData.schoolTier = null
  for (const school of tier985Schools) {
    if (input.includes(school)) {
      formData.schoolTier = '985'
      return
    }
  }
  for (const school of tier211Schools) {
    if (input.includes(school)) {
      formData.schoolTier = '211'
      return
    }
  }
}

function onOccupationChange(e: { detail: { value: number } }) {
  formData.occupation = occupationOptions[e.detail.value]
}

function onJobLevelChange(e: { detail: { value: number } }) {
  formData.jobLevel = jobLevelOptions[e.detail.value]
}

function onIncomeChange(e: { detail: { value: number } }) {
  formData.income = incomeOptions[e.detail.value]
}

function toggleHobby(hobby: string) {
  const index = formData.hobbies.indexOf(hobby)
  if (index > -1) {
    formData.hobbies.splice(index, 1)
  } else {
    formData.hobbies.push(hobby)
  }
}

function uploadAvatar() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      formData.avatar = res.tempFilePaths[0]
    },
  })
}

function saveProfile() {
  // 更新store
  userStore.updateProfile({
    ...formData,
    zodiac: autoInfo.value.zodiac,
    zodiacSign: autoInfo.value.zodiacSign,
    mbti: autoInfo.value.mbti,
  })
  // 返回首页
  uni.switchTab({ url: '/pages/discover/index' })
}

function goBack() {
  uni.navigateBack({
    fail: () => uni.switchTab({ url: '/pages/mine/index' }),
  })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.back-btn {
  margin-right: 72rpx;
}
</style>