<script setup lang="ts">
interface HeroTopicBadgeProps {
    text: string
}

const { text } = defineProps<HeroTopicBadgeProps>()
</script>

<template>
    <div
        class="font-zh-playful inline-flex rounded-full border-2 border-emerald-900 bg-[#ddffe8] px-5 py-2 text-sm font-black text-emerald-900 shadow-[5px_5px_0_#064e3b]">
        {{ text }}
    </div>
</template>
