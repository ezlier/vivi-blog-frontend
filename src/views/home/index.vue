<template>
    <main class="home-screen">
        <div class="star-field" aria-hidden="true">
            <span v-for="star in stars" :key="star.id" class="star" :style="{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
            }" />
        </div>

        <div class="orbit-art" aria-hidden="true">
            <svg class="orbit-art__svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="presentation">
                <path class="orbit-path orbit-path--profile"
                    d="M15.95 109.75 C16.27 84.88 19.78 61.92 23.6 46.62 C29.98 22.7 38.27 13.13 51.98 -6" />
                <path class="orbit-path orbit-path--navigation" :d="navigationPath" />
            </svg>
        </div>

        <section class="profile" aria-label="个人信息">
            <div class="current-time" aria-label="当前时间">
                <span>{{ currentTime }}</span>
                <span>{{ currentDate }}</span>
            </div>

            <div class="profile-main">
                <div class="avatar-frame">
                    <img v-if="ui.webSetting?.name_avatar" :src="ui.webSetting.name_avatar"
                        :alt="ui.webSetting.name || 'avatar'" />
                    <span v-else>{{ (ui.webSetting?.name || 'V').slice(0, 1) }}</span>
                </div>

                <div class="profile-name">
                    <strong>{{ ui.webSetting?.name || 'Vivi' }}</strong>
                    <span>{{ ui.webSetting?.web_name || 'Blog' }}</span>
                </div>
            </div>
        </section>

        <nav class="navigation-rail" aria-label="主导航">
            <div class="navigation-nodes">
                <button v-for="item in navigationPoints" :key="item.path" class="nav-node"
                    :class="{ 'nav-node--active': activeNav === item.path }" type="button"
                    :style="{ left: `${item.x}%`, top: `${item.y}%` }" :aria-label="item.label"
                    @mouseenter="activeNav = item.path" @mouseleave="activeNav = null" @focus="activeNav = item.path"
                    @blur="activeNav = null" @click="goTo(item.path)">
                    <span class="nav-node__halo" aria-hidden="true" />
                    <svg class="nav-node__icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path v-if="item.icon === 'home'"
                            d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
                        <path v-else-if="item.icon === 'article'" d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />
                        <path v-else-if="item.icon === 'archive'" d="M4 6h16v4H4zM6 10v9h12v-9M9 14h6" />
                        <path v-else d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v1m0 3v5" />
                    </svg>

                    <span v-if="activeNav === item.path" class="nav-node__label">
                        {{ item.label }}
                    </span>
                </button>
            </div>
        </nav>
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'

type NavigationIcon = 'home' | 'article' | 'archive' | 'about'

interface NavigationItem {
    label: string
    path: string
    icon: NavigationIcon
}

interface Point {
    x: number
    y: number
}

interface CurveSample extends Point {
    t: number
    distance: number
}

const router = useRouter()
const ui = useUiStore()

const navigationItems = ref<NavigationItem[]>([
    { label: '首页', path: '/', icon: 'home' },
    { label: '文章', path: '/home', icon: 'article' },
    { label: '归档', path: '/archive', icon: 'archive' },
    { label: '关于', path: '/about', icon: 'about' },
])

const navigationCurve = {
    start: { x: 63, y: 108 },
    control1: { x: 64, y: 68 },
    control2: { x: 70, y: 30 },
    end: { x: 96, y: -8 },
}

const navigationPath = `M ${navigationCurve.start.x} ${navigationCurve.start.y} C ${navigationCurve.control1.x} ${navigationCurve.control1.y}, ${navigationCurve.control2.x} ${navigationCurve.control2.y}, ${navigationCurve.end.x} ${navigationCurve.end.y}`
const activeNav = ref<string | null>(null)
const currentTime = ref('')
const currentDate = ref('')
let clockTimer: ReturnType<typeof setInterval> | undefined

// 固定种子让星点分布稳定，动画交给 CSS 处理，避免每次渲染时跳动。
const stars = Array.from({ length: 28 }, (_, index) => {
    const left = (index * 37 + 11) % 96
    const top = (index * 61 + 13) % 92

    return {
        id: index,
        left: `${left}%`,
        top: `${top}%`,
        size: index % 9 === 0 ? 2 : 1,
        delay: (index * 1.7) % 12,
        duration: 8 + (index % 6) * 2,
    }
})

function getCurvePoint(t: number): Point {
    const inverseT = 1 - t
    const { start, control1, control2, end } = navigationCurve

    return {
        x: inverseT ** 3 * start.x
            + 3 * inverseT ** 2 * t * control1.x
            + 3 * inverseT * t ** 2 * control2.x
            + t ** 3 * end.x,
        y: inverseT ** 3 * start.y
            + 3 * inverseT ** 2 * t * control1.y
            + 3 * inverseT * t ** 2 * control2.y
            + t ** 3 * end.y,
    }
}

// 用弧长采样而不是直接均分 t，保证节点在视觉上沿曲线等距。
const curveSamples = computed<CurveSample[]>(() => {
    const samples: CurveSample[] = []
    const sampleCount = 480
    let distance = 0
    let previous = getCurvePoint(0)

    samples.push({ ...previous, t: 0, distance: 0 })

    for (let index = 1; index <= sampleCount; index += 1) {
        const t = index / sampleCount
        const point = getCurvePoint(t)
        distance += Math.hypot(point.x - previous.x, point.y - previous.y)
        samples.push({ ...point, t, distance })
        previous = point
    }

    return samples
})

function getPointAtDistance(samples: CurveSample[], distance: number): Point {
    if (samples.length === 0) {
        return { x: 0, y: 0 }
    }

    let low = 0
    let high = samples.length - 1

    while (low < high) {
        const middle = Math.floor((low + high) / 2)
        if (samples[middle]!.distance < distance) {
            low = middle + 1
        } else {
            high = middle
        }
    }

    const current = samples[low]!
    const previous = samples[Math.max(low - 1, 0)]!
    const segmentLength = current.distance - previous.distance
    const ratio = segmentLength === 0 ? 0 : (distance - previous.distance) / segmentLength

    return {
        x: previous.x + (current.x - previous.x) * ratio,
        y: previous.y + (current.y - previous.y) * ratio,
    }
}

const navigationPoints = computed(() => {
    const items = navigationItems.value
    const samples = curveSamples.value
    const totalLength = samples[samples.length - 1]?.distance || 0
    const startDistance = totalLength * 0.15
    const endDistance = totalLength * 0.86
    const availableLength = endDistance - startDistance

    return items.map((item, index) => {
        const progress = items.length <= 1 ? 0.5 : index / (items.length - 1)
        const point = getPointAtDistance(samples, startDistance + availableLength * progress)

        return { ...item, ...point }
    })
})

function updateTime() {
    const now = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')

    currentTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    currentDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function goTo(path: string) {
    router.push(path)
}

onMounted(async () => {
    updateTime()
    clockTimer = setInterval(updateTime, 1000)
    await ui.fetchWebSetting()
})

onUnmounted(() => {
    if (clockTimer) {
        clearInterval(clockTimer)
    }
})
</script>

<style scoped>
.home-screen {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    overflow: hidden;
    isolation: isolate;
    background:
        radial-gradient(circle at 50% 44%, rgba(30, 43, 49, 0.28), transparent 38%),
        linear-gradient(135deg, #12171b 0%, #090b0e 54%, #050608 100%);
    color: #d8e2e5;
}

.home-screen::after {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    content: '';
    background: radial-gradient(ellipse at center, transparent 42%, rgba(0, 0, 0, 0.32) 100%);
}

.star-field {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
}

.star {
    position: absolute;
    border-radius: 50%;
    background: #c6dce1;
    box-shadow: 0 0 7px rgba(198, 220, 225, 0.5);
    opacity: 0.2;
    animation: star-twinkle ease-in-out infinite;
}

.orbit-art {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
}

.orbit-art__svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.orbit-path {
    fill: none;
    stroke: whitesmoke;
    stroke-linecap: round;
    stroke-width: 0.42;
    vector-effect: non-scaling-stroke;
}

.orbit-path--profile {
    stroke: whitesmoke;
}

.orbit-path--navigation {
    stroke: rgba(190, 211, 216, 0.5);
    filter: drop-shadow(0 0 3px rgba(163, 205, 214, 0.12));
}

.profile {
    position: absolute;
    top: 50%;
    left: clamp(88px, 21vw, 300px);
    z-index: 3;
    transform: translateY(-50%);
}

.current-time {
    position: absolute;
    top: 50%;
    right: calc(100% + clamp(24px, 3.2vw, 46px));
    display: flex;
    flex-direction: column;
    gap: 1px;
    width: max-content;
    transform: translateY(-50%);
    color: rgba(187, 203, 207, 0.72);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: clamp(10px, 0.8vw, 12px);
    letter-spacing: 0.04em;
    line-height: 1.55;
    text-align: right;
}

.profile-main {
    display: flex;
    align-items: center;
    gap: clamp(18px, 2.4vw, 34px);
}

.avatar-frame {
    display: grid;
    place-items: center;
    width: clamp(148px, 18vw, 226px);
    aspect-ratio: 1;
    overflow: hidden;
    border: 1px solid rgba(205, 224, 228, 0.8);
    border-radius: 50%;
    background: rgba(14, 19, 22, 0.96);
    box-shadow:
        0 0 0 1px rgba(127, 157, 165, 0.13),
        0 0 30px rgba(126, 179, 187, 0.07),
        inset 0 0 26px rgba(0, 0, 0, 0.35);
    color: #d9e7e9;
    font-size: clamp(34px, 4vw, 54px);
}

.avatar-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-name {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 92px;
}

.profile-name strong {
    color: #e4eef0;
    font-size: clamp(20px, 2.4vw, 30px);
    font-weight: 500;
    letter-spacing: 0.02em;
    line-height: 1.25;
    text-shadow: 0 0 18px rgba(195, 222, 225, 0.14);
}

.profile-name span {
    color: rgba(164, 183, 188, 0.78);
    font-size: clamp(12px, 1vw, 14px);
    letter-spacing: 0.08em;
}

.navigation-rail {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
}

.navigation-nodes {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.nav-node {
    position: absolute;
    display: grid;
    place-items: center;
    width: clamp(46px, 5.2vw, 38px);
    aspect-ratio: 1;
    padding: 0;
    border: 1px solid rgba(194, 218, 222, 0.8);
    border-radius: 50%;
    outline: none;
    background: rgba(8, 12, 14, 0.9);
    box-shadow:
        inset 0 0 0 5px rgba(22, 31, 35, 0.72),
        0 0 0 1px rgba(91, 121, 129, 0.25),
        0 0 18px rgba(110, 165, 174, 0.07);
    color: #bcd0d4;
    cursor: pointer;
    pointer-events: auto;
    transform: translate(-50%, -50%);
    transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease, color 180ms ease;
}

.nav-node__halo {
    position: absolute;
    inset: -5px;
    border: 1px solid rgba(159, 195, 201, 0.16);
    border-radius: inherit;
    opacity: 0;
    transform: scale(0.86);
    transition: opacity 180ms ease, transform 180ms ease;
}

.nav-node__icon {
    width: clamp(20px, 2vw, 26px);
    height: clamp(20px, 2vw, 26px);
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.45;
    pointer-events: none;
}

.nav-node__label {
    position: absolute;
    top: 50%;
    left: calc(100% + 15px);
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 3px 10px 4px 13px;
    border: 1px solid rgba(161, 193, 199, 0.24);
    border-radius: 999px;
    background: rgba(8, 12, 14, 0.86);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
    color: #d9e8ea;
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    transform: translateY(-50%);
    animation: label-in 180ms ease both;
}

.nav-node__label::before {
    position: absolute;
    top: 50%;
    right: calc(100% + 1px);
    width: 14px;
    height: 1px;
    background: rgba(183, 214, 219, 0.48);
    content: '';
}

.nav-node:hover,
.nav-node:focus-visible,
.nav-node--active {
    border-color: #e0f0f1;
    background: rgba(22, 36, 40, 0.95);
    box-shadow:
        inset 0 0 0 5px rgba(36, 57, 62, 0.8),
        0 0 0 1px rgba(173, 211, 216, 0.24),
        0 0 26px rgba(143, 202, 210, 0.2);
    color: #effafa;
}

.nav-node:hover .nav-node__halo,
.nav-node:focus-visible .nav-node__halo,
.nav-node--active .nav-node__halo {
    opacity: 1;
    transform: scale(1);
}

@keyframes star-twinkle {

    0%,
    100% {
        opacity: 0.12;
        transform: scale(0.85);
    }

    50% {
        opacity: 0.62;
        transform: scale(1.22);
    }
}

@keyframes label-in {
    from {
        opacity: 0;
        transform: translate(-6px, -50%);
    }

    to {
        opacity: 1;
        transform: translate(0, -50%);
    }
}

@media (max-width: 760px) {
    .profile {
        top: 39%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .profile-main {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .profile-name {
        align-items: center;
    }

    .current-time {
        top: auto;
        right: auto;
        bottom: calc(100% + 22px);
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
    }

    .nav-node {
        width: clamp(44px, 12vw, 58px);
    }

    .nav-node__label {
        left: calc(100% + 10px);
        font-size: 12px;
    }

    .nav-node__label::before {
        width: 9px;
    }
}

@media (prefers-reduced-motion: reduce) {

    .star,
    .nav-node__label {
        animation: none;
    }
}
</style>
