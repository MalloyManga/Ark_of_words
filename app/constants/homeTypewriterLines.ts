export interface TypewriterLineInfo {
    label: string
    text: string
    typingSpeedMs?: number
    deletingSpeedMs?: number
    holdAfterTypedMs?: number
    holdBeforeNextLineMs?: number
}

export const TYPE_SPEED_MS = 90
export const DELETE_SPEED_MS = 45
export const HOLD_AFTER_TYPED_MS = 1200
export const HOLD_BEFORE_NEXT_LINE_MS = 360

export const homeTypewriterLines = [
    { label: '作战中3', text: 'はいはい、焦らなくていいわよ、全員分あるから' },
    { label: '戳一下', text: 'そんなに死にたいの' },
    { label: '行动出发', text: '楽しい時間って、ほんとに終わらないわよねぇ' },
] as const satisfies readonly TypewriterLineInfo[]
