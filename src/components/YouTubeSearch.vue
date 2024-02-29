<script setup>
import { useGlobalStore } from '@/stores/globalStore';
const globalStore = useGlobalStore();

const props = defineProps(['componentType']);

import axios from "axios";
import { ref } from 'vue';
let youtubeSearch = ref({
    query: '',
    results: ''
});

const searchYouTube = async query => {
    const youtubeRequest = await axios.post(`http://${window.location.hostname}:3000/api/ytsearch`, {
        invidiousInstance: globalStore.invidiousInstances[0],
        query: query
    });

    globalStore.YTsearchResults = youtubeRequest.data;
}
</script>

<template>
    <div v-if="props.componentType === 'youtubeSearch'" :class="`${props.componentType}Container__content flex`">
        <input type="text" :class="`${props.componentType}Container__content__input input`"
            placeholder="Type here to search Youtube..." v-model="youtubeSearch.query">
        <button @click="searchYouTube(youtubeSearch.query.trim())">Search</button>
        <div :class="`${props.componentType}Container__content__results flex`">
            <span v-for="[iResult, result] of globalStore.YTsearchResults.entries()"
                :class="`youtubeSearchContainer__content__results__result youtube__result${iResult} flex`">
                <img :src="result.videoThumbnails[1].url" :alt="`${result.title} thumbnail`" width="25%">
            </span>
        </div>
    </div>
</template>

<style media="screen" lang="scss" scoped>
@import '@/scss/utils/mixins';
@import '@/scss/utils/variables';

.youtubeSearchContainer {
    padding: 0 1% 2% 2%;
    flex-direction: column;
    font-size: 1.5em;
    width: 50%;
    align-items: center;
    align-self: center;
    padding: 0.5em;
    border: 1px solid white;
    border-radius: 1em;

    @media (max-width: 720px) {
        height: 50vh;
    }

    &__content {
        height: 85%;
        width: 100%;
        @include align(flex-start, center);
        @include flex-direction();
        overflow: hidden;

        &__results {
            @include flex-direction();
            height: 100%;
            width: 100%;
            margin-top: 1em;
            font-size: 1em;

            &__result {
                margin-bottom: 1.5em;
                padding: 0.5em;

                &:hover {
                    background-color: opacify($contentBackground, 0.2);
                    border-radius: 1em;
                }

                img {
                    width: 25%;
                    align-items: center;
                    max-height: 100%;
                    max-width: 100%;
                }

                &__content {
                    @include flex-direction();
                    width: 75%;
                    padding: 0 0.5em;
                    font-size: 1.1em;
                    word-break: break-word;

                    a {
                        text-overflow: ellipsis;
                        min-width: 0;
                        overflow: hidden;
                        white-space: nowrap;
                    }

                    p {
                        margin: 0.6em 0 0;

                        u {
                            text-decoration-style: dashed;
                        }
                    }
                }
            }
        }
    }

    &__header {
        width: 100%;
    }

    @include flex-direction;
    border-radius: 15px;
    height: 100%;
    max-height: 100%;
    width: 100%;
    font-size: 1.05em;

    @media (max-width: 720px) {
        width: 95%;
    }

    &__header {
        transition: display 400ms;

        &:hover .contentOptions {
            display: flex;
        }

        & p {
            display: block;
            width: 90%;
            text-align: center;
            margin: 2% 0;
        }
    }
}
</style>