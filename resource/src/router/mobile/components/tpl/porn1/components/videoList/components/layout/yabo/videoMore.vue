<template>
  <div :class="$style['video-more-container']">
    <div :class="[$style['wrap'], $style[source]]">
      <swiper ref="swiper" :options="options">
        <swiper-slide
          v-for="info in videoTabs"
          :key="info.id"
          :class="[
            $style['item'],
            $style[source],
            { [$style.active]: info.id === +sortId }
          ]"
        >
          <span @click="setSortId(info.id)" :disabled="isDisable">{{
            info.title
          }}</span>
          <div :class="$style['line']" />
        </swiper-slide>
      </swiper>
      <div
        :class="[isSingle ? $style['is-single'] : $style['is-multiple']]"
        @click="isSingle = !isSingle"
      />
    </div>
    <div
      :ref="'video-list-wrap'"
      id="video-list-wrap"
      :class="[$style['video-list-wrap'], 'clearfix']"
    >
      <div
        v-for="info in videoList"
        :key="info.id"
        :class="[
          isSingle ? $style['single'] : $style['multiple'],
          $style['video-cell']
        ]"
        @click="
          $router.push({
            name: 'videoPlay',
            params: { id: info.id },
            query: { source: $route.query.source }
          })
        "
      >
        <div :class="[$style['image-wrap'], $style[siteConfig.ROUTER_TPL]]">
          <img :src="defaultImg" :img-id="info.id" />
        </div>
        <div :class="$style['title']">{{ info.title }}</div>
        <div v-if="isSingle" :class="$style['views']">
          <img :src="$getCdnPath('/static/image/_new/discover/ic_video.png')" />
          {{ info.views }}
        </div>
      </div>

      <infinite-loading
        v-if="hasInfinite"
        ref="infiniteLoading"
        @infinite="infiniteHandler"
      >
        <span slot="no-more" />
        <span slot="no-results" />
      </infinite-loading>
    </div>
  </div>
</template>

<script>
import InfiniteLoading from "vue-infinite-loading";
import axios from "axios";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import pornRequest from "@/api/pornRequest";
import { getEncryptImage } from "@/lib/crypto";
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    Swiper,
    SwiperSlide,
    InfiniteLoading
  },
  props: {
    setHeaderTitle: {
      type: Function,
      required: true
    },
    setHasSearchBtn: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      isReceive: false,
      hasInfinite: false,
      videoList: [],
      current: 0,
      total: 0,
      videoTabs: [],
      sortId: +this.$route.query.sortId,
      tagId: +this.$route.query.tagId,
      isSingle: false,
      source: this.$route.query.source,
      isDisable: false,
      queryTitle: this.$route.query.tag
    };
  },
  created() {
    this.setHeaderTitle(this.$text("S_FULL_HD_MOVIE", "全部高清影片"));
  },
  mounted() {
    this.changeTab(500);
    this.setVideoList();
  },
  beforeDestroy() {
    clearTimeout(this.changeTabTimer);
    this.changeTabTimer = null;
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    }),
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    },
    options() {
      return {
        slidesPerView: "auto",
        slideToClickedSlide: false,
        centeredSlides: true,
        centeredSlidesBounds: true,
        spaceBetween: 25,
        slidesOffsetBefore: 20,
        slidesOffsetAfter: 20,
        freeMode: true,
        observer: true,
        observeParents: true
      };
    },
    defaultImg() {
      // const isYabo = this.source === "yabo" || this.source === "av";
      // return this.$getCdnPath(
      //   `/static/image/${this.themeTPL}/default/${
      //     isYabo ? "bg_video03_d" : "bg_video03_1_d@3x"
      //   }.png`
      // );
      return "";
    }
  },
  methods: {
    getNewTab() {
      return pornRequest({
        method: "post",
        url: `/video/videolist`,
        getFreeSpace: this.source === "free-yv",
        data: {
          tag: this.queryTitle === "全部" ? "" : this.queryTitle,
          page: 1
        }
      }).then(response => {
        if (response.result && response.result.length > 0) {
          let videoArray = [];
          for (let i = 0; i < Object.keys(response.result).length; i++) {
            videoArray.push({
              id: response.result[i].id,
              title: response.result[i].name
            });
          }
          this.videoTabs = [{ id: 0, title: "全部" }, ...videoArray];
        } else {
          this.videoTabs = [];
        }
      });
    },
    getVideoTab() {
      return pornRequest({
        method: "get",
        url: `/video/sort`,
        getFreeSpace: this.source === "free-yv",
        params: {
          tag: this.$route.query.tag,
          tagId: this.tagId || ""
        }
      }).then(response => {
        if (response.status !== 200) {
          return;
        }

        let _videoTabs = response.result.sort(
          (a, b) => parseFloat(a.seat) - parseFloat(b.seat)
        );
        this.videoTabs = [{ id: 0, title: "全部" }, ..._videoTabs];
      });
    },
    setSortId(value) {
      if (this.sortId === value) {
        return;
      }

      this.sortId = value;
      this.current = 0;

      this.$router.replace({
        query: {
          tag: this.$route.query.tag,
          source: this.$route.query.source,
          tagId: this.tagId,
          sortId: value
        }
      });
      this.$refs["video-list-wrap"].scrollTop = 0;
      this.isDisable = true;
      this.changeTabTimer = setTimeout(() => {
        this.isDisable = false;
        this.changeTab(250);
      }, 250);
    },
    changeTab(time) {
      const swiper = this.$refs.swiper.$swiper;

      this.getNewTab().then(() => {
        // 讓 Swiper 的 index 在初始進來時，能將 Label 置中
        let initIndex = this.videoTabs.findIndex(item => {
          return item.id === this.sortId;
        });

        swiper.slideTo(initIndex, time, false);
      });
    },
    getVideoList(page) {
      return pornRequest({
        method: "post",
        url: `/video/list`,
        getFreeSpace: this.source === "free-yv",
        data: {
          tagId: this.tagId,
          sortId: this.sortId,
          page: page
        }
      });
    },
    setVideoList() {
      if (this.isReceive) {
        return;
      }

      this.isReceive = true;
      this.hasInfinite = false;

      this.getVideoList(1).then(response => {
        this.isReceive = false;

        if (response.status !== 200) {
          return;
        }

        if (response.result.data && response.result.data.length > 0) {
          this.videoList = [...response.result.data];
        } else {
          this.videoList = [];
        }

        this.current += 1;

        this.total = response.result.last_page;

        if (this.current >= this.total) {
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

      this.getVideoList(this.current + 1).then(response => {
        if (response.status !== 200) {
          return;
        }

        this.videoList = [...this.videoList, ...response.result.data];
        this.current += 1;
        this.total = response.result.last_page;
        this.isReceive = false;

        if (this.current >= this.total) {
          $state.complete();
          return;
        }

        $state.loaded();
      });
    }
  },
  watch: {
    sortId() {
      this.setVideoList();
    },
    videoList(val) {
      this.$nextTick(() => {
        setTimeout(() => {
          this.videoList.forEach(item => {
            getEncryptImage(item);
          });
        }, 100);
      });
    }
  }
};
</script>

<style lang="scss" module>
@import "~@/css/variable.scss";

.wrap {
  width: 100%;
  max-width: $mobile_max_width;
  padding-right: 40px;
  position: fixed;
  top: 43px;
  z-index: 2;
  background: #fefffe;

  &.gay {
    background: #3e81ac;
  }

  &.les {
    background: #cc4646;
  }
}

@media (orientation: landscape) {
  .wrap {
    max-width: $mobile_max_landscape_width !important;
  }
}

.item {
  width: auto;
  line-height: 44px;
  color: var(--slider_text_color);

  // 亞博點擊的文字color
  &.active {
    color: var(--slider_text_active_color);
  }

  &.gay {
    color: #a8ceff;
  }

  &.les {
    color: #ffbbbb;
  }

  &.gay,
  &.les {
    // 男男 or 女女 點擊的文字color
    &.active {
      color: #fff;
    }
  }

  .line {
    display: none;
    position: absolute;
    width: 48px;
    height: 2px;
    left: 50%;
    bottom: 2px;
    transform: translateX(-50%);
    border-radius: 1px;
    background-color: #fff;
  }

  &.active .line {
    display: block;
  }

  &.yv.active .line {
    background-color: var(--slider_underline_active_color);
  }

  &.av.active .line {
    background-color: var(--slider_underline_active_color);
  }
}

.btn-column {
  $size: 20px;
  position: absolute;
  top: 50%;
  right: 10px;
  width: $size;
  height: $size;
  background-position: 0 50%;
  background-repeat: no-repeat;
  background-size: $size $size;
  transform: translateY(-50%);
}

.is-multiple {
  composes: btn-column;
  background-image: url("/static/image/_new/discover/ic_list_double.png");
}

.is-single {
  composes: btn-column;
  background-image: url("/static/image/_new/discover/ic_list_single.png");
}

.video-list-wrap {
  padding-top: 43px;
  width: 97%;
  margin: 5px auto 0;
  overflow-y: scroll;
  height: calc(100vh - 60px);
  background-color: #fff;
}

.video-cell {
  margin: 5px auto 0;
}

.multiple {
  position: relative;
  float: left;
  width: 49%;
  margin-left: 0.6%;

  &:nth-child(2n) {
    float: right;
    margin-right: 0.6%;
  }

  .image-wrap {
    height: 110px;
  }
}

.single {
  composes: video-list-wrap;
  width: 99%;
  position: relative;
  height: auto;
  padding-top: 0;

  .image-wrap {
    height: 200px;
  }
}

.image-wrap {
  overflow: hidden;
  position: relative;
  background: linear-gradient(180deg, #fdfeff, #e2e8fe);
  &::after {
    content: "";
    z-index: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 72px;
    height: 72px;
    transform: translate(-50%, -50%);
    background-image: url("/static/image/porn1/default/default_logo.png");
  }
  &.aobo1 {
    background: linear-gradient(180deg, #fdfeff, #fdf2f2);
    &::after {
      content: "";
      z-index: 0;
      position: absolute;
      top: 50%;
      left: 50%;
      width: 72px;
      height: 72px;
      transform: translate(-50%, -50%);
      background-image: url("/static/image/aobo1/default/default_logo.png");
    }
  }
  > img {
    display: block;
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
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
  color: #fefffe;
  background: #000;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 1;
}

.single .title {
  height: 35px;
  line-height: 35px;
  padding-right: 30%;
}

.views {
  display: flex;
  align-items: center;
  color: #bcbdc1;
  position: absolute;
  right: 10px;
  border: 0;
  bottom: 0;
  height: 35px;
  line-height: 35px;
  font-size: 13px;

  > img {
    width: 13px;
    height: 13px;
    margin-right: 2.5px;
  }
}
</style>
