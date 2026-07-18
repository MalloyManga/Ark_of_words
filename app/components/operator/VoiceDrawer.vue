<script setup lang="ts">
import type { OperatorDisplayItem } from '~/types/operator'

interface VoiceDrawerProps {
    activeOperator?: OperatorDisplayItem
    isVoiceLineSelected: (operatorId: string, voiceLineId: string) => boolean
}

const { activeOperator, isVoiceLineSelected } = defineProps<VoiceDrawerProps>()

const emit = defineEmits<{
    close: []
    toggleVoiceLine: [operatorId: string, voiceLineId: string]
}>()

const { overlayPanelRef, handleOverlayKeydown } = useOverlayFocusTrap({
    isOpen: () => activeOperator !== undefined,
    onEscapeClose: () => emit('close'),
})

const handleToggleVoiceLine = (operatorId: string, voiceLineId: string): void => {
    emit('toggleVoiceLine', operatorId, voiceLineId)
}
</script>

<template>
    <Transition name="drawer-backdrop">
        <div v-if="activeOperator"
            class="fixed inset-0 z-40 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-sm transition-opacity"
            aria-hidden="true" @click="emit('close')" />
    </Transition>

    <Transition name="voice-drawer">
        <aside v-if="activeOperator" ref="overlayPanelRef" tabindex="-1" role="dialog" aria-modal="true"
            aria-labelledby="operator-voice-drawer-title"
            class="fixed top-0 right-0 z-50 h-screen w-full max-w-md lg:max-w-lg flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-l border-white/50 dark:border-slate-700/50 shadow-2xl shadow-blue-900/10 dark:shadow-black/40"
            @keydown="handleOverlayKeydown">
            <div
                class="flex shrink-0 items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50">
                <div class="flex flex-col">
                    <span class="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-cyan-500">
                        Operator File
                    </span>
                    <h2 id="operator-voice-drawer-title"
                        class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                        {{ activeOperator.displayName }}
                    </h2>
                </div>

                <button type="button"
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                    aria-label="关闭侧边栏" @click="emit('close')">
                    <IconClose class="w-5 h-5" />
                </button>
            </div>

            <div class="flex-1 overflow-hidden p-4 sm:p-6">
                <OperatorVoicePanel class="h-full" :active-operator="activeOperator"
                    :is-voice-line-selected="isVoiceLineSelected"
                    @toggle-voice-line="handleToggleVoiceLine" />
            </div>
        </aside>
    </Transition>
</template>

<style scoped>
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
    transition: opacity 300ms ease;
}

.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
    opacity: 0;
}

.voice-drawer-enter-active,
.voice-drawer-leave-active {
    transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease;
}

.voice-drawer-enter-from,
.voice-drawer-leave-to {
    transform: translateX(100%);
    opacity: 0.5;
}
</style>
