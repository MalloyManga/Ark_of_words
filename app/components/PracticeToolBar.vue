<script setup lang="ts">
import type { PracticeToolAction, PracticeToolActionId } from '~/constants/practiceToolActions'

interface PracticeToolBarProps {
    actions: readonly PracticeToolAction[]
}

const { actions } = defineProps<PracticeToolBarProps>()

const emit = defineEmits<{
    'action-click': [actionId: PracticeToolActionId]
}>()
</script>

<template>
    <!-- 工具栏只负责排列按钮和上抛 action id 具体行为由页面处理 -->
    <div class="mt-7 flex min-h-8 w-full max-w-md items-center justify-center gap-5">
        <PracticeToolActionButton v-for="action in actions" :key="action.id" :label="action.label"
            @click="emit('action-click', action.id)">
            <component :is="action.icon" class="size-6" aria-hidden="true" />
        </PracticeToolActionButton>
    </div>
</template>
