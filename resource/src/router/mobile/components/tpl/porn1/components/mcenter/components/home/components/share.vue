<template>
  <div :class="$style['share-container']">
    <div :class="$style['pic-wrap']">
      <div :class="$style['img']">
        <img
          :src="
            $getCdnPath(
              `/static/image/${routerTPL}/mcenter/share/shareapp_save.png`
            )
          "
          alt="shareApp"
        />

        <div v-if="getAgentLink || landingLink" :class="$style['qrcode-wrap']">
          <qrcode
            :value="loginStatus ? getAgentLink : landingLink"
            :options="{ width: 75, margin: 1 }"
            tag="img"
          />
        </div>
      </div>

      <div :class="$style['text']" @click="downloadImage">
        <img
          :src="$getCdnPath(`/static/image/common/mcenter/share/btn_tick.png`)"
        />
        {{ btnTickText }}
      </div>
    </div>

    <div :class="$style['func-wrap']">
      <div :class="$style['cancle']" @click="closeShare">取消</div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import goLangApiRequest from "@/api/goLangApiRequest";

export default {
  components: {},
  props: {
    isShowShare: {
      type: Boolean,
      require: true
    }
  },
  data() {
    return {
      landingLink: ""
    };
  },
  computed: {
    ...mapGetters({
      isPwa: "getIsPwa",
      loginStatus: "getLoginStatus",
      siteConfig: "getSiteConfig",
      agentLink: "getAgentLink",
      memInfo: "getMemInfo",
      promotionLink: "getPromotionLink"
    }),
    btnTickText() {
      return "点击截屏保存";
    },
    getAgentLink() {
      if (this.promotionLink) {
        return this.promotionLink;
      }

      if (!this.agentLink.domain || !this.agentLink.agentCode) {
        return "";
      }

      return `https://${this.agentLink.domain}/a/${this.agentLink.agentCode}`;
    },
    routerTPL() {
      return this.siteConfig.ROUTER_TPL;
    }
  },
  created() {
    if (this.loginStatus) {
      // 已登入：註冊頁
      this.actionSetAgentLink();
    } else {
      // 未登入：落地頁
      // yaboRequest({
      //   method: "get",
      //   url: `${this.siteConfig.YABO_API_DOMAIN}/system/downloadlink`,
      // }).then(res => {
      //   if (res && res.data && res.data) {
      //     this.landingLink = res.data[0].value || res.data[1].value;
      //   }
      // });

      goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/cxbb/System/downloadlink`
      }).then(res => {
        if (res && res.data && res.data) {
          this.landingLink = res.data[0].value || res.data[1].value;
        }
      });
    }
  },
  methods: {
    ...mapActions(["actionSetAgentLink"]),
    closeShare() {
      this.$emit("update:isShowShare", false);
    },
    downloadImage() {
      this.$router.push("/mobile/shareDownload");
    }
  }
};
</script>

<style lang="scss" module>
@import "~@/css/variable.scss";

@mixin fixed-container-style($opacity) {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 10;

  &::before {
    content: "";
    position: absolute;
    background: #000;
    opacity: $opacity;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}

.share-container {
  @include fixed-container-style(0.4);
}

.pic-wrap {
  border-radius: 8px;
  height: 392px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 281px;

  .img {
    height: 360px;
    width: 100%;
    overflow-y: hidden;

    img {
      width: 100%;
    }
  }

  .text {
    background: #fff;
    border-radius: 0 0 3px 3px;
    color: #78a8f0;
    font-size: 12px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    z-index: 999;

    img {
      vertical-align: middle;
    }
  }

  .qrcode-wrap {
    position: absolute;
    bottom: 7%;
    left: 50%;
    transform: translateX(-50%);
  }
}

.func-wrap {
  position: absolute;
  width: 100%;
  bottom: 0;
  font-weight: 600;
  background: #f5f5f9;

  .func-cell {
    display: inline-block;
    width: 60px;
    text-align: center;
    margin: 15px 0px 10px 17px;

    > div {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 60px;
      height: 60px;
      border-radius: 10px;
      background: #fff;
    }

    > p {
      font-size: 12px;
      color: #898989;
      margin-top: 5px;
    }

    img {
      width: 32px;
      height: 32px;
    }
  }

  // cancle
  .cancle {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    height: 45px;
    font-size: 16px;
    color: #000000;
  }
}
</style>
