<script setup lang="ts">
import { ref } from 'vue'
import wisadelImage from '../assets/imgs/Wiš\'adel.png'

// Nuxt 中推荐使用 @nuxtjs/color-mode 来控制主题
const isDarkMode = ref(false)
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  // 初始化时读取本地存储或系统偏好
  if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
})

const features = [
    {
        icon: '🎧',
        title: '听音打字练习',
        desc: '沉浸式聆听干员语音，智能判断输入正误，自动过滤标点，专注日语敲击。',
        color: 'from-blue-400 to-cyan-300 dark:from-blue-500/50 dark:to-cyan-400/50'
    },
    {
        icon: '🎵',
        title: 'K歌级歌词滚动',
        desc: '结合语音时间轴，实现卡拉OK级别的逐词/逐句高亮，精准卡点。',
        color: 'from-indigo-400 to-purple-300 dark:from-indigo-500/50 dark:to-purple-400/50'
    },
    {
        icon: '📚',
        title: '智能单词解析',
        desc: '内置NLP自然语言处理，智能解析台词中的单词，提供原形还原与词性辅助。',
        color: 'from-amber-400 to-orange-300 dark:from-amber-500/50 dark:to-orange-400/50'
    },
    {
        icon: '📊',
        title: '动态难度分级',
        desc: '从简短有力的作战指令，到饱含深情的日常长语音，循序渐进。',
        color: 'from-emerald-400 to-teal-300 dark:from-emerald-500/50 dark:to-teal-400/50'
    }
]

const footerLinks = [
    { label: 'Bilibili', to: '#', icon: '📺' },
    { label: 'GitHub 开源', to: 'https://github.com/MalloyManga/Ark_of_words', icon: '🐈‍⬛' },
    { label: 'PRTS Wiki', to: 'https://prts.wiki/', icon: '💠' },
]
</script>

<template>
    <div
        class="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-cyan-900 overflow-hidden flex flex-col transition-colors duration-500">

        <!-- 环境光晕 (Ambient Glow) - 夜间模式下变成更深邃的霓虹光 -->
        <div
            class="pointer-events-none absolute top-[-10%] left-[-10%] size-125 rounded-full bg-blue-300/30 dark:bg-blue-900/30 blur-[100px] transition-colors duration-500" />
        <div
            class="pointer-events-none absolute bottom-[-10%] right-[-10%] size-160 rounded-full bg-indigo-300/20 dark:bg-indigo-900/20 blur-[120px] transition-colors duration-500" />
        <div
            class="pointer-events-none absolute top-[20%] right-[10%] size-75 rounded-full bg-cyan-200/40 dark:bg-cyan-800/30 blur-[80px] transition-colors duration-500" />

        <!-- 顶部导航栏 -->
        <header class="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
            <div class="flex items-center gap-3 cursor-pointer group">
                <!-- Logo -->
                <div
                    class="flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/30 dark:shadow-cyan-900/50 group-hover:scale-110 transition-transform duration-300">
                    A
                </div>
                <div class="flex flex-col">
                    <span
                        class="font-black text-xl tracking-tight text-slate-800 dark:text-slate-100 transition-colors">Ark_of_words</span>
                    <span
                        class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Operator
                        Voice Terminal</span>
                </div>
            </div>

            <!-- 快捷入口 & 主题切换 -->
            <nav class="hidden md:flex items-center gap-6 font-medium text-sm text-slate-500 dark:text-slate-400">
                <NuxtLink to="/practice" class="hover:text-blue-500 dark:hover:text-cyan-400 transition-colors">开始听写
                </NuxtLink>
                <NuxtLink to="/operators" class="hover:text-blue-500 dark:hover:text-cyan-400 transition-colors">干员图鉴
                </NuxtLink>

                <div class="w-px h-4 bg-slate-300 dark:bg-slate-700 transition-colors"></div> <!-- 分割线 -->

                <!-- 主题切换按钮 -->
                <button @click="toggleTheme"
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-cyan-400 transition-all"
                    aria-label="Toggle Dark Mode">
                    <!-- 太阳 (白天显示) -->
                    <IconSun v-if="isDarkMode" class="w-4 h-4" />
                    <!-- 月亮 (夜间显示) -->
                    <IconMoon v-else class="w-4 h-4" />
                </button>
            </nav>
        </header>

        <!-- 核心主体内容 -->
        <main class="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 sm:px-8 pb-20">

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">

                <!-- 左侧：文案与按钮 -->
                <div class="flex flex-col items-start gap-6 pt-10 lg:pt-0">
                    <!-- 小标签 (适配夜间模式的边框和背景) -->
                    <div
                        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm dark:shadow-none text-xs font-bold text-blue-500 dark:text-cyan-400 tracking-wide transition-colors">
                        <span class="relative flex h-2 w-2">
                            <span
                                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-cyan-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-cyan-500"></span>
                        </span>
                        LISTEN · TYPE · LEARN
                    </div>

                    <h1
                        class="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-slate-800 dark:text-slate-100 transition-colors">
                        听干员语音 <br />
                        <span
                            class="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-400 dark:from-cyan-400 dark:to-blue-500">
                            敲日语台词。
                        </span>
                    </h1>

                    <p
                        class="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-medium transition-colors">
                        告别冷冰冰的语言试卷。在这里，每一次敲击键盘，都是与喜爱干员的一次灵魂共鸣。结合自然语言解析与K歌级高亮，让你的日语学习变成一场轻快的游戏。
                    </p>

                    <div class="flex flex-wrap items-center gap-4 mt-4">
                        <!-- 主按钮：白天深色，夜间浅色发光 -->
                        <NuxtLink to="/practice"
                            class="relative overflow-hidden group px-8 py-4 rounded-2xl bg-slate-800 dark:bg-cyan-50 text-white dark:text-cyan-950 font-bold text-lg shadow-xl shadow-slate-800/20 dark:shadow-cyan-400/20 hover:-translate-y-1 transition-all duration-300">
                            <div
                                class="absolute inset-0 w-full h-full bg-linear-to-r from-blue-500 to-cyan-500 dark:from-cyan-300 dark:to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            </div>
                            <span class="relative flex items-center gap-2 group-hover:text-white transition-colors">
                                开始练习
                                <IconChevronsRight
                                    class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </NuxtLink>

                        <!-- 次按钮：白天白玻，夜间黑玻 -->
                        <NuxtLink to="/operators"
                            class="px-8 py-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-bold text-lg shadow-sm hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                            浏览干员库
                        </NuxtLink>
                    </div>
                </div>

                <!-- 右侧：精美立绘展示 -->
                <div class="relative w-full h-full flex items-center justify-center min-h-100">
                    <!-- 装饰环 -->
                    <div
                        class="absolute w-[80%] h-[80%] rounded-full border-2 border-dashed border-blue-200/50 dark:border-cyan-700/40 animate-[spin_60s_linear_infinite] transition-colors">
                    </div>
                    <div
                        class="absolute w-[60%] h-[60%] rounded-full bg-linear-to-tr from-blue-100/40 to-cyan-100/40 dark:from-cyan-900/30 dark:to-blue-900/30 blur-2xl transition-colors">
                    </div>

                    <!-- 悬浮的日文假名装饰 -->
                    <span
                        class="absolute top-10 right-10 text-4xl text-blue-300/40 dark:text-cyan-400/20 font-black floating-slow select-none transition-colors">あ</span>
                    <span
                        class="absolute bottom-20 left-4 text-5xl text-indigo-300/30 dark:text-indigo-400/20 font-black floating-slow delay-150 select-none transition-colors">キ</span>
                    <span
                        class="absolute top-1/2 right-4 text-3xl text-cyan-300/40 dark:text-blue-400/20 font-black floating-slow delay-300 select-none transition-colors">ル</span>

                    <!-- 立绘图片 -->
                    <img :src="wisadelImage" alt="Wiš'adel 立绘" draggable="false"
                        class="relative z-10 w-full max-w-125 object-contain drop-shadow-2xl dark:drop-shadow-[0_20px_40px_rgba(34,211,238,0.15)] floating select-none transition-all duration-500">

                    <!-- 立绘标签卡片 (夜间模式为暗黑玻璃) -->
                    <div
                        class="absolute bottom-4 right-4 z-20 px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-xl shadow-blue-900/5 dark:shadow-black/50 flex flex-col gap-1 floating-slow transition-colors">
                        <span
                            class="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Featured
                            Operator</span>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-slate-800 dark:text-slate-200">Wiš'adel</span>
                            <span
                                class="px-2 py-0.5 rounded-md bg-amber-400 dark:bg-amber-500 text-white text-[10px] font-bold">6★</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 特性展示 Bento Grid -->
            <div class="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="(item, index) in features" :key="index"
                    class="group relative overflow-hidden rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg border border-white/60 dark:border-slate-700/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_40px_rgb(59,130,246,0.1)] dark:hover:shadow-[0_8px_40px_rgb(34,211,238,0.1)] transition-all duration-500 hover:-translate-y-1">
                    <!-- 卡片背景光晕效果 -->
                    <div
                        :class="`absolute -top-10 -right-10 w-32 h-32 bg-linear-to-br ${item.color} rounded-full blur-3xl opacity-20 dark:opacity-30 group-hover:opacity-50 dark:group-hover:opacity-60 transition-opacity duration-500`">
                    </div>

                    <div class="relative z-10">
                        <!-- Icon 框在夜间变成暗色带微光 -->
                        <div
                            class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-2xl mb-4 transition-colors">
                            {{ item.icon }}
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">{{
                            item.title }}</h3>
                        <p
                            class="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors">
                            {{ item.desc }}
                        </p>
                    </div>
                </div>
            </div>

        </main>

        <!-- 底部 Footer -->
        <!-- 夜间模式底栏加深，完全融入背景 -->
        <footer
            class="relative z-10 w-full border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-950/50 backdrop-blur-md transition-colors duration-500">
            <div
                class="max-w-7xl mx-auto px-6 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">

                <div class="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                    <span class="font-bold text-slate-700 dark:text-slate-300 transition-colors">Ark_of_words <span
                            class="text-sm font-normal text-slate-500 dark:text-slate-500 ml-2">by Malloy</span></span>
                    <p class="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-md transition-colors">
                        本项目仅用于学习交流，禁止用于盈利。<br class="md:hidden" />所有素材均来自上海鹰角网络，版权归原权利方所有。
                    </p>
                </div>

                <nav class="flex items-center gap-3">
                    <a v-for="link in footerLinks" :key="link.label" :href="link.to" target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all shadow-sm hover:shadow">
                        <span>{{ link.icon }}</span>
                        <span>{{ link.label }}</span>
                    </a>
                </nav>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* 悬浮动画：主立绘 */
.floating {
    animation: float 6s ease-in-out infinite;
}

/* 悬浮动画：小装饰物 */
.floating-slow {
    animation: float 8s ease-in-out infinite;
}

.delay-150 {
    animation-delay: 1.5s;
}

.delay-300 {
    animation-delay: 3s;
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-15px);
    }

    100% {
        transform: translateY(0px);
    }
}
</style>
