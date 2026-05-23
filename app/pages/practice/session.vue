<script setup lang="ts">
import { practiceDisplayModes } from '~/constants/practiceDisplayModes'
import type { PracticeDisplayMode } from '~/constants/practiceDisplayModes'
import { practiceToolActions } from '~/constants/practiceToolActions'
import type { PracticeToolActionId } from '~/constants/practiceToolActions'
import mockPracticeAudioUrl from '~/data/编入队伍.wav?url'

type PracticeDifficulty = 'easy' | 'normal' | 'hard' | 'custom'
type CharacterStatus = 'pending' | 'correct' | 'wrong'

interface DifficultyDetail {
    label: string
    classes: string
}

interface DisplayCharacter {
    value: string
    submittedValue?: string // 隐藏原文时用已提交字符替换同位置占位
    status: CharacterStatus // 当前字符和已提交输入之间的判定状态
    isCursorBefore: boolean // 用于显示当前模拟光标
    isExtraSubmittedCharacter: boolean // 日文模式保留多输入字符的追加显示
}

interface DisplayCharacterChunk {
    id: string
    characters: readonly DisplayCharacter[]
}

interface PracticeTextUnit {
    id: string
    romajiText: string
    sourceText: string
    kanaText: string
}

interface PracticeTextUnitDisplay {
    id: string
    unit: PracticeTextUnit
    startInputIndex: number
    endInputIndex: number
    status: CharacterStatus
    isActive: boolean
    characters: readonly DisplayCharacter[]
    visibleText: string
}

const route = useRoute()

const inputReceiverRef = useTemplateRef<HTMLInputElement>('inputReceiverRef')
const practiceAudioRef = useTemplateRef<HTMLAudioElement>('practiceAudioRef')

const submittedText = ref('')
const pendingInputText = ref('')
const isComposingText = ref(false)
const activeDisplayModeIndex = ref(0)
const isRomajiModeEnabled = ref(false)
const isPracticeInfoModalOpen = ref(false)
let compositionCommitSubmitTimer: ReturnType<typeof window.setTimeout> | undefined
let isWaitingForCompositionCommitSubmit = false

const difficultyDetails: Record<PracticeDifficulty, DifficultyDetail> = {
    easy: {
        label: '简单',
        classes: 'text-[#2563eb]',
    },
    normal: {
        label: '中等',
        classes: 'text-[#a16207]',
    },
    hard: {
        label: '困难',
        classes: 'text-[#dc2626]',
    },
    custom: {
        label: '自由配置',
        classes: 'text-[#047857]',
    },
}

// 规范化传入的难度参数 得到稳定的难度配置
const isPracticeDifficulty = (value: unknown): value is PracticeDifficulty => {
    return typeof value === 'string' && value in difficultyDetails
}
const selectedDifficulty = computed<PracticeDifficulty>(() => {
    const difficultyQuery = route.query.difficulty
    const difficultyValue = Array.isArray(difficultyQuery) ? difficultyQuery[0] : difficultyQuery
    return isPracticeDifficulty(difficultyValue) ? difficultyValue : 'easy'
})
const selectedDifficultyDetail = computed(() => difficultyDetails[selectedDifficulty.value])
const {
    currentPracticeAudioPath,
    currentPracticeChineseText,
    currentPracticeLineTitle,
    targetPracticeText,
    kanaHint,
    practiceInfoItems,
} = usePracticeLineSource({
    difficultyLabel: computed(() => selectedDifficultyDetail.value.label),
})

const activeDisplayMode = computed<PracticeDisplayMode>(() => {
    return practiceDisplayModes[activeDisplayModeIndex.value] ?? practiceDisplayModes[0]
})
const shouldShowOriginalText = computed(() => activeDisplayMode.value.shouldShowOriginalText)
const shouldShowKanaHint = computed(() => activeDisplayMode.value.shouldShowKanaHint)
const shouldShowTranslation = computed(() => activeDisplayMode.value.shouldShowTranslation)

// 罗马字暂时用手写 mock 代替后端/第三方库生成结果
// 后续真正接库时 这个字符串会被 PracticeTextUnit[] 数据替换
const romanizedPracticePlaceholder = 'atashi ga shinndara minmaikinn de minnna ni yakijagaimo wo ogotteoite'

const romajiAllowedInputPattern = /^[\x00-\x7F]*$/u
const romajiInputWarningMessage = '罗马字模式请使用英文输入法'

const activeTargetPracticeText = computed(() => {
    return isRomajiModeEnabled.value ? romanizedPracticePlaceholder : targetPracticeText
})

// backlog 待后续结合正确 预览 错误状态统一调整配色方案
const displayCharacterTextClasses: Record<CharacterStatus, string> = {
    pending: 'text-[#2563eb]',
    correct: 'text-[#1d4ed8]',
    wrong: 'text-[#ef4444]',
}
const getDisplayCharacterTextClass = (status: CharacterStatus) => displayCharacterTextClasses[status]

const inputWhitespacePattern = /\s/gu
const targetSpacePattern = /\s/u

const normalizeInputText = (text: string) => text.replace(inputWhitespacePattern, '')
const isTargetSpaceCharacter = (character: string) => targetSpacePattern.test(character)

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

const createMockRomajiPracticeUnits = (romajiText: string): PracticeTextUnit[] => {
    return romajiText.split(' ').filter(Boolean).map((romajiUnitText, romajiUnitIndex) => {
        return {
            id: `mock-romaji-unit-${romajiUnitIndex}`,
            romajiText: romajiUnitText,
            sourceText: '', // 这里 sourceText 之后需要进行对应回原文
            kanaText: '',
        }
    })
}

const mockRomajiPracticeUnits = computed<PracticeTextUnit[]>(() => {
    return createMockRomajiPracticeUnits(romanizedPracticePlaceholder)
})

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
const getRomajiUnitStatus = (unit: PracticeTextUnit, startInputIndex: number, endInputIndex: number): CharacterStatus => {
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

const getRomajiUnitDisplayCharacters = (unit: PracticeTextUnit, startInputIndex: number): DisplayCharacter[] => {
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

const romajiPracticeUnitDisplays = computed<PracticeTextUnitDisplay[]>(() => {
    let passedInputCharacterCount = 0
    const currentInputCharacterIndex = isRomajiInputLockedByError.value
        ? firstRomajiSubmittedErrorIndex.value
        : submittedTextCharacters.value.length

    return mockRomajiPracticeUnits.value.map((unit) => {
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
            status: getRomajiUnitStatus(unit, startInputIndex, endInputIndex),
            isActive,
            characters: getRomajiUnitDisplayCharacters(unit, startInputIndex),
            visibleText: unit.romajiText,
        }
    })
})

const displayChunkEndingCharacters = new Set(['、', '。', '！', '？', '!', '?', '」', '』', '）', ')'])
const displayChunkNaturalBreakCharacters = new Set([' '])
const maximumDisplayChunkCharacterCount = 14 // 兜底换行长度

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
    const normalizedSubmittedCharacters = Array.from(normalizeInputText(text))

    if (normalizedSubmittedCharacters.length !== targetInputCharacters.value.length) {
        return false
    }

    return normalizedSubmittedCharacters.every((character, characterIndex) => {
        return character === targetInputCharacters.value[characterIndex]
    })
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
        const status: CharacterStatus = submittedCharacter === undefined
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
            status: 'wrong',
            isCursorBefore: false,
            isExtraSubmittedCharacter: true,
        })
    })

    return characters
})
/**
 * 将原文字符切成视觉块
 * 这里不改变 submittedText
 * 原因是输入判定仍然需要完整句子作为真实数据源
 * 视觉块只负责让浏览器可以在日文标点或空格后换行
 * 同时用长度兜底处理没有标点的长句
 * parser 已经负责练习文本规范化 这里继续只处理视觉换行
 */
const displayCharacterChunks = computed<DisplayCharacterChunk[]>(() => {
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

const focusInputReceiver = () => {
    inputReceiverRef.value?.focus()
}
const clearInputReceiverValue = () => {
    if (!inputReceiverRef.value) {
        return
    }
    inputReceiverRef.value.value = ''
}
const syncPendingInputElementValue = (inputElement: HTMLInputElement) => {
    const normalizedInputValue = normalizeInputText(inputElement.value)
    pendingInputText.value = normalizedInputValue

    if (!isComposingText.value && inputElement.value !== normalizedInputValue) {
        inputElement.value = normalizedInputValue
    }
}

const warnRomajiInputMethod = () => {
    console.log(romajiInputWarningMessage)
}

/**
 * 罗马字模式绕过日文 IME 的待确认流程
 * 输入直接追加到 submittedText 错字或完成后立即锁住
 */
const submitDirectRomajiInput = (inputElement: HTMLInputElement) => {
    const normalizedInputValue = normalizeInputText(inputElement.value)
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

    if (isSubmittedTextCompleteAndCorrect(nextSubmittedText)) {
        console.log('当前练习文本已完全正确')
    }
}

/**
 * 隐藏 input 是日文 IME 和罗马字直接输入的共同入口
 * 具体提交方式由当前输入模式分流
 */
const syncPendingInputText = (event: Event) => {
    const inputElement = event.target
    if (!(inputElement instanceof HTMLInputElement)) {
        return
    }

    if (isRomajiModeEnabled.value) {
        submitDirectRomajiInput(inputElement)
        return
    }

    syncPendingInputElementValue(inputElement)
}

/**
 * compositionupdate 在部分浏览器里比 input.value 更新更早
 * event.data 通常就是输入法当前正在组合的候选文本
 * 用它兜底可以让 待确认 在候选阶段也尽量实时显示
 * 注意这里只更新待确认文本 不触发原文检测
 */
const syncPendingCompositionText = (event: CompositionEvent) => {
    if (isRomajiModeEnabled.value) {
        pendingInputText.value = ''
        clearInputReceiverValue()
        warnRomajiInputMethod()
        return
    }

    const inputElement = event.target

    if (inputElement instanceof HTMLInputElement && inputElement.value) {
        pendingInputText.value = normalizeInputText(inputElement.value)
        return
    }

    pendingInputText.value = normalizeInputText(event.data)
}

/**
 * Enter 是练习页的确认键
 * 普通输入时由 keydown 触发检测
 * IME 输入时由 compositionend 在候选词落入原生 input 后触发检测
 * 这样可以兼容不会把候选确认 Enter 暴露给页面的系统输入法
 */
const confirmPendingInput = () => {
    const normalizedPendingInputText = normalizeInputText(pendingInputText.value)

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

    if (isSubmittedTextCompleteAndCorrect(nextSubmittedText)) {
        console.log('当前练习文本已完全正确')
    }

    nextTick(focusInputReceiver)
}

/**
 * 输入法候选词确认时 不同系统暴露给页面的事件顺序并不一致
 * 有些输入法不会触发可识别的 Enter keydown 只会派发 compositionend 和随后的 input
 * 因此这里把检测排到下一轮任务中 先等待最终候选写入非受控 input 再读取并提交
 * 若后续浏览器又派发了一次普通 Enter keydown confirmPendingInput 会因文本已清空而直接跳过
 */
const confirmPendingInputAfterCompositionCommit = () => {
    if (compositionCommitSubmitTimer !== undefined) {
        window.clearTimeout(compositionCommitSubmitTimer)
    }

    isWaitingForCompositionCommitSubmit = true
    compositionCommitSubmitTimer = window.setTimeout(() => {
        compositionCommitSubmitTimer = undefined
        isWaitingForCompositionCommitSubmit = false
        const inputElement = inputReceiverRef.value

        if (inputElement) {
            syncPendingInputElementValue(inputElement)
        }

        confirmPendingInput()
    }, 0)
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
    submittedText.value = nextSubmittedCharacters.join('')
    nextTick(focusInputReceiver)
}

const playPracticeAudio = async () => {
    const audioElement = practiceAudioRef.value

    if (!audioElement) {
        return
    }

    audioElement.currentTime = 0
    await audioElement.play()
}

const cycleDisplayMode = () => {
    activeDisplayModeIndex.value = (activeDisplayModeIndex.value + 1) % practiceDisplayModes.length
}

const toggleRomajiMode = () => {
    // 输入方式切换后目标文本会变化 旧提交进度必须清空
    submittedText.value = ''
    isRomajiModeEnabled.value = !isRomajiModeEnabled.value
    pendingInputText.value = ''
    clearInputReceiverValue()
    nextTick(focusInputReceiver)
}

const closePracticeInfoModal = () => {
    isPracticeInfoModalOpen.value = false
}

const handlePracticeToolAction = async (actionId: PracticeToolActionId) => {
    if (actionId === 'audio') {
        await playPracticeAudio()
        return
    }

    if (actionId === 'displayMode') {
        cycleDisplayMode()
        return
    }

    if (actionId === 'romaji') {
        toggleRomajiMode()
        return
    }

    if (actionId === 'info') {
        isPracticeInfoModalOpen.value = true
        return
    }
}

const handleWindowKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        closePracticeInfoModal()
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleWindowKeydown)
})

const handleCompositionStart = () => {
    if (isRomajiModeEnabled.value) {
        isComposingText.value = false
        pendingInputText.value = ''
        clearInputReceiverValue()
        warnRomajiInputMethod()
        return
    }

    isComposingText.value = true
}
const handleCompositionUpdate = (event: CompositionEvent) => {
    syncPendingCompositionText(event)
}
const handleCompositionEnd = (event: CompositionEvent) => {
    if (isRomajiModeEnabled.value) {
        isComposingText.value = false
        pendingInputText.value = ''
        clearInputReceiverValue()
        warnRomajiInputMethod()
        return
    }

    isComposingText.value = false
    syncPendingInputText(event)
    confirmPendingInputAfterCompositionCommit()
}

const handleInputKeydown = (event: KeyboardEvent) => {
    if (
        !isRomajiModeEnabled.value
        && (event.key === ' ' || event.code === 'Space')
        && !isComposingText.value
        && !event.isComposing
    ) {
        event.preventDefault()
        return
    }

    if (event.key === 'Backspace') {
        if (!pendingInputText.value) {
            event.preventDefault()
        }

        rollbackSubmittedCharacter()
        return
    }

    if (event.key !== 'Enter') {
        return
    }

    if (isWaitingForCompositionCommitSubmit) {
        event.preventDefault()
        return
    }

    if (isComposingText.value || event.isComposing) {
        return
    }

    event.preventDefault()
    confirmPendingInput()
}
</script>

<template>
    <main class="min-h-screen bg-[#f5fbf4] px-5 py-6 text-emerald-950 sm:px-8 lg:px-10">
        <section class="relative mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-7xl flex-col">
            <header class="flex items-center justify-between gap-4">
                <NuxtLink to="/practice"
                    class="inline-flex size-12 items-center justify-center rounded-2xl border-2 border-emerald-950 bg-white text-emerald-950 shadow-[5px_5px_0_#86efac] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#86efac] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#86efac]"
                    aria-label="返回难度选择">
                    <IconBack class="size-5" />
                </NuxtLink>

                <div class="flex min-w-0 flex-wrap items-center justify-end gap-x-4 gap-y-1 text-right">
                    <p
                        class="font-zh-playful max-w-[min(52vw,28rem)] truncate text-sm font-bold text-emerald-700/75 sm:text-base">
                        {{ currentPracticeLineTitle }}
                    </p>
                    <span class="font-zh-playful text-sm font-black" :class="selectedDifficultyDetail.classes">
                        {{ selectedDifficultyDetail.label }}
                    </span>
                    <span class="font-fredoka text-sm font-black text-emerald-700">
                        1 / 5
                    </span>
                </div>
            </header>

            <div class="flex flex-1 flex-col items-center justify-center text-center" @click="focusInputReceiver">
                <audio ref="practiceAudioRef" :src="mockPracticeAudioUrl" preload="auto" class="hidden" />

                <p v-if="currentPracticeAudioPath" class="sr-only">
                    {{ currentPracticeAudioPath }}
                </p>
                <p v-if="currentPracticeChineseText" class="sr-only">
                    {{ currentPracticeChineseText }}
                </p>

                <div class="flex min-h-7 w-full items-center justify-center">
                    <p v-show="shouldShowKanaHint" class="text-sm font-medium tracking-[0.2em] text-emerald-700/70">
                        {{ kanaHint }}
                    </p>
                    <p v-show="!shouldShowKanaHint" class="sr-only">
                        {{ kanaHint }}
                    </p>
                </div>

                <!-- 主体原文展示暂时保留在页面中 待用户审查稳定后再拆 -->
                <div class="flex min-h-36 w-full max-w-5xl flex-col items-center justify-center gap-y-3 text-[#2563eb]"
                    :class="isRomajiModeEnabled
                        ? 'font-fredoka text-2xl leading-[1.18] sm:text-3xl lg:text-[32px]'
                        : 'text-4xl leading-[1.28]'">

                    <!-- 罗马字输入模式 -->
                    <div v-if="isRomajiModeEnabled"
                        class="flex max-w-full wrap-break-word flex-wrap items-end justify-center gap-x-[0.42em] gap-y-3">
                        <span v-for="unitDisplay in romajiPracticeUnitDisplays" :key="unitDisplay.id"
                            class="inline-flex items-end gap-x-[0.08em]">

                            <!-- 显示原文状态下 当前 activeUnit 拆分内部 characters 逐 span 渲染 -->
                            <template v-if="unitDisplay.isActive">
                                <template v-for="(character, index) in unitDisplay.characters"
                                    :key="`${unitDisplay.id}-${character.value}-${index}`">
                                    <span v-if="character.isCursorBefore" class="typing-caret" aria-hidden="true" />
                                    <span class="inline-flex justify-center font-romaji"
                                        :class="getDisplayCharacterTextClass(character.status)">
                                        {{ getDisplayCharacterValue(character) }}
                                    </span>
                                </template>
                            </template>

                            <!-- 显示原文状态下 非 activeUnit 直接显示原文不做拆分 -->
                            <template v-else-if="shouldShowOriginalText">
                                <span class="inline-flex size-auto justify-center font-romaji"
                                    :class="getDisplayCharacterTextClass(unitDisplay.status)">
                                    {{ unitDisplay.visibleText }}
                                </span>
                            </template>

                            <!-- 隐藏原文状态下 全部替换为 _ -->
                            <template v-else>
                                <span v-for="(character, index) in unitDisplay.characters"
                                    :key="`${unitDisplay.id}-placeholder-${index}`"
                                    class="inline-flex size-auto justify-center font-romaji"
                                    :class="getDisplayCharacterTextClass(character.status)">
                                    {{ getDisplayCharacterValue(character) }}
                                </span>
                            </template>
                        </span>

                        <span v-if="isCursorAfterAllCharacters" class="typing-caret" aria-hidden="true" />
                    </div>

                    <!-- 假名输入模式 -->
                    <div v-else class="flex max-w-full wrap-break-word flex-col items-center justify-center">
                        <template v-for="(chunk, chunkIndex) in displayCharacterChunks" :key="chunk.id">
                            <span class="inline-flex items-end">
                                <template v-for="(character, index) in chunk.characters"
                                    :key="`${chunk.id}-${character.value}-${index}`">
                                    <span v-if="character.isCursorBefore" class="typing-caret" aria-hidden="true" />
                                    <span class="inline-flex min-w-[1.12em] justify-center"
                                        :class="getDisplayCharacterTextClass(character.status)">
                                        {{ getDisplayCharacterValue(character) }}
                                    </span>
                                </template>
                                <span
                                    v-if="isCursorAfterAllCharacters && chunkIndex === displayCharacterChunks.length - 1"
                                    class="typing-caret" aria-hidden="true" />
                            </span>
                        </template>
                    </div>
                </div>

                <!-- 待确认 IME 候选词 -->
                <div class="relative mt-7 flex min-h-8 w-full justify-center">
                    <p v-if="pendingInputText" class="text-sm font-medium tracking-normal text-[#2563eb]">
                        待确认：<span class="border-b border-[#2563eb] px-1">{{ pendingInputText }}</span>
                    </p>
                    <input ref="inputReceiverRef" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
                        class="typing-input" aria-label="输入听到的日语" @input="syncPendingInputText"
                        @compositionstart="handleCompositionStart" @compositionupdate="handleCompositionUpdate"
                        @compositionend="handleCompositionEnd" @keydown="handleInputKeydown">
                </div>

                <!-- 当前语音的中文译文 -->
                <div class="mt-6 flex min-h-8 w-full items-center justify-center">
                    <p v-show="shouldShowTranslation"
                        class="font-zh-playful text-base font-bold text-emerald-700/75 sm:text-lg">
                        {{ currentPracticeChineseText || '暂无中文译文' }}
                    </p>
                    <p v-show="!shouldShowTranslation" class="sr-only">
                        {{ currentPracticeChineseText || '暂无中文译文' }}
                    </p>
                </div>

                <p class="sr-only">
                    {{ activeDisplayMode.label }}
                </p>
                <PracticeToolBar :actions="practiceToolActions" @action-click="handlePracticeToolAction" />
            </div>

            <PracticeInfoModal :is-open="isPracticeInfoModalOpen" title="当前语音信息" :items="practiceInfoItems"
                @close="closePracticeInfoModal" />
        </section>
    </main>
</template>

<style scoped>
.typing-caret {
    animation: caret-blink 1s step-end infinite;
    display: inline-block;
    flex: 0 0 0;
    position: relative;
    width: 0;
    height: 1.3em;
}

.typing-caret::before {
    background-color: #fbbf24;
    content: '';
    display: block;
    height: 100%;
    width: 2px;
}

.typing-input {
    background: transparent;
    border: 0;
    color: transparent;
    height: 1.4em;
    bottom: 0;
    left: 50%;
    caret-color: transparent;
    outline: none;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transform: translateX(-50%);
    width: 1px;
}

@keyframes caret-blink {
    50% {
        opacity: 0;
    }
}
</style>
