import { getPracticeDifficultyByVoiceTitle } from '~/constants/practiceDifficulties'
import type { PracticePoolId } from '~/constants/practiceDifficulties'
import type { PrtsVoiceLine } from '#shared/utils/prtsVoiceDataExtractor'
import type { JapaneseReadingUnit } from '#shared/types/japaneseReading'
import type {
    OperatorVoiceLineResponse,
    OperatorVoiceResponse,
    SupportedOperatorId,
} from '#shared/types/operatorApi'

/**
 * 前端展示用语音条目名称
 */
export interface PracticeOperatorIdentity {
    id: string
    name: string
    voiceKey: string
}

/**
 * 一个练习池的干员语音信息
 */
export interface PracticePoolItem {
    id: string
    operator: PracticeOperatorIdentity
    voiceNumber: number
    voiceLine: PrtsVoiceLine
    audioUrl?: string
    readingUnits?: readonly JapaneseReadingUnit[]
}

interface CustomPracticePoolSelection {
    operatorId: SupportedOperatorId
    voiceLineId: string
}

/**
 * 练习池接口
 */
export interface PracticePool {
    id: PracticePoolId
    items: readonly PracticePoolItem[]
}

type OperatorVoiceResponseMap = Readonly<Partial<Record<SupportedOperatorId, OperatorVoiceResponse>>>

/**
 * 从站点语音Response当中提取出单条练习item
 */
const createPracticePoolItemFromOperatorVoiceResponse = (
    operatorVoiceResponse: OperatorVoiceResponse,
    voiceLine: OperatorVoiceLineResponse,
): PracticePoolItem => {
    return {
        id: `${operatorVoiceResponse.id}:${voiceLine.id}`,
        operator: {
            id: operatorVoiceResponse.id,
            name: operatorVoiceResponse.displayName,
            voiceKey: operatorVoiceResponse.voiceKey,
        },
        voiceNumber: voiceLine.voiceNumber,
        voiceLine,
        audioUrl: voiceLine.audioUrl,
        readingUnits: voiceLine.readingUnits,
    }
}

/**
 * 根据 自选语音信息 以及 从站点得到的语音Response 得到一个自建练习池
 */
export const createCustomPracticePool = (
    selections: readonly CustomPracticePoolSelection[],
    operatorVoiceResponseMap: OperatorVoiceResponseMap,
): PracticePool => {
    const items = selections.flatMap((selection): readonly PracticePoolItem[] => {
        const operatorVoiceResponse = operatorVoiceResponseMap[selection.operatorId]
        const voiceLine = operatorVoiceResponse?.lines.find((line) => line.id === selection.voiceLineId)

        if (!operatorVoiceResponse || !voiceLine) {
            return []
        }

        return [createPracticePoolItemFromOperatorVoiceResponse(operatorVoiceResponse, voiceLine)]
    })

    return { id: 'custom', items }
}

const createStandardDifficultyPoolItems = (
    poolId: Exclude<PracticePoolId, 'custom'>,
    allPoolItems: readonly PracticePoolItem[],
): readonly PracticePoolItem[] => {
    return allPoolItems.filter((poolItem) => {
        return getPracticeDifficultyByVoiceTitle(poolItem.voiceLine.title) === poolId
    })
}

const createPracticePoolsFromItems = (allPoolItems: readonly PracticePoolItem[]): readonly PracticePool[] => {
    return [
        {
            id: 'easy',
            items: createStandardDifficultyPoolItems('easy', allPoolItems),
        },
        {
            id: 'normal',
            items: createStandardDifficultyPoolItems('normal', allPoolItems),
        },
        {
            id: 'hard',
            items: createStandardDifficultyPoolItems('hard', allPoolItems),
        },
        {
            id: 'custom',
            items: allPoolItems,
        },
    ]
}

export const createPracticePoolsFromOperatorVoiceResponses = (
    operatorVoiceResponses: readonly OperatorVoiceResponse[],
): readonly PracticePool[] => {
    const allPoolItems = operatorVoiceResponses.flatMap((operatorVoiceResponse) => {
        return operatorVoiceResponse.lines.map((voiceLine) => {
            return createPracticePoolItemFromOperatorVoiceResponse(operatorVoiceResponse, voiceLine)
        })
    })

    return createPracticePoolsFromItems(allPoolItems)
}
