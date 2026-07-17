import type { MaybeRefOrGetter, Ref } from 'vue'
import { practiceJudgementTextClasses } from '~/constants/practiceCharacterStatus'
import type { PracticeReadingUnit } from '~/composables/usePracticeLineSource'
import type { PracticeJudgementStatus } from '~/constants/practiceCharacterStatus'

export interface DisplayCharacter {
    value: string
    submittedValue?: string // 隐藏原文时用已提交字符替换同位置占位
    status: PracticeJudgementStatus // 当前字符和已提交输入之间的判定状态
    isCursorBefore: boolean // 用于显示当前模拟光标
    isExtraSubmittedCharacter: boolean // 日文模式保留多输入字符的追加显示
}

export interface DisplayCharacterChunk {
    id: string
    characters: readonly DisplayCharacter[]
}

export interface PracticeRomajiUnitDisplay {
    id: string
    unit: PracticeReadingUnit
    startInputIndex: number
    endInputIndex: number
    judgementStatus: PracticeJudgementStatus
    isActive: boolean
    characters: readonly DisplayCharacter[]
    visibleText: string
}

export interface PracticeKanaUnitDisplay {
    id: string
    sourceText: string
    kanaText: string
    characters: readonly DisplayCharacter[]
    judgementStatus: PracticeJudgementStatus
}

interface PracticeTypingJudgeOptions {
    isRomajiModeEnabled: Ref<boolean>
    targetPracticeText: MaybeRefOrGetter<string>
    practiceReadingUnits: MaybeRefOrGetter<readonly PracticeReadingUnit[]>
    shouldShowOriginalText: Readonly<Ref<boolean>>
    pendingInputText: Ref<string>
    clearInputReceiverValue: () => void
    focusInputReceiver: () => void
    onRomajiInputMethodWarning?: () => void
    onPracticeCompleted?: () => void
}

const romajiAllowedInputPattern = /^[\x00-\x7F]*$/u
const romajiInputWarningMessage = '罗马字模式请使用英文输入法'
const inputWhitespacePattern = /\s/gu
const targetSpacePattern = /\s/u
const displayChunkEndingCharacters = new Set(['、', '。', '！', '？', '!', '?', '」', '』', '）', ')'])
const displayChunkNaturalBreakCharacters = new Set([' '])
const maximumDisplayChunkCharacterCount = 14 // 兜底换行长度

export const normalizePracticeInputText = (text: string) => text.replace(inputWhitespacePattern, '')

/**
 * 只管提交文本 正确/错误判定 光标位置 罗马字锁定 显示字符数组
 */
export const usePracticeTypingJudge = ({
    isRomajiModeEnabled,
    targetPracticeText,
    practiceReadingUnits,
    shouldShowOriginalText,
    pendingInputText,
    clearInputReceiverValue,
    focusInputReceiver,
    onRomajiInputMethodWarning,
    onPracticeCompleted,
}: PracticeTypingJudgeOptions) => {
    const submittedText = ref('')

    const resetTypingProgress = () => {
        submittedText.value = ''
        pendingInputText.value = ''
        clearInputReceiverValue()
        nextTick(focusInputReceiver)
    }

    // 罗马字显示目标由 reading units 派生
    // 这样第三方分词和转换库接入后只需要替换 PracticeReadingUnit 数据源
    const romajiReadingUnits = computed(() => {
        return toValue(practiceReadingUnits).filter((unit) => {
            return normalizePracticeInputText(unit.romajiText) !== ''
        })
    })

    const romajiDisplayText = computed(() => {
        return romajiReadingUnits.value.map((unit) => unit.romajiText).join(' ')
    })

    const activeTargetPracticeText = computed(() => {
        return isRomajiModeEnabled.value ? romajiDisplayText.value : toValue(targetPracticeText)
    })

    const getDisplayCharacterTextClass = (status: PracticeJudgementStatus) => practiceJudgementTextClasses[status]

    const isTargetSpaceCharacter = (character: string) => targetSpacePattern.test(character)

    const getPracticeUnitJudgementStatus = (characters: readonly DisplayCharacter[]): PracticeJudgementStatus => {
        if (characters.some((character) => character.status === 'wrong')) {
            return 'wrong'
        }

        if (characters.length > 0 && characters.every((character) => character.status === 'correct')) {
            return 'correct'
        }

        return 'pending'
    }

    const targetTextCharacters = computed(() => Array.from(activeTargetPracticeText.value))
    const targetInputCharacters = computed(() => {
        return targetTextCharacters.value.filter((character) => !isTargetSpaceCharacter(character))
    })
    const submittedTextCharacters = computed(() => Array.from(submittedText.value))

    const getDisplayCharacterValue = (character: DisplayCharacter) => {
        // 显示原文状态下 和 超出文本的字符 返回原字符
        if (shouldShowOriginalText.value || character.isExtraSubmittedCharacter) {
            return character.value
        }

        // 已经提交了原文的情况下 显示原文
        if (character.submittedValue !== undefined) {
            return character.submittedValue
        }

        // 隐藏原文状态下 无原文说明为空格 有原文替换为 _
        return isTargetSpaceCharacter(character.value) ? ' ' : '_'
    }

    // 第一个错误字符决定罗马字输入锁定位置和 active unit
    const firstRomajiSubmittedErrorIndex = computed(() => {
        if (!isRomajiModeEnabled.value) {
            return -1
        }
        return submittedTextCharacters.value.findIndex((submittedCharacter, characterIndex) => {
            return submittedCharacter !== targetInputCharacters.value[characterIndex]
        })
    })
    const isRomajiInputLockedByError = computed(() => firstRomajiSubmittedErrorIndex.value !== -1)
    const isRomajiInputCompleteAndCorrect = computed(() => {
        return isRomajiModeEnabled.value && isSubmittedTextCompleteAndCorrect(submittedText.value)
    })

    // 将 submittedText 按照 unit 放入整句后的区间提取对应文本 并逐字符判断正误
    const getRomajiUnitStatus = (unit: PracticeReadingUnit, startInputIndex: number, endInputIndex: number): PracticeJudgementStatus => {
        const unitCharacters = Array.from(unit.romajiText)
        const submittedCharactersInUnit = submittedTextCharacters.value.slice(startInputIndex, endInputIndex)

        if (submittedCharactersInUnit.some((character, characterIndex) => character !== unitCharacters[characterIndex])) {
            return 'wrong'
        }

        if (submittedCharactersInUnit.length < unitCharacters.length) {
            return 'pending'
        }

        return 'correct'
    }

    const getRomajiUnitDisplayCharacters = (unit: PracticeReadingUnit, startInputIndex: number): DisplayCharacter[] => {
        return Array.from(unit.romajiText).map((targetCharacter, characterIndex) => {
            const inputCharacterIndex = startInputIndex + characterIndex
            const submittedCharacter = submittedTextCharacters.value[inputCharacterIndex]

            return {
                value: targetCharacter,
                submittedValue: submittedCharacter,
                status: submittedCharacter === undefined
                    ? 'pending'
                    : submittedCharacter === targetCharacter ? 'correct' : 'wrong',
                isCursorBefore: inputCharacterIndex === submittedTextCharacters.value.length
                    && submittedTextCharacters.value.length <= targetInputCharacters.value.length,
                isExtraSubmittedCharacter: false,
            }
        })
    }

    const romajiPracticeUnitDisplays = computed<PracticeRomajiUnitDisplay[]>(() => {
        let passedInputCharacterCount = 0
        const currentInputCharacterIndex = isRomajiInputLockedByError.value
            ? firstRomajiSubmittedErrorIndex.value
            : submittedTextCharacters.value.length

        return romajiReadingUnits.value.map((unit) => {
            const unitInputCharacterCount = Array.from(unit.romajiText).length
            const startInputIndex = passedInputCharacterCount
            const endInputIndex = passedInputCharacterCount + unitInputCharacterCount
            const isActive = currentInputCharacterIndex >= startInputIndex && currentInputCharacterIndex < endInputIndex

            passedInputCharacterCount = endInputIndex

            // characters 始终保存拆分后的字符状态
            // visibleText 只负责 inactive 且显示原文时的整词展示
            return {
                id: unit.id,
                unit,
                startInputIndex,
                endInputIndex,
                judgementStatus: getRomajiUnitStatus(unit, startInputIndex, endInputIndex),
                isActive,
                characters: getRomajiUnitDisplayCharacters(unit, startInputIndex),
                visibleText: unit.romajiText,
            }
        })
    })

    /**
     * 根据已经提交的可输入字符数寻找光标在目标文本中的位置
     * 目标文本里的空格只做视觉分隔 不需要用户输入
     */
    const getCursorTargetCharacterIndex = (submittedCharacterCount: number) => {
        let passedInputCharacterCount = 0

        for (const [targetCharacterIndex, targetCharacter] of targetTextCharacters.value.entries()) {
            // 将输入的 textChar 逐个与原文 char 进行匹配(不做检查)
            // 原文遇到空格就跳过 passedInputCharacterCount 不做修改 只记录字符的 pass
            if (isTargetSpaceCharacter(targetCharacter)) {
                continue
            }
            // 匹配数量相等时 pass 字符 === 提交的字符数量 返回当前的原文 index
            if (passedInputCharacterCount === submittedCharacterCount) {
                return targetCharacterIndex
            }

            passedInputCharacterCount += 1
        }

        return targetTextCharacters.value.length
    }
    const simulatedCursorTargetCharacterIndex = computed(() => {
        return getCursorTargetCharacterIndex(submittedTextCharacters.value.length)
    })

    /**
     * 完成检测只比较可输入字符
     * 目标文本里的空格不计入完成长度
     */
    const isSubmittedTextCompleteAndCorrect = (text: string) => {
        const normalizedSubmittedCharacters = Array.from(normalizePracticeInputText(text))

        if (normalizedSubmittedCharacters.length !== targetInputCharacters.value.length) {
            return false
        }

        return normalizedSubmittedCharacters.every((character, characterIndex) => {
            return character === targetInputCharacters.value[characterIndex]
        })
    }

    const notifyPracticeCompletedIfCorrect = (text: string) => {
        if (!isSubmittedTextCompleteAndCorrect(text)) {
            return
        }

        onPracticeCompleted?.()
    }

    /**
     * 得到规范处理后的每一个渲染字符 保留空格
     */
    const displayCharacters = computed<DisplayCharacter[]>(() => {
        const characters: DisplayCharacter[] = []
        let targetInputCharacterIndex = 0

        /**
         * 第一轮只渲染原文自身
         * 空格会保留在原文中 但它不会消耗 submittedText 的字符
         * 因此 空 青い 这样的文本输入 空が 时
         * が 会和 青 对比 而不是和中间的空格对比
         */
        targetTextCharacters.value.forEach((targetCharacter, targetCharacterIndex) => {
            const isTargetSpace = isTargetSpaceCharacter(targetCharacter)
            const submittedCharacter = isTargetSpace
                ? undefined
                : submittedTextCharacters.value[targetInputCharacterIndex]
            const status: PracticeJudgementStatus = submittedCharacter === undefined
                ? 'pending'
                : submittedCharacter === targetCharacter ? 'correct' : 'wrong'

            characters.push({
                value: targetCharacter,
                submittedValue: submittedCharacter,
                status,
                isCursorBefore: targetCharacterIndex === simulatedCursorTargetCharacterIndex.value
                    && submittedTextCharacters.value.length <= targetInputCharacters.value.length, // 将输入的文本限制在原文本的长度 并判断是否为光标前文本
                isExtraSubmittedCharacter: false,
            })

            // 原文为非空格时才会跳到下一个输入 textChar 进行比对
            if (!isTargetSpace) {
                targetInputCharacterIndex += 1
            }
        })

        // 日文模式保留多输入显示 罗马字模式已经在输入层锁定不允许超出
        const extraSubmittedCharacters = isRomajiModeEnabled.value
            ? []
            : submittedTextCharacters.value.slice(targetInputCharacters.value.length)

        extraSubmittedCharacters.forEach((submittedCharacter) => {
            characters.push({
                value: submittedCharacter,
                submittedValue: submittedCharacter,
                status: 'extra',
                isCursorBefore: false,
                isExtraSubmittedCharacter: true,
            })
        })

        return characters
    })

    const kanaPracticeUnitDisplays = computed<PracticeKanaUnitDisplay[]>(() => {
        if (isRomajiModeEnabled.value) {
            return []
        }

        const readingUnits = toValue(practiceReadingUnits)
        const sourceTextFromUnits = readingUnits.map((unit) => unit.sourceText).join('')

        // 假名模式的输入判定仍然使用 targetPracticeText
        // 这里只在 reading units 能完整覆盖原文时复用 displayCharacters 派生渲染单元
        if (!sourceTextFromUnits || sourceTextFromUnits !== toValue(targetPracticeText)) {
            return []
        }

        let passedSourceCharacterCount = 0
        const unitDisplays = readingUnits.map((unit) => {
            const sourceCharacterCount = Array.from(unit.sourceText).length
            const characters = displayCharacters.value.slice(
                passedSourceCharacterCount,
                passedSourceCharacterCount + sourceCharacterCount,
            )

            passedSourceCharacterCount += sourceCharacterCount

            return {
                id: unit.id,
                sourceText: unit.sourceText,
                kanaText: unit.kanaText,
                characters,
                judgementStatus: getPracticeUnitJudgementStatus(characters),
            }
        })

        // 判断是否有额外字符
        const trailingCharacters = displayCharacters.value.slice(passedSourceCharacterCount)
        if (trailingCharacters.length === 0 || unitDisplays.length === 0) {
            return unitDisplays
        }

        // 日文模式允许多提交字符 额外字符不是 reading unit 的一部分
        // 为了保留旧渲染的错误提示和光标位置 将它们挂到最后一个显示单元末尾
        const lastUnitDisplayIndex = unitDisplays.length - 1

        return unitDisplays.map((unitDisplay, unitDisplayIndex) => {
            // 没有额外字符直接返回
            if (unitDisplayIndex !== lastUnitDisplayIndex) {
                return unitDisplay
            }

            // 存在额外字符
            const characters = [...unitDisplay.characters, ...trailingCharacters]
            return {
                ...unitDisplay,
                characters,
                judgementStatus: getPracticeUnitJudgementStatus(characters),
            }
        })
    })

    /**
     * 将原文字符切成视觉块
     * 这里不改变 submittedText
     * 原因是输入判定仍然需要完整句子作为真实数据源
     * 视觉块只负责让浏览器可以在日文标点或空格后换行
     * 同时用长度兜底处理没有标点的长句
     * parser 已经负责练习文本规范化 这里继续只处理视觉换行
     */
    const fallbackDisplayCharacterChunks = computed<DisplayCharacterChunk[]>(() => {
        const chunks: DisplayCharacterChunk[] = []
        let chunkCharacters: DisplayCharacter[] = []

        displayCharacters.value.forEach((character, characterIndex) => {
            chunkCharacters.push(character)

            const isPunctuationBreak = displayChunkEndingCharacters.has(character.value)
            const isNaturalSpaceBreak = displayChunkNaturalBreakCharacters.has(character.value)
            const isLengthFallbackBreak = chunkCharacters.length >= maximumDisplayChunkCharacterCount
            const isLastCharacter = characterIndex === displayCharacters.value.length - 1

            // 普通字符就 return 进入下一轮 遇到需要换行的地方就打包之前的 charsArr 进 chunk 并清空 charsArr 进入下一轮
            if (!isPunctuationBreak && !isNaturalSpaceBreak && !isLengthFallbackBreak && !isLastCharacter) {
                return
            }

            chunks.push({
                id: `${chunks.length}-${characterIndex}`,
                characters: chunkCharacters,
            })
            chunkCharacters = []
        })

        return chunks
    })

    /**
     * 提交文本 >= 源文本 时 用于显示模拟光标
     */
    const isCursorAfterAllCharacters = computed(() => {
        return submittedTextCharacters.value.length >= targetInputCharacters.value.length
    })

    const warnRomajiInputMethod = () => {
        console.log(romajiInputWarningMessage)
        onRomajiInputMethodWarning?.()
    }

    /**
     * 罗马字模式绕过日文 IME 的待确认流程
     * 输入直接追加到 submittedText 错字或完成后立即锁住
     */
    const submitDirectRomajiInput = (inputElement: HTMLInputElement) => {
        const normalizedInputValue = normalizePracticeInputText(inputElement.value)
        pendingInputText.value = ''
        clearInputReceiverValue()

        if (!normalizedInputValue) {
            return
        }

        if (isRomajiInputLockedByError.value || isRomajiInputCompleteAndCorrect.value) {
            return
        }

        if (!romajiAllowedInputPattern.test(normalizedInputValue)) {
            warnRomajiInputMethod()
            return
        }

        const acceptedInputCharacters: string[] = []

        for (const inputCharacter of Array.from(normalizedInputValue)) {
            const targetCharacterIndex = submittedTextCharacters.value.length + acceptedInputCharacters.length
            const targetCharacter = targetInputCharacters.value[targetCharacterIndex]

            if (targetCharacter === undefined) {
                break
            }

            acceptedInputCharacters.push(inputCharacter)

            if (inputCharacter !== targetCharacter) {
                break
            }
        }

        const acceptedInputValue = acceptedInputCharacters.join('')

        if (!acceptedInputValue) {
            return
        }

        const nextSubmittedText = `${submittedText.value}${acceptedInputValue}`
        submittedText.value = nextSubmittedText

        notifyPracticeCompletedIfCorrect(nextSubmittedText)
        nextTick(focusInputReceiver)
    }

    /**
     * Enter 是练习页的确认键
     * 普通输入时由 keydown 触发检测
     * IME 输入时由 compositionend 在候选词落入原生 input 后触发检测
     * 这样可以兼容不会把候选确认 Enter 暴露给页面的系统输入法
     */
    const confirmPendingInput = () => {
        const normalizedPendingInputText = normalizePracticeInputText(pendingInputText.value)

        if (!normalizedPendingInputText) {
            clearInputReceiverValue()
            return
        }

        // 每次确认都把候选词追加到同一个提交字符串中
        const nextSubmittedText = `${submittedText.value}${normalizedPendingInputText}`
        submittedText.value = nextSubmittedText

        // 重置 pendingInputText 待确认文本
        pendingInputText.value = ''
        clearInputReceiverValue()

        notifyPracticeCompletedIfCorrect(nextSubmittedText)

        nextTick(focusInputReceiver)
    }

    /**
     * Backspace 在隐藏 input 为空时才回退原文进度
     * 如果 input 里还有待确认文本 就交给浏览器正常删除
     * 这样待确认文本减少时 原文模拟光标也会跟着往前移动
     */
    const rollbackSubmittedCharacter = () => {
        if (pendingInputText.value || !submittedText.value) {
            return
        }

        const nextSubmittedCharacters = Array.from(submittedText.value)
        nextSubmittedCharacters.pop()
        const nextSubmittedText = nextSubmittedCharacters.join('')
        submittedText.value = nextSubmittedText
        notifyPracticeCompletedIfCorrect(nextSubmittedText)
        nextTick(focusInputReceiver)
    }

    return {
        submittedText,
        romajiDisplayText,
        activeTargetPracticeText,
        isTargetSpaceCharacter,
        targetTextCharacters,
        targetInputCharacters,
        submittedTextCharacters,
        getDisplayCharacterTextClass,
        getDisplayCharacterValue,
        firstRomajiSubmittedErrorIndex,
        isRomajiInputLockedByError,
        isRomajiInputCompleteAndCorrect,
        getRomajiUnitStatus,
        getRomajiUnitDisplayCharacters,
        romajiPracticeUnitDisplays,
        kanaPracticeUnitDisplays,
        getCursorTargetCharacterIndex,
        simulatedCursorTargetCharacterIndex,
        isSubmittedTextCompleteAndCorrect,
        displayCharacters,
        fallbackDisplayCharacterChunks,
        isCursorAfterAllCharacters,
        warnRomajiInputMethod,
        submitDirectRomajiInput,
        confirmPendingInput,
        rollbackSubmittedCharacter,
        resetTypingProgress,
    }
}
