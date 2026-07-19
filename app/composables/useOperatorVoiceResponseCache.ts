import type { OperatorVoiceResponse, SupportedOperatorId } from '#shared/types/operatorApi'

export type OperatorVoiceResponseMap = Partial<Record<SupportedOperatorId, OperatorVoiceResponse>>

/**
 * 当前一次会话里的用户缓存 刷新页面之后会清空
 * 缓存用户已经加载过的语音 不再重复请求
 */
export const useOperatorVoiceResponseCache = () => {
    return useState<OperatorVoiceResponseMap>('operator-voice-response-cache-v2', () => ({}))
}
