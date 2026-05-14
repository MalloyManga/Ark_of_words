<script setup lang="ts">
interface TypewriterInfo {
    label: string
    text: string
}

interface TypewriterTextProps {
    lines: readonly TypewriterInfo[]
}

const { lines } = defineProps<TypewriterTextProps>()
const lineIndex = ref(0)
const displayCharCount = ref(0)
const isDeleting = ref(false)

const TYPE_SPEED_MS = 90
const DELETE_SPEED_MS = 45
const DELETE_INTERVAL_MS = 1200
const TEXT_INTERVAL_MS = 360

let timer: ReturnType<typeof setTimeout> | undefined
const fallbackLine: TypewriterInfo = {
    label: '',
    text: '',
}

const currentLineInfo = computed(() => lines[lineIndex.value] ?? lines[0] ?? fallbackLine)
// 使用 Array.from 按字符切分  避免日文和特殊符号被 UTF-16 下标截断
const currentCharacters = computed(() => Array.from(currentLineInfo.value.text))
const displayedText = computed(() => currentCharacters.value.slice(0, displayCharCount.value).join(''))

const clearTimer = () => {
    if (timer) {
        clearTimeout(timer)
        timer = undefined
    }
}
const queueStep = (delay: number) => {
    clearTimer()
    timer = setTimeout(runStep, delay)
}
// 小型状态机  输入完成后停留 TEXT_INTERVAL_MS  再删除并切到下一句
const runStep = () => {
    const textLength = currentCharacters.value.length

    if (isDeleting.value) {
        // 删除阶段
        if (displayCharCount.value > 0) {
            displayCharCount.value -= 1
            queueStep(DELETE_SPEED_MS)
            return
        }
        else {
            isDeleting.value = false
            lineIndex.value = (lineIndex.value + 1) % lines.length
            queueStep(TEXT_INTERVAL_MS)
            return
        }
    }
    else if (displayCharCount.value < textLength) {
        // 输入阶段
        displayCharCount.value += 1
        queueStep(TYPE_SPEED_MS)
        return
    }

    // 初始化挂载阶段 后续不走这里
    isDeleting.value = true
    queueStep(DELETE_INTERVAL_MS)
}

onMounted(() => {
    if (lines.length > 0) {
        queueStep(TEXT_INTERVAL_MS)
    }
})

onBeforeUnmount(clearTimer)
</script>

<template>
    <div class="max-w-[min(86vw,440px)] text-right">
        <p
            class="select-none text-sm font-black uppercase tracking-[0.18em] text-emerald-700 drop-shadow-[2px_2px_0_#ffffff]">
            {{ currentLineInfo.label }}
        </p>
        <div class="mt-2 min-h-32 sm:min-h-30">
            <span
                class="typewriter text-3xl font-black tracking-normal text-emerald-950 drop-shadow-[3px_3px_0_#ffffff] sm:text-4xl">
                {{ displayedText }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.typewriter {
    display: inline;
    overflow-wrap: anywhere;
    line-break: anywhere;
    border-right: 0.12em solid #10b981;
    animation: caret 0.8s step-end infinite;
}

@keyframes caret {
    50% {
        border-color: transparent;
    }
}

@media (prefers-reduced-motion: reduce) {
    .typewriter {
        animation: none;
    }
}
</style>
