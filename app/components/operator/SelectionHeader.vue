<script setup lang="ts">
interface SelectionHeaderProps {
    selectedVoiceLineCount: number
}

defineProps<SelectionHeaderProps>()
</script>

<template>
    <header
        class="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
        <NuxtLink to="/"
            class="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 hover:-translate-x-1 transition-all"
            aria-label="返回首页">
            <IconBack class="w-5 h-5" />
        </NuxtLink>

        <div
            class="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm"
            aria-live="polite">
            <div class="relative text-slate-600 dark:text-slate-400">
                <IconCart class="w-5 h-5" />
                <span v-if="selectedVoiceLineCount > 0" :key="selectedVoiceLineCount"
                    class="selection-bump absolute -right-2 -top-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-blue-500 dark:bg-cyan-500 text-[10px] font-black text-white shadow-md shadow-blue-500/30 dark:shadow-cyan-500/30">
                    {{ selectedVoiceLineCount }}
                </span>
            </div>
            <span class="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">已选台词</span>
        </div>
    </header>
</template>

<style scoped>
.selection-bump {
    animation: selection-bump 220ms ease-out;
}

@keyframes selection-bump {
    0% {
        transform: scale(0.88);
    }

    65% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}
</style>
