import type { CSSProperties } from 'vue'
import type { PrtsVoiceLine } from '#shared/utils/prtsVoiceDataExtractor'

export interface OperatorPortraitCrop extends CSSProperties {
    width: string
    maxWidth: string
    left: string
    top: string
}

export interface OperatorDisplayItem {
    id: string
    displayName: string
    portrait: string
    portraitCrop: OperatorPortraitCrop
    professionIconSrc: string
    voiceLines: readonly PrtsVoiceLine[]
}
