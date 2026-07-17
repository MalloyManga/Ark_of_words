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

export const practiceDifficultyVoiceTitleMap = {
    easy: [
        '编入队伍',
        '任命队长',
        '行动出发',
        '行动开始',
        '选中干员1',
        '选中干员2',
        '部署1',
        '部署2',
        '作战中1',
        '作战中2',
        '作战中3',
        '作战中4',
        '问候',
        '信赖触摸',
        '戳一下',
    ],
    normal: [
        '完成高难行动',
        '3星结束行动',
        '非3星结束行动',
        '行动失败',
        '观看作战记录',
        '闲置',
    ],
} as const satisfies Record<Exclude<StandardPracticeDifficulty, 'hard'>, readonly string[]>

const easyVoiceTitles = new Set<string>(practiceDifficultyVoiceTitleMap.easy)
const normalVoiceTitles = new Set<string>(practiceDifficultyVoiceTitleMap.normal)

/**
 * PRTS 各干员语音编号可能存在缺号 业务难度按稳定标题分类
 * 未进入简单和中等集合的语音统一归为困难
 */
export const getPracticeDifficultyByVoiceTitle = (voiceTitle: string): StandardPracticeDifficulty => {
    if (easyVoiceTitles.has(voiceTitle)) {
        return 'easy'
    }

    if (normalVoiceTitles.has(voiceTitle)) {
        return 'normal'
    }

    return 'hard'
}

// 路由 query 来自外部输入 需要先收敛到受控难度键
export const isPracticeDifficulty = (value: unknown): value is PracticeDifficulty => {
    return typeof value === 'string' && value in practiceDifficultyDetails
}
