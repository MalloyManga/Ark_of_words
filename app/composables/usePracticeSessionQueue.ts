import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { PracticePool, PracticePoolItem } from '~/constants/practicePools'

interface PracticeSessionQueueOptions {
    practicePool: MaybeRefOrGetter<PracticePool | undefined>
}

interface PracticeSessionQueue {
    currentItemIndex: Ref<number>
    currentPracticePoolItem: ComputedRef<PracticePoolItem | undefined>
    currentItemNumber: ComputedRef<number>
    totalItemCount: ComputedRef<number>
    completedCycleCount: Readonly<Ref<number>>
    advanceToNextItem: () => void
}

/**
 * 管理单次练习的题目游标
 *
 * 队列到达末尾后从第一题重新开始并记录完成轮数
 * 数据获取和输入判定不进入这里 保持状态职责单一
 */
export const usePracticeSessionQueue = ({ practicePool }: PracticeSessionQueueOptions): PracticeSessionQueue => {
    const currentItemIndex = ref(0)
    const completedCycleCount = ref(0)

    const practicePoolItems = computed(() => toValue(practicePool)?.items ?? [])
    const totalItemCount = computed(() => practicePoolItems.value.length)
    const currentPracticePoolItem = computed(() => practicePoolItems.value[currentItemIndex.value])
    const currentItemNumber = computed(() => totalItemCount.value === 0 ? 0 : currentItemIndex.value + 1)

    const resetQueueProgress = () => {
        currentItemIndex.value = 0
        completedCycleCount.value = 0
    }

    const advanceToNextItem = () => {
        if (totalItemCount.value === 0) {
            return
        }

        const isCurrentCycleComplete = currentItemIndex.value >= totalItemCount.value - 1

        if (isCurrentCycleComplete) {
            currentItemIndex.value = 0
            completedCycleCount.value += 1
            return
        }

        currentItemIndex.value += 1
    }

    watch(
        () => toValue(practicePool)?.id,
        resetQueueProgress,
    )

    return {
        currentItemIndex,
        currentPracticePoolItem,
        currentItemNumber,
        totalItemCount,
        completedCycleCount: readonly(completedCycleCount),
        advanceToNextItem,
    }
}
