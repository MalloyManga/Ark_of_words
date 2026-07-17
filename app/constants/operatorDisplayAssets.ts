import operatorFrameBack from '~/assets/imgs/back.png'
import operatorFrameFront from '~/assets/imgs/front.png'
import casterProfessionIcon from '~/assets/imgs/Caster.png'
import type { OperatorPortraitCrop } from '~/types/operator'

export { casterProfessionIcon, operatorFrameBack, operatorFrameFront }

// MVP 暂无职业和立绘裁切接口 先集中使用现有展示参数 后续只需替换数据映射
export const defaultOperatorPortraitCrop: OperatorPortraitCrop = {
    width: '505%',
    maxWidth: 'none',
    left: '-202%',
    top: '5%',
}
