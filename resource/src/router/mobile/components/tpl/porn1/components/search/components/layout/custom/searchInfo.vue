<template>
  <div :class="$style['search-info-wrap']">
    <template v-if="searchList.length > 0">
      <div :class="[$style['list-wrap'], 'clearfix']">
        <div v-for="info in searchList" :key="info.id" :class="$style.wrap">
          <div
            :class="$style['image-wrap']"
            @click="
              $router.push({
                name: 'videoPlay',
                params: { id: info.id },
                query: { source: $route.query.source }
              })
            "
          >
            <img :src="img" :img-id="info.id" />
          </div>
          <div :class="$style.title">{{ info.title }}</div>
        </div>
      </div>
      <!-- 捲動加載 -->
      <infinite-loading
        v-if="hasInfinite"
        ref="infiniteLoading"
        @infinite="infiniteHandler"
      >
        <span slot="no-more" />
        <span slot="no-results" />
      </infinite-loading>
    </template>

    <template v-else-if="searchList.length === 0 && !isLoading">
      <div :class="$style['no-data']">
        <div :class="$style['search-img']">
          <img
            :src="$getCdnPath('/static/image/common/ic_search_grey.png')"
            alt="search"
          />
        </div>
        <p>无视频资料</p>
      </div>
    </template>
    <page-loading :is-show="isLoading" />
  </div>
</template>

<script>
import InfiniteLoading from "vue-infinite-loading";
import axios from "axios";
import querystring from "querystring";
import pornRequest from "@/api/pornRequest";
import { getEncryptImage } from "@/lib/crypto";
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    pageLoading: () =>
      import(
        /* webpackChunkName: 'pageLoading' */ "@/router/mobile/components/common/pageLoading"
      ),
    InfiniteLoading
  },
  props: {
    keyWord: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      isReceive: false,
      hasInfinite: false,
      searchList: [],
      current: 0,
      total: 0
    };
  },
  // watch: {
  // 如果需要邊輸入邊搜尋，再打開
  //   keyWord() {
  //     this.setSearchList();
  //   }
  // },
  mounted() {
    this.setSearchList();
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    }),
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    },
    img() {
      return this.$getCdnPath(
        `/static/image/${this.themeTPL}/default/bg_video03_1_d@3x.png`
      );
    }
  },
  methods: {
    getSearchList(page) {
      return pornRequest({
        method: "post",
        url: `/video/searchbywords`,
        data: {
          keyWords: this.keyWord,
          page: page
        }
      });
    },
    setSearchList() {
      if (this.isReceive) {
        return;
      }

      if (!this.keyWord) {
        this.isLoading = false;
        this.searchList = [];
        this.hasInfinite = false;
        return;
      }

      this.isLoading = true;
      this.isReceive = true;
      this.hasInfinite = false;

      this.getSearchList(1).then(response => {
        this.isLoading = false;
        this.isReceive = false;
        if (response.status !== 200 || !response.result.data) {
          this.searchList = [];
          return;
        }

        this.searchList = [...response.result.data];
        this.current += 1;
        this.total = response.result.last_page;

        setTimeout(() => {
          this.searchList.forEach(item => {
            getEncryptImage(item);
          });
        }, 300);

        if (response.result.current_page >= response.result.last_page) {
          return;
        }

        this.hasInfinite = true;
      });
    },
    infiniteHandler($state) {
      if (this.isReceive) {
        return;
      }

      this.isReceive = true;

      this.getSearchList(this.current + 1).then(response => {
        if (response.status !== 200) {
          return;
        }

        this.searchList = [...this.searchList, ...response.result.data];
        this.current += 1;
        this.total = response.result.last_page;
        this.isReceive = false;

        setTimeout(() => {
          this.searchList.forEach(item => {
            getEncryptImage(item);
          });
        }, 300);

        if (response.result.current_page >= response.result.last_page) {
          $state.complete();
          return;
        }

        $state.loaded();
      });
    }
  }
};
</script>

<style lang="scss" module>
@import "~@/css/variable.scss";

.search-info-wrap {
  position: relative;
  height: calc(100vh - 43px); // scroll 高度無限加載問題
  overflow-y: scroll;
}

.list-wrap {
  width: 97%;
  margin: 10px auto 0;
}

.wrap {
  position: relative;
  float: left;
  height: 115px;
  width: 49%;
  margin-left: 0.6%;
  margin-top: 5px;

  &:nth-child(2n) {
    float: right;
    margin-right: 0.6%;
  }
}

.image-wrap {
  overflow: hidden;
  position: relative;
  height: 100%;
  background-color: #161823;
  border-radius: 5px;

  > img {
    width: 100%;
    min-height: 100%;
    margin: auto;
  }
}

.title {
  position: absolute;
  width: 100%;
  height: 20px;
  line-height: 20px;
  bottom: 0;
  font-size: 12px;
  color: rgb(61, 61, 61);
  background: rgb(255, 255, 255);
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 1;
}

.no-data {
  position: absolute;
  width: 100%;
  height: calc(100vh - 100px);
  background: #f8f8f8;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .search-img {
    position: relative;
    width: 63px;
    height: 63px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  p {
    font-size: 16px;
    margin-top: 10px;
    color: #000;
  }
}

@media screen and (min-width: $pad) {
  .title {
    font-size: 16px;
  }

  .image-wrap {
    height: 115px;
  }

  .title {
    font-size: 16px;
  }
}
</style>
