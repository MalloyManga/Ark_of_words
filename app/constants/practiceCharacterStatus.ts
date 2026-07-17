export const practiceJudgementStatuses = ['pending', 'correct', 'wrong', 'extra'] as const

export type PracticeJudgementStatus = typeof practiceJudgementStatuses[number]

export const practiceJudgementTextClasses = {
    pending: 'text-slate-400 dark:text-slate-500',
    correct: 'text-green-500 dark:text-green-400',
    wrong: 'text-red-500 dark:text-red-400',
    extra: 'text-amber-500 dark:text-amber-400',
} as const satisfies Record<PracticeJudgementStatus, string>
