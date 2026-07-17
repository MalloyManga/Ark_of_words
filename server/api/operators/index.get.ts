import { getPrtsOperatorCatalog } from '../../domain/prts/prtsOperatorService'

const OPERATOR_CACHE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const OPERATOR_CACHE_STALE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90

export default defineCachedEventHandler(async () => {
    try {
        return await getPrtsOperatorCatalog()
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        console.error(`[PRTS] 获取干员目录失败 ${errorMessage}`)

        throw createError({
            statusCode: 502,
            statusMessage: '暂时无法获取干员目录',
        })
    }
}, {
    name: 'operator-catalog-with-placement',
    group: 'prts',
    maxAge: OPERATOR_CACHE_MAX_AGE_SECONDS,
    staleMaxAge: OPERATOR_CACHE_STALE_MAX_AGE_SECONDS,
    swr: true,
})
