<template>
  <div :class="[$style['detail-wrap']]">
    <!-- 狀態暫時移除 -->
    <!-- <div :class="$style['status-wrap']">
      <div
        :class="[$style.status, { [$style.active]: curStatus == 0 }]"
        @click="filterStatus(0)"
      >
        {{ $text("S_APPLY", "已申请") }}
      </div>
      <div
        :class="[$style.status, { [$style.active]: curStatus == 1 }]"
        @click="filterStatus(1)"
      >
        {{ $text("S_NOT_FINISH", "未完成") }}
      </div>
      <div
        :class="$style['active-slider']"
        :style="{
          left: `calc(calc(25% - 25px + 50% * ${curStatus}))`
        }"
      />
    </div> -->
    <div v-if="data" :class="$style['detail-content-wrap']">
      <div
        v-for="(item, index) in data"
        :class="$style['detail-block']"
        :key="index"
      >
        <div :class="[$style['detail-cell'], $style['item-status']]">
          <div :class="[$style['title']]">
            {{ $text("S_STATUS", "状态") }}
          </div>

          <div
            :class="[
              $style['value'],
              {
                [$style['match']]:
                  (item.bank_name === 'E点付' || item.bank_name === 'e点富') &&
                  item.status === 'confirm'
              }
            ]"
          >
            <div
              v-if="!item.locked"
              :class="$style['edit']"
              @click="openEdit(item)"
            >
              {{ $text("S_SUBMIT_WITHDRAW", "重新提交") }}
            </div>
            <div
              v-else-if="
                (item.bank_name === 'E点付' || item.bank_name === 'e点富') &&
                  item.status === 'confirm'
              "
              @click="openMatchLink(item)"
            >
              搓合查询
            </div>
            <div
              v-else
              @click="
                () => {
                  item.status !== 'processing' && item.memo
                    ? showDetailPop(item)
                    : '';
                }
              "
              :class="[
                { [$style['processing']]: item.status === 'processing' }
              ]"
            >
              {{ getStatus(item.status) }}
            </div>

            <div
              v-if="item.status !== 'processing' && item.memo"
              :class="$style['processing-icon']"
              @click="showDetailPop(item)"
            >
              <img :src="`/static/image/${theme}/mcenter/ic_remark.png`" />
            </div>
          </div>
        </div>

        <div :class="$style['item-status-border']" />
        <template v-for="(col, index) in columns">
          <div
            v-if="item.hasOwnProperty(col.key)"
            :class="$style['detail-cell']"
            :key="`col-'${index}`"
          >
            <div :class="$style['title']">
              {{ $text(col.title) }}
            </div>
            <div :class="$style['value']">
              {{ formatThousandsCurrency(col.key, item[col.key]) }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="detailRate" :class="$style['tips-wrap']">
      <div :class="$style['tips-mask']" @click="detailRate = null" />

      <div :class="$style['tips-block']">
        <div
          :class="$style['tips-content']"
          v-html="detailRate.memo.replace(/\n/gi, '<br/>')"
        />
        <!-- <div :class="$style['tips-cell']">
          實際匯率:&nbsp;{{ detailRate && detailRate.withdraw_rate }}
        </div>
        <div :class="$style['tips-cell']">
          入帳數量:&nbsp;{{ detailRate && detailRate.real_amount }}
        </div> -->
        <div :class="[$style['close']]" @click="detailRate = null">关闭</div>
      </div>
    </div>
    <edit-withdraw-field
      v-if="editOpen"
      :third-url.sync="thirdUrl"
      :withdraw-data="withdrawData"
      :close-fuc="() => (editOpen = false)"
    />

    <div v-if="!data.length" :class="$style['no-data-wrap']">
      <img :src="$getCdnPath(`/static/image/${theme}/mcenter/no_data.png`)" />
      <div :class="$style['tips']">
        <!-- <template v-if="curStatus === 0"> 暂时没有新的提现记录 </template>
        <template v-else>还没有任何记录</template> -->
        暂时没有新的提现记录
      </div>
    </div>
  </div>
</template>

<script>
import { getCookie } from "@/lib/cookie";
import { mapGetters, mapActions } from "vuex";
import axios from "axios";
import goLangApiRequest from "@/api/goLangApiRequest";
import editWithdrawField from "./editWithdrawField";
import { thousandsCurrency } from "@/lib/thousandsCurrency";

export default {
  components: {
    editWithdrawField
  },
  props: {
    isApp: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      total: 0,
      data: [],
      detailRate: null,
      curStatus: 0,
      columns: [
        // 日期
        { key: "at", title: "S_DATE" },
        // 单号
        { key: "id", title: "S_ORDER_NUMBER" },
        // 提现金额
        { key: "amount", title: "S_WITHDRAW_MONEY" },
        // 扣除金额
        { key: "deduction", title: "S_DEDUCTION_MONEY" },
        // 实际到帐
        { key: "real_amount", title: "S_REAL_WITHDRAW" },
        // 提现类型
        { key: "bank_name", title: "S_WITHDRAW_TYPE" }
      ],
      editOpen: false,
      withdrawData: {},
      thirdUrl: ""
    };
  },
  mounted() {
    this.getData();
    document.title = "近10笔提现记录";
  },
  computed: {
    ...mapGetters({
      loginStatus: "getLoginStatus",
      memInfo: "getMemInfo",
      siteConfig: "getSiteConfig"
    }),
    theme() {
      return this.siteConfig.MOBILE_WEB_TPL;
    }
    // isApp() {
    //   let isApp = !!((this.$route.query && this.$route.query.app) || (this.$route.query && this.$route.query.APP))
    //   return isApp
    // },
  },
  methods: {
    ...mapActions(["actionSetGlobalMessage"]),
    showDetailPop(item) {
      // withdraw_rate
      this.detailRate = item;
    },
    filterStatus(status) {
      this.curStatus = status;

      // 已申請
      if (status == 0) {
        this.data = this.data.filter(
          info => info.status === "finished" || info.locked
        );
        return;
      }

      // 未完成
      if (status == 1) {
        this.data = this.data.filter(info => info.process && !info.locked);
        return;
      }
    },
    getData() {
      let params = {
        firstResult: 0,
        maxResults: 10
      };

      let cid = getCookie("cid");
      if (!cid) return;

      goLangApiRequest({
        method: "post",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Payment/Withdraw/List`,
        params: {
          ...params
        }
      }).then(res => {
        if (res && res.status === "000") {
          this.data = res.data.ret;
          this.total = res.data.pagination.total;
          this.filterStatus();
        } else {
          if ((res && res.msg) || (res && res.message)) {
            this.actionSetGlobalMessage({
              msg: res.msg || res.message
            });
          }
        }
      });
    },
    getStatus(status) {
      status = status.toLowerCase();
      switch (status) {
        //   (處理中/processing、已完成/finished、已確認/confirm、已取消/cancel、已拒絕/reject)
        case "processing":
          return this.$text("S_PROCESSING_TEXT", "处理中");
        case "cancel":
          return this.$text("S_CANCEL", "取消");
        case "reject":
          return this.$text("S_CANCEL_TEXT", "拒绝");
        default:
          return this.$text("S_CR_SUCCESS", "成功");
      }
    },
    openEdit(info) {
      this.editOpen = true;
      this.withdrawData = info;
      this.getData();
    },
    formatThousandsCurrency(key, value) {
      if (["amount", "deduction", "real_amount"].includes(key)) {
        return thousandsCurrency(value);
      }
      return value;
    },
    openMatchLink(item) {
      console.log(item);
      axios({
        method: "get",
        url: "/api/v1/c/ext/inpay?api_uri=/api/trade/v2/c/stat/match/url",
        errorAlert: false,
        params: {
          entry_id: item.id,
          type: "withdraw"
        }
      })
        .then(res => {
          if (res && res.data && res.data.result === "ok") {
            // let newWindow;
            // newWindow = window.open(`${res.data.ret}`, "_blank");
            localStorage.setItem("iframe-third-url", res.data.ret);
            localStorage.setItem("iframe-third-url-title", "搓合查询");
            this.$router.push(
              `/mobile/iframe/history?func=false${
                this.isApp ? "&hasHeader=false" : ""
              }`
            );
          }
        })
        .catch(error => {
          this.actionSetGlobalMessage({
            msg: error.response.data.msg,
            code: error.response.data.code
          });
        });
    }
  }
};
</script>

<style src="../../css/index.module.scss" lang="scss" module />
