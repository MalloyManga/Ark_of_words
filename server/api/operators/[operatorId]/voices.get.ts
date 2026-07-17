import { getPrtsOperatorVoices } from '../../../domain/prts/prtsOperatorService'
import { isSupportedOperatorId } from '../../../domain/prts/supportedOperators'

const OPERATOR_VOICE_CACHE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const OPERATOR_VOICE_CACHE_STALE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90

export default defineCachedEventHandler(async (event) => {
    const operatorId = getRouterParam(event, 'operatorId')

    if (!operatorId || !isSupportedOperatorId(operatorId)) {
        throw createError({
            statusCode: 404,
            statusMessage: '不支持该干员',
        })
    }

    try {
        return await getPrtsOperatorVoices(operatorId)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        console.error(`[PRTS] 获取干员语音失败 operatorId=${operatorId} ${errorMessage}`)

        throw createError({
            statusCode: 502,
            statusMessage: '暂时无法获取干员语音',
        })
    }
}, {
    name: 'operator-voices-with-ime-readings',
    group: 'prts',
    getKey: (event) => getRouterParam(event, 'operatorId') ?? 'missing-operator',
    maxAge: OPERATOR_VOICE_CACHE_MAX_AGE_SECONDS,
    staleMaxAge: OPERATOR_VOICE_CACHE_STALE_MAX_AGE_SECONDS,
    swr: true,
})
