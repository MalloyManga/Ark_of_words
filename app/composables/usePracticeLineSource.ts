import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { PrtsVoiceLine } from '~/utils/prtsVoiceDataExtractor'
import wisadelVoicePageRawData from '~/data/prts-wisadel-voice-page.slots.raw.json'

interface PracticeLineSourceOptions {
    difficultyLabel: MaybeRefOrGetter<string>
}

export interface PracticeInfoItem {
    label: string
    value: string
}

/**
 * 练习阅读单元是第三方分词和假名 罗马字转换库接入前的稳定接口
 */
export interface PracticeReadingUnit {
    id: string
    sourceText: string
    kanaText: string
    romajiText: string
}

export interface PracticeLineSource {
    currentPracticeLine: PrtsVoiceLine | undefined
    currentPracticeOperatorName: string
    currentPracticeAudioPath: string
    currentPracticeChineseText: string
    targetPracticeText: string
    currentPracticeLineTitle: string
    kanaHint: string
    practiceReadingUnits: readonly PracticeReadingUnit[]
    practiceInfoItems: ComputedRef<readonly PracticeInfoItem[]>
}

const selectedPracticeLineIndex = 14
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

const createPlaceholderKanaHint = (text: string) => {
    // kana 生成规则还没有确定 这里先用等长占位符验证练习数据接线
    return Array.from(text).map(() => '＿').join('')
}

export const usePracticeLineSource = (options: PracticeLineSourceOptions): PracticeLineSource => {
    // 练习数据源只负责选择当前语音行 不保存输入 判定 光标等练习状态
    const wisadelVoiceData = parsePrtsOperatorVoiceData(wisadelVoicePageRawData)
    const currentPracticeLine = wisadelVoiceData.lines[selectedPracticeLineIndex]
    const currentPracticeOperatorName = wisadelVoiceData.operatorName
    const currentPracticeAudioPath = currentPracticeLine
        ? `/${wisadelVoiceData.japaneseAudioBasePath}/${currentPracticeLine.audioFileName}`
        : ''
    const currentPracticeChineseText = currentPracticeLine?.chineseText ?? ''
    const targetPracticeText = currentPracticeLine?.japaneseText ?? ''
    const currentPracticeLineTitle = currentPracticeLine?.title ?? `${wisadelVoiceData.operatorName}的不知道哪一条语音`
    const kanaHint = createPlaceholderKanaHint(targetPracticeText)
    const practiceInfoItems = computed<PracticeInfoItem[]>(() => [
        { label: '干员', value: currentPracticeOperatorName || '未知干员' },
        { label: '标题', value: currentPracticeLineTitle || '未知语音' },
        { label: '难度', value: toValue(options.difficultyLabel) },
        { label: '日文', value: targetPracticeText || '暂无日文文本' },
        { label: '中文', value: currentPracticeChineseText || '暂无中文译文' },
        { label: '原始音频路径', value: currentPracticeAudioPath || '暂无原始路径' },
        { label: '当前播放文件', value: currentPracticeLine?.audioFileName ?? mockPracticeAudioFileName },
        { label: 'Mock 音频', value: mockPracticeAudioFileName },
    ])

    return {
        currentPracticeLine,
        currentPracticeOperatorName,
        currentPracticeAudioPath,
        currentPracticeChineseText,
        targetPracticeText,
        currentPracticeLineTitle,
        kanaHint,
        practiceReadingUnits: mockPracticeReadingUnits,
        practiceInfoItems,
    }
}
