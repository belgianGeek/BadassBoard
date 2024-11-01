<script setup>
const props = defineProps(['componentType', 'errorMsg']);
</script>

<template>
    <div v-if="props.componentType === 'error'"
        :class="`${props.componentType}Container__content flex flexColumn`">
        <article>{{ props.errorMsg }}</article>
    </div>
</template>

<style media="screen" lang="scss">
@import '@/scss/utils/mixins';
@import '@/scss/utils/variables';
</style>