import type {
    OperatorCatalogResponse,
    OperatorVoiceLineResponse,
    OperatorVoiceResponse,
    SupportedOperatorId,
} from '#shared/types/operatorApi'
import { parsePrtsOperatorVoiceData } from '#shared/utils/prtsVoiceDataExtractor'
import { fetchPrtsPortraitUrls, fetchPrtsVoicePageRawData } from './prtsMediaWikiClient'
import { getSupportedOperator, supportedOperators } from './supportedOperators'

const PRTS_AUDIO_ORIGIN = 'https://torappu.prts.wiki'
const PRTS_PAGE_ORIGIN = 'https://prts.wiki'

const encodePathSegments = (path: string): string => {
    const pathSegments = path.split('/')

    if (pathSegments.some((pathSegment) => !pathSegment || pathSegment === '.' || pathSegment === '..')) {
        throw new Error(`PRTS 返回了无效资源路径 ${path}`)
    }

    return pathSegments.map((pathSegment) => encodeURIComponent(pathSegment)).join('/')
}

const createAudioUrl = (audioBasePath: string, audioFileName: string): string => {
    // PRTS 官方播放器会先将文件名转成小写 对象存储路径区分大小写
    const normalizedAudioFileName = audioFileName.toLowerCase()
    const playbackFileName = normalizedAudioFileName.replace(/\.wav$/u, '.mp3')

    if (playbackFileName === normalizedAudioFileName) {
        throw new Error(`PRTS 返回了不支持的音频文件名 ${audioFileName}`)
    }

    const encodedAudioPath = encodePathSegments(`${audioBasePath}/${playbackFileName}`)
    return new URL(`/assets/audio/${encodedAudioPath}`, PRTS_AUDIO_ORIGIN).toString()
}

const createSourcePageUrl = (voicePageTitle: string): string => {
    const encodedPageTitle = encodePathSegments(voicePageTitle)
    return new URL(`/w/${encodedPageTitle}`, PRTS_PAGE_ORIGIN).toString()
}

export const getPrtsOperatorCatalog = async (): Promise<OperatorCatalogResponse> => {
    const portraitUrls = await fetchPrtsPortraitUrls(supportedOperators)

    return {
        operators: supportedOperators.map((operator) => {
            const portraitUrl = portraitUrls.get(operator.id)

            if (!portraitUrl) {
                throw new Error(`缺少干员立绘 ${operator.displayName}`)
            }

            return {
                id: operator.id,
                displayName: operator.displayName,
                portraitUrl,
            }
        }),
    }
}

export const getPrtsOperatorVoices = async (
    operatorId: SupportedOperatorId,
): Promise<OperatorVoiceResponse> => {
    const operator = getSupportedOperator(operatorId)
    const [rawVoiceData, portraitUrls] = await Promise.all([
        fetchPrtsVoicePageRawData(operator.voicePageTitle),
        fetchPrtsPortraitUrls([operator]),
    ])
    const voiceData = parsePrtsOperatorVoiceData(rawVoiceData)
    const portraitUrl = portraitUrls.get(operator.id)

    if (!portraitUrl) {
        throw new Error(`缺少干员立绘 ${operator.displayName}`)
    }

    if (voiceData.operatorName !== operator.displayName) {
        throw new Error(`PRTS 页面标题与干员配置不一致 ${operator.displayName}`)
    }

    const lines: readonly OperatorVoiceLineResponse[] = voiceData.lines.map((voiceLine) => ({
        ...voiceLine,
        audioUrl: createAudioUrl(voiceData.japaneseAudioBasePath, voiceLine.audioFileName),
    }))

    return {
        id: operator.id,
        displayName: operator.displayName,
        voiceKey: voiceData.voiceKey,
        portraitUrl,
        sourcePageUrl: createSourcePageUrl(operator.voicePageTitle),
        lines,
    }
}
