import { getPrtsOperatorCatalog } from '../../domain/prts/prtsOperatorService'

const OPERATOR_CACHE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const OPERATOR_CACHE_STALE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90

// 从我方服务器 请求获取干员列表 与每一位干员的基本信息
const getOperatorCatalog = async () => {
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
}

const cachedOperatorCatalogHandler = defineCachedEventHandler(getOperatorCatalog, {
    name: 'operator-catalog-with-profession-v2',
    group: 'prts',
    maxAge: OPERATOR_CACHE_MAX_AGE_SECONDS,
    staleMaxAge: OPERATOR_CACHE_STALE_MAX_AGE_SECONDS,
    swr: true,
})

// 本地调整立绘参数时必须立即读取配置 生产环境继续使用长期缓存保护 PRTS
export default import.meta.dev
    ? defineEventHandler(getOperatorCatalog)
    : cachedOperatorCatalogHandler
