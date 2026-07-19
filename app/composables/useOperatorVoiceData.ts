import type { OperatorVoiceResponse, SupportedOperatorId } from '#shared/types/operatorApi'

type OperatorVoiceErrorMap = Partial<Record<SupportedOperatorId, string>>

const getRequestErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : '未知请求错误'
}

/**
 * 加载一个干员的语音
 */
export const useOperatorVoiceData = () => {
    // 从已经缓存的干员语音信息里面获取
    const operatorVoiceResponseMap = useOperatorVoiceResponseCache()
    const operatorVoiceErrorMap = ref<OperatorVoiceErrorMap>({})
    const pendingOperatorIds = ref<ReadonlySet<SupportedOperatorId>>(new Set<SupportedOperatorId>())

    /**
     * 加载干员语音 从 server/api 我方服务器获取
     */
    const loadOperatorVoices = async (operatorId: SupportedOperatorId): Promise<void> => {
        // 缓存当中已经存在 或者 已经正在请求这个干员的信息 就直接返回不再请求
        if (operatorVoiceResponseMap.value[operatorId] || pendingOperatorIds.value.has(operatorId)) {
            return
        }

        pendingOperatorIds.value = new Set([...pendingOperatorIds.value, operatorId])

        try {
            const operatorVoiceResponse = await $fetch<OperatorVoiceResponse>(
                `/api/operators/${encodeURIComponent(operatorId)}/voices`,
            )

            // 请求完成之后写入缓存
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

    /**
     * 加载干员语音 Set
     */
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
