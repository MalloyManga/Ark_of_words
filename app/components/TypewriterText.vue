<script setup lang="ts">
import {
    DELETE_SPEED_MS,
    HOLD_AFTER_TYPED_MS,
    HOLD_BEFORE_NEXT_LINE_MS,
    TYPE_SPEED_MS,
    type TypewriterLineInfo,
} from '~/constants/homeTypewriterLines'

interface TypewriterTextProps {
    lines: readonly TypewriterLineInfo[]
}

const { lines } = defineProps<TypewriterTextProps>()
const activeLineIndex = ref(0)
const visibleCharacterCount = ref(0)
const isDeletingCurrentLine = ref(false)

let typewriterTimer: ReturnType<typeof setTimeout> | undefined
const fallbackLine: TypewriterLineInfo = {
    label: '',
    text: '',
}

const activeLineInfo = computed(() => lines[activeLineIndex.value] ?? lines[0] ?? fallbackLine)

// 使用 Array.from 按用户能看到的字符切分
const activeLineCharacters = computed(() => Array.from(activeLineInfo.value.text))
const visibleText = computed(() => activeLineCharacters.value.slice(0, visibleCharacterCount.value).join(''))
// 每句台词可以单独控制输入 删除和停留时长  未配置时回退到全局默认值
const activeLineTypingSpeedMs = computed(() => activeLineInfo.value.typingSpeedMs ?? TYPE_SPEED_MS)
const activeLineDeletingSpeedMs = computed(() => activeLineInfo.value.deletingSpeedMs ?? DELETE_SPEED_MS)
const activeLineHoldAfterTypedMs = computed(() => activeLineInfo.value.holdAfterTypedMs ?? HOLD_AFTER_TYPED_MS)
const activeLineHoldBeforeNextLineMs = computed(() => activeLineInfo.value.holdBeforeNextLineMs ?? HOLD_BEFORE_NEXT_LINE_MS)

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
            queueNextTypewriterStep(activeLineHoldBeforeNextLineMs.value)
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
    queueNextTypewriterStep(activeLineHoldAfterTypedMs.value)
}

onMounted(() => {
    if (lines.length > 0) {
        queueNextTypewriterStep(activeLineHoldBeforeNextLineMs.value)
    }
})

onBeforeUnmount(clearTypewriterTimer)
</script>

<template>
    <div class="mt-4 text-left">
        <span class="nb-sticker bg-butter font-zh-playful text-xs text-ink">
            {{ activeLineInfo.label || 'VOICE' }}
        </span>
        <p class="typewriter-bubble mt-3 text-2xl font-black leading-[1.4] tracking-normal text-ink sm:text-3xl font-zh-playful">
            <span>{{ visibleText }}</span><span class="typewriter-caret" aria-hidden="true" />
        </p>
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
    background-color: #ff5b2e;
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
