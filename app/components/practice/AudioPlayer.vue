<script setup lang="ts">
import type { PracticeAudioController } from '~/types/practiceAudio'

interface AudioPlayerProps {
    sourceUrl: string
}

const { sourceUrl } = defineProps<AudioPlayerProps>()

const audioElementRef = useTemplateRef<HTMLAudioElement>('audioElementRef')

const playFromStart = async (): Promise<void> => {
    const audioElement = audioElementRef.value

    if (!audioElement || !sourceUrl) {
        return
    }

    audioElement.currentTime = 0
    await audioElement.play()
}

const pause = (): void => {
    audioElementRef.value?.pause()
}

const seekTo = (timeInSeconds: number): void => {
    const audioElement = audioElementRef.value

    if (!audioElement || !Number.isFinite(timeInSeconds)) {
        return
    }

    const maximumTime = Number.isFinite(audioElement.duration) ? audioElement.duration : timeInSeconds
    audioElement.currentTime = Math.min(Math.max(timeInSeconds, 0), maximumTime)
}

watch(() => sourceUrl, () => {
    audioElementRef.value?.load()
})

defineExpose<PracticeAudioController>({
    playFromStart,
    pause,
    seekTo,
})
</script>

<template>
    <audio ref="audioElementRef" :src="sourceUrl" preload="none" class="hidden" />
</template>
