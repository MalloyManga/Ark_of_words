export default defineNuxtPlugin(() => {
    const { initializeThemePreference } = useThemePreference()
    const { initializeCustomPracticeSelection } = useCustomPracticeSelection()

    initializeThemePreference()
    initializeCustomPracticeSelection()
})
