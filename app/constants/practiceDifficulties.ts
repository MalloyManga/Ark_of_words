interface PracticeDifficultyDetail {
    label: string
    classes: string
}

type StandardPracticeDifficulty = 'easy' | 'normal' | 'hard'

export const practiceDifficultyDetails = {
    easy: {
        label: '简单',
        classes: 'text-mint',
    },
    normal: {
        label: '中等',
        classes: 'text-butter',
    },
    hard: {
        label: '困难',
        classes: 'text-coral',
    },
    custom: {
        label: '自由配置',
        classes: 'text-indigo',
    },
} as const satisfies Record<string, PracticeDifficultyDetail>

export type PracticeDifficulty = keyof typeof practiceDifficultyDetails
export type PracticePoolId = PracticeDifficulty

export const practiceDifficultyVoiceNumberMap = {
    easy: [1, 2, 10, 17, 18],
    normal: [3, 7, 8, 19, 21],
    hard: [5, 6, 29, 32, 44],
} as const satisfies Record<StandardPracticeDifficulty, readonly number[]>

// 路由 query 来自外部输入 需要先收敛到受控难度键
export const isPracticeDifficulty = (value: unknown): value is PracticeDifficulty => {
    return typeof value === 'string' && value in practiceDifficultyDetails
}
