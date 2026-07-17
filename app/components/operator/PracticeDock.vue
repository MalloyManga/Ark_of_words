<script setup lang="ts">
interface PracticeDockProps {
    selectedVoiceLineCount: number
}

defineProps<PracticeDockProps>()

const emit = defineEmits<{
    startPractice: []
}>()
</script>

<template>
    <div class="fixed bottom-0 left-0 right-0 z-30 pointer-events-none p-6">
        <div class="mx-auto max-w-7xl flex justify-center lg:justify-end pointer-events-auto">
            <OperatorPracticeFooter :selected-voice-line-count="selectedVoiceLineCount"
                @start-practice="emit('startPractice')" />
        </div>
    </div>
</template>
