<script setup lang="ts">
import type { PracticeDifficulty } from '~/constants/practiceDifficulties'

interface DifficultyOption {
    value: PracticeDifficulty
    label: string
    desc: string
    icon: string
    gradient: string
    darkGradient: string
}

const difficultyOptions: readonly DifficultyOption[] = [
    {
        value: 'easy',
        label: '简 单',
        desc: '较短的作战指令与干员报到语音。',
        icon: '🍀',
        gradient: 'from-emerald-400 to-teal-400',
        darkGradient: 'dark:from-emerald-600/60 dark:to-teal-500/60',
    },
    {
        value: 'normal',
        label: '中 等',
        desc: '带有情绪起伏的日常交流与战斗语音。',
        icon: '⚡',
        gradient: 'from-amber-400 to-orange-400',
        darkGradient: 'dark:from-amber-600/60 dark:to-orange-500/60',
    },
    {
        value: 'hard',
        label: '困 难',
        desc: '长段落的干员信赖交谈与复杂台词。',
        icon: '🔥',
        gradient: 'from-rose-400 to-red-500',
        darkGradient: 'dark:from-rose-600/60 dark:to-red-600/60',
    },
    {
        value: 'custom',
        label: '自由配置',
        desc: '按需组合干员、难度与语音类型。',
        icon: '⚙️',
        gradient: 'from-indigo-400 to-purple-500',
        darkGradient: 'dark:from-indigo-600/60 dark:to-purple-600/60',
    },
] as const
</script>

<template>
    <main
        class="relative min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-8 text-slate-800 dark:text-slate-100 flex items-center justify-center overflow-hidden transition-colors duration-500">

        <!-- 氛围光晕背景 -->
        <div
            class="pointer-events-none absolute top-[10%] left-[20%] w-100 rounded-full bg-blue-300/20 dark:bg-blue-900/20 blur-[100px] transition-colors duration-500" />
        <div
            class="pointer-events-none absolute bottom-[10%] right-[20%] w-125 rounded-full bg-purple-300/20 dark:bg-purple-900/20 blur-[120px] transition-colors duration-500" />

        <section class="relative z-10 w-full max-w-4xl flex flex-col items-center">

            <!-- 顶部导航条 -->
            <div class="w-full flex items-center justify-between mb-12">
                <NuxtLink to="/"
                    class="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 hover:-translate-x-1 transition-all">
                    <IconBack class="w-6 h-6" />
                </NuxtLink>
            </div>

            <!-- 标题区 -->
            <div class="text-center mb-16">
                <p class="text-sm font-black uppercase tracking-widest text-blue-500 dark:text-cyan-500 mb-2">Select
                    Difficulty</p>
                <h1 class="text-4xl sm:text-5xl font-black tracking-tight">选择训练强度</h1>
            </div>

            <!-- 难度选择网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
                <NuxtLink v-for="option in difficultyOptions" :key="option.value"
                    :to="`/practice/session?difficulty=${option.value}`"
                    class="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 p-6 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                    <!-- 悬浮光晕 -->
                    <div
                        :class="`absolute inset-0 opacity-0 group-hover:opacity-10 bg-linear-to-br ${option.gradient} dark:opacity-0 dark:group-hover:opacity-20 transition-opacity duration-500`">
                    </div>

                    <!-- 图标区域 -->
                    <div
                        :class="`flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br ${option.gradient} ${option.darkGradient} text-2xl shadow-lg text-white transition-colors`">
                        {{ option.icon }}
                    </div>

                    <!-- 文字信息 -->
                    <div class="flex-1">
                        <h2
                            class="text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {{ option.label }}</h2>
                        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                            {{ option.desc }}
                        </p>
                    </div>

                    <!-- 右侧箭头 -->
                    <div
                        class="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">
                        <IconChevronRight class="w-6 h-6" :stroke-width="3" />
                    </div>
                </NuxtLink>
            </div>
        </section>
    </main>
</template>
