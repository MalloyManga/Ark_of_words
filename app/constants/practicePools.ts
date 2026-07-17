import { practiceDifficultyVoiceNumberMap } from '~/constants/practiceDifficulties'
import type { PracticePoolId } from '~/constants/practiceDifficulties'
import type { PrtsOperatorVoiceData, PrtsVoiceLine } from '#shared/utils/prtsVoiceDataExtractor'
import type { JapaneseReadingUnit } from '#shared/types/japaneseReading'
import type {
    OperatorVoiceLineResponse,
    OperatorVoiceResponse,
    SupportedOperatorId,
} from '#shared/types/operatorApi'

export interface PracticeOperatorIdentity {
    id: string
    name: string
    voiceKey: string
}

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

type OperatorVoiceResponseMap = Readonly<Partial<Record<SupportedOperatorId, OperatorVoiceResponse>>>

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

export interface PracticePool {
    id: PracticePoolId
    items: readonly PracticePoolItem[]
}

const createOperatorIdentity = (operatorVoiceData: PrtsOperatorVoiceData): PracticeOperatorIdentity => {
    return {
        id: operatorVoiceData.voiceKey,
        name: operatorVoiceData.operatorName,
        voiceKey: operatorVoiceData.voiceKey,
    }
}

const createPracticePoolItem = (
    operatorVoiceData: PrtsOperatorVoiceData,
    voiceLine: PrtsVoiceLine,
): PracticePoolItem => {
    const operator = createOperatorIdentity(operatorVoiceData)

    return {
        id: `${operator.id}:${voiceLine.voiceNumber}`,
        operator,
        voiceNumber: voiceLine.voiceNumber,
        voiceLine,
    }
}

const createPracticePoolItems = (
    operatorVoiceDataList: readonly PrtsOperatorVoiceData[],
): readonly PracticePoolItem[] => {
    return operatorVoiceDataList.flatMap((operatorVoiceData) => {
        return operatorVoiceData.lines.map((voiceLine) => createPracticePoolItem(operatorVoiceData, voiceLine))
    })
}

const createStandardDifficultyPoolItems = (
    poolId: Exclude<PracticePoolId, 'custom'>,
    allPoolItems: readonly PracticePoolItem[],
): readonly PracticePoolItem[] => {
    const acceptedVoiceNumbers = new Set<number>(practiceDifficultyVoiceNumberMap[poolId])

    return allPoolItems.filter((poolItem) => acceptedVoiceNumbers.has(poolItem.voiceNumber))
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

export const createPracticePoolsFromOperatorVoiceData = (
    operatorVoiceDataList: readonly PrtsOperatorVoiceData[],
): readonly PracticePool[] => {
    const allPoolItems = createPracticePoolItems(operatorVoiceDataList)

    return createPracticePoolsFromItems(allPoolItems)
}
