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
    {
        label: '加强物理队',
        text: '物理队要坚持不下去了😭',
        deletingSpeedMs: 20,
        typingSpeedMs: 20,
        holdAfterTypedMs: 20,
        holdBeforeNextLineMs: 100
    },
    { label: '戳一下', text: 'そんなに死にたいの' },
    {
        label: '时序莫斯提马！',
        text: '莫斯提马异格😡',
        deletingSpeedMs: 20,
        typingSpeedMs: 20,
        holdAfterTypedMs: 20,
        holdBeforeNextLineMs: 100
    },
    { label: '行动出发', text: '楽しい時間って、ほんとに終わらないわよねぇ' },
] as const satisfies readonly TypewriterLineInfo[]
