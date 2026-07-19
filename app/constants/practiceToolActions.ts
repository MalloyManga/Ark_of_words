import IconAudio from '~/components/icon/Audio.vue'
import IconMenu from '~/components/icon/Menu.vue'
import IconSetting from '~/components/icon/Setting.vue'
import IconToggle from '~/components/icon/Toggle.vue'
import IconTranslation from '~/components/icon/Translation.vue'

/**
 * tool id
 */
export type PracticeToolActionId = 'audio' | 'displayMode' | 'romaji' | 'info' | 'settings'

/**
 * 练习页面 tool 信息
 */
export interface PracticeToolAction {
    id: PracticeToolActionId
    label: string
    icon: Component
}

/**
 * 具体的 tool 信息
 */
export const practiceToolActions = [
    { id: 'audio', label: '播放语音', icon: IconAudio },
    { id: 'displayMode', label: '显示模式', icon: IconToggle },
    { id: 'romaji', label: '罗马字占位', icon: IconTranslation },
    { id: 'info', label: '语音信息', icon: IconMenu },
    { id: 'settings', label: '设置', icon: IconSetting },
] as const satisfies readonly PracticeToolAction[]
