<script setup>
const props = defineProps(['currentStream', 'url', 'thumbnail', 'title', 'totalStreams', 'type']);
import { useGlobalStore } from '@/stores/globalStore';
const globalStore = useGlobalStore();

const hideAudioPlayer = () => {
    globalStore.audio.isDisplayed = false;
    globalStore.audio.isPlaying = false;
}
</script>

<template>
    <div class="audio flexRow fixed" v-if="props.url">
        <svg class="audio__leftSvg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"
            fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6" v-if="type === 'playlist'" />
        </svg>
        <img class="audio__remove removeContentBtn flexRow" alt="Remove the audio player from the interface"
            src="@/scss/icons/interface/cross.svg" @click="hideAudioPlayer()" />
        <span class="audio__container flexRow">
            <div class="audio__container__msg flexRow">
                <img :src="props.thumbnail" alt="">
                <article>
                    <p class="playlistStatus" v-if="props.type === 'playlist'">{{ props.currentStream + 1 }} / {{
                        props.totalStreams }}</p>
                    <p class="title">{{ props.title }}</p>
                </article>
            </div>
            <div class="audio__container__player flexRow">
                <audio :src="props.url" id="audio__player" class="audio__player" controls autoplay>
                    Your browser does not support the audio element
                </audio>
            </div>
        </span>
        <svg class="audio__rightSvg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"
            fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6" v-if="type === 'playlist'" />
        </svg>
    </div>
</template>

<style media="screen" lang="scss">
@use '@/scss/utils/mixins';
@use '@/scss/utils/variables';

.audio {
    width: 70%;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 0 .6em;
    border-radius: 15px;
    margin-bottom: 1vh;
    top: 85%;
    align-items: center;
    z-index: 2;
    align-self: center;
    text-align: center;

    &__leftSvg,
    &__rightSvg {
        cursor: pointer;
        min-width: 2em;
    }

    &__container {
        width: 100%;
        justify-content: space-around;
        align-items: center;

        @media (max-width: 720px) {
            width: 90%;
        }

        &__msg {
            height: min-content;
            width: 50%;
            font-size: 1.2em;
            min-width: 50%;
            align-items: center;

            article {
                padding: 0 .8em;
            }

            .playlistInfo {
                width: min-content;
                margin: 0 1.5vh;
            }
        }

        &__player {
            height: min-content;
            min-width: 50%;
            width: 50%;
            @include mixins.align(space-evenly, center);
            @include mixins.flex-direction(row);
        }

        .streamInfoContainer {
            width: 50%;
            margin: 0 1vh;
            display: flex;
            @include mixins.flex-direction;
            flex: 1;
            overflow: hidden;

            .streamTitle {
                text-overflow: ellipsis;
                overflow: hidden;
                min-width: 0;
                display: inline;
                white-space: nowrap;
            }

            .YtId {
                padding-top: 1%;
            }

            .YtId,
            .streamTitle {
                margin: 0;
                text-align: center;
            }
        }

        @media (max-width: 720px) {
            flex-direction: column;

            &__msg,
            &__player {
                width: 100%;
            }

            &__player {
                margin-top: 1em;
            }
        }
    }

    &__player {
        width: 100%;
    }

    &__remove {
        height: 2.5vh;
        cursor: pointer;
        position: absolute;
        top: -10px;
        left: 97%;
        background-color: rgba(0, 0, 0, 0.8);
        padding: 0.2%;
        border-radius: 45%;
    }

    @media (max-width: 720px) {
        width: 85%;
    }
}

.audio.playlist .audio__container__msg,
.audio.playlist .audio__container__player {
    width: 47%;

    @media (max-width: 720px) {
        width: 100%;
    }
}
</style>