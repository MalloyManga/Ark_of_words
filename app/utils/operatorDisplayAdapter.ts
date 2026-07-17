import { casterProfessionIcon } from '~/constants/operatorDisplayAssets'
import type {
    OperatorCatalogItem,
    OperatorPortraitPlacement,
    OperatorVoiceResponse,
    SupportedOperatorId,
} from '#shared/types/operatorApi'
import type { OperatorDisplayItem, OperatorPortraitCrop } from '~/types/operator'

type OperatorVoiceResponseMap = Readonly<Partial<Record<SupportedOperatorId, OperatorVoiceResponse>>>

const fallbackOperatorPortraitPlacement: OperatorPortraitPlacement = {
    widthPercent: 505,
    leftPercent: -202,
    topPercent: 5,
    scale: 1,
    rotationDegrees: 0,
}

/**
 * 兼容不含立绘配置的旧缓存 并阻止不完整配置破坏整个干员页渲染
 */
const resolveOperatorPortraitPlacement = (
    placement: OperatorPortraitPlacement | undefined,
): OperatorPortraitPlacement => {
    if (
        placement
        && Number.isFinite(placement.widthPercent)
        && Number.isFinite(placement.leftPercent)
        && Number.isFinite(placement.topPercent)
        && Number.isFinite(placement.scale)
        && Number.isFinite(placement.rotationDegrees)
    ) {
        return placement
    }

    return fallbackOperatorPortraitPlacement
}

const createOperatorPortraitCrop = (
    placement: OperatorPortraitPlacement | undefined,
): OperatorPortraitCrop => {
    const resolvedPlacement = resolveOperatorPortraitPlacement(placement)

    return {
        width: `${resolvedPlacement.widthPercent}%`,
        maxWidth: 'none',
        left: `${resolvedPlacement.leftPercent}%`,
        top: `${resolvedPlacement.topPercent}%`,
        transform: `scale(${resolvedPlacement.scale}) rotate(${resolvedPlacement.rotationDegrees}deg)`,
        transformOrigin: 'center center',
    }
}

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
        portraitCrop: createOperatorPortraitCrop(catalogItem.portraitPlacement),
        professionIconSrc: casterProfessionIcon,
        voiceLines: operatorVoiceResponseMap[catalogItem.id]?.lines ?? [],
    }))
}
