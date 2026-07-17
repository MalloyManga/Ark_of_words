<script setup lang="ts">
import type { PracticeDifficultyOption } from '~/constants/practiceDifficultyOptions'

interface DifficultyOptionCardProps {
    option: PracticeDifficultyOption
}

const { option } = defineProps<DifficultyOptionCardProps>()

const optionDestination = computed(() => {
    return option.value === 'custom'
        ? '/operators'
        : `/practice/session?difficulty=${option.value}`
})
</script>

<template>
    <NuxtLink :to="optionDestination"
        class="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 p-6 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
        <div
            :class="`absolute inset-0 opacity-0 group-hover:opacity-10 bg-linear-to-br ${option.gradient} dark:opacity-0 dark:group-hover:opacity-20 transition-opacity duration-500`">
        </div>

        <div
            :class="`flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br ${option.gradient} ${option.darkGradient} text-2xl shadow-lg text-white transition-colors`">
            {{ option.icon }}
        </div>

        <div class="flex-1">
            <h2
                class="text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                {{ option.label }}
            </h2>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                {{ option.desc }}
            </p>
        </div>

        <div
            class="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">
            <IconChevronRight class="w-6 h-6" :stroke-width="3" />
        </div>
    </NuxtLink>
</template>
