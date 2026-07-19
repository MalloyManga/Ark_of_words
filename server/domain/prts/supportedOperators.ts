import { supportedOperatorIds } from '#shared/types/operatorApi'
import type {
    OperatorPortraitPlacement,
    OperatorProfession,
    SupportedOperatorId,
} from '#shared/types/operatorApi'

export interface SupportedOperatorConfig {
    id: SupportedOperatorId
    displayName: string
    profession: OperatorProfession
    voicePageTitle: string
    portraitFileTitle: string
    portraitPlacement: OperatorPortraitPlacement
}

export const supportedOperators: readonly SupportedOperatorConfig[] = [
    {
        id: 'kaltsit-sihengtuo',
        displayName: '凯尔希·思衡托',
        profession: '医疗',
        voicePageTitle: '凯尔希·思衡托/语音记录',
        portraitFileTitle: 'File:立绘_凯尔希·思衡托_1.png',
        portraitPlacement: {
            widthPercent: 505,
            leftPercent: -227.65,
            topPercent: -10.1,
            scale: 2.09,
            rotationDegrees: 0,
        },
    },
    {
        id: 'ines',
        displayName: '伊内丝',
        profession: '先锋',
        voicePageTitle: '伊内丝/语音记录',
        portraitFileTitle: 'File:立绘_伊内丝_1.png',
        portraitPlacement: {
            widthPercent: 505,
            leftPercent: -193.67,
            topPercent: 33.51,
            scale: 1.16,
            rotationDegrees: 0,
        },
    },
    {
        id: 'wisadel',
        displayName: '维什戴尔',
        profession: '狙击',
        voicePageTitle: '维什戴尔/语音记录',
        portraitFileTitle: 'File:立绘_维什戴尔_1.png',
        portraitPlacement: {
            widthPercent: 505,
            leftPercent: -216.02,
            topPercent: -7.92,
            scale: 1.48,
            rotationDegrees: 0,
        },
    },
    {
        id: 'yu',
        displayName: '余',
        profession: '重装',
        voicePageTitle: '余/语音记录',
        portraitFileTitle: 'File:立绘_余_1.png',
        portraitPlacement: {
            widthPercent: 505,
            leftPercent: -203.28,
            topPercent: 24.87,
            scale: 1.15,
            rotationDegrees: 0,
        },
    },
    {
        id: 'shu',
        displayName: '黍',
        profession: '重装',
        voicePageTitle: '黍/语音记录',
        portraitFileTitle: 'File:立绘_黍_1.png',
        portraitPlacement: {
            widthPercent: 505,
            leftPercent: -206.47,
            topPercent: 28.57,
            scale: 1.23,
            rotationDegrees: 0,
        },
    },
    {
        id: 'wang',
        displayName: '望',
        profession: '特种',
        voicePageTitle: '望/语音记录',
        portraitFileTitle: 'File:立绘_望_1.png',
        portraitPlacement: {
            widthPercent: 505,
            leftPercent: -265.49,
            topPercent: 50.8,
            scale: 1.42,
            rotationDegrees: 0,
        },
    },
]

const supportedOperatorById = new Map<SupportedOperatorId, SupportedOperatorConfig>(
    supportedOperators.map((operator) => [operator.id, operator] as const),
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
