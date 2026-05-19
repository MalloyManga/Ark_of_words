<script setup lang="ts">
import { homeTypewriterLines } from '~/constants/homeTypewriterLines'
import wisadelImage from '../assets/imgs/Wiš\'adel.png'

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

const heroIntro = {
    topic: '日语听写 / 干员语音 / 自动校队',
    title: 'Ark_of_words',
    description: '听见熟悉的语音 敲下日语台词 把听写练习做成一张轻快的小课桌 而不是一份冷冰冰的试卷(把这一条润色一下塞简介里 不要复制粘贴)',
} as const
</script>

<template>
    <main class="min-h-screen overflow-hidden bg-[#effcf2] text-emerald-950">
        <section class="relative min-h-[calc(100vh-16px)] px-5 py-6 sm:px-8 lg:px-10">
            <div class="relative mx-auto grid h-full w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div class="relative z-10 py-8">
                    <HeroTopicBadge :text="heroIntro.topic" />

                    <HeroIntro :description="heroIntro.description" :title="heroIntro.title" />

                    <div class="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <AppButton class="font-zh-playful" to="/practice">
                            直接开始
                        </AppButton>
                        <AppButton class="font-zh-playful" variant="secondary" width="compact" to="/operators">
                            浏览干员
                        </AppButton>
                    </div>

                    <PracticeStatsCard
                        :best-combo="practiceStats.bestCombo"
                        :today-progress="practiceStats.todayProgress"
                    />

                    <FreeConfigCard :operator-count="practiceStats.operatorCount" />
                </div>

                <div class="relative z-10 min-h-155 lg:min-h-190">
                    <div class="absolute right-0 top-4 w-[min(92vw,640px)] lg:w-170">
                        <img
                            class="ml-auto block max-h-190 w-full select-none object-contain drop-shadow-[0_30px_28px_rgba(6,78,59,0.28)]"
                            :src="wisadelImage"
                            alt="Wiš'adel character artwork"
                            draggable="false"
                        >
                    </div>

                    <div class="absolute right-4 top-[70%] sm:right-8">
                        <TypewriterText :lines="homeTypewriterLines" />
                    </div>
                </div>
            </div>
        </section>

        <div class="px-5 sm:px-8 lg:px-10">
            <div class="mx-auto h-1 w-full max-w-7xl overflow-hidden rounded-full bg-emerald-900/20" />
        </div>

        <SiteFooter />
    </main>
</template>
