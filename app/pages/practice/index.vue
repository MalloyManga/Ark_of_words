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
        classes: 'bg-mint text-cream',
    },
    {
        value: 'normal',
        label: '中等',
        classes: 'bg-butter text-ink',
    },
    {
        value: 'hard',
        label: '困难',
        classes: 'bg-coral text-cream',
    },
    {
        value: 'custom',
        label: '自由配置',
        classes: 'bg-indigo text-cream',
    },
] as const
</script>

<template>
    <main class="relative min-h-screen overflow-hidden bg-paper px-5 py-6 text-ink sm:px-8 lg:px-10">
        <div class="pointer-events-none fixed inset-0 nb-dots" aria-hidden="true" />
        <section class="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-2xl flex-col justify-center">
            <NuxtLink to="/"
                class="nb-card nb-interactive absolute left-0 top-4 inline-flex size-12 items-center justify-center text-ink"
                aria-label="返回首页">
                <IconBack class="size-5" />
            </NuxtLink>

            <div class="mb-8 text-center">
                <p class="font-romaji text-xs font-black uppercase tracking-widest text-ink-soft">select difficulty</p>
                <h1 class="font-zh-playful mt-2 text-4xl font-black">选择难度</h1>
            </div>

            <div class="flex w-full flex-col gap-5">
                <NuxtLink v-for="option in difficultyOptions" :key="option.value"
                    :to="`/practice/session?difficulty=${option.value}`"
                    class="nb-card nb-interactive font-zh-playful flex h-16 items-center justify-center text-2xl font-black"
                    :class="option.classes">
                    {{ option.label }}
                </NuxtLink>
            </div>
        </section>
    </main>
</template>
