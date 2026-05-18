import type { Component } from 'vue'
import IconAudio from '~/components/icon/Audio.vue'
import IconMenu from '~/components/icon/Menu.vue'
import IconSetting from '~/components/icon/Setting.vue'
import IconToggle from '~/components/icon/Toggle.vue'
import IconTranslation from '~/components/icon/Translation.vue'

export interface PracticeToolAction {
    label: string
    icon: Component
}

export const practiceToolActions = [
    { label: '播放语音', icon: IconAudio },
    { label: '显示提示', icon: IconToggle },
    { label: '翻译', icon: IconTranslation },
    { label: '列表', icon: IconMenu },
    { label: '设置', icon: IconSetting },
] as const satisfies readonly PracticeToolAction[]
