<script setup lang="ts">
interface PracticeToolActionButtonProps {
    label: string
    iconText: string
}

const { label, iconText } = defineProps<PracticeToolActionButtonProps>()
</script>

<template>
    <button type="button"
        class="font-fredoka flex size-8 items-center justify-center text-xl font-black text-[#2563eb] transition-all duration-150 hover:-translate-y-0.5 hover:text-emerald-600 active:translate-y-0"
        :aria-label="label">
        {{ iconText }}
    </button>
</template>
