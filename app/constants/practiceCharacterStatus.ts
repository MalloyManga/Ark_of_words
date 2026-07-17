export const practiceJudgementStatuses = ['pending', 'correct', 'wrong'] as const

export type PracticeJudgementStatus = typeof practiceJudgementStatuses[number]

// 打字判定配色 pending 浅墨等待输入 correct 深墨已确认 wrong 珊瑚红醒目
// 目标是让对错一眼可辨 保持输入节奏
export const practiceJudgementTextClasses = {
    pending: 'text-ink-soft/40',
    correct: 'text-ink',
    wrong: 'text-coral',
} as const satisfies Record<PracticeJudgementStatus, string>
