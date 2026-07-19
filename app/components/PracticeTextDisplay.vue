<script setup lang="ts">
import type { PracticeJudgementStatus } from '~/constants/practiceCharacterStatus'
import type { PracticeReadingUnit } from '~/composables/usePracticeLineSource'

interface DisplayCharacter {
    value: string
    submittedValue?: string
    status: PracticeJudgementStatus
    isCursorBefore: boolean
    isExtraSubmittedCharacter: boolean
}

interface DisplayCharacterChunk {
    id: string
    characters: readonly DisplayCharacter[]
}

interface PracticeRomajiUnitDisplay {
    id: string
    unit: PracticeReadingUnit
    startInputIndex: number
    endInputIndex: number
    judgementStatus: PracticeJudgementStatus
    isActive: boolean
    characters: readonly DisplayCharacter[]
    visibleText: string
}

interface PracticeKanaUnitDisplay {
    id: string
    sourceText: string
    kanaText: string
    characters: readonly DisplayCharacter[]
    judgementStatus: PracticeJudgementStatus
}

interface PracticeTextDisplayProps {
    isRomajiModeEnabled: boolean
    romajiPracticeUnitDisplays: readonly PracticeRomajiUnitDisplay[]
    kanaPracticeUnitDisplays: readonly PracticeKanaUnitDisplay[]
    fallbackDisplayCharacterChunks: readonly DisplayCharacterChunk[]
    shouldShowKanaHint: boolean
    shouldShowOriginalText: boolean
    isCursorAfterAllCharacters: boolean
    getDisplayCharacterTextClass: (status: PracticeJudgementStatus) => string
    getDisplayCharacterValue: (character: DisplayCharacter) => string
}

const {
    isRomajiModeEnabled,
    romajiPracticeUnitDisplays,
    kanaPracticeUnitDisplays,
    fallbackDisplayCharacterChunks,
    shouldShowKanaHint,
    shouldShowOriginalText,
    isCursorAfterAllCharacters,
    getDisplayCharacterTextClass,
    getDisplayCharacterValue,
} = defineProps<PracticeTextDisplayProps>()

const kanjiPattern = /\p{Script=Han}/u

const shouldShowUnitKanaText = (unit: PracticeReadingUnit) => {
    return kanjiPattern.test(unit.sourceText) && unit.kanaText !== unit.sourceText
}

const shouldShowKanaUnitKanaText = (unitDisplay: PracticeKanaUnitDisplay) => {
    return shouldShowKanaHint
        && kanjiPattern.test(unitDisplay.sourceText)
        && unitDisplay.kanaText.trim() !== ''
        && unitDisplay.sourceText !== unitDisplay.kanaText
}
</script>

<template>
    <div class="flex min-h-36 w-full max-w-5xl flex-col items-center justify-center gap-y-3 text-ink" :class="isRomajiModeEnabled
        ? 'font-fredoka text-2xl leading-[1.18] sm:text-3xl lg:text-[32px]'
        : 'text-4xl leading-[1.28]'">

        <!-- 罗马字输入模式 -->
        <div v-if="isRomajiModeEnabled"
            class="flex max-w-full wrap-break-word flex-wrap items-end justify-center gap-x-[0.42em] gap-y-6 pt-2">
            <span v-for="unitDisplay in romajiPracticeUnitDisplays" :key="unitDisplay.id"
                class="inline-flex flex-col items-center justify-end gap-y-0.5">
                <span class="min-h-3.75 font-[Yu_Gothic] text-[15px] leading-none text-ink-soft/60">
                    {{ shouldShowKanaHint && shouldShowUnitKanaText(unitDisplay.unit) ? unitDisplay.unit.kanaText : '' }}
                </span>
                <span class="min-h-5 font-[Yu_Gothic] text-[20px] leading-none text-ink-soft mb-1">
                    {{ shouldShowKanaHint ? unitDisplay.unit.sourceText : '' }}
                </span>
                <span class="inline-flex items-end">
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
                            :class="getDisplayCharacterTextClass(unitDisplay.judgementStatus)">
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
            </span>

            <span v-if="isCursorAfterAllCharacters" class="typing-caret" aria-hidden="true" />
        </div>

        <!-- 假名输入模式 -->
        <div v-else-if="kanaPracticeUnitDisplays.length > 0"
            class="flex max-w-full wrap-break-word flex-wrap items-end justify-center gap-x-[0.36em] gap-y-5 pt-2">
            <span v-for="unitDisplay in kanaPracticeUnitDisplays" :key="unitDisplay.id"
                class="inline-flex flex-col items-center justify-end gap-y-1.5">
                <!-- 显示假名 -->
                <span class="min-h-3.75 font-[Yu_Gothic] text-[15px] leading-none text-ink-soft/60">
                    {{ shouldShowKanaUnitKanaText(unitDisplay) ? unitDisplay.kanaText : '' }}
                </span>
                <!-- 逐字符显示 characters -->
                <span class="inline-flex items-end font-mono text-[34px] leading-none sm:text-4xl">
                    <template v-for="(character, index) in unitDisplay.characters"
                        :key="`${unitDisplay.id}-${character.value}-${index}`">
                        <span v-if="character.isCursorBefore" class="typing-caret" aria-hidden="true" />
                        <span class="inline-flex min-w-[1.12em] justify-center"
                            :class="getDisplayCharacterTextClass(character.status)">
                            {{ getDisplayCharacterValue(character) }}
                        </span>
                    </template>
                </span>
            </span>

            <span v-if="isCursorAfterAllCharacters" class="typing-caret" aria-hidden="true" />
        </div>
        <!-- 罗马字显示有问题时 这里兜底 -->
        <div v-else class="flex max-w-full wrap-break-word flex-col items-center justify-center pt-1 font-mono">
            <template v-for="(chunk, chunkIndex) in fallbackDisplayCharacterChunks" :key="chunk.id">
                <span class="inline-flex items-end">
                    <template v-for="(character, index) in chunk.characters"
                        :key="`${chunk.id}-${character.value}-${index}`">
                        <span v-if="character.isCursorBefore" class="typing-caret" aria-hidden="true" />
                        <span class="inline-flex min-w-[1.12em] justify-center"
                            :class="getDisplayCharacterTextClass(character.status)">
                            {{ getDisplayCharacterValue(character) }}
                        </span>
                    </template>
                    <span v-if="isCursorAfterAllCharacters && chunkIndex === fallbackDisplayCharacterChunks.length - 1"
                        class="typing-caret" aria-hidden="true" />
                </span>
            </template>
        </div>
    </div>
</template>

<style scoped>
.typing-caret {
    animation: caret-blink 1s step-end infinite;
    display: inline-block;
    flex: 0 0 0;
    position: relative;
    width: 0;
    height: 1em;
}

.typing-caret::before {
    background-color: #ff5b2e;
    content: '';
    display: block;
    height: 100%;
    width: 2px;
}

@keyframes caret-blink {
    50% {
        opacity: 0;
    }
}
</style>
