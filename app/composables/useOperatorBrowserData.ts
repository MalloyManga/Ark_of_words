import type { OperatorCatalogResponse } from '#shared/types/operatorApi'
import { createOperatorDisplayItems } from '~/utils/operatorDisplayAdapter'

/**
 * 前端请求 获取干员列表完整信息 干员页面数据总入口
 * 干员页面挂载时获取干员目录 单个干员只在首次展开时获取语音信息
 */
export const useOperatorBrowserData = () => {
    // 仅仅获取到干员目录信息
    const operatorCatalogRequest = useFetch<OperatorCatalogResponse>(
        '/api/operators',
        { key: 'supported-operator-catalog-with-placement' },
    )
    const {
        operatorVoiceResponseMap,
        operatorVoiceErrorMap,
        loadOperatorVoices, // 发送请求获取到一位干员的完整语音信息 仅在点击展开时触发并获取
        isOperatorVoicePending,
    } = useOperatorVoiceData()

    const operatorDisplayItems = computed(() => {
        return createOperatorDisplayItems(
            operatorCatalogRequest.data.value?.operators ?? [],
            operatorVoiceResponseMap.value,
        )
    })

    return {
        operatorDisplayItems,
        operatorCatalogError: operatorCatalogRequest.error,
        operatorCatalogReady: operatorCatalogRequest.then(() => undefined),
        operatorVoiceResponseMap,
        operatorVoiceErrorMap,
        loadOperatorVoices,
        isOperatorVoicePending,
    }
}
