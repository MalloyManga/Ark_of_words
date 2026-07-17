<script setup lang="ts">
import { operatorFrameBack, operatorFrameFront } from '~/constants/mockOperators'
import type { OperatorDisplayItem } from '~/types/operator'

interface SelectionGridProps {
    operators: readonly OperatorDisplayItem[]
    activeOperatorId?: string
    hasActiveOperator: boolean
}

defineProps<SelectionGridProps>()

const emit = defineEmits<{
    toggleOperator: [operatorId: string]
}>()
</script>

<template>
    <section class="min-w-0 flex flex-col">
        <div class="flex flex-col gap-1 mb-6">
            <p class="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-cyan-500">
                Custom Practice
            </p>
            <h1 class="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-800 dark:text-slate-100">
                自由配置练习
            </h1>
        </div>

        <div
            class="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-6 xl:grid-cols-8 transition-all duration-300"
            :class="hasActiveOperator ? '2xl:grid-cols-6' : '2xl:grid-cols-10'">
            <button v-for="operator in operators" :key="operator.id" type="button"
                class="group relative aspect-289/594 focus-visible:outline-none transition-transform duration-300 hover:-translate-y-1"
                :aria-pressed="activeOperatorId === operator.id" :aria-label="operator.displayName"
                @click="emit('toggleOperator', operator.id)">
                <span
                    class="pointer-events-none absolute left-[3.6%] top-[-12.5%] z-0 h-full w-[92%] overflow-hidden bg-transparent">
                    <img
                        class="pointer-events-none absolute bottom-0 left-0 z-0 w-full max-w-none select-none opacity-90 dark:opacity-70"
                        :src="operatorFrameBack" alt="" draggable="false">
                    <img class="pointer-events-none absolute z-10 select-none" :style="operator.portraitCrop"
                        :src="operator.portrait" :alt="`${operator.displayName} portrait`" draggable="false">
                </span>

                <img
                    class="pointer-events-none absolute left-[-6.5%] top-0 z-20 w-[114%] max-w-none select-none drop-shadow-md opacity-95 dark:opacity-80"
                    :src="operatorFrameFront" alt="" draggable="false">

                <img class="pointer-events-none absolute left-[6%] top-[1%] z-30 w-[22%] select-none drop-shadow"
                    :src="operator.professionIconSrc" alt="" draggable="false">

                <span
                    class="pointer-events-none absolute bottom-[3%] right-[7%] z-30 text-right font-bold leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                    :class="hasActiveOperator ? 'text-[clamp(8px,0.8vw,14px)]' : 'text-[clamp(10px,1.2vw,16px)]'">
                    {{ operator.displayName }}
                </span>

                <span v-if="activeOperatorId === operator.id"
                    class="pointer-events-none absolute inset-0 z-40 rounded border-2 border-blue-500 dark:border-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] dark:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all" />
                <span
                    class="pointer-events-none absolute inset-0 z-40 rounded border-2 border-transparent group-hover:border-blue-300/50 dark:group-hover:border-cyan-300/30 transition-colors" />
            </button>
        </div>
    </section>
</template>
