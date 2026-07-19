import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { JapaneseReadingUnit } from '#shared/types/japaneseReading'
import type { PrtsVoiceLine } from '#shared/utils/prtsVoiceDataExtractor'
import { supportedOperatorIds } from '#shared/types/operatorApi'
import {
    createCustomPracticePool,
    createPracticePoolsFromOperatorVoiceResponses,
} from '~/constants/practicePools'
import type { PracticePool, PracticePoolItem } from '~/constants/practicePools'
import type { PracticeQueueGroup } from '~/composables/usePracticeSessionQueue'
import type { PracticePoolId } from '~/constants/practiceDifficulties'

interface PracticeLineSourceOptions {
    poolId: MaybeRefOrGetter<PracticePoolId>
    difficultyLabel: MaybeRefOrGetter<string>
}

export interface PracticeInfoItem {
    label: string
    value: string
}

export type PracticeReadingUnit = Pick<
    JapaneseReadingUnit,
    'id' | 'sourceText' | 'kanaText' | 'romajiText'
>

export interface PracticeLineSource {
    currentPracticePool: ComputedRef<PracticePool | undefined>
    currentPracticePoolItem: ComputedRef<PracticePoolItem | undefined>
    currentItemNumber: ComputedRef<number>
    totalItemCount: ComputedRef<number>
    practiceQueueGroups: ComputedRef<readonly PracticeQueueGroup[]>
    currentPracticeGroupNumber: ComputedRef<number>
    totalPracticeGroupCount: ComputedRef<number>
    currentPracticeLine: ComputedRef<PrtsVoiceLine | undefined>
    currentPracticeOperatorName: ComputedRef<string>
    currentPracticeAudioPath: ComputedRef<string>
    currentPracticeChineseText: ComputedRef<string>
    targetPracticeText: ComputedRef<string>
    currentPracticeLineTitle: ComputedRef<string>
    practiceReadingUnits: ComputedRef<readonly PracticeReadingUnit[]>
    practiceInfoItems: ComputedRef<readonly PracticeInfoItem[]>
    isPracticeCycleCompleted: Readonly<Ref<boolean>>
    advanceToNextItem: () => void
    restartPracticeCycle: () => void
    advanceToNextPracticeGroup: () => void
}

export const usePracticeLineSource = ({ poolId, difficultyLabel }: PracticeLineSourceOptions): PracticeLineSource => {
    // 练习数据源只负责选择当前语音行 不保存输入 判定 光标等练习状态
    const { selectedVoiceLines } = useCustomPracticeSelection()
    const operatorVoiceResponseMap = useOperatorVoiceResponseCache()
    const realPracticePools = computed(() => {
        const operatorVoiceResponses = supportedOperatorIds.flatMap((operatorId) => {
            const operatorVoiceResponse = operatorVoiceResponseMap.value[operatorId]
            return operatorVoiceResponse ? [operatorVoiceResponse] : []
        })

        return createPracticePoolsFromOperatorVoiceResponses(operatorVoiceResponses)
    })
    const customPracticePool = computed(() => {
        return createCustomPracticePool(selectedVoiceLines.value, operatorVoiceResponseMap.value)
    })
    const currentPracticePool = computed(() => {
        if (toValue(poolId) === 'custom') {
            return customPracticePool.value
        }

        return realPracticePools.value.find((practicePool) => practicePool.id === toValue(poolId))
    })
    const {
        currentPracticePoolItem,
        currentItemNumber,
        totalItemCount,
        practiceQueueGroups,
        currentPracticeGroupNumber,
        totalPracticeGroupCount,
        isPracticeCycleCompleted,
        advanceToNextItem,
        restartPracticeCycle,
        advanceToNextPracticeGroup,
    } = usePracticeSessionQueue({
        practicePool: currentPracticePool,
    })
    const currentPracticeLine = computed(() => currentPracticePoolItem.value?.voiceLine)
    const currentPracticeOperatorName = computed(() => currentPracticePoolItem.value?.operator.name ?? '')
    const currentPracticeAudioPath = computed(() => currentPracticePoolItem.value?.audioUrl ?? '')
    const currentPracticeChineseText = computed(() => currentPracticeLine.value?.chineseText ?? '')
    /**
     * 最终练习的日文文本
     */
    const targetPracticeText = computed(() => currentPracticeLine.value?.japaneseText ?? '')
    const currentPracticeLineTitle = computed(() => currentPracticeLine.value?.title ?? '暂无练习题目')
    const practiceReadingUnits = computed<readonly PracticeReadingUnit[]>(
        () => currentPracticePoolItem.value?.readingUnits ?? [],
    )
    const practiceInfoItems = computed<readonly PracticeInfoItem[]>(() => [
        { label: '干员', value: currentPracticeOperatorName.value || '未知干员' },
        { label: '标题', value: currentPracticeLineTitle.value || '未知语音' },
        { label: 'PRTS 编号', value: currentPracticePoolItem.value?.voiceNumber.toString() ?? '未知编号' },
        { label: '难度', value: toValue(difficultyLabel) },
        { label: '日文', value: targetPracticeText.value || '暂无日文文本' },
        { label: '中文', value: currentPracticeChineseText.value || '暂无中文译文' },
        { label: '原始音频路径', value: currentPracticeAudioPath.value || '暂无原始路径' },
        { label: '当前播放文件', value: currentPracticeLine.value?.audioFileName ?? '暂无音频文件' },
    ])

    return {
        currentPracticePool,
        currentPracticePoolItem,
        currentItemNumber,
        totalItemCount,
        practiceQueueGroups,
        currentPracticeGroupNumber,
        totalPracticeGroupCount,
        currentPracticeLine,
        currentPracticeOperatorName,
        currentPracticeAudioPath,
        currentPracticeChineseText,
        targetPracticeText,
        currentPracticeLineTitle,
        practiceReadingUnits,
        practiceInfoItems,
        isPracticeCycleCompleted,
        advanceToNextItem,
        restartPracticeCycle,
        advanceToNextPracticeGroup,
    }
}
