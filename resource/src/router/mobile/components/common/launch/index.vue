<template>
  <div :class="$style['container']">
    <img
      :src="
        $getCdnPath(
          `/static/image/${routerTPL}/common/loading.${
            routerTPL === 'sg1' ? 'gif' : 'png'
          }`
        )
      "
    />
    <div :class="$style['timer']" @click="click">
      <span>{{ sec }}</span>
      <span>|</span>
      <span>跳过</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      timer: 0,
      sec: 3
    };
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    }),
    routerTPL() {
      return this.siteConfig.ROUTER_TPL;
    }
  },
  created() {
    //   初始化
    window.RESET_LOCAL_SETTING();
  },
  mounted() {
    this.timer = setInterval(() => {
      if (this.sec === 0 && !this.$route.query.test) {
        clearInterval(this.timer);
        this.timer = null;
        this.goToMobile();
        return;
      }
      this.sec -= 1;
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    goToMobile() {
      if (this.siteConfig.ROUTER_TPL === "sg1") {
        // 泡泡直播轉導
        localStorage.removeItem("live-iframe-event-from");
        this.$router.push({
          name: "home",
          query: { toLive: "true", ...this.$route.query }
        });
      } else {
        this.$router.push({
          name: "home",
          query: { ...this.$route.query }
        });
      }
    },
    click() {
      clearInterval(this.timer);
      this.timer = null;
      this.$nextTick(() => {
        this.goToMobile();
      });
    }
  }
};
</script>

<style lang="scss" module>
@import "~@/css/variable.scss";
.container {
  position: relative;
  height: 100vh;

  > img {
    width: 100%;
    // height: 100%;
  }
}

@media (orientation: landscape) {
  .container > img {
    height: unset;
  }
}

.timer {
  position: absolute;
  top: 45px;
  right: 14px;
  background-color: #b3b3b3;
  width: 80px;
  border-radius: 10px;
  color: white;
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  text-align: center;
}
</style>
