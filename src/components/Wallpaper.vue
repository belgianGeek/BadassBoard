<script setup>
import { useGlobalStore } from '@/stores/globalStore';

const globalStore = useGlobalStore();
let wallpaper = globalStore.wallpaper;
</script>

<template>
    <div class="backgroundImage" :style="{ backgroundImage: `url(${wallpaper})`}"></div>
</template>

<style media="screen" lang="scss">
@import '@/scss/utils/mixins';

.backgroundImage {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
  @include background-image;
}
</style>