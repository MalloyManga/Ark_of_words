<script setup lang="ts">
interface DataLoadingPanelProps {
    loadedOperatorCount: number
    requiredOperatorCount: number
}

const { loadedOperatorCount, requiredOperatorCount } = defineProps<DataLoadingPanelProps>()

const loadingProgressPercent = computed(() => {
    if (requiredOperatorCount <= 0) {
        return 100
    }

    return Math.min(Math.round((loadedOperatorCount / requiredOperatorCount) * 100), 100)
})
</script>

<template>
    <section class="flex w-full flex-col items-center justify-center py-12 text-center sm:py-16"
        aria-live="polite" aria-busy="true">
        <span
            class="size-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500 dark:border-slate-700 dark:border-t-cyan-400" />
        <h2 class="mt-6 text-xl font-black text-slate-800 dark:text-slate-100 sm:text-2xl">
            正在准备练习数据
        </h2>
        <p class="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            已加载 {{ loadedOperatorCount }} / {{ requiredOperatorCount }} 位干员
        </p>
        <div class="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80"
            role="progressbar" aria-label="练习数据加载进度" aria-valuemin="0" aria-valuemax="100"
            :aria-valuenow="loadingProgressPercent">
            <div
                class="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-400 transition-[width] duration-500 ease-out dark:from-cyan-400 dark:to-blue-500"
                :style="{ width: `${loadingProgressPercent}%` }" />
        </div>
        <span class="mt-2 text-xs font-black tabular-nums text-blue-500 dark:text-cyan-400">
            {{ loadingProgressPercent }}%
        </span>
        <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
            首次生成日文读音时会稍慢 后续将直接使用缓存
        </p>
    </section>
</template>
