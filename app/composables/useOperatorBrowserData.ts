import type { OperatorCatalogResponse, OperatorVoiceResponse, SupportedOperatorId } from '#shared/types/operatorApi'
import { createOperatorDisplayItems } from '~/utils/operatorDisplayAdapter'

type OperatorVoiceResponseMap = Partial<Record<SupportedOperatorId, OperatorVoiceResponse>>
type OperatorVoiceErrorMap = Partial<Record<SupportedOperatorId, string>>

const getRequestErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : '未知请求错误'
}

/**
 * 管理干员浏览页的数据请求和会话内缓存
 *
 * 目录随页面获取 单个干员语音只在首次展开时按需请求
 * 相同干员在当前页面生命周期内不会重复请求
 */
export const useOperatorBrowserData = async () => {
    const { data: operatorCatalogResponse, error: operatorCatalogError } = await useFetch<OperatorCatalogResponse>(
        '/api/operators',
        { key: 'supported-operator-catalog' },
    )
    const operatorVoiceResponseMap = ref<OperatorVoiceResponseMap>({})
    const operatorVoiceErrorMap = ref<OperatorVoiceErrorMap>({})
    const pendingOperatorIds = ref<ReadonlySet<SupportedOperatorId>>(new Set<SupportedOperatorId>())

    const operatorDisplayItems = computed(() => {
        return createOperatorDisplayItems(
            operatorCatalogResponse.value?.operators ?? [],
            operatorVoiceResponseMap.value,
        )
    })

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

    const isOperatorVoicePending = (operatorId: SupportedOperatorId): boolean => {
        return pendingOperatorIds.value.has(operatorId)
    }

    return {
        operatorDisplayItems,
        operatorCatalogError,
        operatorVoiceErrorMap: readonly(operatorVoiceErrorMap),
        loadOperatorVoices,
        isOperatorVoicePending,
    }
}
