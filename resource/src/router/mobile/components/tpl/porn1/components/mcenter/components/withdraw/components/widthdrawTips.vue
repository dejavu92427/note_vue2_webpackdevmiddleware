<template>
  <!-- 提款前提示彈窗 -->
  <transition name="fade">
    <div :class="$style['check-wrap']">
      <div
        :class="[
          $style['check-container'],
          $style[siteConfig.ROUTER_TPL],
          {
            [$style['deposit']]: type === 'deposit'
          }
        ]"
      >
        <div :class="$style['check-header']">
          <div :class="$style['title']">温馨提示</div>
          <div
            v-if="type === 'tips'"
            :class="$style['btn-close']"
            @click="closeTips"
          >
            <img
              :src="$getCdnPath(`/static/image/common/btn_close_white.png`)"
              alt="close"
            />
          </div>
        </div>
        <div :class="$style['check-content']">
          <template v-if="type === 'tips'">
            <div :class="$style['time']">流水检查时间：{{ getNowTime() }}</div>
            <div v-if="serialNumberData && serialNumberData.total">
              <div :class="$style['check-cell']">
                <span :class="$style['sub-title']"> 流水要求 </span>
                <span :class="$style['money']">
                  {{
                    formatThousandsCurrency(serialNumberData.total.audit_amount)
                  }}
                </span>
              </div>
              <div :class="$style['check-cell']">
                <span :class="$style['sub-title']">
                  {{ $text("S_SERIAL_POOR", "流水不足") }}
                </span>
                <span :class="$style['money']">
                  {{
                    formatThousandsCurrency(
                      serialNumberData.total.audit_amount_lack
                    )
                  }}
                </span>
              </div>

              <div :class="[$style['check-cell'], $style['check-total']]">
                <span :class="$style['sub-title']"> 提现金额 </span>
                <span :class="$style['money']">
                  {{ formatThousandsCurrency(withdrawValue) }}
                </span>
              </div>

              <div :class="[$style['check-cell'], $style['offer-twoline']]">
                <div :class="$style['sub-title']">
                  {{ $text("S_DEDUCTION_MONEY", "扣除金额") }}
                </div>
                <span :class="$style['money']">
                  {{
                    +serialNumberData.total.deduction > 0
                      ? "-" +
                        formatThousandsCurrency(
                          serialNumberData.total.deduction
                        )
                      : formatThousandsCurrency(
                          serialNumberData.total.deduction
                        )
                  }}
                </span>
              </div>

              <div :class="$style['check-cell']">
                <span :class="$style['sub-title']">
                  {{ $text("S_FEE", "手续费") }}
                </span>
                <span :class="$style['money']">
                  -{{ formatThousandsCurrency(serialNumberData.total.fee) }}
                </span>
              </div>

              <div :class="[$style['check-cell'], $style['check-total']]">
                <span :class="$style['sub-title']"> 扣除总计 </span>
                <span :class="$style['money']">
                  {{
                    +serialNumberData.total.total_deduction > 0
                      ? "-" +
                        formatThousandsCurrency(
                          serialNumberData.total.total_deduction
                        )
                      : formatThousandsCurrency(
                          serialNumberData.total.total_deduction
                        )
                  }}
                </span>
              </div>

              <div
                v-if="hasOffer"
                :class="[
                  $style['check-cell'],
                  $style['custom-color'],
                  $style['offer-twoline']
                ]"
              >
                <div :class="$style['sub-title']">
                  {{
                    withdrawName === "" ? "银行卡" : withdrawName
                  }}出款额外赠送
                </div>
                <span :class="[$style['money']]">
                  {{ bonusOffer }}
                </span>
              </div>

              <div :class="[$style['check-cell'], $style['check-actual']]">
                <span :class="$style['sub-title']"> 实际提现金额 </span>
                <span
                  :style="
                    actualMoney && actualMoney.length > 10
                      ? { 'font-size': '12px' }
                      : {}
                  "
                  :class="[$style['money-bold']]"
                >
                  {{ actualMoney }}
                </span>
              </div>

              <div
                v-if="hasCrypto"
                :class="[
                  $style['check-cell'],
                  $style['custom-color'],
                  $style['custom-color-background']
                ]"
              >
                <span :class="$style['sub-title']">
                  {{ selectCard.bank_id === 2025 ? "币希" : withdrawName }}到帐
                </span>
                <span
                  :style="
                    cryptoMoney && cryptoMoney.length > 10
                      ? { 'font-size': '12px' }
                      : {}
                  "
                  :class="$style['crypto-money']"
                >
                  {{
                    selectCard.bank_id === 2025
                      ? formatThousandsCurrencyUnFix(cryptoMoney)
                      : formatThousandsCurrency(cryptoMoney)
                  }}
                </span>
              </div>
            </div>
          </template>

          <template v-if="type === 'deposit'">
            <div :class="$style['title']">只需充值一次 开通提现功能</div>
          </template>
        </div>

        <div :class="$style['check-button-wrap']">
          <div :class="$style['check-btn']" @click="handleCheckRule">
            查看规则
          </div>
          <div :class="$style['check-btn']" @click="handleBack">继续游戏</div>

          <div
            v-if="type === 'tips'"
            :class="[$style['check-btn'], $style['submit']]"
            @click="$emit('submit')"
          >
            确认提现
          </div>

          <div
            v-if="type === 'deposit'"
            :class="[$style['check-btn'], $style['submit']]"
            @click="$router.push('/mobile/mcenter/deposit')"
          >
            立即充值
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import mixin from "@/mixins/mcenter/withdraw/serialNumber";
import { mapGetters } from "vuex";

export default {
  mixins: [mixin],
  data() {
    return {};
  },
  props: {
    type: {
      type: String,
      default: "tips" //tip deposit
    },
    show: {
      type: Boolean,
      default: false
    },
    actualMoney: {
      type: Number | String,
      default: "0.00"
    },
    cryptoMoney: {
      type: String,
      default: "0.00"
    },
    withdrawValue: {
      type: Number,
      default: 0
    },
    hasCrypto: {
      type: Boolean,
      default: false
    },
    swiftCode: {
      type: String,
      default: ""
    },
    bonusOffer: {
      type: String | Number, // "0.00" or Number
      default: "0.00"
    },
    withdrawName: {
      type: String,
      default: ""
    },
    hasOffer: {
      type: Boolean,
      default: false
    },
    selectCard: {
      type: Object,
      default: {}
    }
  },
  mounted() {
    this.getSerialNumberData(this.swiftCode);
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    }),
    $style() {
      return (
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1
      );
    },
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    }
  },
  methods: {
    closeTips() {
      this.$emit("close");
    },
    handleCheckRule() {
      this.$emit("save");

      // 109/11/05
      // 與企劃確認，跳轉至幫助中心後，提現金額的金額不需保留
      localStorage.removeItem("tmp_w_amount");
      localStorage.removeItem("tmp_w_actualAmount");

      if (this.type === "tips") {
        this.$router.push("/mobile/mcenter/help/withdraw?&key=6");
      } else if (this.type === "deposit") {
        this.$router.push("/mobile/mcenter/help/withdraw?&key=0");
      }
    },
    handleBack() {
      // if (this.type === "tips") {
      //   // this.$router.push("/mobile/mcenter/wallet");
      //   this.closeTips();
      // } else if (this.type === "deposit") {
      //   this.$router.back();
      // }
      this.$router.back();
    }
  }
  // watch: {
  //   show(val) {
  //     if (val) {
  //       this.getSerialNumberData();
  //     }
  //   }
  // }
};
</script>

<style lang="scss" src="../css/index.module.scss" module="$style_porn1"></style>
<style lang="scss" src="../css/sg1.module.scss" module="$style_sg1"></style>
