<template>
  <div :class="$style['game-item']" @click="onEnter">
    <div :class="$style['game-image']">
      <img v-lazy="getImg" />
    </div>
    <div :class="$style['game-text']">{{ gameData.name }}</div>
    <page-loading :is-show="isShowLoading" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import openGame from "@/lib/open_game";
import isMobile from "@/lib/is_mobile";
import goLangApiRequest from "@/api/goLangApiRequest";
import { getCookie, setCookie } from "@/lib/cookie";

export default {
  components: {
    pageLoading: () =>
      import(
        /* webpackChunkName: 'pageLoading' */ "@/router/mobile/components/common/pageLoading"
      )
  },
  props: {
    gameData: {
      type: Object,
      default: {}
      //  {
      //    "code": "string",
      //    "enable": true,
      //    "is_mobile": true,
      //    "is_pc": true,
      //    "kind": 0,
      //    "mobile_trial;": true,
      //    "name": "string",
      //    "online_at": "string",
      //    "trial": true,
      //    "type": 0,
      //    "vendor": "string",
      //    "vendor_abridge": "string"
      //  }
    },
    lobbyInfo: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      needShowRedEnvelope: true,
      isShowLoading: false
    };
  },
  computed: {
    ...mapGetters({
      isBackEnd: "getIsBackEnd",
      loginStatus: "getLoginStatus",
      siteConfig: "getSiteConfig",
      withdrawCheckStatus: "getWithdrawCheckStatus"
    }),
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    },
    getImg() {
      let resultUrl = ``;

      return {
        src: `${resultUrl}?v=${Date.now().toString()}`,
        error: this.$getCdnPath("/static/image/game_loading_s.gif"),
        loading: this.$getCdnPath("/static/image/game_loading_s.gif")
      };
    }
  },
  methods: {
    ...mapActions(["actionSetGlobalMessage", "actionSetShowRedEnvelope"]),
    /**
     * 點擊立即遊戲
     * @method onEnter
     */
    onEnter() {
      if (localStorage.getItem("is-open-game")) {
        return;
      }
      if (this.isBackEnd) {
        return;
      }

      let isMobileView;

      try {
        isMobileView = this.$route.matched[0].meta.isMobile;
      } catch (e) {
        isMobileView = false;
      }

      const { vendor, kind, code, mobile_trial, trial } = this.gameData;

      if (!this.loginStatus && !(isMobile() ? mobile_trial : trial)) {
        if (isMobileView) {
          this.$router.push("/mobile/login");
        } else {
          alert(this.$i18n.t("S_LOGIN_TIPS"));
        }

        return;
      }

      this.isShowLoading = true;
      // 0421 進入遊戲前檢查withdrawcheck (億元無熱門大廳，先不執行檢查，日後若加需再考慮是否維護)
      // if (!this.withdrawCheckStatus.account) {
      //   lib_useGlobalWithdrawCheck("home");
      //   return;
      // }

      const openGameSuccessFunc = res => {
        this.isShowLoading = false;
        window.GAME_RELOAD = true;
      };

      const openGameFailFunc = res => {
        this.isShowLoading = false;
        window.GAME_RELOAD = undefined;

        if (res && res.data) {
          let data = res.data;
          if (data.code === "C50101" || data.code === "C50100") {
            goLangApiRequest({
              method: "get",
              url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/cxbb/Drawing/GetDrawing`,
              params: {
                cid: getCookie("cid")
              }
            }).then(res => {
              console.log(res);
              if (res.status === "000") {
                if (res.data.status != -1) {
                  this.actionSetShowRedEnvelope(res.data);
                } else {
                  this.actionSetGlobalMessage({
                    msg: data.msg,
                    code: data.code,
                    origin: `hotLobby-${this.$route.params.vendor}`
                  });
                }
              }
            });
          } else {
            this.actionSetGlobalMessage({
              msg: data.msg,
              code: data.code,
              origin: `hotLobby-${this.$route.params.vendor}`
            });
          }
        } else {
          this.actionSetGlobalMessage({
            msg: data.msg,
            code: data.code,
            origin: `hotLobby-${this.$route.params.vendor}`
          });
        }
      };

      openGame(
        { vendor, kind, code, gameName: this.gameData.name },
        openGameSuccessFunc,
        openGameFailFunc
      );
      return;
    }
  }
};
</script>

<style lang="scss" src="../css/porn1.index.scss" module="$style_porn1"></style>
