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
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/30 px-5 py-6"
            role="presentation" @click.self="emit('close')">
            <section
                class="w-full max-w-lg rounded-lg border border-emerald-200 bg-white p-5 text-left text-emerald-950 shadow-lg"
                role="dialog" aria-modal="true" aria-labelledby="romaji-input-method-title">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p id="romaji-input-method-title" class="font-mono text-xl font-black">
                            检测到假名输入
                        </p>
                        <p class="mt-3 font-mono text-sm font-bold leading-6 text-emerald-950/75 sm:text-base">
                            当前为「罗马字输入」。是否切换到「假名/汉字输入法」？
                        </p>
                    </div>

                    <button type="button"
                        class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-white text-lg font-black text-emerald-700 transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-50 active:bg-emerald-100"
                        aria-label="关闭输入法提示" @click="emit('close')">
                        <IconClose class="size-5" />
                    </button>
                </div>

                <div class="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <button type="button"
                        class="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-emerald-950 bg-emerald-300 px-4 py-2 font-mono text-sm font-black text-emerald-950 shadow-[4px_4px_0_#064e3b] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#064e3b] active:translate-x-1 active:translate-y-1 active:shadow-none sm:text-base"
                        @click="emit('switchToKanaMode')">
                        切换到 假名/汉字输入法
                    </button>
                    <button type="button"
                        class="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 py-2 font-mono text-sm font-black text-emerald-700 transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-50 active:bg-emerald-100 sm:text-base"
                        @click="emit('close')">
                        忽略
                    </button>
                </div>
            </section>
        </div>
    </Teleport>
</template>
