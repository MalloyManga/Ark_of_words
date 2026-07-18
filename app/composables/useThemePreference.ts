export type ThemePreference = 'light' | 'dark'

const themeStorageKey = 'theme'

const applyThemePreference = (themePreference: ThemePreference): void => {
    document.documentElement.classList.toggle('dark', themePreference === 'dark')
}

/**
 * 在应用级状态中管理主题 并同步浏览器本地偏好
 */
export const useThemePreference = () => {
    const themePreference = useState<ThemePreference>('theme-preference', () => 'light')
    const isThemePreferenceInitialized = useState<boolean>('theme-preference-initialized', () => false)
    const isDarkMode = computed(() => themePreference.value === 'dark')

    const initializeThemePreference = (): void => {
        if (!import.meta.client || isThemePreferenceInitialized.value) {
            return
        }

        const storedThemePreference = localStorage.getItem(themeStorageKey)
        const preferredTheme: ThemePreference = storedThemePreference === 'dark'
            || (storedThemePreference === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'dark'
            : 'light'

        themePreference.value = preferredTheme
        applyThemePreference(preferredTheme)
        isThemePreferenceInitialized.value = true
    }

    const setThemePreference = (nextThemePreference: ThemePreference): void => {
        themePreference.value = nextThemePreference

        if (!import.meta.client) {
            return
        }

        applyThemePreference(nextThemePreference)
        localStorage.setItem(themeStorageKey, nextThemePreference)
    }

    const toggleThemePreference = (): void => {
        setThemePreference(isDarkMode.value ? 'light' : 'dark')
    }

    return {
        themePreference: readonly(themePreference),
        isDarkMode,
        initializeThemePreference,
        setThemePreference,
        toggleThemePreference,
    }
}
