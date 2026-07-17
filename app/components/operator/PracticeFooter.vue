<script setup lang="ts">
interface PracticeFooterProps {
    selectedVoiceLineCount: number
}

defineProps<PracticeFooterProps>()

const emit = defineEmits<{
    startPractice: []
}>()
</script>

<template>
    <footer
        class="mt-4 pt-4 flex justify-center lg:justify-end pb-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <button type="button"
            class="relative overflow-hidden group flex items-center justify-center w-full sm:w-64 h-14 rounded-2xl text-lg font-black transition-all duration-300"
            :class="selectedVoiceLineCount > 0
                ? 'bg-slate-800 dark:bg-cyan-50 text-white dark:text-cyan-950 shadow-lg shadow-slate-800/20 dark:shadow-cyan-400/20 hover:-translate-y-1 hover:shadow-xl'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'"
            :disabled="selectedVoiceLineCount === 0" @click="emit('startPractice')">
            <div v-if="selectedVoiceLineCount > 0"
                class="absolute inset-0 w-full h-full bg-linear-to-r from-blue-500 to-cyan-500 dark:from-cyan-300 dark:to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span class="relative flex items-center gap-2 group-hover:text-white transition-colors">
                开始练习
                <IconChevronRight v-if="selectedVoiceLineCount > 0" alignment="right"
                    class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
        </button>
    </footer>
</template>
