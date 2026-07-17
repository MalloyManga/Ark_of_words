<script setup lang="ts">
interface PracticeRomajiInputMethodModalProps {
    isOpen: boolean
}

const { isOpen } = defineProps<PracticeRomajiInputMethodModalProps>()

const emit = defineEmits<{
    close: []
    switchToKanaMode: []
}>()
</script>

<template>
    <!-- 只负责罗马字模式下的输入法提示 具体模式切换由练习页统一处理 -->
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-5 py-6"
            role="presentation" @click.self="emit('close')">
            <section
                class="w-full max-w-lg rounded-2xl border-2 border-ink bg-cream p-5 text-left text-ink shadow-[6px_6px_0_var(--color-ink)]"
                role="dialog" aria-modal="true" aria-labelledby="romaji-input-method-title">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p id="romaji-input-method-title" class="font-zh-playful text-xl font-black">
                            检测到假名输入
                        </p>
                        <p class="mt-3 font-zh-playful text-sm font-bold leading-6 text-ink-soft sm:text-base">
                            当前为「罗马字输入」。是否切换到「假名/汉字输入法」？
                        </p>
                    </div>

                    <button type="button"
                        class="nb-card nb-interactive inline-flex size-9 shrink-0 items-center justify-center text-ink"
                        aria-label="关闭输入法提示" @click="emit('close')">
                        <IconClose class="size-5" />
                    </button>
                </div>

                <div class="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <button type="button"
                        class="nb-interactive font-zh-playful inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-ink bg-coral px-4 py-2 text-sm font-black text-cream shadow-[4px_4px_0_var(--color-ink)] sm:text-base"
                        @click="emit('switchToKanaMode')">
                        切换到 假名/汉字输入法
                    </button>
                    <button type="button"
                        class="font-zh-playful inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-ink bg-paper px-4 py-2 text-sm font-black text-ink-soft transition-colors duration-150 hover:bg-paper-dim sm:text-base"
                        @click="emit('close')">
                        忽略
                    </button>
                </div>
            </section>
        </div>
    </Teleport>
</template>
