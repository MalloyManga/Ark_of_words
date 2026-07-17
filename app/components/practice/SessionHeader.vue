<script setup lang="ts">
interface SessionHeaderProps {
    currentPracticeLineTitle: string
    difficultyLabel: string
    currentItemNumber?: number
    totalItemCount?: number
}

const {
    currentPracticeLineTitle,
    difficultyLabel,
    currentItemNumber = 1,
    totalItemCount = 5,
} = defineProps<SessionHeaderProps>()
</script>

<template>
    <header class="relative z-20 flex items-center justify-between gap-4 max-w-7xl mx-auto w-full mb-8">
        <NuxtLink to="/practice"
            class="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 hover:-translate-x-1 transition-all"
            aria-label="返回难度选择">
            <IconBack class="w-5 h-5" />
        </NuxtLink>

        <div
            class="flex items-center gap-3 sm:gap-4 px-4 py-2 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm">
            <p class="hidden sm:block max-w-50 truncate text-sm font-bold text-slate-500 dark:text-slate-400">
                {{ currentPracticeLineTitle }}
            </p>

            <div class="w-px h-4 bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

            <span
                class="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-cyan-900/50 text-blue-600 dark:text-cyan-400 text-xs font-black tracking-wide">
                {{ difficultyLabel }}
            </span>

            <div class="flex items-baseline gap-1 text-blue-500 dark:text-cyan-500 font-black">
                <span class="text-base">{{ currentItemNumber }}</span>
                <span class="text-xs opacity-50">/ {{ totalItemCount }}</span>
            </div>
        </div>
    </header>
</template>
