<script setup lang="ts">
import type { PracticePool } from '~/constants/practicePools'
import type { PracticeQueueGroup } from '~/composables/usePracticeSessionQueue'

interface PracticePoolModalProps {
    isOpen: boolean
    practicePool?: PracticePool
    practiceGroups: readonly PracticeQueueGroup[]
    currentPracticeGroupNumber: number
    totalPracticeGroupCount: number
}

const {
    isOpen,
    practicePool,
    practiceGroups,
    currentPracticeGroupNumber,
    totalPracticeGroupCount,
} = defineProps<PracticePoolModalProps>()

const emit = defineEmits<{
    close: []
}>()

// 只记录弹窗内展开状态 不在这里切换练习题 避免提前耦合 session 队列逻辑
const expandedPoolItemIds = ref<Set<string>>(new Set())

const togglePoolItem = (poolItemId: string) => {
    const nextExpandedPoolItemIds = new Set(expandedPoolItemIds.value)

    if (nextExpandedPoolItemIds.has(poolItemId)) {
        nextExpandedPoolItemIds.delete(poolItemId)
    } else {
        nextExpandedPoolItemIds.add(poolItemId)
    }

    expandedPoolItemIds.value = nextExpandedPoolItemIds
}

watch(
    () => isOpen,
    (isModalOpen) => {
        if (!isModalOpen) {
            expandedPoolItemIds.value = new Set()
        }
    },
)
</script>

<template>
    <AppModalShell :is-open="isOpen" labelled-by="practice-pool-title"
        panel-class="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden" @close="emit('close')">
                    <!-- 弹窗 Header (固定在顶部) -->
                    <div
                        class="shrink-0 flex items-start justify-between gap-4 px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center gap-2">
                                <span
                                    class="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-cyan-400">
                                    Current Queue
                                </span>
                                <!-- 数量小徽章 -->
                                <span
                                    class="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-cyan-900/50 text-blue-600 dark:text-cyan-400 text-[10px] font-bold">
                                    {{ totalPracticeGroupCount }} GROUPS · {{ practicePool?.items.length ?? 0 }} DATA
                                </span>
                            </div>
                            <h2 id="practice-pool-title"
                                class="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                练习文本队列
                            </h2>
                        </div>

                        <!-- 关闭按钮 -->
                        <button type="button"
                            class="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                            aria-label="关闭练习文本选择" @click="emit('close')">
                            <IconClose class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                        </button>
                    </div>

                    <!-- 弹窗 Body (滚动区域) -->
                    <div class="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                        <div v-if="practiceGroups.length" class="flex flex-col gap-5">
                            <section v-for="practiceGroup in practiceGroups" :key="practiceGroup.id"
                                class="rounded-2xl border p-3 transition-colors sm:p-4"
                                :class="practiceGroup.groupNumber === currentPracticeGroupNumber
                                    ? 'border-blue-300 bg-blue-50/40 dark:border-cyan-700/60 dark:bg-cyan-950/10'
                                    : 'border-slate-200/60 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-900/30'">
                                <div class="mb-3 flex items-center justify-between gap-3 px-1">
                                    <div class="flex items-center gap-2">
                                        <h3 class="text-sm font-black text-slate-700 dark:text-slate-200">
                                            第 {{ practiceGroup.groupNumber }} 组
                                        </h3>
                                        <span v-if="practiceGroup.groupNumber === currentPracticeGroupNumber"
                                            class="rounded-md bg-blue-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white dark:bg-cyan-500 dark:text-cyan-950">
                                            Current
                                        </span>
                                    </div>
                                    <span class="text-xs font-bold text-slate-400 dark:text-slate-500">
                                        {{ practiceGroup.items.length }} 条
                                    </span>
                                </div>

                                <div class="flex flex-col gap-3">

                            <!-- 单个音频/文本条目 -->
                            <button v-for="poolItem in practiceGroup.items" :key="poolItem.id" type="button"
                                class="group relative flex flex-col w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden focus-visible:outline-none"
                                :class="[
                                    expandedPoolItemIds.has(poolItem.id)
                                        ? 'bg-blue-50/50 dark:bg-slate-800 border-blue-200 dark:border-cyan-800/50 shadow-md shadow-blue-500/5 dark:shadow-black/20'
                                        : 'bg-white dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-cyan-700/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                                ]" :aria-expanded="expandedPoolItemIds.has(poolItem.id)"
                                @click="togglePoolItem(poolItem.id)">
                                <!-- 基础信息行 (始终可见) -->
                                <div class="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-4">
                                    <!-- 序号标识 -->
                                    <div
                                        class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900/80 text-slate-400 dark:text-slate-500 font-mono text-xs font-bold border border-slate-200/50 dark:border-slate-700/50 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors">
                                        {{ String(poolItem.voiceNumber).padStart(2, '0') }}
                                    </div>

                                    <!-- 标题信息 -->
                                    <div class="flex flex-1 flex-col min-w-0">
                                        <div class="flex items-center gap-2">
                                            <span
                                                class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {{ poolItem.operator.name }}
                                            </span>
                                            <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            <span
                                                class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                                                {{ poolItem.voiceLine.title }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- 展开/折叠箭头 -->
                                    <div class="text-slate-300 dark:text-slate-600 transition-transform duration-300"
                                        :class="expandedPoolItemIds.has(poolItem.id) ? 'rotate-180 text-blue-500 dark:text-cyan-500' : ''">
                                        <IconChevronRight class="w-5 h-5 rotate-90" />
                                    </div>
                                </div>

                                <!-- 展开的详细文本区域 -->
                                <div class="grid transition-all duration-300 ease-in-out"
                                    :class="expandedPoolItemIds.has(poolItem.id) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
                                    <div class="overflow-hidden">
                                        <div
                                            class="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 mx-4 sm:mx-5">
                                            <!-- 日文文本 -->
                                            <p
                                                class="text-sm sm:text-base font-bold leading-relaxed text-slate-700 dark:text-slate-300 wrap-break-word mt-3">
                                                {{ poolItem.voiceLine.japaneseText || '暂无日文文本' }}
                                            </p>
                                            <!-- 中文译文 -->
                                            <p
                                                class="text-xs sm:text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 wrap-break-word mt-1.5">
                                                {{ poolItem.voiceLine.chineseText || '暂无中文译文' }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                                </div>
                            </section>
                        </div>

                        <!-- 空状态 -->
                        <div v-else
                            class="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-2xl">
                            <span class="text-4xl mb-3 opacity-50">📭</span>
                            <p class="text-base font-bold text-slate-500 dark:text-slate-400">暂无可用练习文本</p>
                            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">请返回上一页重新配置干员或难度</p>
                        </div>
                    </div>
    </AppModalShell>
</template>

<style scoped>
/* 优雅的自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    /* slate-400/30 */
    border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(71, 85, 105, 0.5);
    /* slate-600/50 */
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
}
</style>
