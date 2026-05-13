<script setup lang="ts">
interface FreeConfigCardProps {
    operatorCount: number
}

const { operatorCount } = defineProps<FreeConfigCardProps>()
</script>

<template>
    <article
        class="mt-5 max-w-xl rounded-4xl border-2 border-[#1d4ed8] bg-[#dbeafe] p-5 shadow-[9px_9px_0_#60a5fa] sm:p-6">
        <p class="font-fredoka text-sm font-black uppercase tracking-[0.16em] text-[#1d4ed8]">
            free config
        </p>
        <div class="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h2 class="text-3xl font-black text-[#172554]">
                    自由配置
                </h2>
                <p class="mt-2 text-sm font-bold leading-6 text-[#1e3a8a]">
                    可按干员 难度 语音类型自由组合练习入口
                </p>
            </div>
            <p
                class="rounded-3xl border-2 border-[#1d4ed8] bg-white px-4 py-3 text-sm font-black text-[#172554] shadow-[5px_5px_0_#93c5fd]">
                目前收录 <span class="font-fredoka text-xl">{{ operatorCount }}</span> 位干员
            </p>
        </div>
    </article>
</template>
