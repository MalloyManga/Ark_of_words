<script setup lang="ts">
interface HomeFeature {
    icon: string
    title: string
    desc: string
    color: string
}

const features: readonly HomeFeature[] = [
    {
        icon: '🎧',
        title: '听音打字练习',
        desc: '沉浸式聆听干员语音，智能判断输入正误，自动过滤标点，专注日语敲击。',
        color: 'from-blue-400 to-cyan-300 dark:from-blue-500/50 dark:to-cyan-400/50',
    },
    {
        icon: '🎵',
        title: 'K歌级歌词滚动',
        desc: '结合语音时间轴，实现卡拉OK级别的逐词/逐句高亮，精准卡点。',
        color: 'from-indigo-400 to-purple-300 dark:from-indigo-500/50 dark:to-purple-400/50',
    },
    {
        icon: '📚',
        title: '智能单词解析',
        desc: '内置NLP自然语言处理，智能解析台词中的单词，提供原形还原与词性辅助。',
        color: 'from-amber-400 to-orange-300 dark:from-amber-500/50 dark:to-orange-400/50',
    },
    {
        icon: '📊',
        title: '动态难度分级',
        desc: '从简短有力的作战指令，到饱含深情的日常长语音，循序渐进。',
        color: 'from-emerald-400 to-teal-300 dark:from-emerald-500/50 dark:to-teal-400/50',
    },
]
</script>

<template>
    <div class="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(item, index) in features" :key="index"
            class="group relative overflow-hidden rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg border border-white/60 dark:border-slate-700/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_40px_rgb(59,130,246,0.1)] dark:hover:shadow-[0_8px_40px_rgb(34,211,238,0.1)] transition-all duration-500 hover:-translate-y-1">
            <div
                :class="`absolute -top-10 -right-10 w-32 h-32 bg-linear-to-br ${item.color} rounded-full blur-3xl opacity-20 dark:opacity-30 group-hover:opacity-50 dark:group-hover:opacity-60 transition-opacity duration-500`">
            </div>

            <div class="relative z-10">
                <div
                    class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-2xl mb-4 transition-colors">
                    {{ item.icon }}
                </div>
                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">
                    {{ item.title }}
                </h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors">
                    {{ item.desc }}
                </p>
            </div>
        </div>
    </div>
</template>
