<script setup lang="ts">
import operatorFrameBack from '../assets/imgs/back.png'
import operatorFrameFront from '../assets/imgs/front.png'
import casterProfessionIcon from '../assets/imgs/Caster.png'
import mostimaPortrait from '../assets/imgs/立绘_莫斯提马_1.png'
import type { CSSProperties } from 'vue'
import type { PrtsVoiceLine } from '~/utils/prtsVoiceDataExtractor'
import wisadelVoicePageRawData from '~/data/prts-wisadel-voice-page.slots.raw.json'

interface OperatorPortraitCrop extends CSSProperties {
    width: string
    maxWidth: string
    left: string
    top: string
}

interface MockOperator {
    id: string
    displayName: string
    portrait: string
    portraitCrop: OperatorPortraitCrop
    professionIconSrc: string
    voiceLines: readonly PrtsVoiceLine[]
}

const wisadelVoiceData = parsePrtsOperatorVoiceData(wisadelVoicePageRawData)

// 干员头像格子现在由三层图片组成
// 第一层 back 作为底图 第二层干员立绘 第三层 front 作为前景遮罩
// 当前头像统一使用手动裁切
// 裁切值跟随干员数据走 每个干员可以独立保存自己的立绘位置
const defaultOperatorPortraitCrop: OperatorPortraitCrop = {
    width: '505%',
    maxWidth: 'none',
    left: '-202%',
    top: '5%',
}

const mockOperators: readonly MockOperator[] = Array.from({ length: 30 }, (_, operatorIndex): MockOperator => {
    const serialNumber = String(operatorIndex + 1).padStart(2, '0')

    return {
        id: `operator-${serialNumber}`,
        displayName: operatorIndex === 0 ? '莫斯提马' : `演习干员 ${serialNumber}`,
        portrait: mostimaPortrait,
        portraitCrop: defaultOperatorPortraitCrop,
        professionIconSrc: casterProfessionIcon,
        voiceLines: wisadelVoiceData.lines,
    }
})

// activeOperatorId 只控制右侧详情面板 当前原型保持单干员激活
const activeOperatorId = ref<string>()

// 用干员 id 和台词 id 组成全局 key 切换干员后已选台词不丢失
const selectedVoiceLineIds = ref<ReadonlySet<string>>(new Set<string>())

const activeOperator = computed(() => {
    return mockOperators.find((operator) => operator.id === activeOperatorId.value)
})

const selectedVoiceLineCount = computed(() => selectedVoiceLineIds.value.size)

const operatorGridClasses = computed(() => {
    return activeOperator.value
        ? 'lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,0.58fr)]'
        : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,0px)]'
})

const createVoiceLineSelectionId = (operatorId: string, voiceLineId: string): string => {
    return `${operatorId}:${voiceLineId}`
}

const isVoiceLineSelected = (operatorId: string, voiceLineId: string): boolean => {
    return selectedVoiceLineIds.value.has(createVoiceLineSelectionId(operatorId, voiceLineId))
}

const toggleActiveOperator = (operatorId: string): void => {
    activeOperatorId.value = activeOperatorId.value === operatorId ? undefined : operatorId
}

const toggleVoiceLineSelection = (operatorId: string, voiceLineId: string): void => {
    const voiceLineSelectionId = createVoiceLineSelectionId(operatorId, voiceLineId)
    const nextSelectedVoiceLineIds = new Set(selectedVoiceLineIds.value)

    // Set 原地修改不利于视图更新 这里替换新 Set 让数量和样式稳定刷新
    if (nextSelectedVoiceLineIds.has(voiceLineSelectionId)) {
        nextSelectedVoiceLineIds.delete(voiceLineSelectionId)
    } else {
        nextSelectedVoiceLineIds.add(voiceLineSelectionId)
    }

    selectedVoiceLineIds.value = nextSelectedVoiceLineIds
}
</script>

<template>
    <main class="relative min-h-screen overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
        <div class="pointer-events-none fixed inset-0 nb-dots" aria-hidden="true" />
        <section class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5">
            <header class="flex items-center justify-between gap-4 border-b-2 border-ink pb-4">
                <NuxtLink to="/"
                    class="nb-card nb-interactive inline-flex size-12 items-center justify-center text-ink"
                    aria-label="返回首页">
                    <IconBack class="size-5" />
                </NuxtLink>

                <div class="nb-sticker bg-butter text-ink" aria-live="polite">
                    <div class="relative">
                        <IconCart class="size-6" />
                        <span v-if="selectedVoiceLineCount > 0" :key="selectedVoiceLineCount"
                            class="selection-bump font-fredoka absolute -right-2 -top-2 text-sm font-black leading-none text-coral">
                            {{ selectedVoiceLineCount }}
                        </span>
                    </div>
                    <span class="font-zh-playful text-sm font-bold">已选</span>
                </div>
            </header>

            <div class="grid gap-5 transition-[grid-template-columns] duration-300 ease-out"
                :class="operatorGridClasses">
                <section class="min-w-0 self-start">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p class="font-romaji text-xs font-black uppercase tracking-widest text-coral">
                                custom practice
                            </p>
                            <h1 class="font-zh-playful mt-1 text-3xl font-black leading-tight sm:text-4xl">
                                自由配置练习
                            </h1>
                        </div>
                    </div>

                    <div class="mt-5 grid grid-cols-3 gap-x-2 gap-y-3 transition-all duration-300 sm:grid-cols-5 sm:gap-x-3 sm:gap-y-4 lg:grid-cols-6 xl:grid-cols-8"
                        :class="activeOperator ? '2xl:grid-cols-6' : '2xl:grid-cols-10'">
                        <button v-for="operator in mockOperators" :key="operator.id" type="button"
                            class="relative aspect-289/594 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-coral"
                            :aria-pressed="activeOperatorId === operator.id" :aria-label="operator.displayName"
                            @click="toggleActiveOperator(operator.id)">
                            <span
                                class="pointer-events-none absolute left-[3.6%] top-[-12.5%] z-0 h-full w-[92%] overflow-hidden bg-transparent">
                                <img
                                    class="pointer-events-none absolute bottom-0 left-0 z-0 w-full max-w-none select-none"
                                    :src="operatorFrameBack" alt="" draggable="false">
                                <img class="pointer-events-none absolute z-10 select-none"
                                    :style="operator.portraitCrop" :src="operator.portrait"
                                    :alt="`${operator.displayName} portrait`" draggable="false">
                            </span>
                            <img class="pointer-events-none absolute left-[-6.5%] top-0 z-20 w-[114%] max-w-none select-none"
                                :src="operatorFrameFront" alt=""
                                draggable="false">
                            <img class="pointer-events-none absolute left-[6%] top-[1%] z-30 w-[22%] select-none"
                                :src="operator.professionIconSrc" alt=""
                                draggable="false">
                            <span
                                class="pointer-events-none absolute bottom-[3%] right-[7%] z-30 text-right leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                                :class="activeOperator ? 'text-[clamp(6px,0.75vw,14px)]' : 'text-[clamp(10px,1.15vw,18px)]'">
                                {{ operator.displayName }}
                            </span>

                            <span v-if="activeOperatorId === operator.id"
                                class="pointer-events-none absolute inset-0 z-40 border-2 border-coral" />
                        </button>
                    </div>
                </section>

                <Transition name="voice-panel">
                    <aside v-if="activeOperator"
                        class="flex min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-ink bg-cream shadow-[5px_5px_0_var(--color-ink)] lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:self-start">
                        <div
                            class="grid shrink-0 grid-cols-[6.5rem_minmax(0,1fr)] border-b-2 border-ink bg-ink text-sm font-bold text-cream">
                            <span class="border-r-2 border-cream/20 px-3 py-2">条目</span>
                            <span class="px-3 py-2">文本</span>
                        </div>

                        <div class="divide-y-2 divide-ink/10 lg:min-h-0 lg:overflow-y-auto">
                            <button v-for="voiceLine in activeOperator.voiceLines" :key="voiceLine.id" type="button"
                                class="grid w-full grid-cols-[6.5rem_minmax(0,1fr)] text-left transition-colors duration-150 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-coral"
                                :class="isVoiceLineSelected(activeOperator.id, voiceLine.id)
                                    ? 'bg-butter'
                                    : 'bg-cream hover:bg-paper-dim'"
                                :aria-pressed="isVoiceLineSelected(activeOperator.id, voiceLine.id)"
                                @click="toggleVoiceLineSelection(activeOperator.id, voiceLine.id)">
                                <span
                                    class="font-zh-playful border-r-2 border-ink/10 px-3 py-3 text-sm font-bold text-ink">
                                    {{ voiceLine.title }}
                                </span>
                                <span class="px-3 py-3 text-sm font-bold leading-6 text-ink">
                                    <span class="block">{{ voiceLine.japaneseText }}</span>
                                    <span class="mt-1 block text-ink-soft">{{ voiceLine.chineseText }}</span>
                                </span>
                            </button>
                        </div>
                    </aside>
                </Transition>
            </div>

            <footer class="flex justify-center pb-2">
                <button type="button"
                    class="font-zh-playful inline-flex h-15 w-full items-center justify-center rounded-xl border-2 px-10 text-lg font-black transition-all duration-150 sm:w-56"
                    :class="selectedVoiceLineCount > 0
                        ? 'nb-interactive cursor-pointer border-ink bg-coral text-cream shadow-[4px_4px_0_var(--color-ink)]'
                        : 'cursor-not-allowed border-ink/30 bg-paper-dim text-ink-soft/50'"
                    :disabled="selectedVoiceLineCount === 0">
                    开始练习
                </button>
            </footer>
        </section>
    </main>
</template>

<style scoped>
.selection-bump {
    animation: selection-bump 220ms ease-out;
}

.voice-panel-enter-active,
.voice-panel-leave-active {
    transition: opacity 180ms ease-out, transform 220ms ease-out;
}

.voice-panel-enter-from,
.voice-panel-leave-to {
    opacity: 0;
    transform: translateX(18px);
}

@keyframes selection-bump {
    0% {
        transform: scale(0.88);
    }

    65% {
        transform: scale(1.12);
    }

    100% {
        transform: scale(1);
    }
}
</style>
