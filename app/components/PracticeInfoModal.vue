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
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/30 px-5 py-6"
            role="presentation" @click.self="emit('close')">
            <section
                class="w-full max-w-xl rounded-lg border border-emerald-200 bg-white p-5 text-left text-emerald-950 shadow-lg"
                role="dialog" aria-modal="true" aria-labelledby="practice-info-title">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p id="practice-info-title" class="font-mono text-xl font-black">
                            {{ title }}
                        </p>
                    </div>
                    <button type="button"
                        class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-white text-lg font-black text-emerald-700 transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-50 active:bg-emerald-100"
                        aria-label="关闭语音信息" @click="emit('close')">
                        <IconClose class="size-5" />
                    </button>
                </div>

                <dl class="mt-5 grid gap-3">
                    <div v-for="item in items" :key="item.label"
                        class="grid gap-1 border-b border-emerald-100 px-1 py-3 last:border-b-0 sm:grid-cols-[7rem_1fr] sm:gap-4">
                        <dt class="font-mono text-sm font-black text-emerald-700">
                            {{ item.label }}
                        </dt>
                        <dd class="wrap-break-word font-mono text-sm font-bold leading-6 text-emerald-950/80">
                            {{ item.value }}
                        </dd>
                    </div>
                </dl>
            </section>
        </div>
    </Teleport>
</template>
