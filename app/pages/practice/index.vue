<script setup lang="ts">
import type { PracticeDifficulty } from '~/constants/practiceDifficulties'

interface DifficultyOption {
    value: PracticeDifficulty
    label: string
    classes: string
}

const difficultyOptions: readonly DifficultyOption[] = [
    {
        value: 'easy',
        label: '简单',
        classes: 'border-[#1d4ed8] bg-[#dbeafe] text-[#172554] shadow-[8px_8px_0_#60a5fa] hover:shadow-[5px_5px_0_#60a5fa] active:shadow-[2px_2px_0_#60a5fa]',
    },
    {
        value: 'normal',
        label: '中等',
        classes: 'border-[#a16207] bg-[#fef3c7] text-[#422006] shadow-[8px_8px_0_#fbbf24] hover:shadow-[5px_5px_0_#fbbf24] active:shadow-[2px_2px_0_#fbbf24]',
    },
    {
        value: 'hard',
        label: '困难',
        classes: 'border-[#b91c1c] bg-[#fee2e2] text-[#450a0a] shadow-[8px_8px_0_#f87171] hover:shadow-[5px_5px_0_#f87171] active:shadow-[2px_2px_0_#f87171]',
    },
    {
        value: 'custom',
        label: '自由配置',
        classes: 'border-[#047857] bg-[#ccfbf1] text-[#042f2e] shadow-[8px_8px_0_#2dd4bf] hover:shadow-[5px_5px_0_#2dd4bf] active:shadow-[2px_2px_0_#2dd4bf]',
    },
] as const
</script>

<template>
    <main class="min-h-screen bg-[#effcf2] px-5 py-6 text-emerald-950 sm:px-8 lg:px-10">
        <section class="relative mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-7xl items-center justify-center">
            <NuxtLink to="/"
                class="absolute left-0 top-0 inline-flex size-12 items-center justify-center rounded-2xl border-2 border-emerald-950 bg-white text-emerald-950 shadow-[5px_5px_0_#86efac] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#86efac] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#86efac]"
                aria-label="返回首页">
                <IconBack class="size-5" />
            </NuxtLink>

            <div class="flex w-full max-w-xl flex-col gap-5">
                <NuxtLink v-for="option in difficultyOptions" :key="option.value"
                    :to="`/practice/session?difficulty=${option.value}`"
                    class="font-zh-playful flex h-16 items-center justify-center rounded-3xl border-2 text-2xl font-black transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-2 active:translate-y-2"
                    :class="option.classes">
                    {{ option.label }}
                </NuxtLink>
            </div>
        </section>
    </main>
</template>
