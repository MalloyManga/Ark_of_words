import { isSupportedOperatorId } from '#shared/types/operatorApi'
import type { SupportedOperatorId } from '#shared/types/operatorApi'

export interface CustomPracticeSelectionItem {
    operatorId: SupportedOperatorId
    voiceLineId: string
}

interface StoredCustomPracticeSelection {
    version: 1
    selections: readonly CustomPracticeSelectionItem[]
}

const customPracticeSelectionStorageKey = 'ark-of-words:custom-practice-selection'

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

const isCustomPracticeSelectionItem = (value: unknown): value is CustomPracticeSelectionItem => {
    return isRecord(value)
        && typeof value.operatorId === 'string'
        && isSupportedOperatorId(value.operatorId)
        && typeof value.voiceLineId === 'string'
        && value.voiceLineId.length > 0
}

const parseStoredCustomPracticeSelection = (
    serializedSelection: string,
): readonly CustomPracticeSelectionItem[] => {
    try {
        const storedSelection: unknown = JSON.parse(serializedSelection)

        if (
            !isRecord(storedSelection)
            || storedSelection.version !== 1
            || !Array.isArray(storedSelection.selections)
        ) {
            return []
        }

        return storedSelection.selections.filter(isCustomPracticeSelectionItem)
    } catch {
        return []
    }
}

const parseVoiceLineSelectionKey = (selectionKey: string): CustomPracticeSelectionItem | undefined => {
    const separatorIndex = selectionKey.indexOf(':')

    if (separatorIndex <= 0 || separatorIndex >= selectionKey.length - 1) {
        return undefined
    }

    const operatorId = selectionKey.slice(0, separatorIndex)
    const voiceLineId = selectionKey.slice(separatorIndex + 1)

    if (!isSupportedOperatorId(operatorId)) {
        return undefined
    }

    return { operatorId, voiceLineId }
}

/**
 * 保存自由配置页和练习会话之间的临时选择
 * 该状态属于当前 Nuxt 应用会话 不承担长期学习记录职责
 */
export const useCustomPracticeSelection = () => {
    const selectedVoiceLines = useState<readonly CustomPracticeSelectionItem[]>(
        'custom-practice-selection',
        () => [],
    )
    const isCustomPracticeSelectionInitialized = useState<boolean>(
        'custom-practice-selection-initialized',
        () => false,
    )

    const persistCustomPracticeSelection = (
        selections: readonly CustomPracticeSelectionItem[],
    ): void => {
        if (!import.meta.client) {
            return
        }

        const storedSelection: StoredCustomPracticeSelection = {
            version: 1,
            selections,
        }
        localStorage.setItem(customPracticeSelectionStorageKey, JSON.stringify(storedSelection))
    }

    const initializeCustomPracticeSelection = (): void => {
        if (!import.meta.client || isCustomPracticeSelectionInitialized.value) {
            return
        }

        const serializedSelection = localStorage.getItem(customPracticeSelectionStorageKey)
        selectedVoiceLines.value = serializedSelection
            ? parseStoredCustomPracticeSelection(serializedSelection)
            : []
        isCustomPracticeSelectionInitialized.value = true
    }

    const replaceSelectedVoiceLines = (selectionKeys: readonly string[]): void => {
        const nextSelectedVoiceLines = selectionKeys.flatMap((selectionKey) => {
            const selectionItem = parseVoiceLineSelectionKey(selectionKey)
            return selectionItem ? [selectionItem] : []
        })

        selectedVoiceLines.value = nextSelectedVoiceLines
        persistCustomPracticeSelection(nextSelectedVoiceLines)
    }

    const clearSelectedVoiceLines = (): void => {
        selectedVoiceLines.value = []

        if (import.meta.client) {
            localStorage.removeItem(customPracticeSelectionStorageKey)
        }
    }

    return {
        selectedVoiceLines: readonly(selectedVoiceLines),
        initializeCustomPracticeSelection,
        replaceSelectedVoiceLines,
        clearSelectedVoiceLines,
    }
}
