import { isSupportedOperatorId } from '#shared/types/operatorApi'
import type { SupportedOperatorId } from '#shared/types/operatorApi'

export interface CustomPracticeSelectionItem {
    operatorId: SupportedOperatorId
    voiceLineId: string
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

    const replaceSelectedVoiceLines = (selectionKeys: readonly string[]): void => {
        selectedVoiceLines.value = selectionKeys.flatMap((selectionKey) => {
            const selectionItem = parseVoiceLineSelectionKey(selectionKey)
            return selectionItem ? [selectionItem] : []
        })
    }

    const clearSelectedVoiceLines = (): void => {
        selectedVoiceLines.value = []
    }

    return {
        selectedVoiceLines: readonly(selectedVoiceLines),
        replaceSelectedVoiceLines,
        clearSelectedVoiceLines,
    }
}
