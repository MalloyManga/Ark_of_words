<script setup lang="ts">
interface PracticeToolActionButtonProps {
    label: string
}

const { label } = defineProps<PracticeToolActionButtonProps>()

const emit = defineEmits<{
    click: []
}>()
</script>

<template>
    <button type="button"
        class="inline-flex shrink-0 cursor-pointer items-center justify-center text-[#2563eb] transition-colors duration-150 hover:text-emerald-600"
        :aria-label="label" @click.stop="emit('click')">
        <slot />
    </button>
</template>
