<script setup lang="ts">
import type { CharacterStatus } from '~/constants/practiceCharacterStatus'

interface DisplayCharacter {
    value: string
    submittedValue?: string
    status: CharacterStatus
    isCursorBefore: boolean
    isExtraSubmittedCharacter: boolean
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

interface PracticeTextDisplayProps {
    isRomajiModeEnabled: boolean
    romajiPracticeUnitDisplays: readonly PracticeTextUnitDisplay[]
    displayCharacterChunks: readonly DisplayCharacterChunk[]
    kanaHint: string
    shouldShowKanaHint: boolean
    shouldShowOriginalText: boolean
    isCursorAfterAllCharacters: boolean
    getDisplayCharacterTextClass: (status: CharacterStatus) => string
    getDisplayCharacterValue: (character: DisplayCharacter) => string
}

const {
    isRomajiModeEnabled,
    romajiPracticeUnitDisplays,
    displayCharacterChunks,
    kanaHint,
    shouldShowKanaHint,
    shouldShowOriginalText,
    isCursorAfterAllCharacters,
    getDisplayCharacterTextClass,
    getDisplayCharacterValue,
} = defineProps<PracticeTextDisplayProps>()
</script>

<template>
    <div class="flex min-h-7 w-full items-center justify-center">
        <p v-show="shouldShowKanaHint" class="text-sm font-medium tracking-[0.2em] text-emerald-700/70">
            {{ kanaHint }}
        </p>
        <p v-show="!shouldShowKanaHint" class="sr-only">
            {{ kanaHint }}
        </p>
    </div>

    <div class="flex min-h-36 w-full max-w-5xl flex-col items-center justify-center gap-y-3 text-[#2563eb]" :class="isRomajiModeEnabled
        ? 'font-fredoka text-2xl leading-[1.18] sm:text-3xl lg:text-[32px]'
        : 'text-4xl leading-[1.28]'">

        <!-- 罗马字输入模式 -->
        <div v-if="isRomajiModeEnabled"
            class="flex max-w-full wrap-break-word flex-wrap items-end justify-center gap-x-[0.42em] gap-y-3">
            <span v-for="unitDisplay in romajiPracticeUnitDisplays" :key="unitDisplay.id" class="inline-flex items-end">

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
        <div v-else class="flex max-w-full wrap-break-word flex-col items-center justify-center font-mono">
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
                    <span v-if="isCursorAfterAllCharacters && chunkIndex === displayCharacterChunks.length - 1"
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
    background-color: #fbbf24;
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
