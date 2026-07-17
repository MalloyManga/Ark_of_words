import type { OperatorCatalogResponse } from '#shared/types/operatorApi'
import { createOperatorDisplayItems } from '~/utils/operatorDisplayAdapter'

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
    const {
        operatorVoiceResponseMap,
        operatorVoiceErrorMap,
        loadOperatorVoices,
        isOperatorVoicePending,
    } = useOperatorVoiceData()

    const operatorDisplayItems = computed(() => {
        return createOperatorDisplayItems(
            operatorCatalogResponse.value?.operators ?? [],
            operatorVoiceResponseMap.value,
        )
    })

    return {
        operatorDisplayItems,
        operatorCatalogError,
        operatorVoiceResponseMap,
        operatorVoiceErrorMap,
        loadOperatorVoices,
        isOperatorVoicePending,
    }
}
