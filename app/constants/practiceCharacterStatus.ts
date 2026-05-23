export const practiceCharacterStatuses = ['pending', 'correct', 'wrong'] as const

export type CharacterStatus = typeof practiceCharacterStatuses[number]

// backlog 待后续结合正确 预览 错误状态统一调整配色方案
export const practiceCharacterTextClasses = {
    pending: 'text-[#2563eb]',
    correct: 'text-[#1d4ed8]',
    wrong: 'text-[#ef4444]',
} as const satisfies Record<CharacterStatus, string>
