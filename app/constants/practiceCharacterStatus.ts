export const practiceJudgementStatuses = ['pending', 'correct', 'wrong'] as const

export type PracticeJudgementStatus = typeof practiceJudgementStatuses[number]

// backlog 待后续结合正确 预览 错误状态统一调整配色方案
export const practiceJudgementTextClasses = {
    pending: 'text-[#2563eb]',
    correct: 'text-[#1d4ed8]',
    wrong: 'text-[#ef4444]',
} as const satisfies Record<PracticeJudgementStatus, string>
