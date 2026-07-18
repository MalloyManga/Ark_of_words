<script setup lang="ts">
import { isPracticeDifficulty, practiceDifficultyDetails } from '~/constants/practiceDifficulties'
import type { PracticeDifficulty } from '~/constants/practiceDifficulties'
import { supportedOperatorIds } from '#shared/types/operatorApi'
import { practiceDisplayModes } from '~/constants/practiceDisplayModes'
import type { PracticeDisplayMode } from '~/constants/practiceDisplayModes'
import type { PracticeAudioController } from '~/types/practiceAudio'
import mockPracticeAudioUrl from '~/data/编入队伍.wav?url'

const route = useRoute()

const practiceAudioRef = useTemplateRef<PracticeAudioController>('practiceAudioRef')

const activeDisplayModeIndex = ref(0)
const isRomajiModeEnabled = ref(false)
const isPracticeInfoModalOpen = ref(false)
const isRomajiInputMethodModalOpen = ref(false)

// 规范化传入的难度参数 得到稳定的难度配置
const selectedDifficulty = computed<PracticeDifficulty>(() => {
    const difficultyQuery = route.query.difficulty
    const difficultyValue = Array.isArray(difficultyQuery) ? difficultyQuery[0] : difficultyQuery
    return isPracticeDifficulty(difficultyValue) ? difficultyValue : 'easy'
})
const { loadOperatorVoiceSet } = useOperatorVoiceData()

const selectedDifficultyDetail = computed(() => practiceDifficultyDetails[selectedDifficulty.value])
const {
    currentPracticeAudioPath,
    currentPracticeChineseText,
    currentPracticeLineTitle,
    currentPracticePool,
    currentItemNumber,
    totalItemCount,
    targetPracticeText,
    kanaHint,
    practiceReadingUnits,
    isPracticeCycleCompleted,
    advanceToNextItem,
    restartPracticeCycle,
    shufflePracticeCycle,
} = usePracticeLineSource({
    poolId: selectedDifficulty,
    difficultyLabel: computed(() => selectedDifficultyDetail.value.label),
})

const activeDisplayMode = computed<PracticeDisplayMode>(() => {
    return practiceDisplayModes[activeDisplayModeIndex.value] ?? practiceDisplayModes[0]
})
const shouldShowOriginalText = computed(() => activeDisplayMode.value.shouldShowOriginalText)
const shouldShowKanaHint = computed(() => activeDisplayMode.value.shouldShowKanaHint)
const shouldShowTranslation = computed(() => activeDisplayMode.value.shouldShowTranslation)

let submitDirectRomajiInput: (inputElement: HTMLInputElement) => void = () => { }
let confirmPendingInput: () => void = () => { }
let rollbackSubmittedCharacter: () => void = () => { }
let warnRomajiInputMethod: () => void = () => { }
let resetTypingProgress: () => void = () => { }

const {
    pendingInputText,
    focusInputReceiver,
    clearInputReceiverValue,
    syncPendingInputText,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
    handleInputKeydown,
} = usePracticeInputReceiver({
    isRomajiModeEnabled,
    normalizeInputText: normalizePracticeInputText,
    submitDirectRomajiInput: (inputElement) => submitDirectRomajiInput(inputElement),
    confirmPendingInput: () => confirmPendingInput(),
    rollbackSubmittedCharacter: () => rollbackSubmittedCharacter(),
    warnRomajiInputMethod: () => warnRomajiInputMethod(),
})

const typingJudge = usePracticeTypingJudge({
    isRomajiModeEnabled,
    targetPracticeText,
    practiceReadingUnits,
    shouldShowOriginalText,
    pendingInputText,
    clearInputReceiverValue,
    focusInputReceiver,
    onRomajiInputMethodWarning: () => {
        isRomajiInputMethodModalOpen.value = true
    },
    onPracticeCompleted: () => {
        resetTypingProgress()
        advanceToNextItem()
    },
})
const practiceAudioSourceUrl = computed(() => {
    return currentPracticeAudioPath.value || mockPracticeAudioUrl
})

const {
    submittedText,
    romajiPracticeUnitDisplays,
    kanaPracticeUnitDisplays,
    fallbackDisplayCharacterChunks,
    isCursorAfterAllCharacters,
    getDisplayCharacterTextClass,
    getDisplayCharacterValue,
} = typingJudge

submitDirectRomajiInput = typingJudge.submitDirectRomajiInput
confirmPendingInput = typingJudge.confirmPendingInput
rollbackSubmittedCharacter = typingJudge.rollbackSubmittedCharacter
warnRomajiInputMethod = typingJudge.warnRomajiInputMethod
resetTypingProgress = typingJudge.resetTypingProgress

const {
    closePracticeInfoModal,
    playPracticeAudio,
    switchToKanaMode,
    handlePracticeToolAction,
} = usePracticeToolActions({
    practiceAudioRef,
    activeDisplayModeIndex,
    isRomajiModeEnabled,
    isPracticeInfoModalOpen,
    submittedText,
    pendingInputText,
    clearInputReceiverValue,
    focusInputReceiver,
})

const closeRomajiInputMethodModal = () => {
    isRomajiInputMethodModalOpen.value = false
}

const handleSwitchToKanaMode = () => {
    switchToKanaMode()
    closeRomajiInputMethodModal()
}

const handleWindowKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        closePracticeInfoModal()
        closeRomajiInputMethodModal()
    }
}

let lastAutomaticallyPlayedAudioUrl = ''

/**
 * 音频组件需要等当前渲染轮次完成后才能取得 template ref
 * 首题在页面挂载时播放 后续题目由音频 URL 变化触发且每题只尝试一次
 */
const playCurrentPracticeAudioAfterRender = async (): Promise<void> => {
    const audioUrl = practiceAudioSourceUrl.value

    if (!audioUrl || audioUrl === lastAutomaticallyPlayedAudioUrl) {
        return
    }

    // 在异步等待前占用当前 URL 避免 watcher 和 mounted 在同一轮重复播放
    lastAutomaticallyPlayedAudioUrl = audioUrl
    await nextTick()

    if (practiceAudioSourceUrl.value !== audioUrl) {
        return
    }

    await playPracticeAudio()
}

/**
 * 新一轮开始前清空输入和自动播放标记
 * 单题练习重新开始时音频 URL 不变 因此需要允许同一地址再次自动播放
 */
const startPracticeCycle = async (startCycle: () => void): Promise<void> => {
    resetTypingProgress()
    lastAutomaticallyPlayedAudioUrl = ''
    startCycle()
    await nextTick()
    void playCurrentPracticeAudioAfterRender()
}

const chooseNextPractice = async (): Promise<void> => {
    if (selectedDifficulty.value === 'custom') {
        await navigateTo('/operators')
        return
    }

    await startPracticeCycle(shufflePracticeCycle)
}

const restartCompletedPractice = async (): Promise<void> => {
    await startPracticeCycle(restartPracticeCycle)
}

watch(practiceAudioSourceUrl, (nextAudioUrl, previousAudioUrl) => {
    if (!nextAudioUrl || nextAudioUrl === previousAudioUrl) {
        return
    }

    void playCurrentPracticeAudioAfterRender()
}, { flush: 'post' })

onMounted(() => {
    window.addEventListener('keydown', handleWindowKeydown)
    void playCurrentPracticeAudioAfterRender()
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleWindowKeydown)
})

if (selectedDifficulty.value !== 'custom') {
    await loadOperatorVoiceSet(supportedOperatorIds)
}
</script>

<template>
    <main
        class="relative min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-8 py-6 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden transition-colors duration-500">

        <!-- 沉浸式微光背景 -->
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <div class="size-200 bg-blue-400/5 dark:bg-cyan-900/10 rounded-full blur-[120px]"></div>
        </div>

        <PracticeSessionHeader :current-practice-line-title="currentPracticeLineTitle"
            :difficulty-label="selectedDifficultyDetail.label" :current-item-number="currentItemNumber"
            :total-item-count="totalItemCount" />

        <!-- 核心打字练习区 -->
        <section
            class="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto cursor-text"
            @click="focusInputReceiver">
            <PracticeAudioPlayer ref="practiceAudioRef" :source-url="practiceAudioSourceUrl" />

            <!-- 主体原文展示 (你的组件) -->
            <div
                class="w-full flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-800/50 shadow-2xl shadow-blue-500/5 dark:shadow-cyan-900/10">

                <PracticeCompletionPanel v-if="isPracticeCycleCompleted" :completed-item-count="totalItemCount"
                    :is-custom-practice="selectedDifficulty === 'custom'" @choose-next-practice="chooseNextPractice"
                    @restart-practice="restartCompletedPractice" />

                <template v-else>
                <PracticeTextDisplay :is-romaji-mode-enabled="isRomajiModeEnabled"
                    :romaji-practice-unit-displays="romajiPracticeUnitDisplays"
                    :kana-practice-unit-displays="kanaPracticeUnitDisplays"
                    :fallback-display-character-chunks="fallbackDisplayCharacterChunks" :kana-hint="kanaHint"
                    :should-show-kana-hint="shouldShowKanaHint" :should-show-original-text="shouldShowOriginalText"
                    :is-cursor-after-all-characters="isCursorAfterAllCharacters"
                    :get-display-character-text-class="getDisplayCharacterTextClass"
                    :get-display-character-value="getDisplayCharacterValue" />

                <!-- 待确认 IME 候选词 HUD (更加科技感的样式) -->
                <div class="relative mt-10 h-10 flex items-center justify-center w-full">
                    <PracticePendingInputHud :pending-input-text="pendingInputText" />

                    <!-- 隐藏的真实输入框 (不可见但接收焦点) -->
                    <input ref="inputReceiverRef" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
                        class="typing-input" aria-label="输入听到的日语" @input="syncPendingInputText"
                        @compositionstart="handleCompositionStart" @compositionupdate="handleCompositionUpdate"
                        @compositionend="handleCompositionEnd" @keydown="handleInputKeydown">
                </div>

                <!-- 中文译文区域 -->
                <div class="mt-6 flex h-8 items-center justify-center text-center">
                    <PracticeTranslationText :text="currentPracticeChineseText"
                        :is-visible="shouldShowTranslation" />
                </div>
                </template>
            </div>

            <!-- 工具栏 (居中悬浮在底部) -->
            <div class="mt-8">
                <PracticeToolBar @action-click="handlePracticeToolAction" />
            </div>

        </section>

        <!-- Modals (保持原有逻辑) -->
        <PracticePoolModal :is-open="isPracticeInfoModalOpen" :practice-pool="currentPracticePool"
            @close="closePracticeInfoModal" />
        <PracticeRomajiInputMethodModal :is-open="isRomajiInputMethodModalOpen" @close="closeRomajiInputMethodModal"
            @switch-to-kana-mode="handleSwitchToKanaMode" />
    </main>
</template>

<style scoped>
/* 隐藏真实输入框，但保证它能正常接收法文输入法候选词 */
.typing-input {
    background: transparent;
    border: 0;
    color: transparent;
    height: 2em;
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
</style>
