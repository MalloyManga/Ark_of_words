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
    <main
        class="relative min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 text-slate-800 dark:text-slate-100 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden flex flex-col">

        <!-- 氛围光晕背景 -->
        <div
            class="pointer-events-none absolute top-[-10%] left-[-10%] size-125 rounded-full bg-blue-300/20 dark:bg-cyan-900/20 blur-[100px] transition-colors duration-500" />
        <div
            class="pointer-events-none absolute bottom-[-10%] right-[-10%] size-150 rounded-full bg-indigo-300/10 dark:bg-blue-900/20 blur-[120px] transition-colors duration-500" />

        <section class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 h-full flex-1">

            <!-- 顶部 Header -->
            <header
                class="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
                <!-- 玻璃质感返回按钮 -->
                <NuxtLink to="/"
                    class="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 hover:-translate-x-1 transition-all"
                    aria-label="返回首页">
                    <IconBack class="w-5 h-5" />
                </NuxtLink>

                <!-- 科技感“已选”状态牌 -->
                <div class="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm"
                    aria-live="polite">
                    <div class="relative text-slate-600 dark:text-slate-400">
                        <IconCart class="w-5 h-5" />
                        <span v-if="selectedVoiceLineCount > 0" :key="selectedVoiceLineCount"
                            class="selection-bump absolute -right-2 -top-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-blue-500 dark:bg-cyan-500 text-[10px] font-black text-white shadow-md shadow-blue-500/30 dark:shadow-cyan-500/30">
                            {{ selectedVoiceLineCount }}
                        </span>
                    </div>
                    <span class="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">已选台词</span>
                </div>
            </header>

            <!-- 主体网格区：左侧干员选择，右侧台词选择 (Grid 布局宽度过渡) -->
            <div class="flex-1 grid gap-6 transition-[grid-template-columns] duration-500 ease-out min-h-0"
                :class="operatorGridClasses">
                <!-- 左侧：干员选择区 -->
                <section class="min-w-0 flex flex-col">
                    <div class="flex flex-col gap-1 mb-6">
                        <p class="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-cyan-500">
                            Custom Practice
                        </p>
                        <h1
                            class="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-800 dark:text-slate-100">
                            自由配置练习
                        </h1>
                    </div>

                    <!-- 干员头像 Grid -->
                    <div class="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-6 xl:grid-cols-8 transition-all duration-300"
                        :class="activeOperator ? '2xl:grid-cols-6' : '2xl:grid-cols-10'">
                        <button v-for="operator in mockOperators" :key="operator.id" type="button"
                            class="group relative aspect-289/594 focus-visible:outline-none transition-transform duration-300 hover:-translate-y-1"
                            :aria-pressed="activeOperatorId === operator.id" :aria-label="operator.displayName"
                            @click="toggleActiveOperator(operator.id)">
                            <!-- 底图 / 裁切图保持原有逻辑结构 -->
                            <span
                                class="pointer-events-none absolute left-[3.6%] top-[-12.5%] z-0 h-full w-[92%] overflow-hidden bg-transparent">
                                <!-- 给相框底板加上毛玻璃和柔和透明度 -->
                                <img class="pointer-events-none absolute bottom-0 left-0 z-0 w-full max-w-none select-none opacity-90 dark:opacity-70"
                                    :src="operatorFrameBack" alt="" draggable="false">
                                <img class="pointer-events-none absolute z-10 select-none"
                                    :style="operator.portraitCrop" :src="operator.portrait"
                                    :alt="`${operator.displayName} portrait`" draggable="false">
                            </span>

                            <!-- 前景框：夜间模式稍微降低亮度 -->
                            <img class="pointer-events-none absolute left-[-6.5%] top-0 z-20 w-[114%] max-w-none select-none drop-shadow-md opacity-95 dark:opacity-80"
                                :src="operatorFrameFront" alt="" draggable="false">

                            <img class="pointer-events-none absolute left-[6%] top-[1%] z-30 w-[22%] select-none drop-shadow"
                                :src="operator.professionIconSrc" alt="" draggable="false">

                            <!-- 名字标签：增强阴影可读性 -->
                            <span
                                class="pointer-events-none absolute bottom-[3%] right-[7%] z-30 text-right font-bold leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                                :class="activeOperator ? 'text-[clamp(8px,0.8vw,14px)]' : 'text-[clamp(10px,1.2vw,16px)]'">
                                {{ operator.displayName }}
                            </span>

                            <!-- 激活状态的高科技发光描边 -->
                            <span v-if="activeOperatorId === operator.id"
                                class="pointer-events-none absolute inset-0 z-40 rounded border-2 border-blue-500 dark:border-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] dark:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all" />
                            <!-- Hover 提示光晕 -->
                            <span
                                class="pointer-events-none absolute inset-0 z-40 rounded border-2 border-transparent group-hover:border-blue-300/50 dark:group-hover:border-cyan-300/30 transition-colors" />
                        </button>
                    </div>
                </section>

                <!-- 右侧：台词选择侧边栏 (玻璃面板) -->
                <Transition name="voice-panel">
                    <aside v-if="activeOperator"
                        class="flex flex-col min-w-0 overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 shadow-xl shadow-blue-900/5 dark:shadow-black/20 lg:sticky lg:top-5 lg:max-h-[calc(100vh-8rem)]">
                        <!-- 头部 -->
                        <div
                            class="grid shrink-0 grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[6.5rem_minmax(0,1fr)] bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <span class="border-r border-slate-200 dark:border-slate-700 px-4 py-3">条目</span>
                            <span class="px-4 py-3">文本详情</span>
                        </div>

                        <!-- 台词列表区 -->
                        <div class="flex-1 overflow-y-auto divide-y divide-slate-200/50 dark:divide-slate-700/50">
                            <button v-for="voiceLine in activeOperator.voiceLines" :key="voiceLine.id" type="button"
                                class="group w-full grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[6.5rem_minmax(0,1fr)] text-left transition-all duration-200 focus-visible:outline-none"
                                :class="[
                                    isVoiceLineSelected(activeOperator.id, voiceLine.id)
                                        ? 'bg-blue-50/80 dark:bg-cyan-900/30 border-l-4 border-blue-500 dark:border-cyan-400'
                                        : 'hover:bg-white/50 dark:hover:bg-slate-800/40 border-l-4 border-transparent'
                                ]" :aria-pressed="isVoiceLineSelected(activeOperator.id, voiceLine.id)"
                                @click="toggleVoiceLineSelection(activeOperator.id, voiceLine.id)">
                                <!-- 左侧：类型标题 -->
                                <span
                                    class="border-r border-slate-200/50 dark:border-slate-700/50 px-4 py-4 text-xs sm:text-sm font-bold transition-colors"
                                    :class="isVoiceLineSelected(activeOperator.id, voiceLine.id) ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'">
                                    {{ voiceLine.title }}
                                </span>

                                <!-- 右侧：中日文台词 -->
                                <span class="px-4 py-4 text-sm flex flex-col gap-1.5">
                                    <span class="font-bold text-slate-800 dark:text-slate-200 leading-snug">
                                        {{ voiceLine.japaneseText }}
                                    </span>
                                    <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {{ voiceLine.chineseText }}
                                    </span>
                                </span>
                            </button>
                        </div>
                    </aside>
                </Transition>
            </div>

            <!-- 底部固定栏：开始练习按钮 -->
            <footer
                class="mt-4 pt-4 flex justify-center lg:justify-end pb-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button type="button"
                    class="relative overflow-hidden group flex items-center justify-center w-full sm:w-64 h-14 rounded-2xl text-lg font-black transition-all duration-300"
                    :class="selectedVoiceLineCount > 0
                        ? 'bg-slate-800 dark:bg-cyan-50 text-white dark:text-cyan-950 shadow-lg shadow-slate-800/20 dark:shadow-cyan-400/20 hover:-translate-y-1 hover:shadow-xl'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'"
                    :disabled="selectedVoiceLineCount === 0">
                    <!-- 按钮激活时的光晕渐变背景 -->
                    <div v-if="selectedVoiceLineCount > 0"
                        class="absolute inset-0 w-full h-full bg-linear-to-r from-blue-500 to-cyan-500 dark:from-cyan-300 dark:to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span class="relative flex items-center gap-2 group-hover:text-white transition-colors">
                        开始练习
                        <svg v-if="selectedVoiceLineCount > 0"
                            class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7">
                            </path>
                        </svg>
                    </span>
                </button>
            </footer>
        </section>
    </main>
</template>

<style scoped>
/* 保持你的数字跳动动画不变，它很生动 */
.selection-bump {
    animation: selection-bump 220ms ease-out;
}

/* 侧边栏滑入滑出动画优化为平滑的透明度和位移 */
.voice-panel-enter-active,
.voice-panel-leave-active {
    transition: opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.voice-panel-enter-from,
.voice-panel-leave-to {
    opacity: 0;
    transform: translateX(20px) scale(0.98);
    /* 增加了一点微小的缩放让弹出更柔和 */
}

@keyframes selection-bump {
    0% {
        transform: scale(0.88);
    }

    65% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}
</style>