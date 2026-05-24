import { practiceDifficultyVoiceNumberMap } from '~/constants/practiceDifficulties'
import type { PracticePoolId } from '~/constants/practiceDifficulties'
import type { PrtsOperatorVoiceData, PrtsVoiceLine } from '~/utils/prtsVoiceDataExtractor'

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

export const createPracticePoolsFromOperatorVoiceData = (
    operatorVoiceDataList: readonly PrtsOperatorVoiceData[],
): readonly PracticePool[] => {
    const allPoolItems = createPracticePoolItems(operatorVoiceDataList)

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
            // 自由配置池暂时承载全部 mock 台词 之后会替换成用户手动选择结果
            id: 'custom',
            items: allPoolItems,
        },
    ]
}
