<script setup lang="ts">
interface HomeFooterLink {
    label: string
    to: string
    icon: string
}

const footerLinks: readonly HomeFooterLink[] = [
    { label: 'Bilibili', to: '#', icon: '📺' },
    { label: 'GitHub 开源', to: 'https://github.com/MalloyManga/Ark_of_words', icon: '🐈‍⬛' },
    { label: 'PRTS Wiki', to: 'https://prts.wiki/', icon: '💠' },
]
</script>

<template>
    <footer
        class="relative z-10 w-full border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-950/50 backdrop-blur-md transition-colors duration-500">
        <div
            class="max-w-7xl mx-auto px-6 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                <span class="font-bold text-slate-700 dark:text-slate-300 transition-colors">Ark_of_words <span
                        class="text-sm font-normal text-slate-500 dark:text-slate-500 ml-2">by Malloy</span></span>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-md transition-colors">
                    本项目仅用于学习交流，禁止用于盈利。<br class="md:hidden" />所有素材均来自上海鹰角网络，版权归原权利方所有。
                </p>
            </div>

            <nav class="flex items-center gap-3">
                <a v-for="link in footerLinks" :key="link.label" :href="link.to" target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all shadow-sm hover:shadow">
                    <span>{{ link.icon }}</span>
                    <span>{{ link.label }}</span>
                </a>
            </nav>
        </div>
    </footer>
</template>
