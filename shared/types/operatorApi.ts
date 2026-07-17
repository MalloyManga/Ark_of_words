export const supportedOperatorIds = [
    'kaltsit-sihengtuo',
    'ines',
    'wisadel',
    'yu',
    'shu',
    'wang',
] as const

export type SupportedOperatorId = typeof supportedOperatorIds[number]

export interface OperatorCatalogItem {
    id: SupportedOperatorId
    displayName: string
    portraitUrl: string
}

export interface OperatorCatalogResponse {
    operators: readonly OperatorCatalogItem[]
}

export interface OperatorVoiceLineResponse {
    id: string
    voiceNumber: number
    title: string
    japaneseText: string
    chineseText: string
    audioFileName: string
    audioUrl: string
}

export interface OperatorVoiceResponse {
    id: SupportedOperatorId
    displayName: string
    voiceKey: string
    portraitUrl: string
    sourcePageUrl: string
    lines: readonly OperatorVoiceLineResponse[]
}
