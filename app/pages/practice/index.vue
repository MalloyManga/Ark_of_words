<script setup lang="ts">
import { practiceDifficultyOptions } from '~/constants/practiceDifficultyOptions'
</script>

<template>
    <main
        class="relative min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-8 text-slate-800 dark:text-slate-100 flex items-center justify-center overflow-hidden transition-colors duration-500">

        <!-- 氛围光晕背景 -->
        <div
            class="pointer-events-none absolute top-[10%] left-[20%] w-100 rounded-full bg-blue-300/20 dark:bg-blue-900/20 blur-[100px] transition-colors duration-500" />
        <div
            class="pointer-events-none absolute bottom-[10%] right-[20%] w-125 rounded-full bg-purple-300/20 dark:bg-purple-900/20 blur-[120px] transition-colors duration-500" />

        <section class="relative z-10 w-full max-w-4xl flex flex-col items-center">

            <!-- 顶部导航条 -->
            <div class="w-full flex items-center justify-between mb-12">
                <NuxtLink to="/"
                    class="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 hover:-translate-x-1 transition-all">
                    <IconBack class="w-6 h-6" />
                </NuxtLink>
            </div>

            <!-- 标题区 -->
            <div class="text-center mb-16">
                <p class="text-sm font-black uppercase tracking-widest text-blue-500 dark:text-cyan-500 mb-2">Select
                    Difficulty</p>
                <h1 class="text-4xl sm:text-5xl font-black tracking-tight">选择训练强度</h1>
            </div>

            <!-- 难度选择网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
                <PracticeDifficultyOptionCard v-for="option in practiceDifficultyOptions" :key="option.value"
                    :option="option" />
            </div>
        </section>
    </main>
</template>
