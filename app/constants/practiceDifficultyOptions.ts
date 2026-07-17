import type { PracticeDifficulty } from '~/constants/practiceDifficulties'

export interface PracticeDifficultyOption {
    value: PracticeDifficulty
    label: string
    desc: string
    icon: string
    gradient: string
    darkGradient: string
}

export const practiceDifficultyOptions: readonly PracticeDifficultyOption[] = [
    {
        value: 'easy',
        label: '简 单',
        desc: '较短的作战指令与干员报到语音。',
        icon: '🍀',
        gradient: 'from-emerald-400 to-teal-400',
        darkGradient: 'dark:from-emerald-600/60 dark:to-teal-500/60',
    },
    {
        value: 'normal',
        label: '中 等',
        desc: '带有情绪起伏的日常交流与战斗语音。',
        icon: '⚡',
        gradient: 'from-amber-400 to-orange-400',
        darkGradient: 'dark:from-amber-600/60 dark:to-orange-500/60',
    },
    {
        value: 'hard',
        label: '困 难',
        desc: '长段落的干员信赖交谈与复杂台词。',
        icon: '🔥',
        gradient: 'from-rose-400 to-red-500',
        darkGradient: 'dark:from-rose-600/60 dark:to-red-600/60',
    },
    {
        value: 'custom',
        label: '自由配置',
        desc: '按需组合干员、难度与语音类型。',
        icon: '⚙️',
        gradient: 'from-indigo-400 to-purple-500',
        darkGradient: 'dark:from-indigo-600/60 dark:to-purple-600/60',
    },
]
