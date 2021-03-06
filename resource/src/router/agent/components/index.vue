<template>
  <component
    :is="templateName"
    :class="`theme-${siteConfig.MCENTER_COLOR}`"
    :logout="logout"
  >
    <router-view />
    <notice-center />
  </component>
</template>

<script>
/* global $ */
import { mapGetters, mapActions } from "vuex";
import store from "@/store";
import agent from "@/api/agent";
import appEvent from "@/lib/appEvent";
import apiBalanceAutoBack from "@/lib/balance_auto_back";
import noticeCenter from "@/router/web/components/common/noticeCenter";

export default {
  beforeRouteEnter(to, from, next) {
    store.dispatch("actionAgentInit", () => {
      if (!store.state.agentIsLogin) {
        next("/");
        return;
      }
      if (
        store.state.agentInfo.user.id === 0 &&
        store.state.agentInfo.user.username === "unknown"
      ) {
        next("/");
        return;
      }
      next();
    });
  },
  components: {
    templateBasic: () =>
      import(/* webpackChunkName: 'templateBasic' */ "./template/basic"),
    noticeCenter
  },
  computed: {
    ...mapGetters({
      isWebview: "getIsWebview",
      webInfo: "getWebInfo",
      agentInfo: "getAgentInfo",
      siteConfig: "getSiteConfig",
      agentUserLevels: "getAgentUserLevels",
      agentIsLogin: "getAgentIsLogin"
    }),
    templateName() {
      return `templateBasic`;
    },
    currentPage() {
      return this.$route.path.split("/")[2];
    }
  },
  created() {
    // 域名後面只串/agent時, 導到第一頁
    if (!this.currentPage) {
      this.$router.push({ path: "/agent/accountData" });
    }

    const webName = this.agentInfo.config.domain_name[this.$i18n.locale];
    const webTitle = this.webInfo.web_title[this.$i18n.locale];

    $(document).prop("title", `${webName}-${webTitle}`);

    // 使用者離開頁面時通知rd5
    window.onbeforeunload = () => {
      apiBalanceAutoBack("out");
    };
    // 使用者回來頁面時通知rd5
    apiBalanceAutoBack("in");

    const isContact =
      !this.agentUserLevels.bank &&
      !this.agentUserLevels.virtual_bank &&
      !this.agentUserLevels.bind_user;
    if (
      isContact &&
      (this.$route.path === "/agent/financeWithdraw" ||
        this.$route.path === "/agent/accountBankCard")
    ) {
      this.$router.push("/agent/accountData");
      return;
    }

    const withdrawOnly =
      !this.agentUserLevels.bank &&
      !this.agentUserLevels.virtual_bank &&
      this.agentUserLevels.bind_user;
    if (withdrawOnly && this.$route.path === "/agent/accountBankCard") {
      this.$router.push("/agent/accountData");
    }
  },
  methods: {
    ...mapActions(["actionSetAgentLogin"]),
    logout() {
      if (!this.agentIsLogin) {
        if (this.isWebview) {
          appEvent.jsToAppMessage("AGENT_LOGOUT");
          return;
        }

        this.$router.push({ path: "/" });
        return;
      }

      agent.logout({
        success: () => {
          this.actionSetAgentLogin(false);

          if (this.isWebview) {
            appEvent.jsToAppMessage("AGENT_LOGOUT");
            return;
          }

          this.$router.push({ path: "/" });
        }
      });
    }
  }
};
</script>

<style lang="scss" src="../css/index.scss" />
