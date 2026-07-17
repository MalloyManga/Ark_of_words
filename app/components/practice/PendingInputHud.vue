<script setup lang="ts">
interface PendingInputHudProps {
    pendingInputText: string
}

defineProps<PendingInputHudProps>()
</script>

<template>
    <div v-if="pendingInputText"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/20 dark:border-cyan-500/20 animate-pulse">
        <span class="text-xs font-bold text-blue-400 dark:text-cyan-600">INPUTTING</span>
        <span
            class="text-lg font-black text-blue-600 dark:text-cyan-400 tracking-widest border-b-2 border-blue-500 dark:border-cyan-400 pb-0.5">
            {{ pendingInputText }}
        </span>
    </div>
</template>
