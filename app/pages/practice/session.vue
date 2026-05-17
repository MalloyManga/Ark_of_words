<script setup lang="ts">
import IconAudio from '~/components/icon/Audio.vue'
import IconMenu from '~/components/icon/Menu.vue'
import IconSetting from '~/components/icon/Setting.vue'
import IconToggle from '~/components/icon/Toggle.vue'
import IconTranslation from '~/components/icon/Translation.vue'
import wisadelVoicePageRawData from '~/data/prts-wisadel-voice-page.slots.raw.json'

type PracticeDifficulty = 'easy' | 'normal' | 'hard' | 'custom'
type CharacterStatus = 'pending' | 'correct' | 'wrong' | 'preview'

interface DifficultyDetail {
    label: string
    classes: string
}

interface ToolAction {
    label: string
    icon: Component
}

interface TargetSegment {
    text: string
    kana: string
}

interface DisplayCharacter {
    value: string
    status: CharacterStatus
    isCursorBefore: boolean // 用于显示当前的模拟光标
}

const route = useRoute()

const inputReceiverRef = useTemplateRef<HTMLInputElement>('inputReceiverRef')

const targetSegments: readonly TargetSegment[] = [
    { text: '空', kana: 'そら' },
    { text: '青い', kana: 'あおい' },
    { text: '海', kana: 'うみ' },
]

const confirmedSegmentTexts = ref<string[]>([])
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

const toolActions: readonly ToolAction[] = [
    { label: '播放语音', icon: IconAudio },
    { label: '显示提示', icon: IconToggle },
    { label: '翻译', icon: IconTranslation },
    { label: '列表', icon: IconMenu },
    { label: '设置', icon: IconSetting },
]

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

const kanaHint = computed(() => targetSegments.map((segment) => segment.kana).join('　　'))

// backlog 待后续结合正确 预览 错误状态统一调整配色方案
const displayCharacterTextClasses: Record<CharacterStatus, string> = {
    pending: 'text-[#2563eb]',
    preview: 'text-[#2563eb]',
    correct: 'text-[#1d4ed8]',
    wrong: 'text-[#ef4444]',
}
const getDisplayCharacterTextClass = (status: CharacterStatus) => displayCharacterTextClasses[status]

/**
 * 用 Array.from 统计字符数
 * 日文假名 汉字和部分组合字符都不适合直接使用 string.length
 * 这里的字符数会用于模拟原文光标的位置
 */
const countTextCharacters = (text: string) => Array.from(text).length

/**
 * 寻找已经完成且正确的片段的下一个片段的 index
 * 全部完成返回 length
 * 提交了错误的片段 则保持在当前 index
 */
const activeSegmentIndex = computed(() => {
    const unfinishedSegmentIndex = targetSegments.findIndex((segment, segmentIndex) => {
        return confirmedSegmentTexts.value[segmentIndex] !== segment.text
    })
    return unfinishedSegmentIndex === -1 ? targetSegments.length : unfinishedSegmentIndex
})
const activeSegment = computed<TargetSegment | undefined>(() => targetSegments[activeSegmentIndex.value])
/**
 * 模拟光标 index
 */
const simulatedCursorCharacterIndex = computed(() => {
    let cursorCharacterIndex = 0
    console.log(confirmedSegmentTexts.value)
    targetSegments.some((segment, segmentIndex) => {
        const submittedText = confirmedSegmentTexts.value[segmentIndex]
        const isActiveSegment = segmentIndex === activeSegmentIndex.value

        if (isActiveSegment) {
            // cursorCharacterIndex += Math.min(countTextCharacters(submittedText || ''), countTextCharacters(segment.text))
            cursorCharacterIndex += countTextCharacters(submittedText || '')
            return true
        }

        // 跳过 已经提交过的且正确的的 seg 直接到 activeSeg
        if (submittedText) {
            cursorCharacterIndex += Math.min(countTextCharacters(submittedText), countTextCharacters(segment.text))
            return false
        }

        return true
    })

    return cursorCharacterIndex
})
const displayCharacters = computed<DisplayCharacter[]>(() => {
    const characters: DisplayCharacter[] = []
    let currentCharacterIndex = 0

    targetSegments.forEach((segment, segmentIndex) => {
        // 拆分 targetSegments 和 confirmedSegmentTexts 当中的片段并逐 char 比较
        const submittedText = confirmedSegmentTexts.value[segmentIndex] || ''
        const submittedCharacters = Array.from(submittedText)

        // 逐 char 对比
        Array.from(segment.text).forEach((character, characterIndex) => {
            const submittedCharacter = submittedCharacters[characterIndex]
            let status: CharacterStatus = 'pending'

            if (submittedCharacter) {
                status = submittedCharacter === character ? 'preview' : 'wrong'
            }
            if (submittedText === segment.text) {
                status = 'correct'
            }

            characters.push({
                value: character,
                status,
                isCursorBefore: currentCharacterIndex === simulatedCursorCharacterIndex.value,
            })
            currentCharacterIndex += 1
        })
    })

    return characters
})
const isCursorAfterAllCharacters = computed(() => {
    const targetTextCharacterCount = targetSegments.reduce((characterCount, segment) => {
        return characterCount + countTextCharacters(segment.text)
    }, 0)

    return simulatedCursorCharacterIndex.value === targetTextCharacterCount
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
    pendingInputText.value = inputElement.value
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
        pendingInputText.value = inputElement.value
        return
    }

    pendingInputText.value = event.data
}

/**
 * Enter 是练习页的确认键
 * 普通输入时由 keydown 触发检测
 * IME 输入时由 compositionend 在候选词落入原生 input 后触发检测
 * 这样可以兼容不会把候选确认 Enter 暴露给页面的系统输入法
 */
const confirmPendingInput = () => {
    if (!pendingInputText.value || !activeSegment.value) {
        return
    }

    // 将确认的 inputText 追加到 nextConfirmedSegmentTexts 的对应位置
    // 之后更新 confirmedSegmentTexts.value
    const nextConfirmedSegmentTexts = [...confirmedSegmentTexts.value]
    nextConfirmedSegmentTexts[activeSegmentIndex.value] = pendingInputText.value
    confirmedSegmentTexts.value = nextConfirmedSegmentTexts.slice(0, activeSegmentIndex.value + 1)

    // 重置 pendingInputText 待确认文本
    pendingInputText.value = ''
    clearInputReceiverValue()
    nextTick(focusInputReceiver)
}

/**
 * 输入法候选词确认时 不同系统暴露给页面的事件顺序并不一致
 * 有些输入法不会触发可识别的 Enter keydown 只会派发 compositionend 和随后的 input
 * 因此这里把检测排到下一轮任务中 先等待最终候选写入非受控 input 再读取并提交
 * 若后续浏览器又派发了一次普通 Enter keydown confirmPendingInput 会因文本已清空而直接跳过
 */
const confirmPendingInputAfterCompositionCommit = () => {
    console.log(333)
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
const rollbackConfirmedSegment = () => {
    if (pendingInputText.value || confirmedSegmentTexts.value.length === 0) {
        return
    }

    const rollbackSegmentIndex = activeSegmentIndex.value < confirmedSegmentTexts.value.length
        ? activeSegmentIndex.value
        : confirmedSegmentTexts.value.length - 1

    confirmedSegmentTexts.value = confirmedSegmentTexts.value.slice(0, rollbackSegmentIndex)
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
    if (event.key === 'Backspace') {
        if (!pendingInputText.value) {
            event.preventDefault()
        }

        rollbackConfirmedSegment()
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
                <p class="text-sm font-medium tracking-[0.2em] text-emerald-700/70">
                    {{ kanaHint }}
                </p>

                <div class="mt-4 flex items-end justify-center text-4xl font-light leading-none text-[#2563eb]">
                    <template v-for="(character, index) in displayCharacters" :key="`${character.value}-${index}`">
                        <span v-if="character.isCursorBefore" class="typing-caret" aria-hidden="true" />
                        <span class="inline-flex min-w-[1.12em] justify-center"
                            :class="getDisplayCharacterTextClass(character.status)">
                            {{ character.value }}
                        </span>
                    </template>
                    <span v-if="isCursorAfterAllCharacters" class="typing-caret" aria-hidden="true" />
                </div>

                <div class="relative mt-9 flex min-h-8 w-full justify-center">
                    <p v-if="pendingInputText" class="text-sm font-medium tracking-normal text-[#2563eb]">
                        待确认：<span class="border-b border-[#2563eb] px-1">{{ pendingInputText }}</span>
                    </p>
                    <input ref="inputReceiverRef" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
                        class="typing-input" aria-label="输入听到的日语" @input="syncPendingInputText"
                        @compositionstart="handleCompositionStart" @compositionupdate="handleCompositionUpdate"
                        @compositionend="handleCompositionEnd" @keydown="handleInputKeydown">
                </div>

                <p class="font-zh-playful mt-6 text-base font-bold text-emerald-700/75 sm:text-lg">
                    蓝色的大海
                </p>
            </div>

            <footer class="pb-8">
                <div class="mx-auto flex w-full max-w-md items-center justify-center gap-5">
                    <PracticeToolActionButton v-for="action in toolActions" :key="action.label" :label="action.label">
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
