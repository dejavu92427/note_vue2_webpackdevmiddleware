<template>
  <div>
    <template v-if="path && $route.params.item !== 'detail'">
      <!-- 返利管理 日期 -->
      <tcenter-label :child-item="allTotalData" :change-tab="getTimeRecord" />
      <commission-list
        v-if="!hasSearch"
        :path="path"
        :time-title="timeTitle"
        :set-tab-state="setTabState"
        :set-header-title="setHeaderTitle"
        :search-info="searchInfo"
        :current-info.sync="commissionInfo"
      />
    </template>
    <div
      v-if="page !== 'detail' && isReceive && !path"
      :class="$style['top-link']"
    >
      <span
        :class="[$style.link, { [$style.active]: page === 'record' }]"
        @click="onClick('record')"
        >{{ $text("S_COMMISSION_SEND_RECORD", "派发记录") }}</span
      >
      <span
        :class="[$style.link, { [$style.active]: page === 'summary' }]"
        @click="onClick('summary')"
        >{{ $text("S_COMMISSION_SUMMARY", "收益概況") }}</span
      >
      <span
        v-if="isShowRebate"
        :class="[$style.link, { [$style.active]: page === 'rebate' }]"
        @click="onClick('rebate')"
        >{{ $text("S_COMMISSION_REBATE", "实时返利") }}</span
      >
    </div>

    <div
      v-if="(page === 'record' && hasSearch) || (path && hasSearch)"
      :class="$style[`search-wrap-${path}`]"
    >
      <div :class="$style['search-form']">
        <div :class="[$style['form-row'], 'clearfix']">
          <div :class="$style['form-date-start']">
            <div :class="$style['form-title']">
              {{ $text("S_STARTED_DAY", "起始日") }}
            </div>

            <input
              v-model="start"
              ref="startInput"
              :min="fromDate"
              :max="end"
              :id="`start`"
              type="date"
              @input="limitDate('start', $event.target.value)"
            />
            <span>{{ dateFormat(start) }}</span>
          </div>
          <div :class="$style['form-date-end']">
            <div :class="$style['form-title']">
              {{ $text("S_END_DAY", "结束日") }}
            </div>

            <input
              v-model="end"
              ref="endInput"
              :min="start"
              :max="endDate"
              :id="`end`"
              type="date"
              @input="limitDate('end', $event.target.value)"
            />
            <span>{{ dateFormat(end) }}</span>
          </div>
        </div>

        <div :class="[$style['submit-form-row']]">
          <div :class="[$style.submit]" @click="onInquire">
            {{ $text("S_INQUIRE", "查询") }}
          </div>
        </div>
      </div>
    </div>

    <commission-overview v-if="page === 'summary'" />
    <commission-list
      v-if="!hasSearch"
      v-show="page === 'record'"
      :set-tab-state="setTabState"
      :set-header-title="setHeaderTitle"
      :search-info="searchInfo"
      :current-info.sync="commissionInfo"
    />

    <commission-detail
      v-if="page === 'detail' || $route.params.item === 'detail'"
      :current-info="getCommissionInfo"
      :set-header-title="setHeaderTitle"
    />

    <commission-rebates v-if="page === 'rebate'" />
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import { format } from "date-fns";
import commission from "@/mixins/mcenter/commission";
import EST from "@/lib/EST";
import tcenterLabel from "../../../tcenterSame/tcenterLabel";
import goLangApiRequest from "@/api/goLangApiRequest";
export default {
  components: {
    tcenterLabel,
    commissionOverview: () =>
      import(
        /* webpackChunkName: 'commissionOverview' */ "./components/commissionOverview/index"
      ),
    commissionList: () =>
      import(
        /* webpackChunkName: 'commissionList' */ "./components/commissionList/index"
      ),
    commissionDetail: () =>
      import(
        /* webpackChunkName: 'commissionDetail' */ "./components/commissionDetail/index"
      ),
    commissionRebates: () =>
      import(
        /* webpackChunkName: 'commissionRebates' */ "./components/commissionRebates/index"
      )
  },
  mixins: [commission],
  props: {
    setTabState: {
      type: Function,
      required: true
    },
    setHeaderTitle: {
      type: Function,
      required: true
    },
    setBackFunc: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    const now = EST(new Date(), "", true);
    return {
      isReceive: true,
      isShowRebate: true,
      hasSearch: this.$route.params.page === "record",
      commissionInfo: {},
      fromDate: Vue.moment(now)
        .add(-29, "days")
        .format("YYYY-MM-DD"),
      endDate: Vue.moment(now).format("YYYY-MM-DD"),
      path: this.$route.params.title ?? "", //是否從返利管理來,

      title: "record",
      estToday: EST(new Date(), "", true),
      timeTitle: "",
      tabState: true
    };
  },
  computed: {
    ...mapGetters({
      memInfo: "getMemInfo",
      siteConfig: "getSiteConfig"
    }),
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    },
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    },
    start: {
      get() {
        return format(new Date(this.startTime), "yyyy-MM-dd"); // 格式化成原生 input date 可以使用的格式
      },
      set(date) {
        if (!date) {
          return;
        } else {
          this.startTime = date;
        }
      }
    },
    end: {
      get() {
        return format(new Date(this.endTime), "yyyy-MM-dd"); // 格式化成原生 input date 可以使用的格式
      },
      set(date) {
        if (!date) {
          return;
        } else {
          this.endTime = date;
        }
      }
    },
    getCommissionInfo: {
      get() {
        return this.commissionInfo;
      },
      set(data) {
        this.commissionInfo = data;
      }
    },
    page() {
      return this.$route.params.page;
    },
    allTotalData() {
      return [
        {
          text: this.$text("S_TODDAY", "今日"),
          name: "today",
          value: 0,
          index: 0,
          show: true
        },
        {
          text: this.$text("S_YESTERDAY", "昨日"),
          name: "yesterday",
          value: 1,
          index: 1,
          show: true
        },
        {
          text: this.$text("S_THIRTY_DAY", "近30日"),
          name: "month",
          value: 29,
          index: 2,
          show: true
        },
        {
          text: this.$text("S_SEARCH_DAY", "搜寻"),
          name: "custom",
          value: 29,
          index: 3,
          show: true
        }
      ].filter(item => item.show);
    }
  },
  watch: {
    startTime() {
      this.endTime =
        this.startTime > this.endTime ? this.startTime : this.endTime;
    },
    "$route.query.dateId": {
      handler: function(item) {
        if (item) {
          this.getTimeRecord(this.allTotalData[item]);
        }
      },
      deep: true,
      immediate: true
    },
    "$route.params.item": {
      handler: function(item) {
        if (item == "detail") {
          this.setTabState(false);
          this.hasSearch = false;
        } else {
          this.setTabState(true);
          this.setHeaderTitle(this.$text("S_TEAM_REBATE", "返利管理"));
        }
      },
      deep: true,
      immediate: true
    },
    "$route.params.page"() {
      if (this.$route.params.page !== "detail" && this.page !== "detail") {
        this.setTabState(true);
        this.setHeaderTitle(this.$text("S_TEAM_CENTER", "我的推广"));
      } else {
        this.setTabState(false);
      }
    }
  },
  created() {
    if (!this.$route.query.assign && this.path) {
      this.getTimeRecord(this.allTotalData[0]);
    } else {
      this.hasSearch = true;
    }
    this.hasSearch = false;
    this.getRebateSwitch();

    // 因 detail 的資料可能為第三方 or 各級好友(從上一個傳下來的data)，統一重整回summary
    if (this.page === "detail") {
      this.$router.replace("/mobile/mcenter/tcenter/commission/summary");
    }

    // // 重整的時候，根據當下render page
    // if (this.page) {
    //   this.$router.replace(`/mobile/mcenter/tcenter/commission/${this.page}`);
    //   return;
    // }
  },
  methods: {
    ...mapActions(["actionSetGlobalMessage"]),
    handleClickInqStartDate() {
      const el = this.$refs["startInput"];
      el.click();
    },
    handleClickInqEndDate() {
      const el = this.$refs["endInput"];
      el.click();
    },
    onClick(page) {
      this.hasSearch = page === "record";
      this.$router.replace(`/mobile/mcenter/tcenter/commission/${page}`);
    },
    onInquire() {
      this.onSearch();
      this.manageRebateDate();
      this.hasSearch = false;
      //返利管理多要顯示日期
    },
    getRebateSwitch() {
      this.isReceive = false;

      goLangApiRequest({
        method: "post",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Wage/SelfDispatchInfo`,
        params: { lang: "zh-cn" }
      }).then(response => {
        this.isReceive = true;
        if (response.status === "000") {
          this.isShowRebate = response.data.ret.show_real_time;
          return;
        }
      });
    },
    limitDate(key, val) {
      let _value = Vue.moment(val).format("YYYY/MM/DD");
      let _today = Vue.moment(new Date())
        .add(-29, "days")
        .format("YYYY/MM/DD");

      if (_value < _today) {
        this.actionSetGlobalMessage({ msg: "查询记录不能超过30天" });
        this.start = this.endDate;
      } else if (this.end > this.endDate) {
        this.end = this.endDate;
      } else if (this.start > this.end) {
        let endTemp = this.end;
        this.end = this.start > this.endDate ? this.endDate : this.start;
        this.start = endTemp;
      }
    },
    dateFormat(value) {
      if (value) {
        return Vue.moment(value).format("YYYY/MM/DD");
      } else {
        return "";
      }
    },
    getTimeRecord(data) {
      if (data.name != "custom") {
        this.start = Vue.moment(this.estToday)
          .add(-data.value, "days")
          .format("YYYY-MM-DD");
        this.end = Vue.moment(this.estToday).format("YYYY-MM-DD");

        if (data.name === "yesterday") {
          this.end = Vue.moment(this.estToday)
            .add(-data.value, "days")
            .format("YYYY-MM-DD");
        }
      }

      if (this.path && this.$route.params.item != data.name) {
        this.$router.replace({
          params: {
            title: "record",
            item: `${data.name}`
          },
          query: { dateId: data.index }
        });
      }
      this.rebateTitle = data.name;
      if (data.name === "custom") {
        this.hasSearch = true;

        return;
      }
      this.manageRebateDate();
      this.onInquire();

      return;
    },
    manageRebateDate() {
      if (this.path) {
        if (this.startTime !== this.endTime) {
          this.timeTitle = `${this.startTime} ~ ${this.endTime}`;
        } else {
          this.timeTitle = this.startTime;
        }
      }
      return;
    }
  }
};
</script>

<style lang="scss" src="./css/porn1.module.scss" module="$style_porn1"></style>
<style lang="scss" src="./css/sg1.module.scss" module="$style_sg1"></style>
