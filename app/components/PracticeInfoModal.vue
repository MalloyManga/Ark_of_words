<script setup lang="ts">
interface PracticeInfoItem {
    label: string
    value: string
}

interface PracticeInfoModalProps {
    isOpen: boolean
    title: string
    items: readonly PracticeInfoItem[]
}

const { isOpen, title, items } = defineProps<PracticeInfoModalProps>()

const emit = defineEmits<{
    close: []
}>()
</script>

<template>
    <!-- 只承接语音信息展示和关闭事件 具体数据仍由练习页统一计算 -->
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-5 py-6"
            role="presentation" @click.self="emit('close')">
            <section
                class="w-full max-w-xl rounded-2xl border-2 border-ink bg-cream p-5 text-left text-ink shadow-[6px_6px_0_var(--color-ink)]"
                role="dialog" aria-modal="true" aria-labelledby="practice-info-title">
                <div class="flex items-start justify-between gap-4 border-b-2 border-ink pb-4">
                    <div>
                        <p id="practice-info-title" class="font-zh-playful text-xl font-black">
                            {{ title }}
                        </p>
                    </div>
                    <button type="button"
                        class="nb-card nb-interactive inline-flex size-9 shrink-0 items-center justify-center text-ink"
                        aria-label="关闭语音信息" @click="emit('close')">
                        <IconClose class="size-5" />
                    </button>
                </div>

                <dl class="mt-4 grid gap-2">
                    <div v-for="item in items" :key="item.label"
                        class="grid gap-1 border-b-2 border-ink/10 px-1 py-3 last:border-b-0 sm:grid-cols-[7rem_1fr] sm:gap-4">
                        <dt class="font-romaji text-xs font-black uppercase tracking-widest text-coral">
                            {{ item.label }}
                        </dt>
                        <dd class="wrap-break-word font-zh-playful text-sm font-bold leading-6 text-ink-soft">
                            {{ item.value }}
                        </dd>
                    </div>
                </dl>
            </section>
        </div>
    </Teleport>
</template>
