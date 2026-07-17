<script setup lang="ts">
import { mockOperators } from '~/constants/mockOperators'

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

            <OperatorSelectionHeader :selected-voice-line-count="selectedVoiceLineCount" />

            <!-- 主体网格区：左侧干员选择，右侧台词选择 (Grid 布局宽度过渡) -->
            <div class="flex-1 grid gap-6 transition-[grid-template-columns] duration-500 ease-out min-h-0"
                :class="operatorGridClasses">
                <OperatorSelectionGrid :operators="mockOperators" :active-operator-id="activeOperatorId"
                    :has-active-operator="Boolean(activeOperator)" @toggle-operator="toggleActiveOperator" />
                <OperatorVoicePanel :active-operator="activeOperator"
                    :is-voice-line-selected="isVoiceLineSelected" @toggle-voice-line="toggleVoiceLineSelection" />
            </div>

            <OperatorPracticeFooter :selected-voice-line-count="selectedVoiceLineCount" />
        </section>
    </main>
</template>
