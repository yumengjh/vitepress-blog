@ -1,118 +0,0 @@
<template>
  <button
    class="VPSwitchAppearance"
    title="切换浅色/深色模式"
    @click="toggle"
  >
    <div class="sun">
      <div class="icon">
        <svg t="1746071447947" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6569" width="20"><path d="M510 192a32 32 0 0 1-32-32V80a32 32 0 1 1 64 0v80a32 32 0 0 1-32 32z m224.864 93.136a32 32 0 0 1 0-45.248l56.576-56.576a32 32 0 1 1 45.248 45.248l-56.56 56.56a32 32 0 0 1-45.264 0.016z m93.136 224.864a32 32 0 0 1 32-32h80a32 32 0 1 1 0 64h-80a32 32 0 0 1-32-32z m-93.136 224.864a32 32 0 0 1 45.248 0l56.56 56.56a32 32 0 1 1-45.248 45.248l-56.576-56.56a32 32 0 0 1 0.016-45.248zM510 828a32 32 0 0 1 32 32v80a32 32 0 1 1-64 0v-80a32 32 0 0 1 32-32z m-224.864-93.136a32 32 0 0 1 0 45.248l-56.56 56.56a32 32 0 0 1-45.248-45.248l56.576-56.56a32 32 0 0 1 45.232 0zM192 510a32 32 0 0 1-32 32H80a32 32 0 1 1 0-64h80a32 32 0 0 1 32 32z m93.136-224.864a32 32 0 0 1-45.248 0l-56.576-56.56a32 32 0 0 1 45.248-45.248l56.56 56.576a32 32 0 0 1 0.016 45.232zM510 272c132.544 0 240 107.456 240 240 0 132.544-107.456 240-240 240-132.544 0-240-107.456-240-240 0-132.544 107.456-240 240-240z m0 64c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176z" fill="#000000" p-id="6570"></path></svg>
      </div>
    </div>
    <div class="moon">
      <div class="icon">
        <svg t="1746071683316" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16460" width="20"><path d="M467.648 927.04a412.032 412.032 0 0 1-333.824-171.392 31.36 31.36 0 0 1 27.712-49.6l5.12 0.32c5.632 0.384 11.264 0.832 16.896 0.832a346.688 346.688 0 0 0 347.2-345.408 341.76 341.76 0 0 0-64.704-200.32 31.36 31.36 0 0 1 27.648-49.664 407.872 407.872 0 0 1-26.048 815.232z m-240.256-159.36A345.984 345.984 0 1 0 552.96 184.384a402.56 402.56 0 0 1 40.96 177.408 409.6 409.6 0 0 1-366.528 405.952z" fill="#bfbfbf" p-id="16461"></path></svg>
      </div>
    </div>
  </button>
</template>

<script setup>
import { useData } from 'vitepress'
import { inject, nextTick } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

// 尝试注入自定义切换函数，如果没有则使用默认切换方式
const toggleAppearance = inject('toggle-appearance', async (e) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const x = e.clientX
  const y = e.clientY

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  try {
    const transition = document.startViewTransition(async () => {
      isDark.value = !isDark.value
      await nextTick()
    })

    await transition.ready

    document.documentElement.animate(
      { clipPath: isDark.value ? clipPath.reverse() : clipPath },
      {
        duration: 300,
        easing: 'ease-in',
        pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
      }
    )
  } catch (error) {
    // 回退到普通切换
    console.error('View transitions not supported:', error)
    isDark.value = !isDark.value
  }
})

function toggle(e) {
  // toggleAppearance(e)
    isDark.value = !isDark.value
}
</script>

<style>
.VPSwitchAppearance {
  border: 0;
  padding: 0;
  width: 32px;
  height: 32px;
  background-color: transparent;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background-color 0.25s;
  vertical-align: middle;
  margin-top: 0;
  margin-bottom: 0;
}

.VPSwitchAppearance:hover {
  /* background-color: var(--vp-c-gray-soft); */
}

.VPSwitchAppearance .sun, 
.VPSwitchAppearance .moon {
  position: absolute;
  width: 18px;
  height: 18px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 0.25s, transform 0.25s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.VPSwitchAppearance .sun {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.VPSwitchAppearance .moon {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.66);
}

.dark .VPSwitchAppearance .sun {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.66);
}

.dark .VPSwitchAppearance .moon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* 添加动画效果 */
.VPSwitchAppearance .icon {
  font-size: 18px;
  transition: transform 0.3s ease;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.VPSwitchAppearance:hover .icon {
  transform: rotate(30deg);
}

/* 确保在导航栏中垂直居中 */
.VPNavBarHamburger + .VPSwitchAppearance,
.VPNavBarSearch + .VPSwitchAppearance,
.VPNavBarExtra + .VPSwitchAppearance {
  margin-left: 8px;
  transform: translateY(0);
}

/* 修复在移动设备上的位置 */
@media (max-width: 768px) {
  .VPSwitchAppearance {
    height: 36px;
  }
}

/* 视图过渡样式 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>