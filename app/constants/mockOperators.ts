import operatorFrameBack from '~/assets/imgs/back.png'
import operatorFrameFront from '~/assets/imgs/front.png'
import casterProfessionIcon from '~/assets/imgs/Caster.png'
import mostimaPortrait from '~/assets/imgs/立绘_莫斯提马_1.png'
import wisadelVoicePageRawData from '~/data/prts-wisadel-voice-page.slots.raw.json'
import { parsePrtsOperatorVoiceData } from '#shared/utils/prtsVoiceDataExtractor'
import type { OperatorDisplayItem, OperatorPortraitCrop } from '~/types/operator'

export { operatorFrameBack, operatorFrameFront }

const wisadelVoiceData = parsePrtsOperatorVoiceData(wisadelVoicePageRawData)

// 干员头像格子由底图 干员立绘 前景遮罩三层组成
// 裁切值跟随干员数据走 每个干员可以独立保存自己的立绘位置
const defaultOperatorPortraitCrop: OperatorPortraitCrop = {
    width: '505%',
    maxWidth: 'none',
    left: '-202%',
    top: '5%',
}

export const mockOperators: readonly OperatorDisplayItem[] = Array.from(
    { length: 30 },
    (_, operatorIndex): OperatorDisplayItem => {
        const serialNumber = String(operatorIndex + 1).padStart(2, '0')

        return {
            id: `operator-${serialNumber}`,
            displayName: operatorIndex === 0 ? '莫斯提马' : `演习干员 ${serialNumber}`,
            portrait: mostimaPortrait,
            portraitCrop: defaultOperatorPortraitCrop,
            professionIconSrc: casterProfessionIcon,
            voiceLines: wisadelVoiceData.lines,
        }
    },
)
