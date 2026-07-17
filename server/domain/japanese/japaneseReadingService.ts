import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import kuromoji from 'kuromoji'
import type { IpadicFeatures, Tokenizer } from 'kuromoji'
import { toHiragana, toRomaji } from 'wanakana'
import type { JapaneseReadingUnit } from '#shared/types/japaneseReading'

const require = createRequire(import.meta.url)
const kuromojiDictionaryPath = resolve(dirname(require.resolve('kuromoji')), '../dict')

let tokenizerInitialization: Promise<Tokenizer<IpadicFeatures>> | undefined

const initializeTokenizer = (): Promise<Tokenizer<IpadicFeatures>> => {
    return new Promise((resolveTokenizer, rejectTokenizer) => {
        kuromoji.builder({ dicPath: kuromojiDictionaryPath }).build((error, tokenizer) => {
            if (error) {
                rejectTokenizer(error)
                return
            }

            resolveTokenizer(tokenizer)
        })
    })
}

/**
 * Kuromoji 词典约 16 MB 只在 Nitro 进程首次需要读音时加载一次
 * 初始化失败后清除 Promise 允许下一次请求重新尝试
 */
const getJapaneseTokenizer = async (): Promise<Tokenizer<IpadicFeatures>> => {
    tokenizerInitialization ??= initializeTokenizer().catch((error: unknown) => {
        tokenizerInitialization = undefined
        throw error
    })

    return await tokenizerInitialization
}

const createGapReadingUnit = (unitId: string, gapText: string): JapaneseReadingUnit => {
    return {
        id: unitId,
        sourceText: gapText,
        kanaText: gapText,
        romajiText: '',
        basicForm: gapText,
        partOfSpeech: '空白或标点',
    }
}

const imeRomajiOptions = {
    customRomajiMapping: {
        ん: 'nn',
    },
} as const

const convertKanaToImeRomaji = (kanaText: string): string => {
    return toRomaji(kanaText, imeRomajiOptions).toLowerCase()
}

const getTokenKanaText = (token: IpadicFeatures): string => {
    return toHiragana(token.reading ?? token.surface_form)
}

/**
 * Kuromoji 可能把小 っ 放在前一个 token 末尾
 * WanaKana 单独转换该 token 时无法知道要重复哪个辅音
 * 这里借用下一个 token 的读音算出当前 token 应承担的促音字符
 */
const getTokenImeRomajiText = (
    token: IpadicFeatures,
    nextToken?: IpadicFeatures,
): string => {
    const kanaText = getTokenKanaText(token)

    if (!kanaText.endsWith('っ') || !nextToken || /^\s+$/u.test(nextToken.surface_form)) {
        return convertKanaToImeRomaji(kanaText)
    }

    const nextKanaText = getTokenKanaText(nextToken)
    const nextRomajiText = convertKanaToImeRomaji(nextKanaText)
    const combinedRomajiText = convertKanaToImeRomaji(`${kanaText}${nextKanaText}`)

    return combinedRomajiText.endsWith(nextRomajiText)
        ? combinedRomajiText.slice(0, -nextRomajiText.length)
        : convertKanaToImeRomaji(kanaText)
}

const createTokenReadingUnit = (
    unitId: string,
    token: IpadicFeatures,
    nextToken?: IpadicFeatures,
): JapaneseReadingUnit => {
    const kanaText = getTokenKanaText(token)

    return {
        id: unitId,
        sourceText: token.surface_form,
        kanaText,
        romajiText: getTokenImeRomajiText(token, nextToken),
        basicForm: token.basic_form === '*' ? token.surface_form : token.basic_form,
        partOfSpeech: token.pos,
    }
}

/**
 * 将一条规范化后的日文台词转换成页面直接消费的阅读单元
 * Kuromoji 不返回空格 因此根据源文本游标补回间隔 保证单元拼接后仍等于原文
 */
export const createJapaneseReadingUnits = async (
    lineId: string,
    japaneseText: string,
): Promise<readonly JapaneseReadingUnit[]> => {
    const tokenizer = await getJapaneseTokenizer()
    const tokens = tokenizer.tokenize(japaneseText)
    const readingUnits: JapaneseReadingUnit[] = []
    let sourceTextCursor = 0

    tokens.forEach((token, tokenIndex) => {
        const tokenStartIndex = japaneseText.indexOf(token.surface_form, sourceTextCursor)

        if (tokenStartIndex === -1) {
            throw new Error(`Kuromoji 分词无法对齐源文本 lineId=${lineId}`)
        }

        if (tokenStartIndex > sourceTextCursor) {
            const gapText = japaneseText.slice(sourceTextCursor, tokenStartIndex)
            readingUnits.push(createGapReadingUnit(`${lineId}:gap:${tokenIndex}`, gapText))
        }

        const readingUnit = /^\s+$/u.test(token.surface_form)
            ? createGapReadingUnit(`${lineId}:gap:${tokenIndex}`, token.surface_form)
            : createTokenReadingUnit(`${lineId}:token:${tokenIndex}`, token, tokens[tokenIndex + 1])
        readingUnits.push(readingUnit)
        sourceTextCursor = tokenStartIndex + token.surface_form.length
    })

    if (sourceTextCursor < japaneseText.length) {
        const trailingText = japaneseText.slice(sourceTextCursor)
        readingUnits.push(createGapReadingUnit(`${lineId}:gap:end`, trailingText))
    }

    return readingUnits
}
