<script setup lang="ts">
interface PracticeToolActionButtonProps {
    label: string
}

const { label } = defineProps<PracticeToolActionButtonProps>()
</script>

<template>
    <span
        class="inline-flex shrink-0 text-[#2563eb] transition-colors duration-150 hover:text-emerald-600 active:text-emerald-600"
        role="img"
        :aria-label="label">
        <slot />
    </span>
</template>
