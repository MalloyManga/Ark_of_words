import type { SupportedOperatorId } from '#shared/types/operatorApi'
import type { SupportedOperatorConfig } from './supportedOperators'

const PRTS_MEDIAWIKI_API_URL = 'https://prts.wiki/api.php'
const PRTS_MEDIA_HOST_SUFFIX = '.prts.wiki'
const PRTS_REQUEST_TIMEOUT_MS = 10_000
const PRTS_USER_AGENT = 'Ark_of_words/0.1 (https://github.com/MalloyManga/Ark_of_words)'

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

const getResponsePages = (rawResponse: unknown): readonly unknown[] => {
    if (!isRecord(rawResponse) || !isRecord(rawResponse.query) || !Array.isArray(rawResponse.query.pages)) {
        throw new Error('PRTS MediaWiki API 缺少 query.pages')
    }

    return rawResponse.query.pages
}

const normalizeMediaWikiFileTitle = (title: string): string => {
    return title
        .replace(/^(?:File|文件):/iu, '')
        .replace(/[\s_]+/gu, '')
        .toLocaleLowerCase()
}

const assertPrtsMediaUrl = (value: unknown, fileTitle: string): string => {
    if (typeof value !== 'string') {
        throw new Error(`PRTS 立绘 ${fileTitle} 缺少 URL`)
    }

    const mediaUrl = new URL(value)
    const isAllowedHost = mediaUrl.hostname === 'prts.wiki'
        || mediaUrl.hostname.endsWith(PRTS_MEDIA_HOST_SUFFIX)

    if (mediaUrl.protocol !== 'https:' || !isAllowedHost) {
        throw new Error(`PRTS 立绘 ${fileTitle} 返回了不受信任的 URL`)
    }

    return mediaUrl.toString()
}

const requestPrtsApi = async (query: Record<string, string | number>): Promise<unknown> => {
    return await $fetch<unknown>(PRTS_MEDIAWIKI_API_URL, {
        query,
        headers: {
            'User-Agent': PRTS_USER_AGENT,
        },
        retry: 0,
        timeout: PRTS_REQUEST_TIMEOUT_MS,
    })
}

export const fetchPrtsVoicePageRawData = async (voicePageTitle: string): Promise<unknown> => {
    return await requestPrtsApi({
        action: 'query',
        prop: 'revisions',
        rvprop: 'content',
        rvslots: 'main',
        titles: voicePageTitle,
        redirects: 1,
        format: 'json',
        formatversion: 2,
    })
}

export const fetchPrtsPortraitUrls = async (
    operators: readonly SupportedOperatorConfig[],
): Promise<ReadonlyMap<SupportedOperatorId, string>> => {
    const rawResponse = await requestPrtsApi({
        action: 'query',
        prop: 'imageinfo',
        iiprop: 'url',
        titles: operators.map((operator) => operator.portraitFileTitle).join('|'),
        format: 'json',
        formatversion: 2,
    })
    const pagesByNormalizedTitle = new Map<string, Record<string, unknown>>()

    for (const page of getResponsePages(rawResponse)) {
        if (!isRecord(page) || typeof page.title !== 'string') {
            continue
        }

        pagesByNormalizedTitle.set(normalizeMediaWikiFileTitle(page.title), page)
    }

    return new Map(operators.map((operator) => {
        const normalizedFileTitle = normalizeMediaWikiFileTitle(operator.portraitFileTitle)
        const page = pagesByNormalizedTitle.get(normalizedFileTitle)
        const imageInfo = page?.imageinfo

        if (!Array.isArray(imageInfo) || !isRecord(imageInfo[0])) {
            throw new Error(`PRTS 没有返回立绘 ${operator.portraitFileTitle}`)
        }

        return [operator.id, assertPrtsMediaUrl(imageInfo[0].url, operator.portraitFileTitle)] as const
    }))
}
