import { professionIconByProfession } from '~/constants/operatorDisplayAssets'
import type {
    OperatorCatalogItem,
    OperatorPortraitPlacement,
    OperatorVoiceResponse,
    SupportedOperatorId,
} from '#shared/types/operatorApi'
import type { OperatorDisplayItem, OperatorPortraitCrop } from '~/types/operator'

type OperatorVoiceResponseMap = Readonly<Partial<Record<SupportedOperatorId, OperatorVoiceResponse>>>

// DTO 后端字段适配

/**
 * 干预立绘位置 fallback
 */
const fallbackOperatorPortraitPlacement: OperatorPortraitPlacement = {
    widthPercent: 505,
    leftPercent: -202,
    topPercent: 5,
    scale: 1,
    rotationDegrees: 0,
}

/**
 * 兼容不含立绘配置的旧缓存 并阻止不完整配置破坏整个干员页渲染
 * 检测传入的 placement 信息是否有效 无效则使用 fallback 信息
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

/**
 * 通过立绘位置信息接口创建具体 css 对象
 */
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
 * 创建一个干员完整渲染出来所需要的所有基本信息
 * 把接口数据整理成页面组件能直接渲染的数据
 */
export const createOperatorDisplayItems = (
    catalogItems: readonly OperatorCatalogItem[],
    operatorVoiceResponseMap: OperatorVoiceResponseMap,
): readonly OperatorDisplayItem[] => {
    return catalogItems.map((catalogItem) => ({
        id: catalogItem.id,
        displayName: catalogItem.displayName,
        profession: catalogItem.profession,
        portrait: catalogItem.portraitUrl,
        portraitCrop: createOperatorPortraitCrop(catalogItem.portraitPlacement),
        professionIconSrc: professionIconByProfession[catalogItem.profession],
        voiceLines: operatorVoiceResponseMap[catalogItem.id]?.lines ?? [],
    }))
}
