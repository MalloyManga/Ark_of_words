<script setup lang="ts">
import operatorFrameBack from '../assets/imgs/back.png'
import operatorFrameFront from '../assets/imgs/front.png'
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
        displayName: operatorIndex === 0 ? wisadelVoiceData.operatorName : `演习干员 ${serialNumber}`,
        portrait: mostimaPortrait,
        portraitCrop: defaultOperatorPortraitCrop,
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
    <main class="min-h-screen overflow-hidden bg-[#f7fbf5] px-4 py-5 text-emerald-950 sm:px-6 lg:px-8">
        <section class="mx-auto flex w-full max-w-7xl flex-col gap-5">
            <header class="flex items-center justify-between gap-4 border-b border-emerald-950/15 pb-4">
                <NuxtLink to="/"
                    class="inline-flex size-12 items-center justify-center rounded-2xl border-2 border-emerald-950 bg-white shadow-[5px_5px_0_#86efac] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#86efac] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#86efac] focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                    aria-label="返回首页">
                    <IconBack class="size-5" />
                </NuxtLink>

                <div class="inline-flex items-center gap-2 text-emerald-950" aria-live="polite">
                    <div class="relative">
                        <IconCart class="size-8" />
                        <span v-if="selectedVoiceLineCount > 0" :key="selectedVoiceLineCount"
                            class="selection-bump font-fredoka absolute -right-2 -top-2 text-sm font-black leading-none text-emerald-950">
                            {{ selectedVoiceLineCount }}
                        </span>
                    </div>
                    <span class="font-zh-playful text-sm font-bold text-emerald-900">已选</span>
                </div>
            </header>

            <div class="grid gap-5 transition-[grid-template-columns] duration-300 ease-out"
                :class="operatorGridClasses">
                <section class="min-w-0 self-start">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p class="font-fredoka text-xs font-black uppercase text-emerald-700">
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
                            class="relative aspect-289/594 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-emerald-700"
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

                            <span v-if="activeOperatorId === operator.id"
                                class="pointer-events-none absolute inset-0 z-30 border-2 border-emerald-950" />
                        </button>
                    </div>
                </section>

                <Transition name="voice-panel">
                    <aside v-if="activeOperator"
                        class="flex min-w-0 flex-col border border-slate-500/60 bg-[#f8fafc] lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:self-start">
                        <div
                            class="grid shrink-0 grid-cols-[6.5rem_minmax(0,1fr)] border-b border-slate-500/60 bg-slate-100 text-sm font-bold text-slate-800">
                            <span class="border-r border-slate-500/60 px-3 py-2">条目</span>
                            <span class="px-3 py-2">文本</span>
                        </div>

                        <div class="divide-y divide-slate-500/60 lg:min-h-0 lg:overflow-y-auto">
                            <button v-for="voiceLine in activeOperator.voiceLines" :key="voiceLine.id" type="button"
                                class="grid w-full grid-cols-[6.5rem_minmax(0,1fr)] text-left transition-colors duration-150 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-slate-900"
                                :class="isVoiceLineSelected(activeOperator.id, voiceLine.id)
                                    ? 'bg-[#d7f8df] shadow-[inset_0_0_0_2px_#064e3b]'
                                    : 'bg-white hover:bg-slate-50 active:bg-[#edf7ef]'"
                                :aria-pressed="isVoiceLineSelected(activeOperator.id, voiceLine.id)"
                                @click="toggleVoiceLineSelection(activeOperator.id, voiceLine.id)">
                                <span
                                    class="font-zh-playful border-r border-slate-500/60 px-3 py-3 text-sm font-bold text-slate-900">
                                    {{ voiceLine.title }}
                                </span>
                                <span class="px-3 py-3 text-sm font-bold leading-6 text-slate-900">
                                    <span class="block">{{ voiceLine.japaneseText }}</span>
                                    <span class="mt-1 block">{{ voiceLine.chineseText }}</span>
                                </span>
                            </button>
                        </div>
                    </aside>
                </Transition>
            </div>

            <footer class="flex justify-center pb-2">
                <button type="button"
                    class="font-zh-playful inline-flex h-15 w-full items-center justify-center rounded-sm border-2 px-10 text-lg font-black transition-all duration-150 sm:w-56"
                    :class="selectedVoiceLineCount > 0
                        ? 'cursor-pointer border-emerald-950 bg-[#33d17a] text-emerald-950 shadow-[3px_3px_0_#064e3b] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#45df89] hover:shadow-[2px_2px_0_#064e3b] active:translate-x-1 active:translate-y-1 active:shadow-none'
                        : 'cursor-not-allowed border-slate-400 bg-slate-100 text-slate-500 shadow-none'"
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
