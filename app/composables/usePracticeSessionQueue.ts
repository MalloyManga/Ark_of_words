import type { PracticePool, PracticePoolItem } from '~/constants/practicePools'

interface PracticeSessionQueueOptions {
    practicePool: MaybeRefOrGetter<PracticePool | undefined>
}

interface PracticeSessionQueue {
    currentItemIndex: Ref<number>
    currentPracticePoolItem: ComputedRef<PracticePoolItem | undefined>
    currentItemNumber: ComputedRef<number>
    totalItemCount: ComputedRef<number>
    practiceQueueGroups: ComputedRef<readonly PracticeQueueGroup[]>
    currentPracticeGroupNumber: ComputedRef<number>
    totalPracticeGroupCount: ComputedRef<number>
    completedCycleCount: Readonly<Ref<number>>
    isPracticeCycleCompleted: Readonly<Ref<boolean>>
    advanceToNextItem: () => void
    restartPracticeCycle: () => void
    advanceToNextPracticeGroup: () => void
}

export interface PracticeQueueGroup {
    id: string
    groupNumber: number
    items: readonly PracticePoolItem[]
}

const practiceGroupSize = 5

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
 * 先将完整难度池随机排序再按五题切组
 * 当前组结束后由用户选择原组重练或进入下一组
 * 数据获取和输入判定不进入这里 保持状态职责单一
 */
export const usePracticeSessionQueue = ({ practicePool }: PracticeSessionQueueOptions): PracticeSessionQueue => {
    const currentItemIndex = ref(0)
    const currentPracticeGroupIndex = ref(0)
    const completedCycleCount = ref(0)
    const isPracticeCycleCompleted = ref(false)
    const randomizedPracticePoolItems = shallowRef<readonly PracticePoolItem[]>([])
    let isPracticeQueueMounted = false

    const practiceQueueGroups = computed<readonly PracticeQueueGroup[]>(() => {
        const groups: PracticeQueueGroup[] = []

        for (let itemIndex = 0; itemIndex < randomizedPracticePoolItems.value.length; itemIndex += practiceGroupSize) {
            const groupNumber = groups.length + 1
            groups.push({
                id: `practice-group-${groupNumber}`,
                groupNumber,
                items: randomizedPracticePoolItems.value.slice(itemIndex, itemIndex + practiceGroupSize),
            })
        }

        return groups
    })
    const currentPracticeGroup = computed(() => practiceQueueGroups.value[currentPracticeGroupIndex.value])
    const totalPracticeGroupCount = computed(() => practiceQueueGroups.value.length)
    const currentPracticeGroupNumber = computed(() => {
        return totalPracticeGroupCount.value === 0 ? 0 : currentPracticeGroupIndex.value + 1
    })
    const totalItemCount = computed(() => currentPracticeGroup.value?.items.length ?? 0)
    const currentPracticePoolItem = computed(() => currentPracticeGroup.value?.items[currentItemIndex.value])
    const currentItemNumber = computed(() => totalItemCount.value === 0 ? 0 : currentItemIndex.value + 1)

    const resetCurrentCycleProgress = () => {
        currentItemIndex.value = 0
        isPracticeCycleCompleted.value = false
    }

    const restartPracticeCycle = () => {
        resetCurrentCycleProgress()
    }

    const advanceToNextPracticeGroup = () => {
        const isLastPracticeGroup = currentPracticeGroupIndex.value >= totalPracticeGroupCount.value - 1

        if (isLastPracticeGroup) {
            randomizedPracticePoolItems.value = shufflePracticePoolItems(randomizedPracticePoolItems.value)
            currentPracticeGroupIndex.value = 0
        } else {
            currentPracticeGroupIndex.value += 1
        }

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
            randomizedPracticePoolItems.value = isPracticeQueueMounted
                ? shufflePracticePoolItems(items)
                : items
            currentPracticeGroupIndex.value = 0
            completedCycleCount.value = 0
            resetCurrentCycleProgress()
        },
        { immediate: true },
    )

    // SSR 与客户端水合阶段保持相同顺序 挂载后再生成本次会话的随机队列
    onMounted(() => {
        isPracticeQueueMounted = true
        randomizedPracticePoolItems.value = shufflePracticePoolItems(randomizedPracticePoolItems.value)
        resetCurrentCycleProgress()
    })

    return {
        currentItemIndex,
        currentPracticePoolItem,
        currentItemNumber,
        totalItemCount,
        practiceQueueGroups,
        currentPracticeGroupNumber,
        totalPracticeGroupCount,
        completedCycleCount: readonly(completedCycleCount),
        isPracticeCycleCompleted: readonly(isPracticeCycleCompleted),
        advanceToNextItem,
        restartPracticeCycle,
        advanceToNextPracticeGroup,
    }
}
