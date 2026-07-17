<script setup lang="ts">
interface HomeHeaderProps {
    isDarkMode: boolean
}

defineProps<HomeHeaderProps>()

const emit = defineEmits<{
    toggleTheme: []
}>()
</script>

<template>
    <header class="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div class="flex items-center gap-3 cursor-pointer group">
            <div
                class="flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/30 dark:shadow-cyan-900/50 group-hover:scale-110 transition-transform duration-300">
                A
            </div>
            <div class="flex flex-col">
                <span
                    class="font-black text-xl tracking-tight text-slate-800 dark:text-slate-100 transition-colors">Ark_of_words</span>
                <span
                    class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Operator
                    Voice Terminal</span>
            </div>
        </div>

        <nav class="hidden md:flex items-center gap-6 font-medium text-sm text-slate-500 dark:text-slate-400">
            <NuxtLink to="/practice" class="hover:text-blue-500 dark:hover:text-cyan-400 transition-colors">开始听写
            </NuxtLink>
            <NuxtLink to="/operators" class="hover:text-blue-500 dark:hover:text-cyan-400 transition-colors">干员图鉴
            </NuxtLink>

            <div class="w-px h-4 bg-slate-300 dark:bg-slate-700 transition-colors"></div>

            <button
                class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-cyan-400 transition-all"
                aria-label="Toggle Dark Mode" @click="emit('toggleTheme')">
                <IconSun v-if="isDarkMode" class="w-4 h-4" />
                <IconMoon v-else class="w-4 h-4" />
            </button>
        </nav>
    </header>
</template>
