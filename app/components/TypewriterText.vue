<script setup lang="ts">
import type { TypewriterLineInfo } from '~/constants/homeTypewriterLines'

interface TypewriterTextProps {
    lines: readonly TypewriterLineInfo[]
}

const { lines } = defineProps<TypewriterTextProps>()
const activeLineIndex = ref(0)
const visibleCharacterCount = ref(0)
const isDeletingCurrentLine = ref(false)

const TYPE_SPEED_MS = 90
const DELETE_SPEED_MS = 45
const HOLD_AFTER_TYPED_MS = 1200
const HOLD_BEFORE_NEXT_LINE_MS = 360

let typewriterTimer: ReturnType<typeof setTimeout> | undefined
const fallbackLine: TypewriterLineInfo = {
    label: '',
    text: '',
}

const activeLineInfo = computed(() => lines[activeLineIndex.value] ?? lines[0] ?? fallbackLine)

// 使用 Array.from 按用户能看到的字符切分
const activeLineCharacters = computed(() => Array.from(activeLineInfo.value.text))
const visibleText = computed(() => activeLineCharacters.value.slice(0, visibleCharacterCount.value).join(''))
// 每句台词可以单独控制输入和删除速度  未配置时回退到全局默认速度
const activeLineTypingSpeedMs = computed(() => activeLineInfo.value.typingSpeedMs ?? TYPE_SPEED_MS)
const activeLineDeletingSpeedMs = computed(() => activeLineInfo.value.deletingSpeedMs ?? DELETE_SPEED_MS)

const clearTypewriterTimer = () => {
    if (typewriterTimer) {
        clearTimeout(typewriterTimer)
        typewriterTimer = undefined
    }
}
const queueNextTypewriterStep = (delay: number) => {
    clearTypewriterTimer()
    typewriterTimer = setTimeout(runTypewriterStep, delay)
}
// typewriter 状态机
// 1 输入当前台词  每次增加一个可见字符
// 2 整句显示后停留一小段时间  让用户有足够时间阅读
// 3 删除当前台词  每次减少一个可见字符  删除速度同样支持按台词覆盖
// 4 删除完成后切换到下一句  然后重新开始输入
const runTypewriterStep = () => {
    const activeLineLength = activeLineCharacters.value.length

    if (isDeletingCurrentLine.value) {
        // 删除阶段  每次排队时读取当前台词速度  避免切换台词后沿用上一句配置
        if (visibleCharacterCount.value > 0) {
            visibleCharacterCount.value -= 1
            queueNextTypewriterStep(activeLineDeletingSpeedMs.value)
            return
        }
        else {
            isDeletingCurrentLine.value = false
            activeLineIndex.value = (activeLineIndex.value + 1) % lines.length
            queueNextTypewriterStep(HOLD_BEFORE_NEXT_LINE_MS)
            return
        }
    }
    else if (visibleCharacterCount.value < activeLineLength) {
        // 输入阶段  默认速度保持旧行为  单句配置只影响当前台词
        visibleCharacterCount.value += 1
        queueNextTypewriterStep(activeLineTypingSpeedMs.value)
        return
    }

    // 完整显示阶段  下一步进入删除状态
    isDeletingCurrentLine.value = true
    queueNextTypewriterStep(HOLD_AFTER_TYPED_MS)
}

onMounted(() => {
    if (lines.length > 0) {
        queueNextTypewriterStep(HOLD_BEFORE_NEXT_LINE_MS)
    }
})

onBeforeUnmount(clearTypewriterTimer)
</script>

<template>
    <div class="max-w-[min(86vw,680px)] text-right">
        <p class="font-zh-playful select-none text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
            <span class="inline-block rounded-full bg-white/85 px-3 py-1 shadow-[3px_3px_0_#86efac]">
                {{ activeLineInfo.label }}
            </span>
        </p>
        <div class="mt-3 flex justify-end">
            <span
                class="typewriter-bubble inline-block max-w-full rounded-2xl bg-white/88 px-3 py-1 text-left text-3xl font-black leading-[1.35] tracking-normal text-emerald-950 shadow-[4px_4px_0_#86efac] ring-2 ring-white/90 sm:text-4xl">
                <span>{{ visibleText }}</span><span class="typewriter-caret" aria-hidden="true" />
            </span>
        </div>
    </div>
</template>

<style scoped>
.typewriter-bubble {
    overflow-wrap: break-word;
    word-break: normal;
}

.typewriter-caret {
    display: inline-block;
    width: 0.12em;
    height: 0.95em;
    margin-left: 0.08em;
    background-color: #10b981;
    vertical-align: -0.08em;
    animation: caret 0.8s step-end infinite;
}

@keyframes caret {
    50% {
        opacity: 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .typewriter-caret {
        animation: none;
    }
}
</style>
