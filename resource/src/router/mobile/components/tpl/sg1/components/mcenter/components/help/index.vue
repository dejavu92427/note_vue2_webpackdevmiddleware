<template>
  <mobile-container
    :header-config="headerConfig"
    :has-footer="false"
    :class="$style.container"
  >
    <div
      slot="content"
      :class="$style['help-wrap']"
      v-for="listInfo in list"
      :key="`list-${listInfo.name}`"
      @click="handleClick(listInfo)"
    >
      <div v-if="listInfo.needLogin ? loginStatus : true" :class="$style.list">
        <div :class="$style['list-icon']">
          <img
            :src="
              $getCdnPath(
                `/static/image/sg1/mcenter/help/ic_help_${listInfo.img}.png`
              )
            "
          />
        </div>

        <div v-if="listInfo.info" :class="$style['list-info']">
          {{ listInfo.info }}
        </div>

        <span> {{ listInfo.name }} </span>
        <div :class="$style['btn-next']">
          <img :src="$getCdnPath(`/static/image/common/arrow_next.png`)" />
        </div>
      </div>
    </div>
  </mobile-container>
</template>

<script>
import member from "@/api/member";
import mobileContainer from "../../../common/mobileContainer";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    mobileContainer
  },
  data() {
    return {
      list: [
        {
          name: "充值教程",
          img: "deposit",
          key: "deposit",
          info: "充值极速到帐",
          needLogin: true,
          isShow: true
        },
        {
          name: "购买钻石",
          img: "diamond",
          key: "diamond",
          info: "秒充值直接看",
          needLogin: false,
          isShow: false
        },
        {
          name: "提现教程",
          img: "withdraw",
          key: "withdraw",
          info: "极速提现仅需30秒",
          needLogin: false,
          isShow: true
        },
        {
          name: this.$text("S_GAME_INTR", "游戏介绍"),
          img: "gameintro",
          key: "gameintro",
          info: "主流体育彩票玩法",
          needLogin: false,
          isShow: true
        },
        {
          name: this.$text("S_TECH_SUP", "技术支持"),
          img: "support",
          key: "support",
          info: "提供全面技术支持",
          needLogin: false,
          isShow: true
        },
        {
          name: this.$text("S_CONTACT_US", "联系我们"),
          img: "contact",
          key: "contact",
          info: "为您提供全天候服务",
          needLogin: false,
          isShow: true
        },
        {
          name: "用户须知",
          img: "support",
          key: "tips",
          info: "确保您的权益",
          needLogin: false,
          isShow: true
        },
        {
          name: "隐私政策",
          img: "support",
          key: "privacy",
          info: "保障您的隐私",
          needLogin: false,
          isShow: true
        }
      ].filter(item => item.isShow),
      title: this.$route.query.title ? `title=${this.$route.query.title}` : ""
    };
  },
  computed: {
    ...mapGetters({
      loginStatus: "getLoginStatus"
    }),
    headerConfig() {
      return {
        prev: true,
        onClick: () => {
          if (this.$route.query.more) {
            this.$router.replace(
              `/mobile/mcenter/balanceTrans?more=${this.$route.query.more}&${this.title}`
            );
          } else {
            this.$router.back();
          }
        },
        title: this.$text("S_HELP_CENTER", "帮助中心")
      };
    }
  },
  created() {},
  methods: {
    ...mapActions(["actionSetGlobalMessage"]),
    handleClick(item) {
      // 充值不開放
      // if (item.key === "deposit") {
      //   this.actionSetGlobalMessage({ type: "incoming" });
      //   return;
      // }

      this.$router.push(`/mobile/mcenter/help/${item.key}`);
    }
  }
};
</script>

<style lang="scss" module>
@import "~@/css/variable.scss";

.container {
  background-color: #f8f8f8;
}

.help-wrap {
  overflow-x: hidden;
  color: var(--mcenter_slider_text_active_color);
  position: relative;

  .list {
    height: 60px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    background-color: #fefffe;

    > span {
      width: 100%;
    }

    .list-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      margin-right: 5px;

      > img {
        height: 100%;
      }
    }

    .list-info {
      color: #a2a2a2;
      font-size: 12px;
      position: absolute;
      right: 38px;
    }
  }

  .btn-next {
    width: 14px;
    height: 100%;
    display: flex;
    align-items: center;
    > img {
      height: 14px;
      width: 14px;
    }
  }
}
</style>
