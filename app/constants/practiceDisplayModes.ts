/**
 * 练习页显示模式配置
 */
interface PracticeDisplayModeConfig {
    id: string
    label: string
    shouldShowKanaHint: boolean
    shouldShowOriginalText: boolean
    shouldShowTranslation: boolean
}

export const practiceDisplayModes = [
    {
        id: 'full',
        label: '全文 + 假名 + 译文',
        shouldShowKanaHint: true,
        shouldShowOriginalText: true,
        shouldShowTranslation: true,
    },
    {
        id: 'kanaWithOriginalSlots',
        label: '假名 + 原文占位 + 译文',
        shouldShowKanaHint: true,
        shouldShowOriginalText: false,
        shouldShowTranslation: true,
    },
    {
        id: 'translationWithOriginalSlots',
        label: '原文占位 + 译文',
        shouldShowKanaHint: false,
        shouldShowOriginalText: false,
        shouldShowTranslation: true,
    },
    {
        id: 'originalSlotsOnly',
        label: '仅原文占位',
        shouldShowKanaHint: false,
        shouldShowOriginalText: false,
        shouldShowTranslation: false,
    },
] as const satisfies readonly PracticeDisplayModeConfig[]

export type PracticeDisplayMode = typeof practiceDisplayModes[number]
export type PracticeDisplayModeId = PracticeDisplayMode['id']
