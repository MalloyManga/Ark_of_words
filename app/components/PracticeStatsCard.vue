<script setup lang="ts">
interface PracticeStatsCardProps {
    bestCombo: number
    todayProgress: number
}

const { bestCombo, todayProgress } = defineProps<PracticeStatsCardProps>()
</script>

<template>
    <article
        class="mt-10 max-w-xl rounded-4xl border-2 border-emerald-950 bg-[#d7ffe4] p-5 shadow-[9px_9px_0_#86efac] sm:p-6">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p class="font-fredoka text-sm font-black uppercase tracking-[0.16em] text-emerald-700">
                    practice progress
                </p>
                <p class="font-zh-playful mt-3 text-4xl font-black text-emerald-950">
                    {{ bestCombo }} 连击
                </p>
                <p class="font-zh-playful mt-2 text-sm font-bold text-emerald-900">
                    最高连击
                </p>
            </div>

            <div class="w-full sm:w-56">
                <div class="flex items-center justify-between gap-4">
                    <p class="font-zh-playful text-sm font-black text-emerald-800">
                        今日进度
                    </p>
                    <p class="font-fredoka text-sm font-black text-emerald-950">
                        {{ todayProgress }}%
                    </p>
                </div>
                <div class="mt-3 h-4 rounded-full border-2 border-emerald-950 bg-white p-0.5">
                    <div class="h-full rounded-full bg-[#33d17a]" :style="{ width: `${todayProgress}%` }" />
                </div>
                <p class="font-zh-playful mt-3 text-sm font-bold text-emerald-900">
                    下一句准备就绪
                </p>
            </div>
        </div>
    </article>
</template>
