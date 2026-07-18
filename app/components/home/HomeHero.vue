<script setup lang="ts">
import wisadelImage from '../../assets/imgs/Wiš\'adel.png'
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
        <div class="flex flex-col items-start gap-6 pt-10 lg:pt-0">
            <div
                class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-800/80 shadow-sm dark:shadow-none text-xs font-bold text-blue-500 dark:text-cyan-400 tracking-wide transition-colors">
                <span class="relative flex h-2 w-2">
                    <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-cyan-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-cyan-500"></span>
                </span>
                LISTEN · TYPE · LEARN
            </div>

            <h1
                class="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-slate-800 dark:text-slate-100 transition-colors">
                听干员语音 <br />
                <span
                    class="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-400 dark:from-cyan-400 dark:to-blue-500">
                    敲日语台词。
                </span>
            </h1>

            <p
                class="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-medium transition-colors">
                告别冷冰冰的语言试卷。在这里，每一次敲击键盘，都是与喜爱干员的一次灵魂共鸣。结合自然语言解析与K歌级高亮，让你的日语学习变成一场轻快的游戏。（把这一条润色一下塞简介里 不要复制粘贴）
            </p>

            <div class="flex flex-wrap items-center gap-4 mt-4">
                <NuxtLink to="/practice"
                    class="relative overflow-hidden group px-8 py-4 rounded-2xl bg-slate-800 dark:bg-cyan-50 text-white dark:text-cyan-950 font-bold text-lg shadow-xl shadow-slate-800/20 dark:shadow-cyan-400/20 hover:-translate-y-1 transition-all duration-300">
                    <div
                        class="absolute inset-0 w-full h-full bg-linear-to-r from-blue-500 to-cyan-500 dark:from-cyan-300 dark:to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <span class="relative flex items-center gap-2 group-hover:text-white transition-colors">
                        开始练习
                        <IconChevronsRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </NuxtLink>

                <NuxtLink to="/operators"
                    class="px-8 py-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-bold text-lg shadow-sm hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    浏览干员库
                </NuxtLink>
            </div>
        </div>

        <div class="relative w-full h-full flex items-center justify-center min-h-100">
            <div
                class="absolute w-[80%] h-[80%] rounded-full border-2 border-dashed border-blue-200/50 dark:border-cyan-700/40 animate-[spin_60s_linear_infinite] transition-colors">
            </div>
            <div
                class="absolute w-[60%] h-[60%] rounded-full bg-linear-to-tr from-blue-100/40 to-cyan-100/40 dark:from-cyan-900/30 dark:to-blue-900/30 blur-2xl transition-colors">
            </div>

            <span
                class="absolute top-10 right-10 text-4xl text-blue-300/40 dark:text-cyan-400/20 font-black floating-slow select-none transition-colors">あ</span>
            <span
                class="absolute bottom-20 left-4 text-5xl text-indigo-300/30 dark:text-indigo-400/20 font-black floating-slow delay-150 select-none transition-colors">キ</span>
            <span
                class="absolute top-1/2 right-4 text-3xl text-cyan-300/40 dark:text-blue-400/20 font-black floating-slow delay-300 select-none transition-colors">ル</span>

            <img :src="wisadelImage" alt="Wiš'adel 立绘" draggable="false"
                class="relative z-10 w-full max-w-125 object-contain drop-shadow-2xl dark:drop-shadow-[0_20px_40px_rgba(34,211,238,0.15)] floating select-none transition-all duration-500">

            <div
                class="absolute bottom-4 right-4 z-20 px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-xl shadow-blue-900/5 dark:shadow-black/50 flex flex-col gap-1 floating-slow transition-colors">
                <span
                    class="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Featured
                    Operator</span>
                <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">Wiš'adel</span>
                    <span
                        class="px-2 py-0.5 rounded-md bg-amber-400 dark:bg-amber-500 text-white text-[10px] font-bold">6★</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.floating {
    animation: float 6s ease-in-out infinite;
}

.floating-slow {
    animation: float 8s ease-in-out infinite;
}

.delay-150 {
    animation-delay: 1.5s;
}

.delay-300 {
    animation-delay: 3s;
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-15px);
    }

    100% {
        transform: translateY(0px);
    }
}
</style>
