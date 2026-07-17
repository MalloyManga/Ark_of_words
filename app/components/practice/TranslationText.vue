<script setup lang="ts">
interface TranslationTextProps {
    text: string
    isVisible: boolean
}

defineProps<TranslationTextProps>()
</script>

<template>
    <p v-show="isVisible"
        class="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 tracking-wide transition-opacity duration-300">
        {{ text || '...' }}
    </p>
</template>
