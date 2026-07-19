import operatorFrameBack from '~/assets/imgs/back.png'
import operatorFrameFront from '~/assets/imgs/front.png'
import casterProfessionIcon from '~/assets/imgs/Caster.png'
import defenderProfessionIcon from '~/assets/imgs/Defender.png'
import guardProfessionIcon from '~/assets/imgs/Guard.png'
import medicProfessionIcon from '~/assets/imgs/Medic.png'
import sniperProfessionIcon from '~/assets/imgs/Sniper.png'
import specialistProfessionIcon from '~/assets/imgs/Specialist.png'
import supporterProfessionIcon from '~/assets/imgs/Supporter.png'
import vanguardProfessionIcon from '~/assets/imgs/Vanguard.png'
import type { OperatorProfession } from '#shared/types/operatorApi'

export const professionIconByProfession: Readonly<Record<OperatorProfession, string>> = {
    先锋: vanguardProfessionIcon,
    近卫: guardProfessionIcon,
    重装: defenderProfessionIcon,
    狙击: sniperProfessionIcon,
    术士: casterProfessionIcon,
    医疗: medicProfessionIcon,
    辅助: supporterProfessionIcon,
    特种: specialistProfessionIcon,
}

export { operatorFrameBack, operatorFrameFront }
