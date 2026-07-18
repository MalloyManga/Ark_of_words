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
    <AppModalShell :is-open="isOpen" labelled-by="romaji-input-method-title"
        panel-class="max-w-lg p-6 sm:p-8 flex flex-col gap-6" @close="emit('close')">
                    <!-- 头部：标题与关闭按钮 -->
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex flex-col gap-1.5">
                            <!-- 科技感的小标签 -->
                            <div class="flex items-center gap-2 text-blue-500 dark:text-cyan-400">
                                <span class="relative flex h-2 w-2">
                                    <span
                                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-cyan-400 opacity-75"></span>
                                    <span
                                        class="relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-cyan-500"></span>
                                </span>
                                <span class="text-xs font-black uppercase tracking-widest">System Notice</span>
                            </div>

                            <h2 id="romaji-input-method-title"
                                class="text-2xl font-black text-slate-800 dark:text-slate-100">
                                检测到假名输入
                            </h2>
                        </div>

                        <button type="button"
                            class="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                            aria-label="关闭输入法提示" @click="emit('close')">
                            <!-- 假设你原来的 IconClose 依然可用，这里包裹在更优雅的圆形按钮里 -->
                            <IconClose class="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                        </button>
                    </div>

                    <!-- 提示文字 -->
                    <div class="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
                        当前练习模式为 <span
                            class="font-bold text-slate-800 dark:text-slate-200">「罗马字输入」</span>，但系统检测到了直接的假名或汉字输入。
                        <br class="hidden sm:block" />
                        是否需要为您切换到 <span class="font-bold text-blue-600 dark:text-cyan-400">「假名/汉字输入法」</span> 模式？
                    </div>

                    <!-- 底部操作按钮 -->
                    <div class="mt-2 flex flex-col sm:flex-row-reverse items-center gap-3">
                        <!-- 主按钮：确认切换 -->
                        <button type="button"
                            class="relative w-full sm:w-auto overflow-hidden group flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-800 dark:bg-cyan-50 text-white dark:text-cyan-950 font-bold text-sm sm:text-base shadow-lg shadow-slate-800/10 dark:shadow-cyan-400/20 hover:-translate-y-0.5 transition-all duration-300"
                            @click="emit('switchToKanaMode')">
                            <!-- 悬浮时的渐变发光 -->
                            <div
                                class="absolute inset-0 w-full h-full bg-linear-to-r from-blue-500 to-cyan-500 dark:from-cyan-300 dark:to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span class="relative group-hover:text-white transition-colors">
                                切换到 假名/汉字输入法
                            </span>
                        </button>

                        <!-- 次按钮：忽略 -->
                        <button type="button"
                            class="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200"
                            @click="emit('close')">
                            忽略
                        </button>
                    </div>
    </AppModalShell>
</template>
