import { practiceDisplayModes } from '~/constants/practiceDisplayModes'
import type { PracticeToolActionId } from '~/constants/practiceToolActions'
import type { PracticeAudioController } from '~/types/practiceAudio'

interface PracticeToolActionsOptions {
    practiceAudioRef: Readonly<Ref<PracticeAudioController | null>>
    activeDisplayModeIndex: Ref<number>
    isRomajiModeEnabled: Ref<boolean>
    isPracticeInfoModalOpen: Ref<boolean>
    submittedText: Ref<string>
    pendingInputText: Ref<string>
    clearInputReceiverValue: () => void
    focusInputReceiver: () => void
}

interface PracticeToolActions {
    playPracticeAudio: () => Promise<void>
    cycleDisplayMode: () => void
    toggleRomajiMode: () => void
    switchToKanaMode: () => void
    closePracticeInfoModal: () => void
    handlePracticeToolAction: (actionId: PracticeToolActionId) => Promise<void>
}

/**
 * 只管工具按钮行为 比如播放音频 切模式 切罗马字 打开 modal
 */
export const usePracticeToolActions = ({
    practiceAudioRef,
    activeDisplayModeIndex,
    isRomajiModeEnabled,
    isPracticeInfoModalOpen,
    submittedText,
    pendingInputText,
    clearInputReceiverValue,
    focusInputReceiver,
}: PracticeToolActionsOptions): PracticeToolActions => {
    const playPracticeAudio = async () => {
        const audioController = practiceAudioRef.value

        if (!audioController) {
            return
        }

        try {
            await audioController.playFromStart()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '未知播放错误'
            console.error(`[练习音频] 播放失败 ${errorMessage}`)
        }
    }

    const cycleDisplayMode = () => {
        activeDisplayModeIndex.value = (activeDisplayModeIndex.value + 1) % practiceDisplayModes.length
    }

    const toggleRomajiMode = () => {
        // 输入方式切换后目标文本会变化 旧提交进度必须清空
        submittedText.value = ''
        isRomajiModeEnabled.value = !isRomajiModeEnabled.value
        pendingInputText.value = ''
        clearInputReceiverValue()
        nextTick(focusInputReceiver)
    }

    const switchToKanaMode = () => {
        if (!isRomajiModeEnabled.value) {
            nextTick(focusInputReceiver)
            return
        }

        // 只从罗马字切回假名模式 复用 toggle 的清空提交和 pending 规则
        toggleRomajiMode()
    }

    const closePracticeInfoModal = () => {
        isPracticeInfoModalOpen.value = false
    }

    const handlePracticeToolAction = async (actionId: PracticeToolActionId) => {
        if (actionId === 'audio') {
            await playPracticeAudio()
            return
        }

        if (actionId === 'displayMode') {
            cycleDisplayMode()
            return
        }

        if (actionId === 'romaji') {
            toggleRomajiMode()
            return
        }

        if (actionId === 'info') {
            isPracticeInfoModalOpen.value = true
            return
        }
    }

    return {
        playPracticeAudio,
        cycleDisplayMode,
        toggleRomajiMode,
        switchToKanaMode,
        closePracticeInfoModal,
        handlePracticeToolAction,
    }
}
