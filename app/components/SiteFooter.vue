<script setup lang="ts">
import Bilibili from './icon/Bilibili.vue'
import Github from './icon/Github.vue'

interface FooterLink {
    label: string
    description?: string
    icon: Component
    href: string
}

const footerLinks: readonly FooterLink[] = [
    {
        label: 'B站',
        icon: Bilibili,
        href: '#',
    },
    {
        label: 'GitHub 开源',
        description: '源码 MIT',
        icon: Github,
        href: 'https://github.com/MalloyManga/Ark_of_words',
    },
]
</script>

<template>
    <footer class="px-5 pb-6 sm:px-8 lg:px-10">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p class="font-fredoka text-lg font-black tracking-normal text-emerald-950">
                    Ark_of_words
                </p>
                <p class="font-zh-playful mt-1 text-sm font-bold text-emerald-800">
                    作者 Malloy
                </p>
                <p class="font-zh-playful mt-2 max-w-2xl text-xs font-bold leading-5 text-emerald-700">
                    本项目仅用于学习交流 禁止用于盈利 所有素材均来自上海鹰角网络 版权归原权利方所有
                </p>
            </div>

            <nav class="flex flex-col gap-3 sm:flex-row" aria-label="项目相关链接">
                <a v-for="link in footerLinks" :key="link.label" :href="link.href"
                    class="group flex items-center gap-3 rounded-3xl border-2 border-emerald-950 bg-white px-4 py-3 text-emerald-950 shadow-[5px_5px_0_#86efac] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#86efac] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#86efac]">
                    <span
                        class="font-fredoka flex size-8 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-emerald-950">
                        <component :is="link.icon" />
                    </span>
                    <span>
                        <span class="font-zh-playful block text-sm font-black">
                            {{ link.label }}
                        </span>
                        <span class="font-zh-playful block text-xs font-bold text-emerald-700">
                            {{ link.description }}
                        </span>
                    </span>
                </a>
            </nav>
        </div>
    </footer>
</template>
