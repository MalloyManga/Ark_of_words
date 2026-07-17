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

const createTokenReadingUnit = (
    unitId: string,
    token: IpadicFeatures,
): JapaneseReadingUnit => {
    const readingSource = token.reading ?? token.surface_form

    return {
        id: unitId,
        sourceText: token.surface_form,
        kanaText: toHiragana(readingSource),
        romajiText: toRomaji(readingSource).toLowerCase(),
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

        readingUnits.push(createTokenReadingUnit(`${lineId}:token:${tokenIndex}`, token))
        sourceTextCursor = tokenStartIndex + token.surface_form.length
    })

    if (sourceTextCursor < japaneseText.length) {
        const trailingText = japaneseText.slice(sourceTextCursor)
        readingUnits.push(createGapReadingUnit(`${lineId}:gap:end`, trailingText))
    }

    return readingUnits
}
