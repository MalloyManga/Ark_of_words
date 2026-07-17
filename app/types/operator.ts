import type { CSSProperties } from 'vue'

export interface OperatorDisplayVoiceLine {
    id: string
    title: string
    japaneseText: string
    chineseText: string
}

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
    voiceLines: readonly OperatorDisplayVoiceLine[]
}
