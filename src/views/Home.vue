<script setup>
import { useGlobalStore } from '@/stores/globalStore';
const globalStore = useGlobalStore();

// import AddFeedForm from '../components/AddFeedForm.vue';
import axios from "axios";
import { onMounted } from 'vue';

let contentLength = Number();
let contents = [];
let searchQuery = '';

const getContent = (index) => {
  axios.get(
    `http://${window.location.hostname}:3000/api/content/${index}`
  ).then(response => {
    console.log(response);
    // response.data.isModified = false;

    if (response.data.type === "rss") {
      response.data.inputValue = response.data.reference;
      response.data.containerPageNumber = 1;
    } else if (response.data.type === "weather") {
      response.data.inputValue = response.data.reference;
    }

    contents.push(response.data);
  });
};

const getContentLength = async () => {
  let response = await axios.get(
    `http://${window.location.hostname}:3000/api/contentlength`
  );

  contentLength = response.data;

  for (let i = 0; i < contentLength; i++) {
    getContent(i);
  }
};

const getInvidiousInstanceHealth = async () => {
  const res = await axios.get('https://api.invidious.io/instances.json?pretty=1&sort_by=health');
  for (let i = 0; i < res.data.length; i++) {
    if (res.data[i][1].monitor !== null) {
      if (res.data[i][1].monitor['90dRatio'].ratio > 98 && !res.data[i][1].cors) {
        // Remove the final / if any
        globalStore.addInvidiousInstance(res.data[i][1].uri.replace(/\/$/, ''));
      } else if (i === res.data.length - 1) {
        if (globalStore.invidiousInstances[0] === undefined) {
          return 'Unable to retrieve Invidious instances health : instances health is unknown.';
        }
      }
    } else {
      return `Monitoring data unavailable for instance ${res.data[i][0]}`;
    }
  }
  console.log(globalStore.invidiousInstances);
};

const goToNextPage = async (containerId) => {
  contents[containerId].containerPageNumber++;
};

const goToPreviousPage = async (containerId) => {
  contents[containerId].containerPageNumber--;
};

const handleQuery = async () => {
  if (searchQuery.startsWith('!p ')) {

  } else {
    window.open(`https://www.google.com/search?q=${searchQuery}`);
  }
};

const modifyContent = async (content, index) => {
  if (content.isModified) {
    content.isModified = false;
  } else {
    content.isModified = true;
  }
};

const updateContent = async (content, index) => {
  const settingsUpdate = await axios.post(`http://${window.location.hostname}:3000/api/updatecontent`, {
    containerId: index,
    itemReference: content.inputValue
  });

  contents[index].type = settingsUpdate.data.type;
  contents[index].reference = settingsUpdate.data.reference;

  if (content.type === 'rss') {
    contents[index].feed = settingsUpdate.data.feed;
  } else if (content.type === 'weather') {
    console.log(contents[index]);
    contents[index].forecast = settingsUpdate.data.forecast;
  }
};

onMounted(() => {
  getContentLength();
  getInvidiousInstanceHealth();
});
</script>

<template>
  <main class="mainContainer flexColumn">
    <div id="formContainer__container" class="formContainer__container">
      <div class="formContainer flexRow">
        <form class="form" method="post" @submit.prevent="handleQuery()">
          <input class="questionBox" type="text" name="searchQuery" v-model="searchQuery"
            placeholder="What are you searching for ?" />
          <button type="submit" name="questionBox__submitBtn">
            <svg class="formSubmit" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
              fill="none" stroke="lightgrey" stroke-width="3" stroke-linecap="round" stroke-linejoin="arcs">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
        <div class="suggestions"></div>
      </div>
    </div>
    <span class="converter">
      <section class="converter__body flexRow">
        <img class="converter__body__remove flexRow" alt="Hide the converter"
          src="./client/scss/icons/interface/cross.svg" />
        <select class="converter__body__value1 flexRow">
          <option value="Choose a value">Choose a value</option>
          <option value="Byte">Byte</option>
          <option value="Kilobyte">Kilobyte</option>
          <option value="Megabyte">Megabyte</option>
          <option value="Gigabyte">Gigabyte</option>
          <option value="Terabyte">Terabyte</option>
        </select>
        <input class="converter__body__input input" placeholder="Enter a value here" />
        <select class="converter__body__value2 flexRow">
          <option value="Choose a value">Choose a value</option>
          <option value="Byte">Byte</option>
          <option value="Kilobyte">Kilobyte</option>
          <option value="Megabyte">Megabyte</option>
          <option value="Gigabyte">Gigabyte</option>
          <option value="Terabyte">Terabyte</option>
        </select>
        <input class="converter__body__result input" />
      </section>
    </span>
    <div class="msgContainer">
      <!-- <%= typeof msg != 'undefined' ? msg : '' %> -->
    </div>
    <div class="audio">
      <img class="audio__remove removeContentBtn flexRow" alt="Remove the audio player"
        src="./client/scss/icons/interface/cross.svg" />
      <span class="audio__container flexRow">
        <div class="audio__container__msg flexRow"></div>
        <div class="audio__container__player flexRow"></div>
      </span>
    </div>
    <div class="contentContainers flexRow">
      <section :class="content.type + 'Container'" class="content flexColumn"
        v-for="[iContent, content] of contents.entries()">
        <button @click="modifyContent(content)" :class="{
          hidden: content.isModified,
        }">
          Modify
        </button>
        <nav class="contentNav" :class="{
          hidden: !content.isModified,
          flexColumn: content.isModified,
        }">
          <button>Delete</button>
          <label class="contentNav__label">
            <!-- To translate and generalize  (RSS feed, location...)-->
            Item's reference :
            <input v-bind:type="content.type === 'rss' ? 'url' : 'text'" v-model="content.inputValue" />
          </label>
          <button @click="[modifyContent(content), updateContent(content, content.index)]">Ok</button>
        </nav>
        <h1 class="title" :class="{
          hidden: content.isModified,
          flexColumn: !content.isModified,
        }">
          <a class="link" :href="content.feed[0].meta.link" v-if="content.type === 'rss'">
            {{ content.feed[0].meta.title }}
          </a>
          <a class="link" :href="'https://openweathermap.org/city/' + content.forecast.list[0].id
            " v-else-if="content.type === 'weather'">
            Weather in {{ content.forecast.list[0].name }}
          </a>
          <article v-else>{{ content }}</article>
        </h1>
        <div class="linksContainer" :class="{
          hidden: content.isModified,
          flexColumn: !content.isModified,
        }" v-if="content.type === 'rss'">
          <a class="linksContainer__link" :class="{
            shown: ((contents[iContent].containerPageNumber === 1) && i <= 9) || ((contents[iContent].containerPageNumber > 1) && (i >= (contents[iContent].containerPageNumber - 1) * 10) || (i < (contents[iContent].containerPageNumber * 10))),
            hidden: ((contents[iContent].containerPageNumber === 1) && i > 9) || ((contents[iContent].containerPageNumber > 1) && (i < (contents[iContent].containerPageNumber - 1) * 10) || (i >= (contents[iContent].containerPageNumber * 10)))
          }" :href="article.link" v-for="[i, article] of content.feed.entries()">
            {{ article.title }}</a>
        </div>
        <div class="pager flexRow" v-if="content.type === 'rss' && content.feed.length > 10">
          <p @click="goToPreviousPage(iContent)" :class="{ 'invisible': contents[iContent].containerPageNumber === 1 }">
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white"
              stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </p>
          {{ contents[iContent].containerPageNumber }} / {{ Math.floor(content.feed.length / 10) }}
          <p @click="goToNextPage(iContent)"
            :class="{ 'invisible': contents[iContent].containerPageNumber === Math.floor(content.feed.length / 10) }">
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none"
              stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </p>
        </div>
        <div class="forecast flexRow" :class="{
          hidden: content.isModified,
          flexColumn: !content.isModified,
        }" v-else-if="content.type === 'weather'">
          <div class="forecast__content">
            <p>
              Forecast description :
              {{ content.forecast.list[0].weather[0].description }}
            </p>
            <p>Temperature : {{ content.forecast.list[0].main.temp }} °C</p>
            <p>Wind speed : {{ content.forecast.list[0].wind.speed }} km/h</p>
            <p>Humidity : {{ content.forecast.list[0].main.humidity }} %</p>
          </div>
          <img class="forecast__img"
            :src="`http://openweathermap.org/img/wn/${content.forecast.list[0].weather[0].icon}@2x.png`"
            :alt="content.forecast.list[0].weather[0].description + ' icon'"
            :title="content.forecast.list[0].weather[0].description + ' icon'" />
        </div>
      </section>
      <button @click="getInvidiousInstanceHealth()">Get Invidious instances health</button>
    </div>
    <section>{{ globalStore.invidiousInstances[0] }}</section>
  </main>
</template>

<style media="screen" lang="scss">
.contentContainers {
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.content {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  padding: 0.2rem;
  margin: 0.2rem;
  box-sizing: border-box;
  flex: 1;
  width: 30%;
  margin: 1em;
  padding: 1em;

  &Nav {
    &__label {
      width: 50%;

      input {
        flex: 1;
      }
    }
  }

  a,
  p {
    color: white;
    text-overflow: ellipsis;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    padding-top: .2em;
  }

  a:visited {
    color: lightgrey;
  }
}

.flexColumn {
  display: flex;
  flex-direction: column;
}

.flexRow {
  display: flex;
  flex-direction: row;
}

.forecast {
  align-items: center;

  &__content,
  &__img {
    flex: 1;
  }
}

.hidden {
  display: none;
}

.invisible {
  visibility: hidden;
}

.linksContainer__link {
  &.shown {
    display: block;
  }

  &.hidden {
    display: none;
  }
}

.pager {
  align-items: center;
  justify-content: space-evenly;
}
</style>

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
