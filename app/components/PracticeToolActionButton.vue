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
        class="nb-card nb-interactive inline-flex size-12 shrink-0 cursor-pointer items-center justify-center text-ink transition-all duration-150 hover:-translate-y-0.5 hover:text-blue-500 dark:hover:text-cyan-400 active:translate-y-0"
        :aria-label="label" @click.stop="emit('click')">
        <slot />
    </button>
</template>
