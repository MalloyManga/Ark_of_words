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

export interface PracticeLineSource {
    currentPracticeLine: PrtsVoiceLine | undefined
    currentPracticeOperatorName: string
    currentPracticeAudioPath: string
    currentPracticeChineseText: string
    targetPracticeText: string
    currentPracticeLineTitle: string
    kanaHint: string
    practiceInfoItems: ComputedRef<readonly PracticeInfoItem[]>
}

const selectedPracticeLineIndex = 14
const mockPracticeAudioFileName = '编入队伍.wav'

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
        practiceInfoItems,
    }
}
