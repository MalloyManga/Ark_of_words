<script setup lang="ts">
import { practiceToolActions } from '~/constants/practiceToolActions'

type PracticeDifficulty = 'easy' | 'normal' | 'hard' | 'custom'
type CharacterStatus = 'pending' | 'correct' | 'wrong'

interface DifficultyDetail {
    label: string
    classes: string
}

interface DisplayCharacter {
    value: string
    status: CharacterStatus // 当前字符和已提交输入之间的判定状态
    isCursorBefore: boolean // 用于显示当前的模拟光标
    isExtraSubmittedCharacter: boolean // 用户多输入的字符会追加显示在原文后方
}

interface DisplayCharacterChunk {
    id: string
    characters: readonly DisplayCharacter[]
}

const {
    currentPracticeAudioPath,
    currentPracticeChineseText,
    targetPracticeText,
    currentPracticeLineTitle,
    kanaHint,
} = usePracticeLineSource()

const route = useRoute()

const inputReceiverRef = useTemplateRef<HTMLInputElement>('inputReceiverRef')

const submittedText = ref('')
const pendingInputText = ref('')
const isComposingText = ref(false)
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

// 规范化传入的难度系数 得到规范的难度 detail
const isPracticeDifficulty = (value: unknown): value is PracticeDifficulty => {
    return typeof value === 'string' && value in difficultyDetails
}
const selectedDifficulty = computed<PracticeDifficulty>(() => {
    const difficultyQuery = route.query.difficulty
    const difficultyValue = Array.isArray(difficultyQuery) ? difficultyQuery[0] : difficultyQuery
    return isPracticeDifficulty(difficultyValue) ? difficultyValue : 'easy'
})
const selectedDifficultyDetail = computed(() => difficultyDetails[selectedDifficulty.value])

// backlog 待后续结合正确 预览 错误状态统一调整配色方案
const displayCharacterTextClasses: Record<CharacterStatus, string> = {
    pending: 'text-[#2563eb]',
    correct: 'text-[#1d4ed8]',
    wrong: 'text-[#ef4444]',
}
const getDisplayCharacterTextClass = (status: CharacterStatus) => displayCharacterTextClasses[status]

const displayChunkEndingCharacters = new Set(['、', '。', '！', '？', '!', '?', '」', '』', '）', ')'])
const displayChunkNaturalBreakCharacters = new Set([' '])

const maximumDisplayChunkCharacterCount = 14 // 兜底换行长度

/**
 * 方案 A 的核心是连续字符串判定
 * submittedText 是唯一已经提交的输入源
 * pendingInputText 只表示 IME 候选或待确认文本 不参与原文判定
 * targetPracticeText 中的空格只做视觉停顿和光标跳过 不需要用户输入
 */
const inputWhitespacePattern = /\s/gu
const targetSpacePattern = /\s/u

/**
 * 清除所有的用户输入空格 换行 等等
 */
const normalizeInputText = (text: string) => text.replace(inputWhitespacePattern, '')

const isTargetSpaceCharacter = (character: string) => targetSpacePattern.test(character)

const targetTextCharacters = computed(() => Array.from(targetPracticeText))
const targetInputCharacters = computed(() => {
    return targetTextCharacters.value.filter((character) => !isTargetSpaceCharacter(character))
})
const submittedTextCharacters = computed(() => Array.from(submittedText.value))

/**
 * 根据已经提交的可输入字符数寻找光标在原文中的位置
 * 如果提交数量已经覆盖所有可输入字符 则返回原文末尾
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

    /**
     * 第二轮处理多输入字符
     * 如果提交字符数超过目标可输入字符数
     * 多出来的字符不再参与原文位置匹配
     * 直接追加到原文后方并标红 光标也会落到这些额外字符之后
     */
    const extraSubmittedCharacters = submittedTextCharacters.value.slice(targetInputCharacters.value.length)

    extraSubmittedCharacters.forEach((submittedCharacter) => {
        characters.push({
            value: submittedCharacter,
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

        // console.log(`目前处理${character.value},状态：${isPunctuationBreak},${isNaturalSpaceBreak},${isLengthFallbackBreak},${isLastCharacter}.`)

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

/**
 * 隐藏 input 只负责接收浏览器和系统输入法交给页面的真实文本
 * 不使用 v-model 和 :value 是因为 Vue 反向写回 DOM 会打断 IME 组合态
 * 首字符重复通常就来自 input 事件和 DOM patch 同时介入
 * 因此这里把 input 当成非受控接收器 只从原生事件读取 不主动绑定它的值
 */
const syncPendingInputText = (event: Event) => {
    const inputElement = event.target
    if (!(inputElement instanceof HTMLInputElement)) {
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

    // 方案 A 不再按片段覆盖
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

const handleCompositionStart = () => {
    isComposingText.value = true
}
const handleCompositionUpdate = (event: CompositionEvent) => {
    syncPendingCompositionText(event)
}
const handleCompositionEnd = (event: CompositionEvent) => {
    isComposingText.value = false
    syncPendingInputText(event)
    confirmPendingInputAfterCompositionCommit()
}

const handleInputKeydown = (event: KeyboardEvent) => {
    if ((event.key === ' ' || event.code === 'Space') && !isComposingText.value && !event.isComposing) {
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

                <div class="flex items-center gap-4">
                    <span class="font-zh-playful text-sm font-black" :class="selectedDifficultyDetail.classes">
                        {{ selectedDifficultyDetail.label }}
                    </span>
                    <span class="font-fredoka text-sm font-black text-emerald-700">
                        1 / 5
                    </span>
                </div>
            </header>

            <div class="flex flex-1 flex-col items-center justify-center text-center" @click="focusInputReceiver">
                <p v-if="currentPracticeAudioPath" class="sr-only">
                    {{ currentPracticeAudioPath }}
                </p>
                <p v-if="currentPracticeChineseText" class="sr-only">
                    {{ currentPracticeChineseText }}
                </p>

                <p class="text-sm font-medium tracking-[0.2em] text-emerald-700/70">
                    {{ kanaHint }}
                </p>

                <!-- 主体 原文部分 -->
                <div
                    class="mt-4 flex w-full max-w-5xl flex-col items-center justify-center gap-y-3 text-4xl leading-[1.28] text-[#2563eb]">
                    <template v-for="(chunk, chunkIndex) in displayCharacterChunks" :key="chunk.id">
                        <span class="inline-flex items-end">
                            <template v-for="(character, index) in chunk.characters"
                                :key="`${chunk.id}-${character.value}-${index}`">
                                <span v-if="character.isCursorBefore" class="typing-caret" aria-hidden="true" />
                                <span class="inline-flex min-w-[1.12em] justify-center"
                                    :class="getDisplayCharacterTextClass(character.status)">
                                    {{ character.value }}
                                </span>
                            </template>
                            <span v-if="isCursorAfterAllCharacters && chunkIndex === displayCharacterChunks.length - 1"
                                class="typing-caret" aria-hidden="true" />
                        </span>
                    </template>
                </div>

                <!-- 待确认 IME候选词 -->
                <div class="relative mt-9 flex min-h-8 w-full justify-center">
                    <p v-if="pendingInputText" class="text-sm font-medium tracking-normal text-[#2563eb]">
                        待确认：<span class="border-b border-[#2563eb] px-1">{{ pendingInputText }}</span>
                    </p>
                    <input ref="inputReceiverRef" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
                        class="typing-input" aria-label="输入听到的日语" @input="syncPendingInputText"
                        @compositionstart="handleCompositionStart" @compositionupdate="handleCompositionUpdate"
                        @compositionend="handleCompositionEnd" @keydown="handleInputKeydown">
                </div>

                <!-- 当前语音的 title -->
                <p class="font-zh-playful mt-6 text-base font-bold text-emerald-700/75 sm:text-lg">
                    {{ currentPracticeLineTitle }}
                </p>
            </div>

            <!-- 下方 tools -->
            <footer class="pb-8">
                <div class="mx-auto flex w-full max-w-md items-center justify-center gap-5">
                    <PracticeToolActionButton v-for="action in practiceToolActions" :key="action.label"
                        :label="action.label">
                        <component :is="action.icon" class="size-6" aria-hidden="true" />
                    </PracticeToolActionButton>
                </div>
            </footer>

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
    height: 1.45em;
    transform: translateY(0.18em);
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
