<script setup lang="ts">
interface HeroIntroProps {
    title: string
    description: string
}

const { title, description } = defineProps<HeroIntroProps>()
</script>

<template>
    <div>
        <h1
            class="font-fredoka mt-7 max-w-2xl text-5xl font-black leading-[0.95] tracking-normal text-emerald-950 sm:text-6xl lg:text-7xl">
            {{ title }}
        </h1>

        <p class="font-zh-playful mt-6 max-w-xl text-lg font-medium leading-8 text-emerald-900 sm:text-xl">
            {{ description }}
        </p>
    </div>
</template>
