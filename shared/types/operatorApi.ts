import type { JapaneseReadingUnit } from './japaneseReading'

/**
 * 目前支持的干员列表
 */
export const supportedOperatorIds = [
    'kaltsit-sihengtuo',
    'ines',
    'wisadel',
    'yu',
    'shu',
    'wang',
] as const

export type SupportedOperatorId = typeof supportedOperatorIds[number]

export const isSupportedOperatorId = (value: string): value is SupportedOperatorId => {
    return (supportedOperatorIds as readonly string[]).includes(value)
}

/**
 * 干员的立绘图像位置接口
 */
export interface OperatorPortraitPlacement {
    widthPercent: number
    leftPercent: number
    topPercent: number
    scale: number
    rotationDegrees: number
}

/**
 * 干员目录当中 一位干员相关 res 不包含语音信息
 */
export interface OperatorCatalogItem {
    id: SupportedOperatorId
    displayName: string
    portraitUrl: string
    portraitPlacement?: OperatorPortraitPlacement
}

/**
 * 干员目录 res 接口
 */
export interface OperatorCatalogResponse {
    operators: readonly OperatorCatalogItem[]
}

/**
 * 干员语音相关 res
 */
export interface OperatorVoiceLineResponse {
    id: string
    voiceNumber: number
    title: string
    japaneseText: string
    chineseText: string
    audioFileName: string
    audioUrl: string
    readingUnits: readonly JapaneseReadingUnit[]
}

/**
 * 一个干员的语音为主的相关信息
 */
export interface OperatorVoiceResponse {
    id: SupportedOperatorId
    displayName: string
    voiceKey: string
    portraitUrl: string
    sourcePageUrl: string
    lines: readonly OperatorVoiceLineResponse[]
}
