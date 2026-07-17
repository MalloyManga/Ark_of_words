export interface PracticeAudioController {
    playFromStart: () => Promise<void>
    pause: () => void
    seekTo: (timeInSeconds: number) => void
}
