<template>
  <div :class="sliderClass">
    <div :class="[$style['serial-header'], [$style[themeTPL]]]">
      <div :class="$style['btn-prev']">
        <img
          :src="
            $getCdnPath(
              `/static/image/common/btn_back_${
                themeTPL === 'porn1'
                  ? 'grey'
                  : themeTPL === 'sg1'
                  ? 'black'
                  : null
              }.png`
            )
          "
          @click="onClose()"
        />
      </div>
      <span :class="$style['title']">
        {{ $text("S_SERIAL_DETIAL", "流水详情") }}</span
      >
    </div>
    <div :class="[$style['serial-number-wrap']]">
      <!-- <div :class="$style['serial-time']">
        {{ $text("S_CHECK_TIME", "检查时间") }}：{{ getNowTime() }}
      </div> -->

      <div :class="[$style['basic-info-wrap'], 'clearfix']" v-if="data">
        <div :class="$style['serial-basic-cell']">
          <div :class="$style['serial-basic-title']">
            {{ $text("S_VALID_BET", "有效投注") }}
          </div>
          <div :class="$style['serial-basic-value']">
            {{ formatThousandsCurrency(data.effective_betting) }}
          </div>
        </div>

        <div :class="$style['serial-basic-cell']">
          <div :class="$style['serial-basic-title']">
            {{ $text("S_DEDUCTION_MONEY", "扣除金额") }}
          </div>
          <div
            :class="[
              $style['serial-basic-value'],
              { [$style['red']]: data.deduction > 0 }
            ]"
          >
            {{
              +data.deduction > 0
                ? "-" + formatThousandsCurrency(data.deduction)
                : formatThousandsCurrency(data.deduction)
            }}
          </div>
        </div>
      </div>

      <div :class="[$style['detail-wrap'], 'clearfix']" v-if="data">
        <div v-for="item in detailList" :key="item.title">
          <span>{{ item.title }} </span>
          <span>{{ item.value }} </span>
        </div>
      </div>

      <div
        v-for="(list, key) in auditList"
        :key="`wrap-${key}`"
        :class="$style['detail-wrap']"
      >
        <div
          v-for="item in list"
          :key="item.title"
          :class="$style['audit-cell']"
        >
          <span>
            <span>{{ item.title }} </span>
            <span>{{ item.rateValue }} </span>
          </span>
          <span>
            <!-- 完成/未完成 -->
            <template v-if="item.deduction">
              <span>{{ item.deduction }}</span>
              <span
                :class="{
                  [$style['red']]: item.value !== '0.00'
                }"
                >{{ item.value }}
              </span>
            </template>

            <!-- 扣除金額 -->
            <template v-else>
              <span
                :class="{
                  [$style['red']]:
                    item.value === $text('S_NOT_FINISH', '未完成')
                }"
                >{{ item.value }}
              </span>
            </template>
          </span>
        </div>
      </div>

      <div :class="$style.tips">
        如需帮助，请
        <span @click="linkToService">联系客服</span>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from "@/mixins/mcenter/withdraw/serialNumber";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [mixin],
  data() {
    return {
      sliderClass: "slider",
      serialNumberList: [],
      isShow: true
    };
  },
  props: {
    handleClose: {
      type: Function,
      default: () => {}
    },
    data: {}
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    }),
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    },
    detailList() {
      return [
        {
          title: this.$text("S_CREATED_TIME", "建立时间"),
          value: this.data.confirm_at
        },
        {
          title: this.$text("S_REMARK", "备注"),
          value: this.data.memo
        },
        {
          title: this.$text("S_TYPE", "类别"),
          value: this.data.opcode
        },
        {
          title: "充值金额",
          value: this.formatThousandsCurrency(this.data.amount)
        },
        {
          title: this.$text("S_OFFER_MONEY", "优惠金额"),
          value: this.formatThousandsCurrency(this.data.offer)
        }
      ];
    },
    auditList() {
      // 2020/09/15
      // 充值稽核倍数 audit_rate
      // 充值稽核扣除金額 administrative_amount
      // 充值稽核流水要求 audit_amount
      // 完成/未完成 administrative_checked
      // 充值金额 amount
      // 优惠金额 offer
      // 优惠稽核倍数 offer_audit_rate
      // 優惠稽核扣除金額 offer_deduction
      // 優惠稽核流水要求 offer_audit_amount
      // 完成/未完成 offer_checked
      return [
        [
          {
            title: this.$text("S_SERIAL_AUDIT", "充值稽核倍数"),
            rateValue: this.data.audit_rate > 0 ? this.data.audit_rate : "-",
            value:
              this.data.audit_rate > 0
                ? this.data.administrative_checked
                  ? this.$text("S_COMPLETE", "完成")
                  : this.$text("S_NOT_FINISH", "未完成")
                : "-"
          },
          {
            title: this.$text("S_SERIAL_NUMBER", "流水要求"),
            rateValue:
              this.data.audit_amount > 0
                ? this.formatThousandsCurrency(this.data.audit_amount)
                : "-",
            value:
              +this.data.administrative_amount > 0
                ? `-${this.formatThousandsCurrency(
                    this.data.administrative_amount
                  )}`
                : "0.00",
            deduction: `${this.$text("S_DEDUCTION_MONEY", "扣除金额")}:`
          }
        ],
        [
          {
            title: this.$text("S_SERIAL_STATUS02", "优惠稽核倍数"),
            rateValue:
              this.data.offer_audit_rate > 0 ? this.data.offer_audit_rate : "-",
            value:
              this.data.offer_audit_rate > 0
                ? this.data.offer_checked
                  ? this.$text("S_COMPLETE", "完成")
                  : this.$text("S_NOT_FINISH", "未完成")
                : "-"
          },
          {
            title: this.$text("S_SERIAL_NUMBER", "流水要求"),
            rateValue:
              +this.data.offer_audit_amount > 0
                ? this.formatThousandsCurrency(this.data.offer_audit_amount)
                : "-",
            value:
              +this.data.offer_deduction > 0
                ? `-${this.formatThousandsCurrency(this.data.offer_deduction)}`
                : "0.00",
            deduction: `${this.$text("S_DEDUCTION_MONEY", "扣除金额")}:`
          }
        ]
      ];
    }
  },
  methods: {
    linkToService() {
      this.$router.push("/mobile/service?redirect=withdraw");
      localStorage.setItem("serial-detail-data", JSON.stringify(this.data));
    },
    onClose() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.handleClose();
        }, 280);
      });
      this.sliderClass = "slider-close slider";
    }
  }
};
</script>

<style lang="scss" src="../css/serialNumber.scss" module></style>
