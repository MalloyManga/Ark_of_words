import type { PrtsVoiceLine } from '~/utils/prtsVoiceDataExtractor'
import wisadelVoicePageRawData from '~/data/prts-wisadel-voice-page.slots.raw.json'

export interface PracticeLineSource {
    currentPracticeLine: PrtsVoiceLine | undefined
    currentPracticeAudioPath: string
    currentPracticeChineseText: string
    targetPracticeText: string
    currentPracticeLineTitle: string
    kanaHint: string
}

const selectedPracticeLineIndex = 14

const createPlaceholderKanaHint = (text: string) => {
    // kana 生成规则还没有确定 这里先用等长占位符验证练习数据接线
    return Array.from(text).map(() => '＿').join('')
}

export const usePracticeLineSource = (): PracticeLineSource => {
    // 练习数据源只负责选择当前语音行 不保存输入 判定 光标等练习状态
    const wisadelVoiceData = parsePrtsOperatorVoiceData(wisadelVoicePageRawData)
    const currentPracticeLine = wisadelVoiceData.lines[selectedPracticeLineIndex]
    const currentPracticeAudioPath = currentPracticeLine
        ? `/${wisadelVoiceData.japaneseAudioBasePath}/${currentPracticeLine.audioFileName}`
        : ''
    const currentPracticeChineseText = currentPracticeLine?.chineseText ?? ''
    const targetPracticeText = currentPracticeLine?.japaneseText ?? ''
    const currentPracticeLineTitle = currentPracticeLine?.title ?? `${wisadelVoiceData.operatorName}的不知道哪一条语音`
    const kanaHint = createPlaceholderKanaHint(targetPracticeText)

    return {
        currentPracticeLine,
        currentPracticeAudioPath,
        currentPracticeChineseText,
        targetPracticeText,
        currentPracticeLineTitle,
        kanaHint,
    }
}
