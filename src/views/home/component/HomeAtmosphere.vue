<script setup lang="ts">
defineProps<{ dark: boolean }>();

const lanterns = [
  { id: 1, left: "12%", delay: -7, duration: 21, drift: 28, scale: 0.72 },
  { id: 2, left: "30%", delay: -15, duration: 26, drift: -22, scale: 0.54 },
  { id: 3, left: "52%", delay: -2, duration: 24, drift: 36, scale: 0.88 },
  { id: 4, left: "72%", delay: -18, duration: 29, drift: -30, scale: 0.62 },
  { id: 5, left: "88%", delay: -11, duration: 23, drift: 18, scale: 0.46 },
];

const stars = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 43 + 7) % 98}%`,
  top: `${(index * 67 + 5) % 92}%`,
  delay: (index * 0.8) % 5,
}));

const snowflakes = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  left: `${Math.round(Math.random() * 96) + 2}%`,
  delay: -(Math.random() * 16),
  duration: 16 + Math.random() * 8,
  drift: Math.round((Math.random() - 0.5) * 42),
  size: Math.round((2.5 + Math.random() * 2) * 10) / 10,
}));
</script>

<template>
  <div class="home-atmosphere" aria-hidden="true">
    <template v-if="dark">
      <div class="lantern-field">
        <span v-for="lantern in lanterns" :key="lantern.id" class="lantern" :style="{
          '--lantern-left': lantern.left,
          '--lantern-delay': `${lantern.delay}s`,
          '--lantern-duration': `${lantern.duration}s`,
          '--lantern-drift': `${lantern.drift}px`,
          '--lantern-scale': lantern.scale,
        }">
          <span class="lantern__glow" />
          <span class="lantern__body">
            <span class="lantern__flame" />
          </span>
          <span class="lantern__basket" />
        </span>
      </div>

      <div class="home-stars">
        <i v-for="star in stars" :key="star.id" class="home-star" :style="{
          left: star.left,
          top: star.top,
          animationDelay: `${star.delay}s`,
        }" />
      </div>
    </template>

    <div v-else class="winter-scene">
      <div class="winter-light" />

      <i v-for="flake in snowflakes" :key="flake.id" class="snowflake" :style="{
        '--snow-left': flake.left,
        '--snow-delay': `${flake.delay}s`,
        '--snow-duration': `${flake.duration}s`,
        '--snow-drift': `${flake.drift}px`,
        '--snow-size': `${flake.size}px`,
      }" />
    </div>
  </div>
</template>

<style scoped>
.home-atmosphere,
.lantern-field,
.home-stars,
.winter-scene {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.home-atmosphere {
  z-index: 0;
}

.lantern-field,
.home-stars {
  z-index: 1;
}

.winter-scene {
  background: linear-gradient(180deg, #7899bd 0%, #8da9c5 44%, #afbbcf 100%);
}

.winter-light {
  position: absolute;
  top: -7%;
  left: 57%;
  width: min(58vw, 860px);
  aspect-ratio: 1.7;
  border-radius: 50%;
  background: rgba(245, 207, 186, 0.46);
  filter: blur(60px);
  opacity: 0.72;
  transform: translateX(-50%);
}

.snowflake {
  position: absolute;
  z-index: 8;
  top: -16px;
  left: var(--snow-left);
  width: var(--snow-size);
  height: var(--snow-size);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 7px rgba(255, 255, 255, 0.7);
  opacity: 0;
  animation: snow-fall var(--snow-duration) linear var(--snow-delay) infinite;
}

.lantern {
  position: absolute;
  bottom: -130px;
  left: var(--lantern-left);
  width: 38px;
  height: 66px;
  opacity: 0;
  transform: scale(var(--lantern-scale));
  animation: lantern-rise var(--lantern-duration) linear var(--lantern-delay) infinite;
}

.lantern__glow {
  position: absolute;
  top: 18px;
  left: 50%;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: rgba(255, 166, 119, 0.16);
  filter: blur(14px);
  transform: translateX(-50%);
}

.lantern__body {
  position: absolute;
  top: 6px;
  left: 50%;
  width: 34px;
  height: 43px;
  border: 1px solid rgba(255, 220, 179, 0.72);
  border-radius: 48% 48% 42% 42% / 42% 42% 58% 58%;
  background:
    radial-gradient(ellipse at 50% 84%,
      rgba(255, 246, 187, 0.98) 0 10%,
      rgba(255, 190, 99, 0.92) 26%,
      transparent 48%),
    linear-gradient(90deg,
      rgba(229, 104, 116, 0.72),
      #ffb18f 48%,
      rgba(219, 93, 108, 0.74));
  box-shadow:
    0 0 8px rgba(255, 201, 129, 0.7),
    0 0 24px rgba(255, 145, 101, 0.32),
    inset 7px 0 10px rgba(255, 224, 183, 0.26),
    inset -6px 0 10px rgba(141, 38, 66, 0.16);
  transform: translateX(-50%);
}

.lantern__body::before,
.lantern__body::after {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: rgba(255, 224, 189, 0.5);
  content: "";
}

.lantern__body::before {
  left: 8px;
}

.lantern__body::after {
  right: 8px;
}

.lantern__flame {
  position: absolute;
  bottom: 6px;
  left: 50%;
  width: 9px;
  height: 14px;
  border-radius: 50% 50% 46% 46%;
  background: #fff6a7;
  box-shadow: 0 0 9px 4px rgba(255, 244, 168, 0.78);
  transform: translateX(-50%);
}

.lantern__basket {
  position: absolute;
  bottom: 4px;
  left: 50%;
  width: 13px;
  height: 5px;
  border: 1px solid rgba(255, 209, 157, 0.8);
  border-top: 0;
  background: rgba(112, 47, 37, 0.54);
  transform: translateX(-50%);
}

.home-star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: currentColor;
  color: rgba(244, 242, 239, 0.62);
  opacity: 0.28;
  animation: star-twinkle 4s ease-in-out infinite;
}

@keyframes lantern-rise {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(var(--lantern-scale)) rotate(-2deg);
  }

  8% {
    opacity: 0.78;
  }

  50% {
    transform: translate3d(var(--lantern-drift), -58vh, 0) scale(var(--lantern-scale)) rotate(2deg);
  }

  86% {
    opacity: 0.18;
  }

  100% {
    opacity: 0;
    transform: translate3d(calc(var(--lantern-drift) * -0.5), -122vh, 0) scale(var(--lantern-scale)) rotate(-1deg);
  }
}

@keyframes star-twinkle {

  0%,
  100% {
    opacity: 0.16;
    transform: scale(0.8);
  }

  50% {
    opacity: 0.46;
    transform: scale(1.25);
  }
}

@keyframes snow-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -2vh, 0);
  }

  12% {
    opacity: 0.82;
  }

  84% {
    opacity: 0.6;
  }

  100% {
    opacity: 0;
    transform: translate3d(var(--snow-drift), 105vh, 0);
  }
}

@media (max-width: 760px) {
  .lantern {
    width: 31px;
    height: 55px;
  }

  .lantern__body {
    width: 28px;
    height: 37px;
  }

}

@media (prefers-reduced-motion: reduce) {

  .lantern,
  .home-star,
  .snowflake {
    animation: none;
  }
}
</style>
