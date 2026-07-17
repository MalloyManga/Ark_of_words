<script setup lang="ts">
import Bilibili from './icon/Bilibili.vue'
import Github from './icon/Github.vue'

interface FooterLink {
    label: string
    description?: string
    icon?: Component
    iconText?: string
    to: string
}

const footerLinks: readonly FooterLink[] = [
    {
        label: '劈里啪啦',
        icon: Bilibili,
        to: '#',
    },
    {
        label: 'GitHub 开源',
        description: '源码 MIT',
        icon: Github,
        to: 'https://github.com/MalloyManga/Ark_of_words',
    },
    {
        label: 'PRTS Wiki',
        description: '资料来源参考',
        iconText: 'PRTS',
        to: 'https://prts.wiki/',
    },
]
</script>

<template>
    <footer class="relative z-10 mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div class="flex flex-col gap-6 border-t-2 border-ink pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p class="font-fredoka text-lg font-black tracking-tight text-ink">
                    Ark_of_words
                </p>
                <p class="font-zh-playful mt-1 text-sm font-bold text-ink-soft">
                    作者 Malloy
                </p>
                <p class="font-zh-playful mt-2 max-w-2xl text-xs font-medium leading-5 text-ink-soft/70">
                    本项目仅用于学习交流 禁止用于盈利 所有素材均来自上海鹰角网络 版权归原权利方所有
                </p>
            </div>

            <nav class="flex flex-col gap-3 sm:flex-row" aria-label="项目相关链接">
                <NuxtLink v-for="link in footerLinks" :key="link.label" :to="link.to" target="_blank"
                    rel="noopener noreferrer"
                    class="nb-card nb-interactive group flex items-center gap-3 px-4 py-3 text-ink">
                    <span
                        class="font-fredoka flex size-8 shrink-0 items-center justify-center text-sm font-black text-coral">
                        <component :is="link.icon" v-if="link.icon" />
                        <span v-else>{{ link.iconText }}</span>
                    </span>
                    <span>
                        <span class="font-zh-playful block text-sm font-black">
                            {{ link.label }}
                        </span>
                        <span class="font-zh-playful block text-xs font-medium text-ink-soft/70">
                            {{ link.description }}
                        </span>
                    </span>
                </NuxtLink>
            </nav>
        </div>
    </footer>
</template>
