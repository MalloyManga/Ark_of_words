import type { OperatorVoiceResponse, SupportedOperatorId } from '#shared/types/operatorApi'

export type OperatorVoiceResponseMap = Partial<Record<SupportedOperatorId, OperatorVoiceResponse>>

export const useOperatorVoiceResponseCache = () => {
    return useState<OperatorVoiceResponseMap>('operator-voice-response-cache-v2', () => ({}))
}
