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
        class="nb-card nb-interactive inline-flex size-12 shrink-0 cursor-pointer items-center justify-center text-ink transition-colors duration-150 hover:text-coral"
        :aria-label="label" @click.stop="emit('click')">
        <slot />
    </button>
</template>
