import { casterProfessionIcon, defaultOperatorPortraitCrop } from '~/constants/operatorDisplayAssets'
import type { OperatorCatalogItem, OperatorVoiceResponse, SupportedOperatorId } from '#shared/types/operatorApi'
import type { OperatorDisplayItem } from '~/types/operator'

type OperatorVoiceResponseMap = Readonly<Partial<Record<SupportedOperatorId, OperatorVoiceResponse>>>

/**
 * 将稳定 API DTO 转成现有纯展示组件需要的模型
 *
 * 页面组件不感知请求状态和 PRTS 字段细节
 * 后续增加职业图标或独立裁切参数时只修改这一层
 */
export const createOperatorDisplayItems = (
    catalogItems: readonly OperatorCatalogItem[],
    operatorVoiceResponseMap: OperatorVoiceResponseMap,
): readonly OperatorDisplayItem[] => {
    return catalogItems.map((catalogItem) => ({
        id: catalogItem.id,
        displayName: catalogItem.displayName,
        portrait: catalogItem.portraitUrl,
        portraitCrop: defaultOperatorPortraitCrop,
        professionIconSrc: casterProfessionIcon,
        voiceLines: operatorVoiceResponseMap[catalogItem.id]?.lines ?? [],
    }))
}
