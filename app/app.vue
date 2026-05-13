<script setup lang="ts">
import wisadelImage from './assets/imgs/Wiš\'adel.png'
import AppButton from './components/AppButton.vue'
import FreeConfigCard from './components/FreeConfigCard.vue'
import PracticeStatsCard from './components/PracticeStatsCard.vue'

interface PracticeStats {
    bestCombo: number
    todayProgress: number
    operatorCount: number
}

const practiceStats: PracticeStats = {
    bestCombo: 24,
    todayProgress: 68,
    operatorCount: 312,
}
</script>

<template>
    <main class="min-h-screen overflow-hidden bg-[#effcf2] text-emerald-950">
        <NuxtRouteAnnouncer />

        <section class="relative min-h-screen px-5 py-6 sm:px-8 lg:px-10">
            <div
                class="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div class="relative z-10 py-8">
                    <div
                        class="inline-flex rounded-full border-2 border-emerald-900 bg-[#ddffe8] px-5 py-2 text-sm font-black text-emerald-900 shadow-[5px_5px_0_#064e3b]">
                        日语听写 / 假名输入 / 干员语音
                    </div>

                    <h1
                        class="font-fredoka mt-7 max-w-2xl text-5xl font-black leading-[0.95] tracking-normal text-emerald-950 sm:text-6xl lg:text-7xl">
                        Ark_of_words
                    </h1>

                    <p class="mt-6 max-w-xl text-lg font-medium leading-8 text-emerald-900 sm:text-xl">
                        听见熟悉的语音，敲下日语台词。把听写练习做成一张轻快的小课桌，而不是一份冷冰冰的试卷。
                    </p>

                    <div class="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <AppButton>
                            直接开始
                        </AppButton>
                        <AppButton variant="secondary" width="compact">
                            浏览干员
                        </AppButton>
                    </div>

                    <PracticeStatsCard :best-combo="practiceStats.bestCombo"
                        :today-progress="practiceStats.todayProgress" />

                    <FreeConfigCard :operator-count="practiceStats.operatorCount" />
                </div>

                <div class="relative z-10 min-h-155 lg:min-h-190">
                    <div class="absolute right-0 top-4 w-[min(92vw,640px)] lg:w-170">
                        <img class="ml-auto block max-h-190 w-full select-none object-contain drop-shadow-[0_30px_28px_rgba(6,78,59,0.28)]"
                            :src="wisadelImage" alt="Wiš'adel character artwork" draggable="false">
                    </div>

                    <div
                        class="absolute right-4 top-[70%] max-w-[min(86vw,420px)] rounded-4xl border-2 border-emerald-950 bg-white px-6 py-5 shadow-[9px_9px_0_#34d399] sm:right-8">
                        <p class="select-none text-sm font-black uppercase tracking-[0.18em] text-emerald-600">
                            作战中3
                        </p>
                        <div class="mt-2 min-h-11">
                            <span class="typewriter text-3xl font-black tracking-normal text-emerald-950 sm:text-4xl">
                                全員分あるから
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
.typewriter {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    border-right: 0.12em solid #10b981;
    animation:
        typewriter-loop 4.8s steps(12, end) infinite,
        caret 0.8s step-end infinite;
}

@keyframes typewriter-loop {

    0%,
    12% {
        width: 0;
    }

    42%,
    62% {
        width: 12.5ch;
    }

    92%,
    100% {
        width: 0;
    }
}

@keyframes caret {
    50% {
        border-color: transparent;
    }
}

@media (prefers-reduced-motion: reduce) {
    .typewriter {
        width: auto;
        animation: none;
    }
}
</style>
