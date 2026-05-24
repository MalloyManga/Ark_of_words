<script setup lang="ts">
import { isPracticeDifficulty, practiceDifficultyDetails } from '~/constants/practiceDifficulties'
import type { PracticeDifficulty } from '~/constants/practiceDifficulties'
import { practiceDisplayModes } from '~/constants/practiceDisplayModes'
import type { PracticeDisplayMode } from '~/constants/practiceDisplayModes'
import mockPracticeAudioUrl from '~/data/编入队伍.wav?url'

const route = useRoute()

const practiceAudioRef = useTemplateRef<HTMLAudioElement>('practiceAudioRef')

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
const selectedDifficultyDetail = computed(() => practiceDifficultyDetails[selectedDifficulty.value])
const {
    currentPracticeAudioPath,
    currentPracticeChineseText,
    currentPracticeLineTitle,
    currentPracticePool,
    targetPracticeText,
    kanaHint,
    practiceReadingUnits,
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

let submitDirectRomajiInput: (inputElement: HTMLInputElement) => void = () => {}
let confirmPendingInput: () => void = () => {}
let rollbackSubmittedCharacter: () => void = () => {}
let warnRomajiInputMethod: () => void = () => {}

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

const {
    closePracticeInfoModal,
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

onMounted(() => {
    window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleWindowKeydown)
})
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
                        class="max-w-[min(52vw,28rem)] truncate font-mono text-sm font-bold text-emerald-700/75 sm:text-base">
                        {{ currentPracticeLineTitle }}
                    </p>
                    <span class="font-mono text-sm font-black" :class="selectedDifficultyDetail.classes">
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

                <!-- 主体原文展示已拆到纯展示组件 判定状态由 typing judge composable 提供 -->
                <PracticeTextDisplay :is-romaji-mode-enabled="isRomajiModeEnabled"
                    :romaji-practice-unit-displays="romajiPracticeUnitDisplays"
                    :kana-practice-unit-displays="kanaPracticeUnitDisplays"
                    :fallback-display-character-chunks="fallbackDisplayCharacterChunks" :kana-hint="kanaHint"
                    :should-show-kana-hint="shouldShowKanaHint" :should-show-original-text="shouldShowOriginalText"
                    :is-cursor-after-all-characters="isCursorAfterAllCharacters"
                    :get-display-character-text-class="getDisplayCharacterTextClass"
                    :get-display-character-value="getDisplayCharacterValue" />

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
                        class="font-mono text-base font-bold text-emerald-700/75 sm:text-lg">
                        {{ currentPracticeChineseText || '暂无中文译文' }}
                    </p>
                    <p v-show="!shouldShowTranslation" class="sr-only">
                        {{ currentPracticeChineseText || '暂无中文译文' }}
                    </p>
                </div>

                <p class="sr-only">
                    {{ activeDisplayMode.label }}
                </p>
                <PracticeToolBar @action-click="handlePracticeToolAction" />
            </div>

            <PracticePoolModal :is-open="isPracticeInfoModalOpen" :practice-pool="currentPracticePool"
                @close="closePracticeInfoModal" />
            <PracticeRomajiInputMethodModal :is-open="isRomajiInputMethodModalOpen"
                @close="closeRomajiInputMethodModal" @switch-to-kana-mode="handleSwitchToKanaMode" />
        </section>
    </main>
</template>

<style scoped>
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
</style>
