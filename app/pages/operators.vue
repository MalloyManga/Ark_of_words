<script setup lang="ts">
const placeholderOperatorCount = 312
</script>

<template>
    <main class="min-h-screen bg-[#effcf2] px-5 py-6 text-emerald-950 sm:px-8 lg:px-10">
        <section class="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-5xl flex-col justify-center">
            <NuxtLink to="/"
                class="font-fredoka inline-flex size-12 items-center justify-center rounded-2xl border-2 border-emerald-950 bg-white text-3xl font-black shadow-[5px_5px_0_#86efac] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#86efac] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#86efac]"
                aria-label="返回首页">
                <IconBack class="size-5" />
            </NuxtLink>

            <article
                class="mt-10 rounded-4xl border-2 border-[#1d4ed8] bg-[#dbeafe] p-7 shadow-[9px_9px_0_#60a5fa] sm:p-10">
                <p class="font-fredoka text-sm font-black uppercase tracking-[0.16em] text-[#1d4ed8]">
                    operator catalog
                </p>
                <h1 class="font-zh-playful mt-4 text-4xl font-black leading-tight text-[#172554] sm:text-6xl">
                    干员浏览页占位
                </h1>
                <p class="font-zh-playful mt-5 max-w-2xl text-lg font-bold leading-8 text-[#1e3a8a]">
                    当前阶段先保证首页按钮不会进入断链 后续会在这里接入干员目录和语音筛选
                </p>
                <p
                    class="font-zh-playful mt-8 inline-flex rounded-3xl border-2 border-[#1d4ed8] bg-white px-5 py-4 text-sm font-black text-[#172554] shadow-[5px_5px_0_#93c5fd]">
                    预计收录 <span class="font-fredoka mx-1 text-xl">{{ placeholderOperatorCount }}</span> 位干员
                </p>
            </article>
        </section>
    </main>
</template>
