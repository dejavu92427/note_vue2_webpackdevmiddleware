<template>
  <div :class="$style['swap-wrap']">
    <div :class="[$style['item'], $style['wallet']]">
      <img
        :src="
          $getCdnPath(
            '/static/image/common/mcenter/balanceTrans/ic_wallet_center.png'
          )
        "
      />
      <span> SWAG钱包</span>
      <div :class="$style['swag-block']" @click="handleSWAGBalance">
        <template v-if="isMaintainSwag">
          <span :class="$style['maintain-tip-text']">维护中</span>
          <img
            v-if="isMaintainSwag && swagConfig && swagConfig.enable !== 0"
            :class="$style['maintain-tip-img']"
            :src="$getCdnPath('/static/image/porn1/mcenter/swag/ic_tips.png')"
          />
        </template>
        <template v-else>
          {{ swagDiamondBalance }}
        </template>
      </div>
    </div>

    <div :class="$style['item']" @click="$router.push('/mobile/mcenter/swag')">
      {{ this.$text("S_BUY_DIAMOND", "购买钻石") }}
    </div>

    <div
      :class="$style['item']"
      @click="$router.push('/mobile/mcenter/help/detail?type=buymethod')"
    >
      {{ this.$text("S_TO_BUY", "如何购买") }}
    </div>

    <div
      :class="$style['item']"
      @click="$router.push('/mobile/mcenter/help/detail?type=usage&key=2')"
    >
      {{ this.$text("S_INSTRUSTIONS", "使用方法") }}
    </div>
    <maintain-block
      v-if="maintainInfo"
      :content="maintainInfo"
      @close="handleCloseMaintainInfo"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import balanceTran from "@/components/mcenter/components/balanceTran";
import mixin from "@/mixins/mcenter/swag/swag";
import maintainBlock from "@/router/mobile/components/common/maintainBlock";

export default {
  mixins: [mixin],
  components: {
    balanceTran,
    maintainBlock
  },
  computed: {
    ...mapGetters({})
  },
  data() {
    return {
      swagDiamondBalance: "0"
    };
  },
  watch: {
    swagBalance(val) {
      this.swagDiamondBalance = val.balance;
    }
  },
  created() {
    this.initSWAGConfig();
  },
  methods: {
    ...mapActions(["actionSetGlobalMessage"])
  }
};
</script>
<style lang="scss" module>
@import "~@/css/variable.scss";

.swap-wrap {
  position: relative;
  display: flex;
  align-items: center;
  text-align: center;
  height: 65px;
  background: #fefefe;
  color: var(--slider_text_color);
}

.item {
  position: relative;
  flex: 1;
  font-size: 12px;
  font-weight: 700;
  color: var(--slider_text_color);

  // Swag 錢包區塊
  &.wallet {
    flex: 0;
    min-width: 120px;
  }

  &::before {
    content: "";
    position: absolute;
    width: 1px;
    height: 20px;
    background: #eee;
    left: 0;
    top: 0;
  }

  img {
    width: 13px;
    height: 13px;
    vertical-align: text-bottom;
  }

  .swag-block {
    font-size: 16px;
    font-family: Microsoft JhengHei, Microsoft JhengHei-Bold;
    font-weight: 700;
    text-align: center;
    color: #bd9d7d;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .maintain-tip-text {
    font-size: 12px;
    font-family: Microsoft JhengHei, Microsoft JhengHei-Regular;
    font-weight: 400;
    text-align: center;
    color: #db6372;
  }

  .maintain-tip-img {
    width: 12px;
    height: 12px;
  }
}
</style>
