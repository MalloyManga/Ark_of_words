interface PracticeInputReceiverOptions {
    isRomajiModeEnabled: Readonly<Ref<boolean>>
    normalizeInputText: (text: string) => string
    submitDirectRomajiInput: (inputElement: HTMLInputElement) => void
    confirmPendingInput: () => void
    rollbackSubmittedCharacter: () => void
    warnRomajiInputMethod: () => void
}

/**
 * 浏览器输入事件和 IME 状态
 */
export const usePracticeInputReceiver = ({
    isRomajiModeEnabled,
    normalizeInputText,
    submitDirectRomajiInput,
    confirmPendingInput,
    rollbackSubmittedCharacter,
    warnRomajiInputMethod,
}: PracticeInputReceiverOptions) => {
    const inputReceiverRef = useTemplateRef<HTMLInputElement>('inputReceiverRef')
    const pendingInputText = ref('') // 正在 IME 候选中 还没提交的文本
    const isComposingText = ref(false)
    const isWaitingForCompositionCommitSubmit = ref(false) // ？
    let compositionCommitSubmitTimer: number | undefined

    const focusInputReceiver = () => {
        inputReceiverRef.value?.focus()
    }

    const clearInputReceiverValue = () => {
        if (!inputReceiverRef.value) {
            return
        }
        inputReceiverRef.value.value = ''
    }

    /**
     * 假名模式下 读取 input 当前值 去掉空格后写入 pendingInputText 显示为 待确认: ${text}
     */
    const syncPendingInputElementValue = (inputElement: HTMLInputElement) => {
        const normalizedInputValue = normalizeInputText(inputElement.value)
        pendingInputText.value = normalizedInputValue

        if (!isComposingText.value && inputElement.value !== normalizedInputValue) {
            inputElement.value = normalizedInputValue
        }
    }

    /**
     * 隐藏 input 的 "@input" 入口 
     * 具体提交方式由当前输入模式分流
     */
    const syncPendingInputText = (event: Event) => {
        const inputElement = event.target
        if (!(inputElement instanceof HTMLInputElement)) {
            return
        }

        // 罗马字模式 直接提交给 submitDirectRomajiInput 处理
        if (isRomajiModeEnabled.value) {
            submitDirectRomajiInput(inputElement)
            return
        }
        // 假名模式 只更新确认文本
        syncPendingInputElementValue(inputElement)
    }

    /**
     * compositionupdate 的 event.data 在部分浏览器里比 input.value 更新更早
     * event.data 通常就是输入法当前正在组合的候选文本
     * 部分浏览器 "@input"更新不够及时 这里作为兜底 尽量实时显示 “待确认：xxx”
     */
    const syncPendingCompositionText = (event: CompositionEvent) => {
        // compositionupdate 只会在假名模式下触发 罗马字模式下说明有问题 弹出提示
        if (isRomajiModeEnabled.value) {
            pendingInputText.value = ''
            clearInputReceiverValue()
            warnRomajiInputMethod()
            return
        }

        // 假名输入模式下 优先读取 inputElement.value
        // inputElement.value 不存在(未及时更新)的时间 使用更早更新的 event.data
        const inputElement = event.target
        if (inputElement instanceof HTMLInputElement && inputElement.value) {
            pendingInputText.value = normalizeInputText(inputElement.value)
            return
        }
        pendingInputText.value = normalizeInputText(event.data)
    }

    /**
     * 输入法候选词确认时 不同系统暴露给页面的事件顺序并不一致
     * 有些输入法不会触发可识别的 Enter keydown 只会派发 compositionend 和随后的 input
     * 因此这里把检测排到下一轮任务中 先等待最终候选写入非受控 input 再读取并提交
     * 若后续浏览器又派发了一次普通 Enter keydown confirmPendingInput 会因文本已清空而直接跳过
     */
    const confirmPendingInputAfterCompositionCommit = () => {
        if (compositionCommitSubmitTimer !== undefined) {
            window.clearTimeout(compositionCommitSubmitTimer)
        }

        isWaitingForCompositionCommitSubmit.value = true
        compositionCommitSubmitTimer = window.setTimeout(() => {
            compositionCommitSubmitTimer = undefined
            isWaitingForCompositionCommitSubmit.value = false
            const inputElement = inputReceiverRef.value

            if (inputElement) {
                syncPendingInputElementValue(inputElement)
            }

            confirmPendingInput()
        }, 0)
    }

    /**
     * IME 开始组合输入 罗马字模式下弹出提示
     */
    const handleCompositionStart = () => {
        if (isRomajiModeEnabled.value) {
            isComposingText.value = false
            pendingInputText.value = ''
            clearInputReceiverValue()
            warnRomajiInputMethod()
            return
        }

        isComposingText.value = true
    }

    /**
     * 组合中更新 pending 文本
     */
    const handleCompositionUpdate = (event: CompositionEvent) => {
        syncPendingCompositionText(event)
    }

    /**
     * 组合结束 假名模式下同步最终 input 的值 之后提交
     */
    const handleCompositionEnd = (event: CompositionEvent) => {
        if (isRomajiModeEnabled.value) {
            isComposingText.value = false
            pendingInputText.value = ''
            clearInputReceiverValue()
            warnRomajiInputMethod()
            return
        }

        isComposingText.value = false
        syncPendingInputText(event)
        confirmPendingInputAfterCompositionCommit()
    }

    const handleInputKeydown = (event: KeyboardEvent) => {
        // 日文模式且非 composing 时阻止输入空格
        if (
            !isRomajiModeEnabled.value
            && (event.key === ' ' || event.code === 'Space')
            && !isComposingText.value
            && !event.isComposing
        ) {
            event.preventDefault()
            return
        }

        // 如果没有 pending，就回退已提交字符
        if (event.key === 'Backspace') {
            if (!pendingInputText.value) {
                event.preventDefault()
            }

            rollbackSubmittedCharacter()
            return
        }

        // 过滤掉非 Enter 的
        if (event.key !== 'Enter') {
            return
        }
        // composition 正在提交时，阻止重复 Enter
        if (isWaitingForCompositionCommitSubmit.value) {
            event.preventDefault()
            return
        }

        if (isComposingText.value || event.isComposing) {
            return
        }

        event.preventDefault()
        confirmPendingInput()
    }

    onBeforeUnmount(() => {
        if (compositionCommitSubmitTimer !== undefined) {
            window.clearTimeout(compositionCommitSubmitTimer)
        }
    })

    return {
        inputReceiverRef,
        pendingInputText,
        isComposingText: readonly(isComposingText),
        isWaitingForCompositionCommitSubmit: readonly(isWaitingForCompositionCommitSubmit),
        focusInputReceiver,
        clearInputReceiverValue,
        syncPendingInputElementValue,
        syncPendingInputText,
        syncPendingCompositionText,
        confirmPendingInputAfterCompositionCommit,
        handleCompositionStart,
        handleCompositionUpdate,
        handleCompositionEnd,
        handleInputKeydown,
    }
}
