<template>
  <div class="lamp-intro" :class="{ 'is-leaving': isLeaving, 'is-gone': isGone }">
    <div class="lamp-scene">
      <div class="ambient-glow" :style="{ opacity: lightIntensity * 0.6 }"></div>

      <svg class="lamp-svg" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lightGlow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" :stop-color="`rgba(255,183,77,${lightIntensity * 0.9})`" />
            <stop offset="40%" :stop-color="`rgba(255,152,0,${lightIntensity * 0.4})`" />
            <stop offset="100%" stop-color="rgba(255,152,0,0)" />
          </radialGradient>
          <linearGradient id="lampBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4a4a5a" />
            <stop offset="50%" stop-color="#3a3a4a" />
            <stop offset="100%" stop-color="#2a2a3a" />
          </linearGradient>
          <linearGradient id="lampShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5a5a6a" />
            <stop offset="100%" stop-color="#3a3a4a" />
          </linearGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g class="lamp-light-cone" :style="{ opacity: lightIntensity }">
          <path d="M160 190 L100 520 L300 520 L240 190 Z" fill="url(#lightGlow)" />
        </g>

        <g class="lamp-structure">
          <rect x="185" y="40" width="30" height="8" rx="4" fill="url(#lampBody)" />
          <rect x="196" y="48" width="8" height="60" fill="url(#lampBody)" />

          <path d="M140 108 Q200 95 260 108 L250 140 Q200 132 150 140 Z" fill="url(#lampShade)" stroke="#6a6a7a" stroke-width="1" />
          <path d="M150 140 Q200 132 250 140 L245 155 Q200 148 155 155 Z" fill="#2a2a3a" />

          <ellipse v-if="lightIntensity > 0.1" cx="200" cy="148" rx="42" ry="6" :fill="`rgba(255,183,77,${lightIntensity * 0.8})`" filter="url(#glowFilter)" />

          <rect x="196" y="155" width="8" height="180" fill="url(#lampBody)" />
          <ellipse cx="200" cy="335" rx="50" ry="8" fill="url(#lampBody)" />
          <rect x="150" y="335" width="100" height="10" rx="5" fill="url(#lampShade)" />
        </g>

        <g class="lamp-cord" @click="pullCord" style="cursor: pointer">
          <line x1="200" y1="40" x2="200" :y2="40 + cordPull" stroke="#8a8a9a" stroke-width="2" />
          <circle cx="200" :cy="50 + cordPull" r="6" fill="#8a8a9a" class="cord-ball" :class="{ 'cord-pulled': isPulling }" />
          <text x="200" :y="80 + cordPull" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="11" font-family="sans-serif" v-if="!isPulling">
            {{ pullCount === 0 ? '拉动灯绳' : '' }}
          </text>
        </g>
      </svg>

      <div class="intro-text" :style="{ opacity: Math.max(0, lightIntensity - 0.3) }">
        <h1 class="intro-title">技术创造价值</h1>
        <p class="intro-subtitle">分享技术思考，记录成长轨迹</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const lightIntensity = ref(0)
const cordPull = ref(0)
const isPulling = ref(false)
const isLeaving = ref(false)
const isGone = ref(false)
const pullCount = ref(0)

function pullCord() {
  if (isPulling.value || isLeaving.value) return
  pullCount.value++
  isPulling.value = true

  cordPull.value = 20
  setTimeout(() => { cordPull.value = 0 }, 200)

  const targetIntensity = Math.min(1, lightIntensity.value + 0.35)
  animateLight(targetIntensity)

  setTimeout(() => {
    isPulling.value = false
    if (lightIntensity.value >= 0.95) {
      setTimeout(() => startTransition(), 800)
    }
  }, 300)
}

function animateLight(target: number) {
  const start = lightIntensity.value
  const diff = target - start
  const duration = 600
  const startTime = performance.now()

  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    lightIntensity.value = start + diff * eased
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function startTransition() {
  isLeaving.value = true
  setTimeout(() => {
    isGone.value = true
    emit('complete')
  }, 1000)
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.lamp-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #08080d;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.lamp-intro.is-leaving {
  opacity: 0;
  transform: scale(1.05);
}

.lamp-intro.is-gone {
  display: none;
}

.lamp-scene {
  position: relative;
  width: 400px;
  height: 600px;
  max-width: 90vw;
  max-height: 80vh;
}

.ambient-glow {
  position: absolute;
  inset: -100px;
  background: radial-gradient(ellipse at 50% 35%, rgba(255, 183, 77, 0.3), transparent 70%);
  pointer-events: none;
  transition: opacity 0.5s;
}

.lamp-svg {
  width: 100%;
  height: 100%;
}

.lamp-light-cone {
  transition: opacity 0.5s ease;
}

.cord-ball {
  transition: transform 0.15s ease, fill 0.3s ease;
  transform-origin: center;
}

.cord-ball.cord-pulled {
  fill: #ffb74d;
  transform: scale(1.3);
}

.cord-ball:hover {
  fill: #ccc;
}

.intro-text {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  transition: opacity 0.6s ease;
  pointer-events: none;
  white-space: nowrap;
}

.intro-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #ffb74d;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 40px rgba(255, 183, 77, 0.4);
}

.intro-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.1em;
}
</style>
