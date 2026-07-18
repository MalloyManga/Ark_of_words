<script setup lang="ts">
import { isSupportedOperatorId } from '#shared/types/operatorApi'
import type { SupportedOperatorId } from '#shared/types/operatorApi'

const {
    operatorDisplayItems,
    operatorCatalogReady,
    loadOperatorVoices,
} = useOperatorBrowserData()
const {
    selectedVoiceLines,
    replaceSelectedVoiceLines,
    clearSelectedVoiceLines,
} = useCustomPracticeSelection()

// activeOperatorId 控制抽屉面板的开关
const activeOperatorId = ref<SupportedOperatorId>()
const isSelectedVoiceDrawerOpen = ref(false)

// 用干员 id 和台词 id 组成全局 key 切换干员后已选台词不丢失
const selectedVoiceLineIds = computed<ReadonlySet<string>>(() => {
    return new Set(selectedVoiceLines.value.map((selection) => {
        return `${selection.operatorId}:${selection.voiceLineId}`
    }))
})

const activeOperator = computed(() => {
    return operatorDisplayItems.value.find((operator) => operator.id === activeOperatorId.value)
})

const selectedVoiceLineCount = computed(() => selectedVoiceLineIds.value.size)

const createVoiceLineSelectionId = (operatorId: string, voiceLineId: string): string => {
    return `${operatorId}:${voiceLineId}`
}

const selectedVoiceLineDisplays = computed(() => {
    return selectedVoiceLines.value.map((selection) => {
        const operator = operatorDisplayItems.value.find((item) => item.id === selection.operatorId)
        const voiceLine = operator?.voiceLines.find((item) => item.id === selection.voiceLineId)

        return {
            selectionId: createVoiceLineSelectionId(selection.operatorId, selection.voiceLineId),
            operatorDisplayName: operator?.displayName ?? selection.operatorId,
            voiceLineTitle: voiceLine?.title ?? '语音信息加载中',
            japaneseText: voiceLine?.japaneseText ?? '',
            chineseText: voiceLine?.chineseText ?? '',
            isVoiceLineLoaded: voiceLine !== undefined,
        }
    })
})

const isVoiceLineSelected = (operatorId: string, voiceLineId: string): boolean => {
    return selectedVoiceLineIds.value.has(createVoiceLineSelectionId(operatorId, voiceLineId))
}

const toggleActiveOperator = async (operatorId: string): Promise<void> => {
    if (!isSupportedOperatorId(operatorId)) {
        return
    }

    if (activeOperatorId.value === operatorId) {
        activeOperatorId.value = undefined
        return
    }

    isSelectedVoiceDrawerOpen.value = false
    activeOperatorId.value = operatorId
    await loadOperatorVoices(operatorId)
}

const closeDrawer = (): void => {
    activeOperatorId.value = undefined
}

const openSelectedVoiceDrawer = (): void => {
    activeOperatorId.value = undefined
    isSelectedVoiceDrawerOpen.value = true
}

const closeSelectedVoiceDrawer = (): void => {
    isSelectedVoiceDrawerOpen.value = false
}

const removeSelectedVoiceLine = (selectionId: string): void => {
    replaceSelectedVoiceLines(
        [...selectedVoiceLineIds.value].filter((selectedId) => selectedId !== selectionId),
    )
}

const clearAllSelectedVoiceLines = (): void => {
    clearSelectedVoiceLines()
}

const toggleVoiceLineSelection = (operatorId: string, voiceLineId: string): void => {
    const voiceLineSelectionId = createVoiceLineSelectionId(operatorId, voiceLineId)
    const nextSelectedVoiceLineIds = new Set(selectedVoiceLineIds.value)

    if (nextSelectedVoiceLineIds.has(voiceLineSelectionId)) {
        nextSelectedVoiceLineIds.delete(voiceLineSelectionId)
    } else {
        nextSelectedVoiceLineIds.add(voiceLineSelectionId)
    }

    replaceSelectedVoiceLines([...nextSelectedVoiceLineIds])
}

/**
 * 刷新页面后 LocalStorage 只保存选择键
 * 这里按干员顺序补齐语音详情供已选抽屉展示
 */
const loadPersistedSelectedVoiceLines = async (): Promise<void> => {
    const selectedOperatorIds = [...new Set(
        selectedVoiceLines.value.map((selection) => selection.operatorId),
    )]

    for (const operatorId of selectedOperatorIds) {
        await loadOperatorVoices(operatorId)
    }
}

const startCustomPractice = async (): Promise<void> => {
    if (selectedVoiceLineIds.value.size === 0) {
        return
    }

    replaceSelectedVoiceLines([...selectedVoiceLineIds.value])
    await navigateTo({
        path: '/practice/session',
        query: { difficulty: 'custom' },
    })
}

await operatorCatalogReady

onMounted(() => {
    void loadPersistedSelectedVoiceLines()
})
</script>

<template>
    <main id="main-content" tabindex="-1"
        class="relative min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 text-slate-800 dark:text-slate-100 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden flex flex-col">

        <!-- 氛围光晕背景 -->
        <div
            class="pointer-events-none absolute top-[-10%] left-[-10%] size-125 rounded-full bg-blue-300/20 dark:bg-cyan-900/20 blur-[100px] transition-colors duration-500" />
        <div
            class="pointer-events-none absolute bottom-[-10%] right-[-10%] size-150 rounded-full bg-indigo-300/10 dark:bg-blue-900/20 blur-[120px] transition-colors duration-500" />

        <section class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 h-full flex-1 pb-24">

            <OperatorSelectionHeader :selected-voice-line-count="selectedVoiceLineCount"
                @open-selected-voices="openSelectedVoiceDrawer" />

            <div class="flex-1 w-full min-h-0">
                <OperatorSelectionGrid :operators="operatorDisplayItems" :active-operator-id="activeOperatorId"
                    @toggle-operator="toggleActiveOperator" />
            </div>
        </section>

        <OperatorVoiceDrawer :active-operator="activeOperator" :is-voice-line-selected="isVoiceLineSelected"
            @close="closeDrawer" @toggle-voice-line="toggleVoiceLineSelection" />

        <OperatorSelectedVoiceDrawer :is-open="isSelectedVoiceDrawerOpen"
            :selected-voice-lines="selectedVoiceLineDisplays" @close="closeSelectedVoiceDrawer"
            @remove-voice-line="removeSelectedVoiceLine" @clear-voice-lines="clearAllSelectedVoiceLines" />

        <OperatorPracticeDock :selected-voice-line-count="selectedVoiceLineCount"
            @start-practice="startCustomPractice" />

    </main>
</template>
