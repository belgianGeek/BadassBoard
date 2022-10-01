<script>
// import AddFeedForm from '../components/AddFeedForm.vue';
import axios from 'axios';

export default {
  name: 'Home',
  components: {
    // AddFeedForm
  },
  data() {
    return {
      contentLength: Number(),
      contents: []
    }
  },
  methods: {
    async getContent(index) {
      let response = await axios.get(`http://localhost:3000/api/content/${index}`);
      this.contents.push(response.data);
    },
    async getContentLength() {
      let response = await axios.get('http://localhost:3000/api/contentlength');
      this.contentLength = response.data;

      for (let i = 0; i < this.contentLength; i++) {
        this.getContent(i);
      }
    }
  },
  mounted() {
    this.getContentLength();
  }
}
</script>

<template>
<main class="mainContainer flex">
  <div id="formContainer__container" class="formContainer__container">
    <div class="formContainer flex">
      <form class="form" method="get">
        <input class="questionBox" type="text" name="question" placeholder="What are you searching for ?">
        <button type="submit" name="questionBox__submitBtn">
          <svg class="formSubmit" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="lightgrey" stroke-width="3" stroke-linecap="round" stroke-linejoin="arcs">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>
      <div class="suggestions"></div>
    </div>
  </div>
  <span class="converter">
    <section class="converter__body flex">
      <img class="converter__body__remove flex" alt="Hide the converter" src="./client/scss/icons/interface/cross.svg">
      <select class="converter__body__value1 flex">
        <option value="Choose a value">Choose a value</option>
        <option value="Byte">Byte</option>
        <option value="Kilobyte">Kilobyte</option>
        <option value="Megabyte">Megabyte</option>
        <option value="Gigabyte">Gigabyte</option>
        <option value="Terabyte">Terabyte</option>
      </select>
      <input class="converter__body__input input" placeholder="Enter a value here">
      <select class="converter__body__value2 flex">
        <option value="Choose a value">Choose a value</option>
        <option value="Byte">Byte</option>
        <option value="Kilobyte">Kilobyte</option>
        <option value="Megabyte">Megabyte</option>
        <option value="Gigabyte">Gigabyte</option>
        <option value="Terabyte">Terabyte</option>
      </select>
      <input class="converter__body__result input">
    </section>
  </span>
  <div class="msgContainer">
    <!-- <%= typeof msg != 'undefined' ? msg : '' %> -->
  </div>
  <div class="audio">
    <img class="audio__remove removeContentBtn flex" alt="Remove the audio player" src="./client/scss/icons/interface/cross.svg">
    <span class="audio__container flex">
      <div class="audio__container__msg flex"></div>
      <div class="audio__container__player flex"></div>
    </span>
  </div>
  <div class="contentContainers flex">
    <section class="content flex" v-for="content in this.contents">
      <span :class="content.type + 'Container'">
        <h1 class="title">
          <a class="link" :href="content.feed[0].meta.link" v-if="content.type === 'rss'">
            {{ content.feed[0].meta.title }}
          </a>
          <a class="link" :href="'https://openweathermap.org/city/' + content.forecast.list[0].id" v-else-if="content.type === 'weather'">
            Weather in {{ content.forecast.list[0].name }}
          </a>
          <a class="link" href="#" v-else>
            TODO
          </a>
        </h1>
      </span>
      <div class="linksContainer" v-if="content.type === 'rss'" v-for="article in content.feed">
        <a :href="article.link">{{ article.title }}</a>
      </div>
      <div class="forecast" v-else-if="content.type === 'weather'">
        <p>Forecast description : {{ content.forecast.list[0].weather[0].description }}</p>
        <p>Temperature : {{ content.forecast.list[0].main.temp }} °C</p>
        <p>Wind speed : {{ content.forecast.list[0].wind.speed }} km/h</p>
        <p>Humidity : {{ content.forecast.list[0].main.humidity }} %</p>
        <img :src="`http://openweathermap.org/img/wn/${content.forecast.list[0].weather[0].icon}@2x.png`" :alt="content.forecast.list[0].weather[0].description + ' icon'" :title="content.forecast.list[0].weather[0].description + ' icon'">
      </div>
    </section>
  </div>
</main>
</template>

    <!-- <%- include('settings'); %>
    <div class="rssTooltip flex"></div>
    <%- include('about'); %>
    <div class="yt2rss hidden">
      <section class="yt2rss__container flex">
        <h2 class="yt2rss__container__title">Get a Youtube channel RSS feed</h2>
        <div class="yt2rss__container__child flex">
          <form id="yt2rss__container__child__left" class="yt2rss__container__child__left flex">
            <input class="yt2rss__container__child__left__input input" type="text" placeholder="Channel ID">
            <input class="yt2rss__container__child__left__output input" type="text" placeholder="Result">
          </form>
          <span class="yt2rss__container__child__right flex">
            <button class="yt2rss__container__child__right__btn yt2rss__container__child__right__svgBtn flex" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy the RSS feed URL
            </button>
            <button form="yt2rss__container__child__left" class="yt2rss__container__child__right__btn btn btn--red" type="reset">Reset all fields</button>
          </span>
        </div>
      </section>
    </div>
    <div class="confirmation click">
      <section class="confirmation__child flex">
        <h1 class="confirmation__child__title">Watch out !</h1>
        <span class="confirmation__child__content flex">
          <p class="confirmation__child__content__msg">Do you really want to remove this content ?</p>
        </span>
        <span class="confirmation__child__btnContainer flex">
          <button class="confirmation__child__btnContainer__cancelBtn btn btn--red" type="button" name="confirmation__child__btnContainer__cancelBtn">Nooooooo !</button>
          <button class="confirmation__child__btnContainer__saveBtn btn btn--green" type="button" name="confirmation__child__btnContainer__saveBtn">Yep yep</button>
        </span>
      </section>
    </div>
    <div class="loading flex">
      <img class="loading__img" alt="Loading image" src="client/scss/icons/interface/loading.png" />
    </div>
    <%- include('footer'); %>
  </div>
  <%- include('scripts'); %> -->
