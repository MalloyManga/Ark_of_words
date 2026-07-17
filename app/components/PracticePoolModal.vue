<script setup lang="ts">
import type { PracticePool } from '~/constants/practicePools'

interface PracticePoolModalProps {
    isOpen: boolean
    practicePool?: PracticePool
}

const { isOpen, practicePool } = defineProps<PracticePoolModalProps>()

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
    <!-- 当前弹窗只展示练习文本池 点击行仅展开详情 后续再接入选题和切题逻辑 -->
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-5 py-6"
            role="presentation" @click.self="emit('close')">
            <section
                class="flex max-h-[min(82vh,42rem)] min-h-[min(82vh,42rem)] w-full max-w-2xl flex-col rounded-2xl border-2 border-ink bg-cream p-5 text-left text-ink shadow-[6px_6px_0_var(--color-ink)]"
                role="dialog" aria-modal="true" aria-labelledby="practice-pool-title">
                <div class="flex items-start justify-between gap-4 border-b-2 border-ink pb-4">
                    <div class="min-w-0">
                        <p id="practice-pool-title" class="font-zh-playful text-xl font-black">
                            选择练习文本
                        </p>
                        <p class="mt-1 font-romaji text-xs font-bold uppercase tracking-widest text-ink-soft">
                            POOL · {{ practicePool?.items.length ?? 0 }} 条
                        </p>
                    </div>
                    <button type="button"
                        class="nb-card nb-interactive inline-flex size-9 shrink-0 items-center justify-center text-ink"
                        aria-label="关闭练习文本选择" @click="emit('close')">
                        <IconClose class="size-5" />
                    </button>
                </div>

                <div class="scrollbar-hidden mt-4 flex-1 overflow-y-auto pr-1">
                    <div v-if="practicePool?.items.length" class="grid gap-2.5">
                        <button v-for="poolItem in practicePool.items" :key="poolItem.id" type="button"
                            class="cursor-pointer rounded-xl border-2 border-ink bg-paper px-4 py-3 text-left transition-colors duration-150 hover:bg-butter"
                            :aria-expanded="expandedPoolItemIds.has(poolItem.id)" @click="togglePoolItem(poolItem.id)">
                            <div class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                                <span class="font-zh-playful text-sm font-black text-ink sm:text-base">
                                    {{ poolItem.operator.name }} · {{ poolItem.voiceLine.title }}
                                </span>
                                <span class="font-fredoka text-xs font-bold text-coral">
                                    #{{ poolItem.voiceNumber }}
                                </span>
                            </div>

                            <div v-if="expandedPoolItemIds.has(poolItem.id)"
                                class="mt-3 grid gap-2 border-t-2 border-ink/10 pt-3">
                                <p class="wrap-break-word text-sm font-bold leading-6 text-ink">
                                    {{ poolItem.voiceLine.japaneseText || '暂无日文文本' }}
                                </p>
                                <p class="wrap-break-word font-zh-playful text-sm font-bold leading-6 text-ink-soft">
                                    {{ poolItem.voiceLine.chineseText || '暂无中文译文' }}
                                </p>
                            </div>
                        </button>
                    </div>

                    <p v-else
                        class="rounded-xl border-2 border-ink bg-paper px-4 py-5 font-zh-playful text-sm font-bold text-ink-soft">
                        暂无可用练习文本
                    </p>
                </div>
            </section>
        </div>
    </Teleport>
</template>
