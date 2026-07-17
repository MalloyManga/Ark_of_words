<script setup lang="ts">
interface PendingInputHudProps {
    pendingInputText: string
}

defineProps<PendingInputHudProps>()
</script>

<template>
    <div class="relative h-10 flex items-center justify-center w-full">
        <p v-if="pendingInputText"
            class="text-sm font-medium tracking-normal text-blue-600 dark:text-cyan-400 transition-colors">
            待确认：<span class="border-b-2 border-blue-600 dark:border-cyan-400 px-1">{{ pendingInputText }}</span>
        </p>
    </div>
</template>
