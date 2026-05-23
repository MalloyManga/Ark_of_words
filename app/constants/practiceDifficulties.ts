interface PracticeDifficultyDetail {
    label: string
    classes: string
}

export const practiceDifficultyDetails = {
    easy: {
        label: '简单',
        classes: 'text-[#2563eb]',
    },
    normal: {
        label: '中等',
        classes: 'text-[#a16207]',
    },
    hard: {
        label: '困难',
        classes: 'text-[#dc2626]',
    },
    custom: {
        label: '自由配置',
        classes: 'text-[#047857]',
    },
} as const satisfies Record<string, PracticeDifficultyDetail>

export type PracticeDifficulty = keyof typeof practiceDifficultyDetails

// 路由 query 来自外部输入 需要先收敛到受控难度键
export const isPracticeDifficulty = (value: unknown): value is PracticeDifficulty => {
    return typeof value === 'string' && value in practiceDifficultyDetails
}
