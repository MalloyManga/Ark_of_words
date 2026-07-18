<script setup lang="ts">
interface CompletionPanelProps {
    completedItemCount: number
    isCustomPractice: boolean
}

defineProps<CompletionPanelProps>()

const emit = defineEmits<{
    chooseNextPractice: []
    restartPractice: []
}>()
</script>

<template>
    <section class="flex w-full flex-col items-center justify-center py-8 text-center sm:py-12"
        aria-labelledby="practice-completion-title">
        <span class="text-xs font-black uppercase tracking-[0.25em] text-blue-500 dark:text-cyan-400">
            Practice Complete
        </span>
        <h2 id="practice-completion-title"
            class="mt-3 text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
            本轮练习完成
        </h2>
        <p class="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
            已完成 {{ completedItemCount }} 条语音练习
        </p>

        <div class="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row-reverse">
            <button type="button"
                class="group relative flex min-h-12 flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-800 px-6 font-bold text-white shadow-lg shadow-slate-800/10 transition-all duration-300 hover:-translate-y-0.5 dark:bg-cyan-50 dark:text-cyan-950 dark:shadow-cyan-400/20"
                @click="emit('chooseNextPractice')">
                <span
                    class="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-cyan-300 dark:to-blue-400" />
                <span class="relative transition-colors group-hover:text-white">
                    {{ isCustomPractice ? '重新配置' : '换一组' }}
                </span>
            </button>

            <button type="button"
                class="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-slate-100 px-6 font-bold text-slate-600 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                @click="emit('restartPractice')">
                再次练习
            </button>
        </div>
    </section>
</template>
