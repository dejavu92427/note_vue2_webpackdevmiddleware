<script>
//這裡是form  resource/src/router/mobile/components/tpl/porn1/components/videoList/components/layout/index.vue
//getVideoTag 取得影片標籤並往下發展
//^^^^(pornRequest.js 帶入siteId:1 ,jwt:(搜尋“getV2Token”帶入configInfo.PORN_CONFIG.ID.SPACE取得的token） , videoSpaceId:9)
//以chrome network 就是api :https://hightide.app/api/v1/video/tag
</script>

<template>
  <div :class="$style['video-lobby-container']">
    <div :class="[$style['tag-wrap'], $style[source]]">
      <swiper ref="swiper" :options="options">
        <swiper-slide
          v-for="info in videoTag"
          :key="info.id"
          :class="[
            $style['tag-item'],
            $style[source],
            { [$style.active]: info.id === +videoType.id }
          ]"
        >
          <span
            @click.stop="onChangeVideoType(info.id, info.title)"
            :disabled="isDisable"
          >
            {{ info.title }}
          </span>
          <div :class="[$style['line'], $style[siteConfig.ROUTER_TPL]]" />
        </swiper-slide>
      </swiper>

      <div
        :class="[
          $style['icon-arrow'],
          $style[source],
          { [$style.active]: isShowAllTag }
        ]"
        @click.stop="onShowAllTag(!isShowAllTag)"
      >
        <img
          v-if="source === 'yabo' || source === 'av'"
          :src="
            $getCdnPath(
              `/static/image/_new/common/icon_more${
                isShowAllTag ? '_close' : ''
              }.png`
            )
          "
        />
        <img
          v-else
          :src="
            $getCdnPath(
              `/static/image/_new/common/icon_more${
                isShowAllTag ? '_close' : '_w'
              }.png`
            )
          "
        />
      </div>
    </div>

    <div
      v-show="isShowAllTag"
      :class="[
        $style['all-tag-wrap'],
        $style[siteConfig.ROUTER_TPL],
        $style[source],
        'clearfix'
      ]"
    >
      <template v-for="(tag, index) in videoTag">
        <div
          :key="`all-tag-${index}`"
          @click="onChangeVideoType(tag.id, tag.title)"
          :class="[
            [tag.title.length > 4 ? $style['small'] : ''],
            { [$style.active]: tag.id === +videoType.id }
          ]"
        >
          {{ tag.title }}
        </div>
      </template>
    </div>

    <div
      :ref="'video-list-wrap'"
      :class="[$style['video-list-wrap'], 'clearfix']"
      id="video-list-wrap"
    >
      <div
        :id="`${i}`"
        v-for="(videoData, i) in allVideoList"
        :key="`video-type-${i}`"
        :class="$style['video-cell']"
      >
        <div v-if="videoData.list" :class="[$style['video-type'], 'clearfix']">
          <div
            :class="[
              $style['type-name'],
              $style[source],
              $style[siteConfig.ROUTER_TPL]
            ]"
          >
            {{ videoData.name }}
          </div>
          <div
            :class="[
              $style['btn-more'],
              $style[source],
              $style[siteConfig.ROUTER_TPL]
            ]"
            @click.stop="handleMore(videoData)"
          >
            更多
          </div>
        </div>

        <div
          :class="[$style['video-block'], $style['clearfix']]"
          v-if="videoData.list"
        >
          <div
            v-for="video in videoData.list.slice(0, 2)"
            :key="`video-${video.id}`"
            :href="`/mobile/videoPlay/${video.id}`"
            :class="[
              $style['video'],
              $style[source],
              $style[siteConfig.ROUTER_TPL]
            ]"
            @click.stop="handleVideo(video)"
          >
            <img :src="defaultImg" :img-id="video.id" />
            <div :class="$style['video-title']">{{ video.title }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pornRequest from "@/api/pornRequest";
import { getEncryptImage } from "@/lib/crypto";
import { mapGetters } from "vuex";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";

export default {
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    setHasSearchBtn: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      isShowAllTag: false,
      source: this.$route.query.source,
      videoTag: [],
      videoSort: [],
      videoRecommand: [],
      videoList: [],
      videoType: { id: 0, title: "" },
      resetTimer: null,
      isDisable: false
    };
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
    },
    allVideoList() {
      const videoRecommand =
        this.videoType.id === 0 ? [...this.videoRecommand] : [];
      // const videoList = this.videoSort.reduce(
      //   (init, sort) => {
      //     const data = find(this.videoList, video => video.id === sort.id);

      //     if (!data) {
      //       return init;
      //     }

      //     return [...init, { ...data }];
      //   },
      //   [...videoRecommand]
      // );

      const _videoList = [...videoRecommand, ...this.videoList];
      this.videoListTimer = setTimeout(() => {
        _videoList.forEach(item => {
          if (item && item.list) {
            item.list.forEach(i => {
              getEncryptImage(i);
            });
          }
        });
      }, 300);

      return _videoList;
    }
  },
  created() {
    if (this.$route.query.id && this.$route.query.title) {
      this.videoType.id = this.$route.query.id;
      this.videoType.title = this.$route.query.title;
    } else {
      this.$route.query.id = this.videoType.id = 0;
      this.$route.query.title = this.videoType.title = "全部";
    }

    this.initData();
  },
  mounted() {
    this.changeTab(500);
  },
  beforeDestroy() {
    clearTimeout(this.resetTimer);
    this.resetTimer = null;
    clearTimeout(this.changeTabTimer);
    this.changeTabTimer = null;
    clearTimeout(this.videoListTimer);
    this.videoListTimer = null;
  },

  methods: {
    initData() {
      this.getVideoTag();
      this.getVideoRecommand();
      this.getVideoList();
    },
    handleVideo(video) {
      window.location.replace(
        `${window.location.pathname}${window.location.search}#${this.$route.query.id}`
      );
      this.openVideo("videoPlay", {
        params: { id: video.id },
        // query: { source: this.$route.query.source }
        query: {
          tag: video.name,
          source: this.$route.query.source,
          tagId: +this.videoType.id || 0,
          sortId: +video.id || 0
        }
      });
    },
    handleMore(videoData) {
      window.location.replace(
        `${window.location.pathname}${window.location.search}#${this.$route.query.id}`
      );
      this.openVideo("videoList", {
        query: {
          tag: this.videoType.title,
          source: this.$route.query.source,
          tagId: +this.videoType.id || 0,
          sortId: +videoData.id || 0
        }
      });
    },
    getImg(img) {
      const isYabo = this.source === "yv" || this.source === "av";
      return {
        src: img,
        error: this.$getCdnPath(
          `/static/image/${this.themeTPL}/default/${
            isYabo ? "bg_video03_d" : "bg_video03_1_d@3x"
          }.png`
        ),
        loading: this.$getCdnPath(
          `/static/image/${this.themeTPL}/default/${
            isYabo ? "bg_video03_d" : "bg_video03_1_d@3x"
          }.png`
        )
      };
    },
    getVideoTag() {
      return pornRequest({
        url: "/video/tag",
        method: "get",
        getFreeSpace: this.source === "free-yv"
      }).then(response => {
        if (response.status !== 200 || !response.result) {
          return;
        }
        let _sort = response.result.sort(
          (a, b) => parseFloat(a.seat) - parseFloat(b.seat)
        );
        this.videoTag = [{ id: 0, title: "全部" }, ..._sort];
      });
    },
    // 切換當前影片分類
    onChangeVideoType(index, title) {
      this.onShowAllTag(false);

      if (
        this.$route.query.id !== String(index) &&
        this.$route.query.title !== title
      ) {
        this.videoType = { ...this.videoTag[index] };
        this.videoType.id = index;
        this.videoType.title = title;
        this.$router.replace({
          query: {
            tag: this.videoType.title,
            source: this.$route.query.source,
            id: this.videoType.id,
            title: this.videoType.title
          }
        });
        this.$refs["video-list-wrap"].scrollTop = 0;
      }
      this.isDisable = true;
      this.changeTabTimer = setTimeout(() => {
        this.isDisable = false;
        this.changeTab(250);
      }, 250);
    },
    changeTab(time) {
      const swiper = this.$refs.swiper.$swiper;
      // 讓 Swiper 的 index 在初始進來時，能將 Label 置中
      let initIndex = this.videoTag.findIndex(item => {
        return item.id === parseInt(this.videoType.id);
      });
      swiper.slideTo(initIndex, time, false);
    },
    onShowAllTag(value) {
      this.isShowAllTag = value;
    },
    getVideoSort() {
      return pornRequest({
        method: "get",
        url: "/video/sort",
        getFreeSpace: this.source === "free-yv"
      }).then(response => {
        if (response.status !== 200) {
          return;
        }

        this.videoSort = [...response.result];
      });
    },
    getVideoRecommand() {
      return pornRequest({
        url: `/video/recommand`,
        getFreeSpace: this.source === "free-yv"
      }).then(response => {
        if (response.status !== 200) {
          return;
        }

        this.videoRecommand = [...response.result];
      });
    },
    // 取得所有影片(熱門推薦除外)
    getVideoList() {
      return pornRequest({
        method: "post",
        url: `/video/videolist`,
        getFreeSpace: this.source === "free-yv",
        data: {
          tag: this.videoType.title === "全部" ? "" : this.videoType.title,
          page: 1
        }
      }).then(response => {
        if (response.status !== 200) {
          if (!this.resetTimer) {
            this.resetTimer = setTimeout(() => {
              this.initData();
              clearTimeout(this.resetTimer);
            }, 3000);
          }
          return;
        }

        this.resetTimer = null;
        if (response.result && response.result.length > 0) {
          this.videoList = [...response.result];
        } else {
          this.videoList = [];
        }

        this.$nextTick(() => {
          this.videoType.id = this.$route.query.id;
          this.videoType.title = this.$route.query.title;
          // if (window.location.hash) {
          //   const hash = Number(window.location.hash.replace("#", "")) || 0;
          //   const wrap = document.getElementById("video-list-wrap");
          //   const cell = document.getElementsByClassName(
          //     this.$style["video-cell"]
          //   );
          //   if (wrap && cell && cell[0]) {
          //     wrap.scrollTop = cell[0].offsetHeight * hash;
          //   }
          // }
        });
      });
    },
    openVideo(name, routerParam) {
      this.$router.push({ name, ...routerParam });
    }
  },
  watch: {
    videoType() {
      this.getVideoList();
    }
  }
};
</script>

<style lang="scss" module>
@import "~@/css/variable.scss";

.video-lobby-container {
  padding-bottom: 20px;
}

.tag-wrap {
  width: 100%;
  max-width: $mobile_max_width;
  padding-right: 40px;
  position: fixed;
  top: 43px;
  z-index: 2;
  // display: -ms-flexbox;
  //display: flex;
  transition-property: transform;
  overflow-x: auto;
  background: #fefffe;

  &.gay {
    background: #3e81ac;
  }

  &.les {
    background: #cc4646;
  }
}

@media (orientation: landscape) {
  .tag-wrap {
    max-width: $mobile_max_landscape_width !important;
  }
}

.tag-item {
  // width: auto;
  // line-height: 42px;
  // margin: 0px 15px;
  // flex-shrink: 0;
  // height: 100%;
  // text-align: center;
  // position: relative;
  // transition-property: transform;
  width: auto;
  line-height: 42px;
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

    &.sg1 {
      background: #bd9d7d;
    }
  }

  &.active .line {
    display: block;
  }

  &.yabo.active .line {
    background-color: var(--slider_underline_active_color);

    &.sg1 {
      background: #bd9d7d;
    }
  }

  &.av.active .line {
    background-color: var(--slider_underline_active_color);
  }
}

.icon-arrow {
  float: right;
  width: 30px;
  position: fixed;
  right: 3%;
  top: 57px;
  transition: all 0.1s;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: -webkit-linear-gradient(left, hsla(0, 0%, 100%, 0.3), #fff);
  background: -o-linear-gradient(right, hsla(0, 0%, 100%, 0.3), #fff);
  background: -moz-linear-gradient(right, hsla(0, 0%, 100%, 0.3), #fff);
  background: linear-gradient(90deg, hsla(0, 0%, 100%, 0.3), #fff);

  &.gay,
  &.les {
    background: none;
  }

  img {
    display: block;
    width: 17px;
  }
}

.all-tag-wrap {
  position: absolute;
  top: 84px;
  right: 0;
  left: 0;
  z-index: 2;
  border-radius: 0 0 10px 10px;
  background-color: #fff;
  overflow-y: scroll;

  &.porn1 {
    height: calc(100% - 85px);
    opacity: 0.9;
    > div {
      margin-top: 7px;
    }
  }

  > div {
    float: left;
    width: 23%;
    height: 28px;
    line-height: 28px;
    margin: 0 1% 4px;
    border: 1px solid var(--video_more_dropdown_border_color);
    border-radius: 5px;
    color: var(--video_more_dropdown_text_color);
    background: var(--square_background_color);
    font-size: 14px;
    text-align: center;

    &.small {
      font-size: 12px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &.active {
      color: var(--video_more_dropdown_text_active_color);
      background: var(--video_more_dropdown_background_active_color);
      border: 1px solid var(--video_more_dropdown_border_active_color);
    }
  }

  &.gay > div {
    border-color: #3e81ac;
    color: #3e81ac;

    &.active {
      color: #3e81ac;
      background: none;
      border: 1px solid #3e81ac;
    }
  }

  &.les > div {
    border-color: #d64545;
    color: #d64545;

    &.active {
      color: #d64545;
      background: none;
      border: 1px solid #d64545;
    }
  }

  &.sg1 > div {
    color: #bd9d7d;
    border: 1px solid #bd9d7d;

    &.active {
      color: #ffffff;
      background: var(--video_search_button);
    }
  }
}

.video-list-wrap {
  overflow-y: auto;
  padding: 0 17px;
  background: #f8f8f8;
  padding-top: 43px;
  height: calc(100vh - 50px);
}

.video-cell {
  padding: 8px 0 1px;
}

.video-type {
  margin-bottom: 5px;
}

.type-name {
  float: left;
  height: 20px;
  line-height: 20px;
  padding-left: 20px;
  background: url("/static/image/common/icon_item.png") 0 50% no-repeat;
  background-size: 15px 15px;
  color: var(--main_color);
  font-weight: 700;
  font-size: 12px;

  &.porn1 {
    background: url("/static/image/common/icon_item_b.png") 0 50% no-repeat;
    background-size: 15px 15px;
  }

  &.aobo1 {
    background: url("/static/image/aobo1/common/icon_item_b.png") 0 50%
      no-repeat;
    background-size: 15px 15px;
  }

  &.sp1 {
    background: url("/static/image/aobo1/common/icon_item_b.png") 0 50%
      no-repeat;
    background-size: 15px 15px;
  }
  &.gay {
    color: #333;
  }

  &.gay,
  &.les {
    background-image: url("/static/image/_new/common/icon_item_black.png");
  }
}

.btn-more {
  float: right;
  width: 53px;
  height: 20px;
  line-height: 20px;
  border-radius: 3px;
  font-size: 12px;
  text-align: center;
  background: var(--main_button_color1);
  color: var(--main_button_text_color1);

  &.gay {
    background: #4a8cb8;
  }

  &.les {
    background: #d64545;
  }

  &.sg1 {
    background: var(--video_search_button);
  }

  // &:hover {
  //   color: #fff;
  // }
}

.video-block {
  display: flex;
  justify-content: space-between;
}

.wrap {
  overflow: hidden;
  position: relative;
  float: left;
  width: 49%;
  margin-bottom: 3px;
  box-sizing: border-box;

  > img {
    display: block;
    width: 100%;
  }

  > div {
    overflow: hidden;
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    line-height: 20px;
    background-color: #000;
    color: #fefefe;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
  }
}
.video-title {
  z-index: 1;
}

.video {
  composes: wrap;
  height: 117px;
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
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    min-height: 100%;
    margin: auto;
  }

  // &.yabo > div {
  //   opacity: 0.8;
  //   background: #000000;
  //   color: #ffffff;
  // }
}
</style>
