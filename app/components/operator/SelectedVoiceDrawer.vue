<script setup lang="ts">
import type { SelectedOperatorVoiceLineDisplay } from '~/types/operator'

interface SelectedVoiceDrawerProps {
    isOpen: boolean
    selectedVoiceLines: readonly SelectedOperatorVoiceLineDisplay[]
}

defineProps<SelectedVoiceDrawerProps>()

const emit = defineEmits<{
    close: []
    removeVoiceLine: [selectionId: string]
    clearVoiceLines: []
}>()
</script>

<template>
    <Transition name="selected-voice-backdrop">
        <div v-if="isOpen"
            class="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity dark:bg-slate-950/40"
            aria-hidden="true" @click="emit('close')" />
    </Transition>

    <Transition name="selected-voice-drawer">
        <aside v-if="isOpen"
            class="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-white/50 bg-white/80 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/80 dark:shadow-black/40"
            aria-labelledby="selected-voice-drawer-title">
            <header
                class="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/50 px-6 py-5 dark:border-slate-700/50">
                <div>
                    <span class="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-cyan-400">
                        Selected Voices
                    </span>
                    <h2 id="selected-voice-drawer-title"
                        class="mt-1 text-xl font-black text-slate-800 dark:text-slate-100">
                        已选语音
                    </h2>
                    <p class="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                        共 {{ selectedVoiceLines.length }} 条
                    </p>
                </div>

                <button type="button"
                    class="group flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                    aria-label="关闭已选语音" @click="emit('close')">
                    <IconClose class="size-5 transition-transform duration-300 group-hover:rotate-90" />
                </button>
            </header>

            <div class="scrollbar-hidden flex-1 overflow-y-auto p-4 sm:p-6">
                <ul v-if="selectedVoiceLines.length" class="flex flex-col gap-3">
                    <li v-for="selectedVoiceLine in selectedVoiceLines" :key="selectedVoiceLine.selectionId"
                        class="flex gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span class="text-sm font-black text-slate-800 dark:text-slate-100">
                                    {{ selectedVoiceLine.operatorDisplayName }}
                                </span>
                                <span class="text-xs font-bold text-blue-500 dark:text-cyan-400">
                                    {{ selectedVoiceLine.voiceLineTitle }}
                                </span>
                            </div>
                            <template v-if="selectedVoiceLine.isVoiceLineLoaded">
                                <p class="mt-2 wrap-break-word text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                                    {{ selectedVoiceLine.japaneseText }}
                                </p>
                                <p class="mt-1 wrap-break-word text-xs leading-5 text-slate-400 dark:text-slate-500">
                                    {{ selectedVoiceLine.chineseText }}
                                </p>
                            </template>
                            <p v-else class="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                                正在加载语音信息
                            </p>
                        </div>

                        <button type="button"
                            class="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            :aria-label="`删除 ${selectedVoiceLine.operatorDisplayName} ${selectedVoiceLine.voiceLineTitle}`"
                            @click="emit('removeVoiceLine', selectedVoiceLine.selectionId)">
                            <IconClose class="size-4" />
                        </button>
                    </li>
                </ul>

                <div v-else
                    class="flex h-full min-h-60 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-6 text-center dark:border-slate-700/50">
                    <IconCart class="size-8 text-slate-300 dark:text-slate-600" />
                    <p class="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                        还没有选择语音
                    </p>
                </div>
            </div>

            <footer v-if="selectedVoiceLines.length"
                class="shrink-0 border-t border-slate-200/50 p-4 dark:border-slate-700/50 sm:p-6">
                <button type="button"
                    class="flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    @click="emit('clearVoiceLines')">
                    清空全部选择
                </button>
            </footer>
        </aside>
    </Transition>
</template>

<style scoped>
.selected-voice-backdrop-enter-active,
.selected-voice-backdrop-leave-active {
    transition: opacity 300ms ease;
}

.selected-voice-backdrop-enter-from,
.selected-voice-backdrop-leave-to {
    opacity: 0;
}

.selected-voice-drawer-enter-active,
.selected-voice-drawer-leave-active {
    transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease;
}

.selected-voice-drawer-enter-from,
.selected-voice-drawer-leave-to {
    transform: translateX(100%);
    opacity: 0.5;
}
</style>
