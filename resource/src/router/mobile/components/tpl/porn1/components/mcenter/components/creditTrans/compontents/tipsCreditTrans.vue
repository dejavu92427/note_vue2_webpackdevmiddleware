<template>
  <div :class="$style['tips']">
    <div :class="$style['title']">
      <div :class="$style['hr']"><div /></div>
      <div :class="$style['title-tips']">
        温馨提示，如需帮助
        <span :class="$style['link']" @click="$router.push('/mobile/service')">
          请联系客服
        </span>
      </div>
      <div :class="$style['hr']"><div /></div>
    </div>
    <div :class="$style['content']">
      <div>●&nbsp;限制代理转让给旗下会员</div>
      <div>●&nbsp;{{ tipContent1 }}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;{{ tipContent1_desc }}</div>
      <div>●&nbsp;{{ tipContent2 }}</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;{{ tipContent2_desc }}</div>
      <div>●&nbsp;未完成流水要求的优惠金额不可转让</div>
      <div
        :class="$style['link']"
        @click="$router.push('/mobile/mcenter/help/withdraw?key=6')"
      >
        ●&nbsp;查看流水规则
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { thousandsCurrency } from "@/lib/thousandsCurrency";

export default {
  data() {
    return {
      tipContent1: "",
      tipContent1_desc: "",
      tipContent2: "",
      tipContent2_desc: ""
    };
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig",
      rechargeConfig: "getRechargeConfig"
    }),

    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    }
  },
  methods: {
    ...mapActions(["actionSetRechargeConfig"])
  },
  created() {},
  mounted() {
    this.actionSetRechargeConfig().then(() => {
      const config = this.rechargeConfig;

      this.tipContent1 = `完成提现流水要求`;
      this.tipContent1_desc = `单笔转让最低${thousandsCurrency(
        config.recharge_limit_audited_min
      )}元、`;
      if (config.recharge_limit_audited_max_enable) {
        this.tipContent1_desc += `最高${thousandsCurrency(
          config.recharge_limit_audited_max
        )}元`;
      } else {
        this.tipContent1_desc += `转让无上限`;
      }

      this.tipContent2 = "未完成提现流水要求";
      this.tipContent2_desc = `单笔转让最低${thousandsCurrency(
        config.recharge_limit_unaudited_min
      )}元、`;
      if (config.recharge_limit_unaudited_max_enable) {
        this.tipContent2_desc += `最高${thousandsCurrency(
          config.recharge_limit_unaudited_max
        )}元`;
      } else {
        this.tipContent2_desc += `转让无上限`;
      }
    });
  }
};
</script>
<style lang="scss" module>
@import "../css/porn1.module.scss";

.tips {
  margin-top: 35px;
  color: #a6a9b2;
  font-family: Microsoft JhengHei, Microsoft JhengHei-Regular;
  font-size: 14px;
  font-weight: 400;
}

.hr {
  height: 24px;
  left: 0;
  top: 0;
  position: absolute;
  width: calc((100% - 240px) * 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  > div {
    width: 100%;
    height: 1px;
    background: #dddddd;
  }
}

.title {
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: center;
  line-height: 24px;
  text-align: center;
  position: relative;

  .hr:last-of-type {
    left: unset;
    right: 0;
  }

  > .title-tips {
    width: 205px;
  }
}

.content {
  font-size: 12px;
  font-weight: 400;
  margin-top: 3px;
  padding: 0 20px;
  text-align: left;

  > div:not(:last-of-type) {
    margin-bottom: 2.5px;
  }
}

.link {
  color: #6aaaf5;
}
</style>
