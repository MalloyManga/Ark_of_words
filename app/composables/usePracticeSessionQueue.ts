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
    isPracticeCycleCompleted: Readonly<Ref<boolean>>
    advanceToNextItem: () => void
    restartPracticeCycle: () => void
    shufflePracticeCycle: () => void
}

const shufflePracticePoolItems = (
    practicePoolItems: readonly PracticePoolItem[],
): readonly PracticePoolItem[] => {
    const shuffledPracticePoolItems = [...practicePoolItems]

    for (let itemIndex = shuffledPracticePoolItems.length - 1; itemIndex > 0; itemIndex -= 1) {
        const replacementIndex = Math.floor(Math.random() * (itemIndex + 1))
        const currentItem = shuffledPracticePoolItems[itemIndex]
        const replacementItem = shuffledPracticePoolItems[replacementIndex]

        if (!currentItem || !replacementItem) {
            continue
        }

        shuffledPracticePoolItems[itemIndex] = replacementItem
        shuffledPracticePoolItems[replacementIndex] = currentItem
    }

    return shuffledPracticePoolItems
}

/**
 * 管理单次练习的题目游标
 *
 * 队列到达末尾后进入完成态 由用户选择原顺序重练或洗牌重练
 * 数据获取和输入判定不进入这里 保持状态职责单一
 */
export const usePracticeSessionQueue = ({ practicePool }: PracticeSessionQueueOptions): PracticeSessionQueue => {
    const currentItemIndex = ref(0)
    const completedCycleCount = ref(0)
    const isPracticeCycleCompleted = ref(false)
    const activePracticePoolItems = shallowRef<readonly PracticePoolItem[]>([])

    const totalItemCount = computed(() => activePracticePoolItems.value.length)
    const currentPracticePoolItem = computed(() => activePracticePoolItems.value[currentItemIndex.value])
    const currentItemNumber = computed(() => totalItemCount.value === 0 ? 0 : currentItemIndex.value + 1)

    const resetCurrentCycleProgress = () => {
        currentItemIndex.value = 0
        isPracticeCycleCompleted.value = false
    }

    const restartPracticeCycle = () => {
        resetCurrentCycleProgress()
    }

    const shufflePracticeCycle = () => {
        activePracticePoolItems.value = shufflePracticePoolItems(activePracticePoolItems.value)
        resetCurrentCycleProgress()
    }

    const advanceToNextItem = () => {
        if (totalItemCount.value === 0 || isPracticeCycleCompleted.value) {
            return
        }

        const isCurrentCycleComplete = currentItemIndex.value >= totalItemCount.value - 1

        if (isCurrentCycleComplete) {
            isPracticeCycleCompleted.value = true
            completedCycleCount.value += 1
            return
        }

        currentItemIndex.value += 1
    }

    watch(
        () => {
            const resolvedPracticePool = toValue(practicePool)
            return {
                poolId: resolvedPracticePool?.id,
                items: resolvedPracticePool?.items ?? [],
            }
        },
        ({ items }) => {
            activePracticePoolItems.value = items
            completedCycleCount.value = 0
            resetCurrentCycleProgress()
        },
        { immediate: true },
    )

    return {
        currentItemIndex,
        currentPracticePoolItem,
        currentItemNumber,
        totalItemCount,
        completedCycleCount: readonly(completedCycleCount),
        isPracticeCycleCompleted: readonly(isPracticeCycleCompleted),
        advanceToNextItem,
        restartPracticeCycle,
        shufflePracticeCycle,
    }
}
