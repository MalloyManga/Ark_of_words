import type { MaybeRefOrGetter } from 'vue'

interface OverlayFocusTrapOptions {
    isOpen: MaybeRefOrGetter<boolean>
    onEscapeClose: () => void
}

const focusableElementSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * 将键盘焦点限制在当前覆盖层中
 * 打开时聚焦第一个控件 关闭时恢复到触发元素
 */
export const useOverlayFocusTrap = ({
    isOpen,
    onEscapeClose,
}: OverlayFocusTrapOptions) => {
    const overlayPanelRef = useTemplateRef<HTMLElement>('overlayPanelRef')
    let previouslyFocusedElement: HTMLElement | undefined

    const getFocusableElements = (): readonly HTMLElement[] => {
        const overlayPanel = overlayPanelRef.value

        if (!overlayPanel) {
            return []
        }

        return [...overlayPanel.querySelectorAll<HTMLElement>(focusableElementSelector)].filter((element) => {
            return !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true'
        })
    }

    const focusOverlayStart = (): void => {
        const firstFocusableElement = getFocusableElements()[0]
        firstFocusableElement?.focus()

        if (!firstFocusableElement) {
            overlayPanelRef.value?.focus()
        }
    }

    const restorePreviousFocus = (): void => {
        if (previouslyFocusedElement && document.contains(previouslyFocusedElement)) {
            previouslyFocusedElement.focus()
        }

        previouslyFocusedElement = undefined
    }

    const handleOverlayKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            onEscapeClose()
            return
        }

        if (event.key !== 'Tab') {
            return
        }

        const focusableElements = getFocusableElements()

        if (focusableElements.length === 0) {
            event.preventDefault()
            overlayPanelRef.value?.focus()
            return
        }

        const firstFocusableElement = focusableElements[0]
        const lastFocusableElement = focusableElements[focusableElements.length - 1]

        if (!firstFocusableElement || !lastFocusableElement) {
            return
        }

        if (event.shiftKey && document.activeElement === firstFocusableElement) {
            event.preventDefault()
            lastFocusableElement.focus()
            return
        }

        if (!event.shiftKey && document.activeElement === lastFocusableElement) {
            event.preventDefault()
            firstFocusableElement.focus()
        }
    }

    watch(
        () => toValue(isOpen),
        async (isOverlayOpen) => {
            if (isOverlayOpen) {
                previouslyFocusedElement = document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : undefined
                await nextTick()
                focusOverlayStart()
                return
            }

            await nextTick()
            restorePreviousFocus()
        },
        { flush: 'post' },
    )

    onBeforeUnmount(restorePreviousFocus)

    return {
        overlayPanelRef,
        handleOverlayKeydown,
    }
}
