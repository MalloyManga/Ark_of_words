<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary'
type ButtonWidth = 'wide' | 'compact'

interface AppButtonProps {
    variant?: ButtonVariant
    width?: ButtonWidth
    type?: 'button' | 'submit' | 'reset'
}

const { variant = 'primary', width = 'wide', type = 'button' } = defineProps<AppButtonProps>()

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'border-emerald-950 bg-[#33d17a] text-emerald-950 shadow-[8px_8px_0_#064e3b] hover:shadow-[5px_5px_0_#064e3b] active:shadow-[2px_2px_0_#064e3b]',
    secondary:
        'border-emerald-950 bg-white text-emerald-900 shadow-[6px_6px_0_#86efac] hover:shadow-[3px_3px_0_#86efac] active:shadow-[1px_1px_0_#86efac]',
}

const widthClasses: Record<ButtonWidth, string> = {
    wide: 'sm:w-64',
    compact: 'sm:w-42',
}
</script>

<template>
    <button :type="type"
        class="h-15 w-full cursor-pointer rounded-3xl border-2 px-10 text-lg font-black transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-2 active:translate-y-2 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
        :class="[variantClasses[variant], widthClasses[width], variant === 'secondary' ? 'px-7' : '']">
        <slot />
    </button>
</template>
