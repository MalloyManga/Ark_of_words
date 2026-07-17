<script setup lang="ts">
interface ChevronRightProps {
    alignment?: 'center' | 'right'
    strokeWidth?: number
}

const { alignment = 'center', strokeWidth = 2 } = defineProps<ChevronRightProps>()
</script>

<template>
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" :stroke-width="strokeWidth"
            :transform="alignment === 'right' ? 'translate(4)' : undefined" d="M9 5l7 7-7 7" />
    </svg>
</template>
