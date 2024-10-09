<script setup>
import { useGlobalStore } from '@/stores/globalStore';
const globalStore = useGlobalStore();

import AddFeedForm from '../components/AddFeedForm.vue';
import axios from "axios";
import { onMounted, ref } from 'vue';

import AudioPlayer from '../components/AudioPlayer.vue';
import SearchForm from '../components/SearchForm.vue';
import YouTubeSearch from '../components/YouTubeSearch.vue';
import Wallpaper from '../components/Wallpaper.vue';

let contentLength = ref(Number());
let contents = ref([]);
let searchQuery = ref('');

const getContent = (index) => {
  axios.get(
    `http://${window.location.hostname}:3000/api/content/get/${index}`
  ).then(response => {
    // response.data.isModified = false;

    if (response.data.type === "rss") {
      response.data.inputValue = response.data.reference;
      response.data.containerPageNumber = 1;
    } else if (response.data.type === "weather") {
      response.data.inputValue = response.data.reference;
    }

    contents.value.push(response.data);
  });
};

const getContentLength = async () => {
  let response = await axios.get(
    `http://${window.location.hostname}:3000/api/content/length`
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
      if (res.data[i][1].monitor['last_status'] === 200 && res.data[i][1].api) {
        // Remove the final / if any
        globalStore.addInvidiousInstance(res.data[i][1].uri.replace(/\/$/, ''));
      }

      if (i === res.data.length - 1) {
        if (globalStore.invidiousInstances[0] === undefined) {
          return 'Unable to retrieve Invidious instances health : instances health is unknown.';
        } else {
          return globalStore.invidiousInstances;
        }
      }
    } else {
      return `Monitoring data unavailable for instance ${res.data[i][0]}`;
    }
  }
};

const goToNextPage = async (containerId) => {
  contents.value[containerId].containerPageNumber++;
};

const goToPreviousPage = async (containerId) => {
  contents.value[containerId].containerPageNumber--;
};

const modifyContent = async (content) => {
  if (content.isModified) {
    content.isModified = false;
  } else {
    content.isModified = true;
  }
};

const updateContent = async (content, index) => {
  const settingsUpdate = await axios.post(`http://${window.location.hostname}:3000/api/content/update`, {
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
  <Wallpaper />
  <main class="mainContainer flexColumn">
    <SearchForm :wallpaper-source="globalStore.wallpaper" />
    <div class="msgContainer">
      <!-- <%= typeof msg != 'undefined' ? msg : '' %> -->
    </div>
    <AudioPlayer v-if="globalStore.audio.isDisplayed" :author="globalStore.audio.author" :url="globalStore.audio.url"
      :thumbnail="globalStore.audio.thumbnail" :title="globalStore.audio.title" />
    <div class="contentContainers flexRow">
      <section :class="content.type + 'Container'" class="content flexColumn"
        v-for="[iContent, content] of contents.entries()">
        <span class="content_BtnContainer flexRow">
          <button @click="modifyContent(content)" :class="{
      hidden: content.isModified,
    }">
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#fff" stroke-width="1.5">
                <path
                  d="m21.3175 7.14139-.4936-.8566c-.3733-.64783-.5599-.97174-.8775-1.10091-.3176-.12916-.6768-.02724-1.3951.1766l-1.2202.3437c-.4586.10576-.9398.04576-1.3585-.16939l-.3369-.19437c-.3591-.22999-.6353-.56909-.7882-.96768l-.3339-.99738c-.2196-.66002-.3294-.99003-.5908-1.17879-.2613-.18876-.6085-.18876-1.3029-.18876h-1.1148c-.6943 0-1.0415 0-1.3029.18876-.26135.18876-.37114.51877-.59071 1.17879l-.33396.99738c-.15288.39859-.42908.73769-.78816.96768l-.33688.19437c-.41875.21515-.8999.27515-1.35851.16939l-1.22023-.3437c-.71834-.20384-1.0775-.30576-1.39508-.1766-.31758.12917-.50422.45308-.87752 1.10091l-.49358.8566c-.34991.60725-.52487.91088-.49091 1.2341.03395.32322.26817.58369.7366 1.10463l1.03104 1.15268c.252.319.43091.875.43091 1.3749 0 .5001-.17885 1.0559-.43088 1.375l-1.03107 1.1527c-.46843.521-.70264.7814-.7366 1.1047-.03396.3232.141.6268.49091 1.234l.49357.8566c.37329.6478.55995.9718.87753 1.1009.31758.1292.67675.0273 1.3951-.1766l1.22017-.3437c.45869-.1058.93993-.0457 1.35873.1695l.33683.1944c.35901.23.63514.569.788.9676l.33399.9975c.21957.66.32936.99.59071 1.1788.2614.1887.6086.1887 1.3029.1887h1.1148c.6944 0 1.0416 0 1.3029-.1887.2614-.1888.3712-.5188.5908-1.1788l.334-.9975c.1528-.3986.4289-.7376.788-.9676l.3368-.1944c.4188-.2152.9-.2753 1.3587-.1695l1.2202.3437c.7183.2039 1.0775.3058 1.3951.1766.3176-.1291.5042-.4531.8775-1.1009l.4936-.8566c.3499-.6072.5248-.9108.4909-1.234-.034-.3233-.2682-.5837-.7366-1.1047l-1.0311-1.1527c-.252-.3191-.4309-.8749-.4309-1.375 0-.4999.179-1.0559.4309-1.3749l1.0311-1.15268c.4684-.52094.7026-.78141.7366-1.10463.0339-.32322-.141-.62685-.4909-1.2341z"
                  stroke-linecap="round" />
                <path
                  d="m15.5195 12c0 1.933-1.567 3.5-3.5 3.5s-3.49997-1.567-3.49997-3.5 1.56697-3.5 3.49997-3.5 3.5 1.567 3.5 3.5z" />
              </g>
            </svg>
          </button>
          <button @click="getContent(content.index)" v-if="content.type === 'rss' || content.type === 'weather'">
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                <path
                  d="m17.4776 9.01106c.0074-.00004.0149-.00005.0224-.00005 2.4853 0 4.5 2.01839 4.5 4.50829 0 2.3205-1.75 4.2315-4 4.4807m-.5224-8.98894c.0148-.165.0224-.3321.0224-.50097 0-3.04314-2.4624-5.51009-5.5-5.51009-2.87676 0-5.23767 2.21267-5.47958 5.03192m10.95718.97914c-.1023 1.13654-.549 2.17354-1.2348 3.00544m-9.72238-3.98458c-2.53644.24181-4.52042 2.38198-4.52042 4.98638 0 2.4234 1.71776 4.4449 4 4.909m.52042-9.89538c.15784-.01505.31781-.02275.47958-.02275 1.12582 0 2.16474.37277 3.0005 1.00184" />
                <path d="m12 21v-8m0 8c-.7002 0-2.00847-1.9943-2.5-2.5m2.5 2.5c.7002 0 2.0085-1.9943 2.5-2.5" />
              </g>
            </svg>
          </button>
        </span>
        <nav class="contentNav" :class="{
      hidden: !content.isModified,
      flexColumn: content.isModified,
    }">
          <button>Delete</button>
          <label class="contentNav__label">
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
          <p v-else-if="content.type === 'youtubeSearch'">Instant YouTube search</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none"
              stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
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
        <YouTubeSearch :componentType="content.type" />
      </section>
      <AddFeedForm />
    </div>
  </main>
</template>

<style media="screen" lang="scss">
@import '@/scss/utils/mixins';
@import '@/scss/utils/variables';
@import "@/scss/base/body";
@import "@/scss/base/fonts";

.mainContainer {
  width: 100%;
  height: 100%;
}

.contentContainers {
  flex-wrap: wrap;
  height: 80%;
  width: 100%;
}

.content {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  box-sizing: border-box;
  flex: 1;
  flex-basis: 30%;
  width: 30%;
  margin: 1em;
  padding: 1em;
  height: 45vh;

  &_BtnContainer {
    align-self: flex-end;

    button {
      background: none;
      border: none;
      margin: 0 .3em;
      cursor: pointer;
    }
  }

  &Nav {
    &__label {
      width: 50%;
    }

    button {
      @include btn-style;
    }

    input {
      flex: 1;
      @include input-style;
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

.flex {
  display: flex;
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
