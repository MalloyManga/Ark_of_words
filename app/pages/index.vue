<script setup lang="ts">
const { isDarkMode, toggleThemePreference } = useThemePreference()
</script>

<template>
    <div
        class="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-cyan-900 overflow-hidden flex flex-col transition-colors duration-500">

        <!-- 环境光晕 (Ambient Glow) - 夜间模式下变成更深邃的霓虹光 -->
        <div
            class="pointer-events-none absolute top-[-10%] left-[-10%] size-125 rounded-full bg-blue-300/30 dark:bg-blue-900/30 blur-[100px] transition-colors duration-500" />
        <div
            class="pointer-events-none absolute bottom-[-10%] right-[-10%] size-160 rounded-full bg-indigo-300/20 dark:bg-indigo-900/20 blur-[120px] transition-colors duration-500" />
        <div
            class="pointer-events-none absolute top-[20%] right-[10%] size-75 rounded-full bg-cyan-200/40 dark:bg-cyan-800/30 blur-[80px] transition-colors duration-500" />

        <HomeHeader :is-dark-mode="isDarkMode" @toggle-theme="toggleThemePreference" />

        <!-- 核心主体内容 -->
        <main id="main-content" tabindex="-1"
            class="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 sm:px-8 pb-20">

            <HomeHero />
            <HomeFeatureGrid />

        </main>

        <HomeFooter />
    </div>
</template>
