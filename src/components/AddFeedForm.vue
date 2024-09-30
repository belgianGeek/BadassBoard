<script setup>
import axios from "axios";
import { ref } from 'vue';

let isFormDisplayed = ref(false);
let userChoice = ref('');

const getUserChoice = (event) => {
  userChoice.value = event.target.value;
}

const SendContent = async () => {
  const res = axios.post(
    `http://${window.location.hostname}:3000/api/content/add`, {
    userChoice
  });

  // TODO
};
</script>

<template>
  <section class="blank content flex" :class="{ 'opacity0': !isFormDisplayed }">
    <svg v-if="!isFormDisplayed" @click="isFormDisplayed = true" class="blank__addContent__svg"
      xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffffff"
      stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12">
      </line>
    </svg>
    <div class="addContent flex" :class="{ 'hidden': !isFormDisplayed }">
      <label for="addContent__select">What do you want to add ?</label>
      <select @change="getUserChoice($event)" class="addContent__select" name="addContent__select">
        <option value="">Choose a field</option>
        <option value="rss">Add a feed</option>
        <option value="weather">Weather forecast</option>
        <option value="YouTube">YouTube search box</option>
      </select>
      <div v-show="userChoice == 'rss'" class="addContent__feed flex">
        <input type="text" name="addContent__feed__input" class="addContent__feed__input input"
          placeholder="Enter a RSS feed URL">
      </div>
      <div v-show="userChoice == 'weather'" class="addContent__weather flex">
        <input type="text" name="addContent__weather__input" class="addContent__weather__input input"
          placeholder="Enter a location">
      </div>
      <div v-show="userChoice == 'youtubeSearch'" class="addContent__youtube flex">
        <p class="addContent__youtube__msg">Nothing to do here !</p>
        <p class="addContent__youtube__msg">Just click on the green button below <br>and you're all set, dude ! 😉
        </p>
      </div>
      <div v-show="userChoice !== ''" class="addContent__btnContainer flex">
        <button @click="isFormDisplayed = false" class="addContent__cancelBtn btn btn--red">Bring me back !</button>
        <button @click="SendContent()" class="addContent__submitBtn btn btn--green">Ok, that's it</button>
      </div>
    </div>
  </section>
</template>

<style media="screen" lang="scss">
@import '@/scss/utils/mixins';
@import '@/scss/utils/variables';
@import '@/scss/components/button';
@import '@/scss/components/input';
@import '@/scss/components/select';

.addContent {
  flex-direction: column;
  border-radius: 15px;
  font-size: 1.05em;
  box-sizing: border-box;
  width: 60%;
  height: 80%;
  flex-grow: 0;

  label {
    margin: 2% 0;
    text-align: center;
  }

  &__select,
  &__select option {
    color: black;
    height: 2.1em;
  }

  &__feed,
  &__weather,
  &__youtube {
    width: 100%;
    height: 100%;
    @include align(center, center);
    @include flex-direction;
  }

  &__youtube {
    &__msg {
      font-style: italic;
      margin: 1.5% 0;
      text-align: center;
      flex-wrap: wrap;
    }
  }

  &__btnContainer {
    width: 100%;
    justify-content: space-evenly;
    -webkit-justify-content: space-evenly;
  }

  &__feed__input,
  &__weather__input {
    border-radius: 5px;
  }

  &.content {
    flex-grow: 0;
    box-sizing: content-box;
  }

  .warning {
    align-items: center;
    background: none;
    font-size: 0.9em;
    height: auto;
  }
}

.blank {
  justify-content: center;
  align-items: center;
  max-width: 30%;

  &:hover {
    display: flex;
    opacity: 1;
  }

  &:hover .blank__addContent__svg {
    transform: rotate(360deg);
    transition: transform 1000ms;
  }

  &.content {
    box-sizing: content-box;
  }
}

.opacity0 {
  opacity: 0;
  transition: opacity 1000ms, transform 200ms;
}
</style>
