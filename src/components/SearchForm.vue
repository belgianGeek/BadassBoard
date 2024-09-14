<script setup>
import { useGlobalStore } from '@/stores/globalStore';
import axios from 'axios';

const globalStore = useGlobalStore();
let searchQuery = globalStore.search.query;
let currentInstance = 0;

const playAudio = async (invidiousInstance, videoId) => {
    // Display a loading animation
    globalStore.audio.url = `http://${window.location.hostname}:3000/#`;
    globalStore.audio.title = 'Loading...';
    globalStore.audio.thumbnail = `http://${window.location.hostname}:3000/loadingBar.gif`;
    globalStore.audio.isDisplayed = true;

    const audioRequest = await axios.post(`http://${window.location.hostname}:3000/api/audio`, {
        invidiousInstance: invidiousInstance,
        videoId: videoId
    });

    // Prevent nackground requests when an API call is successfull by using the isPlaying property condition
    if (audioRequest.data.success && !globalStore.audio.isPlaying) {
        globalStore.audio.author = audioRequest.data.audio.author;
        globalStore.audio.url = audioRequest.data.audio.url;
        globalStore.audio.thumbnail = audioRequest.data.audio.thumbnail;
        globalStore.audio.title = audioRequest.data.audio.title;
        globalStore.audio.isPlaying = true;

        await axios
            .get(globalStore.audio.url)
            .catch(error => {
                console.error(`An error occurred while loading the audio feed of "${globalStore.audio.author}, "${globalStore.audio.title}" :\n${error}`);
            });

            // Hide the player when the audio stream is ended
            document.querySelector('#audio__player').onended = () => {
                globalStore.audio.isDisplayed = false;
                globalStore.audio.isPlaying = false;
            };
    } else {
        console.error(`The Invidious instance ${invidiousInstance} did not fullfill the request.`, currentInstance, globalStore.invidiousInstances.length);
        if (currentInstance < globalStore.invidiousInstances.length) {
            globalStore.audio.isPlaying = false;
            playAudio(globalStore.invidiousInstances[currentInstance++], videoId);
        } else {
            console.error("No Invidious instance can fullfill this request.");
        }
    }

    return audioRequest;
}

const handleQuery = async () => {
    if (searchQuery.startsWith('!p ')) {
        if (searchQuery.match(/[0-9A-Za-z_-]{11}/) && !searchQuery.match(/[0-9A-Za-z_-]{13,34}/)) {
            // Match a single video
            let id = searchQuery.match(/[0-9A-Za-z_-]{11}/)[0];

            try {
                playAudio(globalStore.invidiousInstances[currentInstance], id);
            } catch (error) {
                console.log(error);
            }
        }
    } else {
        window.open(`https://www.google.com/search?q=${searchQuery}`);
    }
};
</script>

<template>
    <div id="formContainer__container" class="formContainer__container flexColumn"
        :style="{ '--wallpaperSource': `url(${globalStore.wallpaper})` }">
        <div class="formContainer flexRow">
            <form class="form" method="post" @submit.prevent="handleQuery()">
                <input class="questionBox" type="text" name="searchQuery" v-model="searchQuery"
                    placeholder="What are you searching for ?" />
                <button type="submit" name="questionBox__submitBtn">
                    <svg class="formSubmit" xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                        viewBox="0 0 24 24" fill="none" stroke="lightgrey" stroke-width="3" stroke-linecap="round"
                        stroke-linejoin="arcs">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </form>
            <div class="suggestions"></div>
        </div>
    </div>
</template>

<style media="screen" lang="scss">
@import '@/scss/utils/mixins';
@import '@/scss/utils/variables';

.formContainer__container {
    height: 20%;
    @include align(center, center);
    position: sticky;
    top: 0;
    width: 100%;
    padding-bottom: 2em;
    z-index: 1;

    &::before {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        width: 100%;
        content: "";
        @include background-image;
        background-image: var(--wallpaperSource);
        filter: blur(5px);
    }

    .formContainer {
        width: 50%;
        @include align(center, baseline);
        @include flex-direction(column);
        background-color: white;
        padding: 0.5% 1%;
        border-radius: 2em;
        opacity: 0.7;
        margin: 3% 0 0;
        box-shadow: 10px 10px 12px 2px $contentBackground;

        @media (max-width: 720px) {
            width: 70%;
        }

        .form {
            display: inline-flex;
            width: 100%;
            align-items: center;
            font-size: 1.1em;

            .questionBox {
                width: 100%;
                height: 2em;
                border: none;
                background: none;
                color: black;

                @media (max-width: 720px) {
                    height: 2em;
                    overflow-x: hidden;
                    text-overflow: ellipsis;
                }
            }

            ::placeholder {
                @include placeholder(black);
                font-size: 1.2em;
            }

            button {
                border: none;
                background: none;
                padding: 0;
                cursor: pointer;
            }

            &__Submit {
                margin-left: 1%;

                @media (max-width: 720px) {
                    width: 30px;
                    height: 30px;
                }
            }
        }

        .suggestions {
            font-size: 1.3em;
            width: 100%;
            overflow-y: auto;

            @media (max-width: 720px) {
                height: auto;
                overflow-y: auto;
            }

            * {
                color: black;
            }

            .suggestion {
                padding: 1% 0;
                align-items: center;
                width: 99%;
                @include flex-direction(row);
                cursor: pointer;

                &__icon {
                    padding-right: 2%;
                }

                &__label {
                    width: 10%;

                    @media (max-width: 720px) {
                        width: 30%;
                    }
                }

                &__desc {
                    font-style: italic;
                    color: gray;
                }
            }
        }
    }
}
</style>