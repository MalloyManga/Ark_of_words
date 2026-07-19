/**
 * 单独一条日文语音接口
 */
export interface JapaneseReadingUnit {
    id: string
    sourceText: string
    kanaText: string
    romajiText: string
    basicForm: string
    partOfSpeech: string
}
