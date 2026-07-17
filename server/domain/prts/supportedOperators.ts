import { supportedOperatorIds } from '#shared/types/operatorApi'
import type { SupportedOperatorId } from '#shared/types/operatorApi'

export interface SupportedOperatorConfig {
    id: SupportedOperatorId
    displayName: string
    voicePageTitle: string
    portraitFileTitle: string
}

export const supportedOperators: readonly SupportedOperatorConfig[] = [
    {
        id: 'kaltsit-sihengtuo',
        displayName: '凯尔希·思衡托',
        voicePageTitle: '凯尔希·思衡托/语音记录',
        portraitFileTitle: 'File:立绘_凯尔希·思衡托_1.png',
    },
    {
        id: 'ines',
        displayName: '伊内丝',
        voicePageTitle: '伊内丝/语音记录',
        portraitFileTitle: 'File:立绘_伊内丝_1.png',
    },
    {
        id: 'wisadel',
        displayName: '维什戴尔',
        voicePageTitle: '维什戴尔/语音记录',
        portraitFileTitle: 'File:立绘_维什戴尔_1.png',
    },
    {
        id: 'yu',
        displayName: '余',
        voicePageTitle: '余/语音记录',
        portraitFileTitle: 'File:立绘_余_1.png',
    },
    {
        id: 'shu',
        displayName: '黍',
        voicePageTitle: '黍/语音记录',
        portraitFileTitle: 'File:立绘_黍_1.png',
    },
    {
        id: 'wang',
        displayName: '望',
        voicePageTitle: '望/语音记录',
        portraitFileTitle: 'File:立绘_望_1.png',
    },
]

const supportedOperatorById = new Map<SupportedOperatorId, SupportedOperatorConfig>(
    supportedOperators.map((operator) => [operator.id, operator]),
)

export const isSupportedOperatorId = (value: string): value is SupportedOperatorId => {
    return (supportedOperatorIds as readonly string[]).includes(value)
}

export const getSupportedOperator = (operatorId: SupportedOperatorId): SupportedOperatorConfig => {
    const operator = supportedOperatorById.get(operatorId)

    if (!operator) {
        throw new Error(`缺少受支持干员配置 ${operatorId}`)
    }

    return operator
}
