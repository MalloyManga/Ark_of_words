<script setup lang="ts">
interface AppModalShellProps {
    isOpen: boolean
    labelledBy: string
    panelClass?: string
}

const { isOpen, labelledBy, panelClass = '' } = defineProps<AppModalShellProps>()

const emit = defineEmits<{
    close: []
}>()
</script>

<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                role="presentation">
                <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity dark:bg-slate-950/60"
                    @click="emit('close')" />

                <section
                    class="modal-dialog relative w-full rounded-3xl border border-white/80 bg-white/90 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/90 dark:shadow-black/50"
                    :class="panelClass" role="dialog" aria-modal="true" :aria-labelledby="labelledBy">
                    <slot />
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* 遮罩与面板共用同一个过渡周期 避免业务弹窗重复维护动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .modal-dialog,
.modal-fade-leave-active .modal-dialog {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from .modal-dialog,
.modal-fade-leave-to .modal-dialog {
    transform: scale(0.95) translateY(10px);
}
</style>
