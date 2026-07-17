<script setup lang="ts">
import { homeTypewriterLines } from '~/constants/homeTypewriterLines'
import wisadelImage from '../assets/imgs/Wiš\'adel.png'

interface HomeStat {
    value: string
    label: string
    accentClass: string
}

// 首页 HUD 数据 纯展示 后续接入真实练习记录
const homeStats: readonly HomeStat[] = [
    { value: '24', label: '最高连击', accentClass: 'text-coral' },
    { value: '68%', label: '今日进度', accentClass: 'text-indigo' },
    { value: '312', label: '收录干员', accentClass: 'text-mint' },
]

// 顶部跑马灯标语 重复两份保证无缝滚动
const marqueeWords = ['听写练习', '干员语音', '日语输入', '罗马字', '假名', '原型还原', 'PRTS']

const heroCopy = {
    kicker: 'listen · type · learn',
    title: 'Ark_of_words',
    subtitle: '听干员语音 敲日语台词',
    description: '把听写练习做成一张轻快的小课桌 而不是一份冷冰冰的试卷',
} as const
</script>

<template>
    <div class="relative min-h-screen overflow-hidden bg-paper text-ink">
        <!-- 点阵底纹 -->
        <div class="pointer-events-none fixed inset-0 nb-dots" aria-hidden="true" />

        <!-- 顶部跑马灯 -->
        <div class="relative overflow-hidden border-b-2 border-ink bg-coral text-cream">
            <div class="nb-marquee-track py-2">
                <span v-for="group in 2" :key="group" class="flex items-center">
                    <span v-for="word in marqueeWords" :key="`${group}-${word}`"
                        class="font-romaji flex items-center text-sm font-black uppercase tracking-widest">
                        <span class="px-4">{{ word }}</span>
                        <span class="text-butter">✦</span>
                    </span>
                </span>
            </div>
        </div>

        <!-- 顶栏 只留品牌 导航入口已由下方 bento 卡承担 减少重复 -->
        <header class="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
            <div class="flex items-center gap-2.5">
                <span
                    class="font-fredoka flex size-9 rotate-3 items-center justify-center rounded-xl border-2 border-ink bg-butter text-lg font-black shadow-[2px_2px_0_var(--color-ink)]">
                    A
                </span>
                <span class="font-fredoka text-lg font-black tracking-tight">Ark_of_words</span>
            </div>
            <span class="font-romaji hidden text-xs font-black uppercase tracking-widest text-ink-soft sm:block">
                日语听写练习终端
            </span>
        </header>

        <!-- 主体 bento 网格 立绘卡纵向跨满右侧 消除底部空白 -->
        <main class="relative z-10 mx-auto max-w-6xl px-5 pb-16 sm:px-8">
            <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">

                <!-- 主标题卡 墨黑大卡 -->
                <section
                    class="relative overflow-hidden rounded-[1.5rem] border-2 border-ink bg-ink p-7 text-cream shadow-[6px_6px_0_var(--color-ink)] sm:p-10 lg:col-span-7">
                    <span class="nb-sticker bg-butter text-ink">
                        <span class="size-1.5 rounded-full bg-ink" />
                        <span class="font-romaji text-xs uppercase tracking-widest">{{ heroCopy.kicker }}</span>
                    </span>

                    <h1 class="font-fredoka mt-6 text-6xl font-black leading-[0.9] tracking-tight sm:text-7xl">
                        {{ heroCopy.title }}
                    </h1>
                    <p class="font-zh-playful mt-5 text-2xl font-bold text-butter">{{ heroCopy.subtitle }}</p>
                    <p class="font-zh-playful mt-4 max-w-md text-base font-medium leading-7 text-cream/70">
                        {{ heroCopy.description }}
                    </p>

                    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
                        <NuxtLink to="/practice"
                            class="nb-interactive font-zh-playful inline-flex h-14 items-center justify-center rounded-xl border-2 border-ink bg-coral px-8 text-lg font-black text-cream shadow-[4px_4px_0_var(--color-cream)] sm:px-10">
                            直接开始 →
                        </NuxtLink>
                        <NuxtLink to="/operators"
                            class="nb-interactive font-zh-playful inline-flex h-14 items-center justify-center rounded-xl border-2 border-cream bg-transparent px-8 text-lg font-black text-cream">
                            浏览干员
                        </NuxtLink>
                    </div>

                    <span
                        class="font-fredoka pointer-events-none absolute -bottom-10 -right-2 select-none text-[10rem] font-black leading-none text-cream/5">
                        あ
                    </span>
                </section>

                <!-- 立绘卡 纵向跨 3 行填满右侧 -->
                <section
                    class="relative flex flex-col overflow-hidden rounded-[1.5rem] border-2 border-ink bg-gradient-to-b from-indigo/20 via-paper to-paper-dim shadow-[6px_6px_0_var(--color-ink)] lg:col-span-5 lg:row-span-4">
                    <div class="flex items-center justify-between px-5 pt-4">
                        <span class="font-romaji text-xs font-black uppercase tracking-widest text-ink-soft">
                            featured op
                        </span>
                        <span class="nb-sticker bg-mint px-3 py-1 text-xs text-cream">6★ CASTER</span>
                    </div>
                    <img class="mx-auto mt-auto block w-auto max-w-full object-contain"
                        :src="wisadelImage" alt="Wiš'adel 立绘" draggable="false">
                    <span
                        class="font-fredoka pointer-events-none absolute bottom-4 left-5 select-none text-3xl font-black text-ink">
                        Wiš'adel
                    </span>
                </section>

                <!-- 数据卡 三格 -->
                <section class="grid grid-cols-3 gap-5 lg:col-span-7">
                    <div v-for="stat in homeStats" :key="stat.label"
                        class="nb-card flex flex-col items-center justify-center px-2 py-5 text-center">
                        <span class="font-fredoka text-4xl font-black sm:text-5xl" :class="stat.accentClass">
                            {{ stat.value }}
                        </span>
                        <span class="font-zh-playful mt-1 text-xs font-bold text-ink-soft sm:text-sm">
                            {{ stat.label }}
                        </span>
                    </div>
                </section>

                <!-- 自由配置卡 -->
                <NuxtLink to="/operators"
                    class="nb-card nb-interactive group flex items-center justify-between gap-4 bg-indigo px-6 py-6 text-cream lg:col-span-7">
                    <div>
                        <p class="font-romaji text-xs font-black uppercase tracking-widest text-cream/70">free config</p>
                        <h2 class="font-zh-playful mt-1 text-2xl font-black">自由配置练习</h2>
                        <p class="font-zh-playful mt-1 text-sm font-medium text-cream/70">
                            按干员 难度 语音类型自由组合
                        </p>
                    </div>
                    <span
                        class="font-fredoka flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-cream text-2xl transition-transform group-hover:translate-x-1">
                        →
                    </span>
                </NuxtLink>

                <!-- 语音预览 打字机 占左列底部 -->
                <section class="nb-card overflow-hidden p-6 lg:col-span-7">
                    <div class="flex items-center gap-2">
                        <span class="size-2 rounded-full bg-coral" />
                        <span class="font-romaji text-xs font-black uppercase tracking-widest text-ink-soft">
                            voice log preview
                        </span>
                    </div>
                    <TypewriterText :lines="homeTypewriterLines" />
                </section>
            </div>
        </main>

        <SiteFooter />
    </div>
</template>
