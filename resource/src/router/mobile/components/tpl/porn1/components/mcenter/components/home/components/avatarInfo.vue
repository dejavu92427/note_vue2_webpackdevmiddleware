<template>
  <div :class="$style['mcenter-avatar-info-wrap']" @click="clickEvent">
    <!-- 大頭照 -->
    <div :class="$style['avatar-wrap']">
      <img :src="avatarSrc" />
    </div>

    <!-- 姓名/註冊 -->
    <div :class="$style['info-wrap']">
      <div>
        <template v-if="loginStatus">
          <span>
            {{
              memInfo.user.show_alias
                ? memInfo.user.alias
                : memInfo.user.username
            }}
          </span>
          <span :class="[$style['vip-level'], $style[siteConfig.ROUTER_TPL]]">
            VIP{{ viplevel }}
          </span>
        </template>
        <template v-else>
          <span @click.stop="$router.push('/mobile/login')">
            点击{{ $text("S_LOG_IN_REGISTER", "登录/注册") }}
          </span>
        </template>
      </div>
      <!-- <div v-if="!loginStatus">
        <span> 观影60秒计时奖励 </span>
        <span :class="$style['money-symbol']">¥</span>
        <span> 彩金分分送 </span>
      </div> -->
      <div v-if="routerTPL === 'porn1'" :class="$style['porn-wrap']">
        <span> VIP尊享 每月爽领红包 </span>
        <span :class="$style['money-symbol']">¥</span>
        <span> 8-30,000 </span>
        <span></span>
      </div>
    </div>
    <div :class="$style['btn-next']">
      <img :src="$getCdnPath(`/static/image/common/arrow_next.png`)" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { getCookie, setCookie } from "@/lib/cookie";
import goLangApiRequest from "@/api/goLangApiRequest";
import axios from "axios";
import { sendUmeng } from "@/lib/sendUmeng";

export default {
  components: {},
  data() {
    return {
      isShow: false,
      msg: "",
      viplevel: "",
      avatarSrc: `/static/image/common/default/avatar_nologin.png`
    };
  },
  computed: {
    ...mapGetters({
      loginStatus: "getLoginStatus",
      memInfo: "getMemInfo",
      memCurrency: "getMemCurrency",
      memBalance: "getMemBalance",
      siteConfig: "getSiteConfig"
    }),
    routerTPL() {
      return this.siteConfig.ROUTER_TPL;
    }
  },
  mounted() {
    this.getUserViplevel();
    this.getAvatarSrc();
  },
  methods: {
    ...mapActions(["actionSetUserdata"]),
    getAvatarSrc() {
      if (!this.loginStatus) return;

      const tmpCustomImage = localStorage.getItem("tmp-avatar-img");
      if (tmpCustomImage) {
        this.avatarSrc = tmpCustomImage;
        return;
      }

      if (this.memInfo.user && this.memInfo.user.custom) {
        axios({
          method: "get",
          url: this.memInfo.user.custom_image
        })
          .then(res => {
            if (res && res.data && res.data.result === "ok") {
              this.avatarSrc = res.data.ret;
            }
          })
          .catch(error => {
            this.actionSetGlobalMessage({ msg: error.data.msg });
            this.avatarSrc = this.$getCdnPath(
              `/static/image/common/mcenter/default/avatar_${imgSrcIndex}.png`
            );
          });
        return;
      }

      const imgSrcIndex = this.memInfo.user.image;
      this.avatarSrc = this.$getCdnPath(
        `/static/image/common/mcenter/default/avatar_${imgSrcIndex}.png`
      );
    },
    getUserViplevel() {
      let cid = getCookie("cid");
      if (!cid) {
        return;
      }

      goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/cxbb/Player/vipinfo`,
        headers: {
          cid: cid
        }
      }).then(res => {
        this.viplevel = res.data ? res.data[0] && res.data[0].now_level_seq : 0;
      });
    },
    clickEvent() {
      sendUmeng(25);
      this.loginStatus
        ? this.$router.push("/mobile/mcenter/accountData")
        : this.$router.push("/mobile/login");
    }
  }
};
</script>

<style lang="scss" module>
@import "~@/css/variable.scss";
.mcenter-avatar-info-wrap {
  height: 100px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  background-color: #fefffe;
}

.avatar-wrap {
  height: 70px;
  width: 70px;

  > img {
    height: 100%;
    border-radius: 50%;
    width: 70px;
  }
}

.money-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 18px;
  border-radius: 50%;
  color: white;
  width: 18px;
  height: 18px;
  background: #ff8900;
  border: 2pt solid #fecf34;
  margin: 0 5px;
}

.info-wrap {
  height: 70px;
  padding: 10px 4px;
  width: 100%;

  > div {
    text-align: left;
    font-size: 15px;
    height: 50%;
    display: flex;
    align-items: center;
    line-height: 50%;
  }

  .porn-wrap {
    color: #bd9d7d;
    font-size: 12px;
    height: 50%;

    span:last-of-type {
      color: #eeb72d;
    }
  }
}
.btn-next {
  > img {
    height: 20px;
    width: 20px;
  }
}

.vip-level {
  margin-left: 5px;
  font-size: 11px;
  line-height: 17px;
  height: 17px;
  // color: var(--mcenter_button_text_color1);
  color: #fff;
  text-align: center;
  font-weight: bold;
  width: 40px;
  border-radius: 4px;
  // background: var(--avatar-vip-icon-color);
  background: #9ca3bf;
}
</style>
