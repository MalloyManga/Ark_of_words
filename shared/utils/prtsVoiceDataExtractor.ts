/**
 * PRTS MediaWiki API 返回的 JSON
 * 这里只声明解析器实际读取的字段
 */
interface PrtsMediaWikiApiResponse {
    query?: {
        pages?: unknown
    }
}

/**
 * PRTS query.pages 数组里的页面对象
 * title 和 revisions 都来自外部 JSON 所以读取后仍需要运行时校验
 */
interface PrtsPage {
    title?: unknown
    revisions?: unknown
}

/**
 * revision 同时兼容两种格式
 * slots.main.content 是当前 API 结构
 * content 是旧版 API 或部分 mock 导出结构
 */
interface PrtsPageRevision {
    content?: unknown
    slots?: PrtsPageRevisionSlots
}

/**
 * 当前缓存层需要的单条语音数据
 * id 使用音频文件名 stem 保证在同一干员内稳定且易回溯资源文件
 */
export interface PrtsVoiceLine {
    id: string
    voiceNumber: number
    title: string
    japaneseText: string
    chineseText: string
    audioFileName: string
}

/**
 * 长期缓存和练习页消费的干员语音数据
 * 一个干员语音的完整数据接口
 */
export interface PrtsOperatorVoiceData {
    operatorName: string
    voiceKey: string
    japaneseAudioBasePath: string
    lines: PrtsVoiceLine[]
}

/**
 * PRTS 当前 API 返回的是 MediaWiki revision slots 结构
 * main.content 才是页面源码
 */
interface PrtsPageRevisionSlotMain {
    content?: unknown
}

/**
 * slots 是新版 MediaWiki API 的内容容器
 * 这里仅声明 main 因为本解析器只关心主页面 wikitext
 */
interface PrtsPageRevisionSlots {
    main?: PrtsPageRevisionSlotMain
}

type VoiceLineParameterName = '标题' | '台词' | '语音'

interface IndexedVoiceParameter {
    parameterName: VoiceLineParameterName
    lineIndex: number
}

interface DefaultVoiceTexts {
    japaneseText: string
    chineseText: string
}

// 路径 参数里可能同时出现多语言资源路径 当前练习只接日语音频
const JAPANESE_AUDIO_PATH_PREFIX = '日语:'

/**
 * 抽取 VoiceTable 的顶层参数
 * PRTS 页面源码大致是 |参数名=参数值 的连续文本
 * 参数值内部可能跨行 所以使用 [\s\S]*?
 * 结束条件是下一个顶层 |参数= 模板结束 或文本结束
 */
const WIKI_PARAMETER_PATTERN = /^\|([^=\n]+)=([\s\S]*?)(?=\n\|[^=\n]+=|\n}}<noinclude>|\n}}$|$)/gm

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

const assertStringValue = (value: unknown, errorMessage: string): string => {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(errorMessage)
    }

    return value
}

// ------- 抽取 page revisions -------
/**
 * 从 PRTS 响应里取第一个 page
 * 外部 JSON 结构变化时直接抛错
 * 避免把结构错误伪装成空语音数据进入缓存
 */
const getFirstPrtsPage = (rawResponse: unknown): PrtsPage => {
    if (!isRecord(rawResponse)) {
        throw new Error('PRTS 响应不是可读取的对象')
    }

    const response = rawResponse as PrtsMediaWikiApiResponse
    const pages = response.query?.pages

    if (!Array.isArray(pages) || !isRecord(pages[0])) {
        throw new Error('PRTS 响应缺少 query.pages[0]')
    }

    return pages[0]
}

const getFirstRevision = (page: PrtsPage): PrtsPageRevision => {
    if (!Array.isArray(page.revisions) || !isRecord(page.revisions[0])) {
        throw new Error('PRTS 页面缺少 revisions[0]')
    }

    return page.revisions[0] as PrtsPageRevision
}
// --------------------

// ------- 抽取干员名称 语音文本 -------
const getPrtsPageTitleForOperator = (rawResponse: unknown): string => {
    const page = getFirstPrtsPage(rawResponse)
    return assertStringValue(page.title, 'PRTS 页面缺少干员语音标题 title').replace(/\/语音记录$/, '')
}

/**
 * 抽取语音页 wikitext
 * 优先读取当前 slots.main.content 结构
 * 再兼容旧版 revision.content 结构
 */
export const extractPrtsVoiceWikitext = (rawResponse: unknown): string => {
    const page = getFirstPrtsPage(rawResponse)
    const revision = getFirstRevision(page)

    if (isRecord(revision.slots) && isRecord(revision.slots.main)) {
        const slotContent = revision.slots.main.content

        if (typeof slotContent === 'string' && slotContent.trim()) {
            return slotContent
        }
    }

    if (typeof revision.content === 'string' && revision.content.trim()) {
        return revision.content
    }

    throw new Error('PRTS revision 缺少 slots.main.content 或 content')
}
// --------------------

/**
 * 处理特殊文本
 * {{DrName}} -> 博士
 */
const stripMinimalWikiMarkup = (text: string): string => {
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/\{\{DrName(?:\|[^{}]*)?}}/g, '博士')
        .trim()
}

/**
 * 清理所有日文标点转换为 空格
 */
const normalizePracticeText = (text: string): string => {
    return text
        .replace(/\p{P}+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * 只提取默认语言模板
 * 语言名后必须立刻跟 | 因此不会命中 日文(皮肤名) 这类变体
 */
const extractVoiceTextByLanguage = (
    lineParameter: string,
    language: '日文' | '中文',
    lineIndex: number,
): string => {
    const normalizedLineParameter = stripMinimalWikiMarkup(lineParameter)
    const voiceTextMatch = new RegExp(String.raw`\{\{VoiceData/word\|${language}\|([\s\S]*?)}}`).exec(normalizedLineParameter)
    const rawVoiceText = voiceTextMatch?.[1]
    const voiceText = rawVoiceText ? normalizePracticeText(rawVoiceText) : ''

    if (!voiceText) {
        throw new Error(`台词${lineIndex} 缺少默认${language}文本`)
    }

    return voiceText
}

/**
 * 从 台词N 参数里抽取默认日文和默认中文
 * 日文(超新星) 中文(超新星) 这类皮肤变体不会被命中
 */
const extractDefaultVoiceTexts = (lineParameter: string, lineIndex: number): DefaultVoiceTexts => {
    return {
        japaneseText: extractVoiceTextByLanguage(lineParameter, '日文', lineIndex),
        chineseText: extractVoiceTextByLanguage(lineParameter, '中文', lineIndex),
    }
}

/**
 * 从 路径 参数里选出日语音频目录
 * 传入参数为: |参数名=参数值 的 参数值
 * 返回 voice/char_002_amiya
 */
const extractBaseJapaneseAudioPath = (pathParameter: string): string => {
    const pathItems = pathParameter.split(',').map((pathItem) => pathItem.trim())
    const japanesePathItem = pathItems.find((pathItem) => pathItem.startsWith(JAPANESE_AUDIO_PATH_PREFIX))
    const japaneseAudioBasePath = japanesePathItem?.slice(JAPANESE_AUDIO_PATH_PREFIX.length).trim()

    if (!japaneseAudioBasePath) {
        throw new Error('VoiceTable 路径 参数缺少日语音频路径')
    }

    return japaneseAudioBasePath
}

/**
 * 转换 参数名num 为 固定的对象(拆分)
 */
const parseIndexedVoiceParameter = (parameterName: string): IndexedVoiceParameter | undefined => {
    const parameterMatch = /^(标题|台词|语音)(\d+)$/.exec(parameterName)

    if (!parameterMatch) {
        return undefined
    }

    const [, rawParameterName, rawLineIndex] = parameterMatch

    return {
        parameterName: rawParameterName as VoiceLineParameterName,
        lineIndex: Number(rawLineIndex),
    }
}

/**
 * 抽取音频文件名称
 * 现阶段仅用于 id 值
 */
const extractAudioFileStem = (audioFileName: string, lineIndex: number): string => {
    const normalizedAudioFileName = audioFileName.trim()
    const extensionStartIndex = normalizedAudioFileName.lastIndexOf('.')
    const audioFileStem = extensionStartIndex > 0
        ? normalizedAudioFileName.slice(0, extensionStartIndex)
        : normalizedAudioFileName

    if (!audioFileStem) {
        throw new Error(`语音${lineIndex} 缺少可用的音频文件名`)
    }

    return audioFileStem
}

/**
 * 从 Map 当中取出特定的字段
 */
const getRequiredParameter = (
    parametersByName: ReadonlyMap<string, string>,
    parameterName: string,
): string => {
    const parameterValue = parametersByName.get(parameterName)

    if (!parameterValue) {
        throw new Error(`VoiceTable 缺少 ${parameterName} 参数`)
    }

    return parameterValue
}

/**
 * 从源文本当中解析出特定的文本 
 * 标题N 台词N 语音N 作为参数名的参数值
 */
const getRequiredVoiceLineParameter = (
    parametersByName: ReadonlyMap<string, string>,
    parameterName: string,
    lineIndex: number,
): string => {
    const parameterValue = parametersByName.get(`${parameterName}${lineIndex}`)
    if (!parameterValue) {
        throw new Error(`语音行 ${lineIndex} 缺少 ${parameterName}${lineIndex}`)
    }
    return parameterValue
}

/**
 * 将 wikitext 中的 VoiceTable 参数抽成 Map
 * 后续按编号直接读取 标题N 台词N 语音N
 * 这样组装逻辑不再依赖解析顺序 也不需要维护半成品 draft
 */
const parseVoiceTableParameterMap = (wikitext: string): Map<string, string> => {
    const parametersByName = new Map<string, string>()
    let parameterMatch: RegExpExecArray | null

    WIKI_PARAMETER_PATTERN.lastIndex = 0

    while ((parameterMatch = WIKI_PARAMETER_PATTERN.exec(wikitext)) !== null) {
        const [, rawParameterName, rawParameterValue] = parameterMatch

        if (!rawParameterName || rawParameterValue === undefined) {
            continue
        }

        parametersByName.set(rawParameterName.trim(), rawParameterValue.trim())
    }

    if (parametersByName.size === 0) {
        throw new Error('VoiceTable 没有解析到任何参数')
    }

    return parametersByName
}

/**
 * 从 Map 的参数名 当中提取出 index
 */
const getVoiceLineIndexes = (parametersByName: ReadonlyMap<string, string>): readonly number[] => {
    const lineIndexes = new Set<number>()

    parametersByName.forEach((_parameterValue, parameterName) => {
        const indexedParameter = parseIndexedVoiceParameter(parameterName)
        if (indexedParameter) {
            // 源文本解析的 111222 在这里自动去重
            lineIndexes.add(indexedParameter.lineIndex)
        }
    })

    return [...lineIndexes].sort((currentLineIndex, nextLineIndex) => currentLineIndex - nextLineIndex)
}

/**
 * 整合所有的语音文本
 */
const assembleVoiceLines = (parametersByName: ReadonlyMap<string, string>): PrtsVoiceLine[] => {
    const lineIndexes = getVoiceLineIndexes(parametersByName)

    if (lineIndexes.length === 0) {
        throw new Error('VoiceTable 没有解析到任何语音行')
    }

    return lineIndexes.map((lineIndex) => {
        const title = getRequiredVoiceLineParameter(parametersByName, '标题', lineIndex)
        const audioFileName = getRequiredVoiceLineParameter(parametersByName, '语音', lineIndex)
        const lineParameter = getRequiredVoiceLineParameter(parametersByName, '台词', lineIndex)
        const { japaneseText, chineseText } = extractDefaultVoiceTexts(lineParameter, lineIndex)

        return {
            id: extractAudioFileStem(audioFileName, lineIndex),
            voiceNumber: lineIndex,
            title,
            japaneseText,
            chineseText,
            audioFileName,
        }
    })
}

/**
 * 解析 PRTS 干员语音页数据
 * 输入是 MediaWiki API 原始 JSON
 * 输出是练习页更容易消费的稳定缓存结构
 */
export const parsePrtsOperatorVoiceData = (rawResponse: unknown): PrtsOperatorVoiceData => {
    const operatorName = getPrtsPageTitleForOperator(rawResponse)
    const wikitext = extractPrtsVoiceWikitext(rawResponse)

    const parametersByName = parseVoiceTableParameterMap(wikitext)

    const voiceKey = getRequiredParameter(parametersByName, '语音key')
    const japaneseAudioBasePath = extractBaseJapaneseAudioPath(
        getRequiredParameter(parametersByName, '路径'),
    )
    const lines = assembleVoiceLines(parametersByName)

    return {
        operatorName,
        voiceKey,
        japaneseAudioBasePath,
        lines,
    }
}
