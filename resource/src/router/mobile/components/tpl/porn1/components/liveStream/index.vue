<template>
  <mobile-container :has-footer="false">
    <div slot="content" :class="$style['live-stream-wrap']">
      <div :class="$style['btn-prev']" @click="$router.push('/mobile')">
        <img :src="$getCdnPath(`/static/image/common/btn_back_grey.png`)" />
      </div>

      <div :class="[$style['live-tab-wrap'], 'clearfix']">
        <div :class="[$style['live-tab']]" @click="handleClickType('pornlive')">
          <div :class="$style['img-icon-wrap']">
            <img
              :src="$getCdnPath('/static/image/_new/live/icon_live_swag_n.png')"
            />
          </div>
          <span :class="[$style['live-tab-text']]">{{ "SWAG" }}</span>
        </div>
        <div
          :class="[
            $style['live-tab'],
            { [$style['is-current']]: currentTab === 'ballLive' }
          ]"
          @click="handleClickType('ballLive')"
        >
          <div :class="$style['img-icon-wrap']">
            <img
              v-if="currentTab === 'ballLive'"
              :src="
                $getCdnPath('/static/image/_new/live/icon_live_sport_h.png')
              "
            />
            <img
              v-else
              :src="
                $getCdnPath('/static/image/_new/live/icon_live_sport_n.png')
              "
            />
          </div>
          <span
            :class="[
              $style['live-tab-text'],
              { [$style['active']]: currentTab === 'ballLive' }
            ]"
            >{{ $text("S_SPORT_LIVE", "体育直播") }}</span
          >
        </div>
      </div>
      <div
        v-if="currentTab === 'ballLive'"
        :class="$style['iframe-bg-wrap']"
        :style="{ height: `${iframeHeight}px` }"
      >
        <iframe
          ref="js-set-height"
          allow="geolocation; fullscreen"
          scrolling="auto"
          :class="$style['iframe-wrap']"
          :height="iframeHeight"
          :src="src"
          frameborder="0"
          @load="getIframeHeight"
        />
      </div>
      <div
        v-if="currentTab === 'cutiesLive'"
        :class="$style['cuties-live-wrap']"
      >
        <div
          v-for="(info, index) in streamList"
          :key="`liveStream-${index}`"
          :class="$style['live-card']"
          @click="openLiveStream"
        >
          <div v-if="info.is_live" :class="$style['live-icon']">
            {{ $text("S_ONLIVE", "直播") }}
          </div>
          <img :class="$style['live-bg']" :src="info.image" />
          <div :class="$style['tip-wrap']">
            <div :class="$style['card-content']">
              <div :class="$style['live-title']">{{ info.title }}</div>
            </div>
            <div :class="$style['live-content']">
              <div :class="[$style['live-map-wrap'], 'clearfix']">
                <img
                  :src="$getCdnPath('/static/image/_new/live/ic_address.png')"
                  :class="$style['icon-map']"
                />
                <div :class="$style['live-area']">{{ info.area }}</div>
              </div>
              <div :class="[$style['live-watch-wrap'], 'clearfix']">
                <img
                  :src="$getCdnPath('/static/image/_new/live/ic_look.png')"
                  :class="$style['icon-watch']"
                />
                <div :class="$style['live-watch']">
                  {{ $text("S_WATCH", "观看") }} {{ info.views }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <page-loading :is-show="isShowLoading" />
      <maintain-block
        v-if="maintainInfo"
        :content="maintainInfo"
        @close="handleCloseMaintainInfo"
      />
    </div>
  </mobile-container>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import ajax from "@/lib/ajax";
import axios from "axios";
import mobileContainer from "../common/mobileContainer";
import openGame from "@/lib/open_game";
import pornRequest from "@/api/pornRequest";
import goLangApiRequest from "@/api/goLangApiRequest";
import mixin from "@/mixins/mcenter/swag/swag";
import maintainBlock from "@/router/mobile/components/common/maintainBlock";

export default {
  mixins: [mixin],
  components: {
    pageLoading: () =>
      import(
        /* webpackChunkName: 'pageLoading' */ "@/router/mobile/components/common/pageLoading"
      ),
    mobileContainer,
    maintainBlock
  },
  data() {
    return {
      streamList: [],
      currentTab: "ballLive",
      iframeHeight: 500,
      src: "",
      isShowLoading: false
    };
  },
  computed: {
    ...mapGetters({
      loginStatus: "getLoginStatus",
      memInfo: "getMemInfo",
      siteConfig: "getSiteConfig"
    })
  },
  created() {
    this.currentTab = this.$route.query.type
      ? this.$route.query.type
      : "ballLive";

    pornRequest({
      method: "get",
      url: `/video/livelist`
    }).then(response => {
      this.streamList = response.result;
    });

    // 給體育遊戲觸發事件的function
    window.sportEvent = type => {
      if (type === "GO_IM_SPORT") {
        if (!this.loginStatus) {
          this.$router.push("/mobile/login");
          return;
        } else {
          const openGameSuccessFunc = res => {
            this.isShowLoading = false;
          };

          const openGameFailFunc = res => {
            this.isShowLoading = false;

            if (res && res.data) {
              let data = res.data;
              this.actionSetGlobalMessage({ msg: data.msg, code: data.code });
            }
          };
          openGame(
            { vendor: "boe", kind: 1 },
            openGameSuccessFunc,
            openGameFailFunc
          );
        }
      }
    };
  },
  mounted() {
    // 測試用 正式站
    // this.src = `https://yaboxxxapp01.com/exsport/live/?hall=67`;
    this.src = `/exsport/live/?hall=${this.memInfo.user.domain}`;
  },
  methods: {
    ...mapActions(["actionSetGlobalMessage"]),
    openLiveStream() {
      if (!this.loginStatus) {
        this.$router.push("/mobile/login");
        return;
      }

      if (this.memInfo.balance.total < 100) {
        // this.actionSetGlobalMessage({ msg: this.$text('S_LIVE_BALANCE_NOT_LESS', '直播余额不低%s元').replace('%s', 100) })
        this.actionSetGlobalMessage({
          msg: this.$text("S_COMING_SOON2", "正在上线 敬请期待")
        });
        return;
      }
      //   this.actionSetGlobalMessage({ msg: this.$text('S_BEAUTY_STAY_TUNED', '我们将在下个月帮您开通美眉直播，敬请期待！先去体验一下其它游戏吧！') })
      this.actionSetGlobalMessage({
        msg: this.$text("S_COMING_SOON2", "正在上线 敬请期待")
      });
    },
    getIframeHeight() {
      this.$nextTick(() => {
        this.iframeHeight = document.body.offsetHeight - 48;
      });
      //   this.iframeHeight = this.$refs['js-set-height'].contentWindow.window.document.body.scrollHeight + 100;
    },
    handleClickType(type) {
      if (type === "pornlive") {
        if (this.loginStatus) {
          this.checkSWAGMaintain({
            linkTo: true,
            origin: "liveStream?type=ballLive"
          });
        } else {
          this.$router.push("/mobile/login");
          return;
        }
      } else {
        this.currentTab = type;
      }
    }
  }
};
</script>
<style lang="scss" module>
@import "~@/css/variable.scss";

.live-stream-wrap {
  background-color: linear-gradient(90deg, #ffc954, #fee084);
  position: relative;
  height: 100%;
}

.live-tab {
  line-height: 41px;
  height: 43px;
  position: relative;
  float: left;
  width: 50%;
  text-align: center;
  font-size: 16px;
  color: #b05a0d;
  &.is-current {
    color: #222;
  }
}

.img-icon-wrap {
  display: inline-block;
  vertical-align: middle;
  width: 23px;
  height: 23px;

  img {
    display: block;
    width: 100%;
    border-radius: 7px;
  }
}

.live-tab-text {
  display: inline-block;
  vertical-align: middle;

  &.active {
    border-bottom: var(--slider_underline_active_color) solid 2px;
  }
}

.iframe-bg-wrap {
  background-color: #fff;
}

.iframe-wrap {
  width: 100%;
  overflow: auto !important;
  -webkit-overflow-scrolling: touch !important;
}

.cuties-live-wrap {
  margin: 10px 6px 40px;
  background: url("/static/image/_new/live/live_stream_background.png") 100%
    100%;
}

.live-card {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;
  width: 49%;
  margin-bottom: 10px;

  &:nth-child(even) {
    float: right;
  }
}

.live-icon {
  position: absolute;
  top: 6px;
  right: 7%;
  text-align: center;
  font-size: 14px;
  line-height: 21px;
  width: 43pt;
  height: 21px;
  background: #be9e7f;
  border-radius: 10px;
}

.live-bg {
  display: block;
  width: 100%;
  border-radius: 10px;
}

.tip-wrap {
  position: absolute;
  width: 100%;
  padding: 6px 0 3px;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 10px 10px;
}

.card-content {
  width: 100%;
  padding: 0 5px;
  color: #fff;

  .live-title {
    margin-left: 5px;
  }
}

.live-map-wrap {
  float: left;
  margin-left: 10px;
}

.icon-map {
  display: inline-block;
  vertical-align: middle;
  width: 13px;
}

.live-content {
  width: 100%;
  text-align: center;
  color: #fff;
}

.live-watch-wrap {
  float: right;
  margin-right: 5px;
}

.icon-watch {
  display: inline-block;
  vertical-align: middle;
  width: 13px;
}

.live-area {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  font-size: 12px;
  border-radius: 10px;
  color: #ffc954;
}

.live-watch {
  display: inline-block;
  font-size: 12px;
  text-align: right;
  vertical-align: middle;
  color: #ffc954;
}

.btn-prev {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 43px;
  display: flex;
  align-items: center;
  z-index: 1;

  > img {
    display: block;
    width: 100%;
  }
}

@media screen and (min-width: $pad) {
  .live-area,
  .live-watch,
  .live-icon {
    font-size: 13px;
  }

  .live-title {
    font-size: 16px;
  }

  .live-card__M0Oa0 {
    height: 280px;
  }
}
</style>
