import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { JapaneseReadingUnit } from '#shared/types/japaneseReading'
import { parsePrtsOperatorVoiceData } from '#shared/utils/prtsVoiceDataExtractor'
import type { PrtsVoiceLine } from '#shared/utils/prtsVoiceDataExtractor'
import { supportedOperatorIds } from '#shared/types/operatorApi'
import {
    createCustomPracticePool,
    createPracticePoolsFromOperatorVoiceData,
    createPracticePoolsFromOperatorVoiceResponses,
} from '~/constants/practicePools'
import type { PracticePool, PracticePoolItem } from '~/constants/practicePools'
import type { PracticeQueueGroup } from '~/composables/usePracticeSessionQueue'
import type { PracticePoolId } from '~/constants/practiceDifficulties'
import wisadelVoicePageRawData from '~/data/prts-wisadel-voice-page.slots.raw.json'

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
    kanaHint: ComputedRef<string>
    practiceReadingUnits: ComputedRef<readonly PracticeReadingUnit[]>
    practiceInfoItems: ComputedRef<readonly PracticeInfoItem[]>
    isPracticeCycleCompleted: Readonly<Ref<boolean>>
    advanceToNextItem: () => void
    restartPracticeCycle: () => void
    advanceToNextPracticeGroup: () => void
}

const mockPracticeAudioFileName = '编入队伍.wav'
const mockPracticeReadingUnits: readonly PracticeReadingUnit[] = [
    { id: 'mock-reading-unit-1', sourceText: 'あたし', kanaText: 'あたし', romajiText: 'atashi' },
    { id: 'mock-reading-unit-2', sourceText: 'が', kanaText: 'が', romajiText: 'ga' },
    { id: 'mock-reading-unit-3', sourceText: '死んだら', kanaText: 'しんだら', romajiText: 'shinndara' },
    { id: 'space-after-shinndara', sourceText: ' ', kanaText: ' ', romajiText: ' ', },
    { id: 'mock-reading-unit-4', sourceText: '見舞い金', kanaText: 'みまいきん', romajiText: 'mimaikinn' },
    { id: 'mock-reading-unit-5', sourceText: 'で', kanaText: 'で', romajiText: 'de' },
    { id: 'mock-reading-unit-6', sourceText: 'みんな', kanaText: 'みんな', romajiText: 'minnna' },
    { id: 'mock-reading-unit-7', sourceText: 'に', kanaText: 'に', romajiText: 'ni' },
    { id: 'mock-reading-unit-8', sourceText: '焼きじゃがいも', kanaText: 'やきじゃがいも', romajiText: 'yakijagaimo' },
    { id: 'mock-reading-unit-9', sourceText: 'を', kanaText: 'を', romajiText: 'wo' },
    { id: 'mock-reading-unit-10', sourceText: 'おごっておいて', kanaText: 'おごっておいて', romajiText: 'ogotteoite' },
]
const mockPracticeSourceText = mockPracticeReadingUnits.map((readingUnit) => readingUnit.sourceText).join('')

const createPlaceholderKanaHint = (text: string) => {
    // kana 生成规则还没有确定 这里先用等长占位符验证练习数据接线
    return Array.from(text).map(() => '＿').join('')
}

export const usePracticeLineSource = ({ poolId, difficultyLabel }: PracticeLineSourceOptions): PracticeLineSource => {
    // 练习数据源只负责选择当前语音行 不保存输入 判定 光标等练习状态
    const wisadelVoiceData = parsePrtsOperatorVoiceData(wisadelVoicePageRawData)
    const { selectedVoiceLines } = useCustomPracticeSelection()
    const operatorVoiceResponseMap = useOperatorVoiceResponseCache()
    const mockPracticePools = createPracticePoolsFromOperatorVoiceData([wisadelVoiceData])
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

        const realPracticePool = realPracticePools.value.find((practicePool) => practicePool.id === toValue(poolId))

        if (realPracticePool?.items.length) {
            return realPracticePool
        }

        return mockPracticePools.find((practicePool) => practicePool.id === toValue(poolId))
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
    const targetPracticeText = computed(() => currentPracticeLine.value?.japaneseText ?? '')
    const currentPracticeLineTitle = computed(() => currentPracticeLine.value?.title ?? '暂无练习题目')
    const kanaHint = computed(() => createPlaceholderKanaHint(targetPracticeText.value))
    const practiceReadingUnits = computed<readonly PracticeReadingUnit[]>(() => {
        const currentReadingUnits = currentPracticePoolItem.value?.readingUnits

        if (currentReadingUnits?.length) {
            return currentReadingUnits
        }

        return targetPracticeText.value === mockPracticeSourceText ? mockPracticeReadingUnits : []
    })
    const practiceInfoItems = computed<readonly PracticeInfoItem[]>(() => [
        { label: '干员', value: currentPracticeOperatorName.value || '未知干员' },
        { label: '标题', value: currentPracticeLineTitle.value || '未知语音' },
        { label: 'PRTS 编号', value: currentPracticePoolItem.value?.voiceNumber.toString() ?? '未知编号' },
        { label: '难度', value: toValue(difficultyLabel) },
        { label: '日文', value: targetPracticeText.value || '暂无日文文本' },
        { label: '中文', value: currentPracticeChineseText.value || '暂无中文译文' },
        { label: '原始音频路径', value: currentPracticeAudioPath.value || '暂无原始路径' },
        { label: '当前播放文件', value: currentPracticeLine.value?.audioFileName ?? mockPracticeAudioFileName },
        { label: 'Mock 音频', value: mockPracticeAudioFileName },
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
        kanaHint,
        practiceReadingUnits,
        practiceInfoItems,
        isPracticeCycleCompleted,
        advanceToNextItem,
        restartPracticeCycle,
        advanceToNextPracticeGroup,
    }
}
