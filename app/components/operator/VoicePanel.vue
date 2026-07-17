<script setup lang="ts">
import type { OperatorDisplayItem } from '~/types/operator'

interface VoicePanelProps {
    activeOperator?: OperatorDisplayItem
    isVoiceLineSelected: (operatorId: string, voiceLineId: string) => boolean
}

defineProps<VoicePanelProps>()

const emit = defineEmits<{
    toggleVoiceLine: [operatorId: string, voiceLineId: string]
}>()
</script>

<template>
    <Transition name="voice-panel">
        <aside v-if="activeOperator"
            class="flex flex-col min-w-0 overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 shadow-xl shadow-blue-900/5 dark:shadow-black/20 lg:sticky lg:top-5 lg:max-h-[calc(100vh-8rem)]">
            <div
                class="grid shrink-0 grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[6.5rem_minmax(0,1fr)] bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 text-sm font-bold text-slate-600 dark:text-slate-300">
                <span class="border-r border-slate-200 dark:border-slate-700 px-4 py-3">条目</span>
                <span class="px-4 py-3">文本详情</span>
            </div>

            <div class="flex-1 overflow-y-auto divide-y divide-slate-200/50 dark:divide-slate-700/50">
                <button v-for="voiceLine in activeOperator.voiceLines" :key="voiceLine.id" type="button"
                    class="group w-full grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[6.5rem_minmax(0,1fr)] text-left transition-all duration-200 focus-visible:outline-none"
                    :class="[
                        isVoiceLineSelected(activeOperator.id, voiceLine.id)
                            ? 'bg-blue-50/80 dark:bg-cyan-900/30 border-l-4 border-blue-500 dark:border-cyan-400'
                            : 'hover:bg-white/50 dark:hover:bg-slate-800/40 border-l-4 border-transparent'
                    ]" :aria-pressed="isVoiceLineSelected(activeOperator.id, voiceLine.id)"
                    @click="emit('toggleVoiceLine', activeOperator.id, voiceLine.id)">
                    <span
                        class="border-r border-slate-200/50 dark:border-slate-700/50 px-4 py-4 text-xs sm:text-sm font-bold transition-colors"
                        :class="isVoiceLineSelected(activeOperator.id, voiceLine.id) ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'">
                        {{ voiceLine.title }}
                    </span>

                    <span class="px-4 py-4 text-sm flex flex-col gap-1.5">
                        <span class="font-bold text-slate-800 dark:text-slate-200 leading-snug">
                            {{ voiceLine.japaneseText }}
                        </span>
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {{ voiceLine.chineseText }}
                        </span>
                    </span>
                </button>
            </div>
        </aside>
    </Transition>
</template>

<style scoped>
.voice-panel-enter-active,
.voice-panel-leave-active {
    transition: opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.voice-panel-enter-from,
.voice-panel-leave-to {
    opacity: 0;
    transform: translateX(20px) scale(0.98);
}
</style>
