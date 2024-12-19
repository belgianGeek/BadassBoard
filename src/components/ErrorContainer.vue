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
@use '@/scss/utils/mixins';
@use '@/scss/utils/variables';
</style>