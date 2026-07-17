import type { OperatorVoiceResponse, SupportedOperatorId } from '#shared/types/operatorApi'

type OperatorVoiceErrorMap = Partial<Record<SupportedOperatorId, string>>

const getRequestErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : '未知请求错误'
}

/**
 * 管理干员语音的会话缓存和请求状态
 *
 * 单个加载供浏览页按需展开
 * 顺序批量加载供标准难度池使用 避免冷缓存时同时冲击 PRTS 上游
 */
export const useOperatorVoiceData = () => {
    const operatorVoiceResponseMap = useOperatorVoiceResponseCache()
    const operatorVoiceErrorMap = ref<OperatorVoiceErrorMap>({})
    const pendingOperatorIds = ref<ReadonlySet<SupportedOperatorId>>(new Set<SupportedOperatorId>())

    const loadOperatorVoices = async (operatorId: SupportedOperatorId): Promise<void> => {
        if (operatorVoiceResponseMap.value[operatorId] || pendingOperatorIds.value.has(operatorId)) {
            return
        }

        pendingOperatorIds.value = new Set([...pendingOperatorIds.value, operatorId])

        try {
            const operatorVoiceResponse = await $fetch<OperatorVoiceResponse>(
                `/api/operators/${encodeURIComponent(operatorId)}/voices`,
            )

            operatorVoiceResponseMap.value = {
                ...operatorVoiceResponseMap.value,
                [operatorId]: operatorVoiceResponse,
            }

            const nextOperatorVoiceErrorMap = { ...operatorVoiceErrorMap.value }
            delete nextOperatorVoiceErrorMap[operatorId]
            operatorVoiceErrorMap.value = nextOperatorVoiceErrorMap
        } catch (error: unknown) {
            operatorVoiceErrorMap.value = {
                ...operatorVoiceErrorMap.value,
                [operatorId]: getRequestErrorMessage(error),
            }
        } finally {
            const nextPendingOperatorIds = new Set(pendingOperatorIds.value)
            nextPendingOperatorIds.delete(operatorId)
            pendingOperatorIds.value = nextPendingOperatorIds
        }
    }

    const loadOperatorVoiceSet = async (operatorIds: readonly SupportedOperatorId[]): Promise<void> => {
        for (const operatorId of operatorIds) {
            await loadOperatorVoices(operatorId)
        }
    }

    const isOperatorVoicePending = (operatorId: SupportedOperatorId): boolean => {
        return pendingOperatorIds.value.has(operatorId)
    }

    return {
        operatorVoiceResponseMap: readonly(operatorVoiceResponseMap),
        operatorVoiceErrorMap: readonly(operatorVoiceErrorMap),
        loadOperatorVoices,
        loadOperatorVoiceSet,
        isOperatorVoicePending,
    }
}
