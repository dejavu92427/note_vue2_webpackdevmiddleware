<template>
  <div :class="$style['money-detail-wrap']">
    <template v-if="!isEmbedDetail">
      <div
        v-if="$route.params.page !== 'detail' || !detailInfo"
        :class="[$style['top-link'], 'clearfix']"
        :style="{ width: screenWidthSize + 'px' }"
      >
        <div :class="$style['link-wrap']" @click="changeCondition('category')">
          <div>{{ currentCategory.text }}</div>
          <span
            :class="{ [$style['arrow-top']]: showCondition === 'category' }"
          />
        </div>
        <div
          :class="[$style['link-wrap'], { [$style['has-date']]: isCustomTime }]"
          @click="changeCondition('date')"
        >
          <div v-if="isCustomTime">
            {{ startTime | dateFormat }}<br />{{ endTime | dateFormat }}
          </div>
          <div v-else>{{ bufferCurrentDate.text }}</div>
          <span :class="{ [$style['arrow-top']]: showCondition === 'date' }" />
        </div>
      </div>

      <div
        v-if="showCondition === 'category'"
        :class="[$style['record-select']]"
        :style="{ width: screenWidthSize + 'px' }"
      >
        <div :class="[$style['select-wrap'], 'clearfix']">
          <div
            v-for="option in categoryOpt"
            :key="option.key"
            :class="[
              $style.select,
              { [$style.active]: currentCategory.key === option.key }
            ]"
            @click="setCategory(option)"
          >
            <span>{{ option.text }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="showCondition === 'date'"
        :class="[$style['record-select']]"
        :style="{ width: screenWidthSize + 'px' }"
      >
        <div :class="[$style['select-wrap'], 'clearfix']">
          <div :class="$style['select-tip']">
            *当前系统支持查询最近30日的交易记录
          </div>
          <div
            v-for="option in dateOptions"
            :key="option.key"
            :class="[
              $style['select-time'],
              { [$style.active]: currentDate.key === option.key }
            ]"
            @click="setDate(option)"
          >
            <span>{{ option.text }}</span>
          </div>
        </div>
        <div v-if="showDatePicker" :class="$style['date-wrap']">
          <div
            :class="[$style['picker-wrap'], 'clearfix']"
            @click="changeDatePicker('start')"
          >
            <div :class="$style['date-text']">开始日期</div>
            <div :class="$style['select-date']">
              {{ startTime | dateFormat }}
            </div>
            <div :class="$style['icon-arrow']">
              <icon name="chevron-right" width="10" height="16" />
            </div>
          </div>
          <date-picker
            v-if="currentDatePicker === 'start'"
            :key="'start-date-picker'"
            :date.sync="startTime"
            :min-limit="limitTime"
            :max-limit="estToday"
          />
          <div
            :class="[$style['picker-wrap'], 'clearfix']"
            @click="changeDatePicker('end')"
          >
            <div :class="$style['date-text']">结束日期</div>
            <div :class="$style['select-date']">{{ endTime | dateFormat }}</div>
            <div :class="$style['icon-arrow']">
              <icon name="chevron-right" width="10" height="16" />
            </div>
          </div>
          <date-picker
            v-if="currentDatePicker === 'end'"
            :key="'end-date-picker'"
            :date.sync="endTime"
            :min-limit="limitTime"
            :max-limit="estToday"
          />
          <div :class="[$style['picker-button-wrap'], 'clearfix']">
            <div :class="$style.cancel" @click="onCancel">取消</div>
            <div :class="$style.confirm" @click="onConfirm">确定</div>
          </div>
          <!-- <div v-if="startTime.valueOf() > endTime.valueOf()" :class="[$style['date-tip']] ">
                  开始日期不能大于结束日期
                </div> -->
        </div>
      </div>
    </template>

    <detail-info
      v-if="$route.params.page === 'detail' && detailInfo && !isEmbedDetail"
      :current-category="currentCategory"
      :opcode-list="opcodeList"
      :detail-info.sync="detailInfo"
    />
    <detail-list
      v-else
      :current-category="currentCategory"
      :opcode-list="opcodeList"
      :detail-list="detailList"
      :detail-info.sync="detailInfo"
      :page-type="pageType"
      :category-list="categoryList"
      @openSlider="openSlider"
    />
    <!-- 捲動加載 -->
    <infinite-loading
      v-if="showInfinite"
      ref="infiniteLoading"
      @infinite="infiniteHandler"
    >
      <span slot="no-more" />
      <span slot="no-results" />
    </infinite-loading>

    <page-loading :is-show="isLoading" />
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import InfiniteLoading from "vue-infinite-loading";
import EST from "@/lib/EST";
import { sendUmeng } from "@/lib/sendUmeng";
import goLangApiRequest from "@/api/goLangApiRequest";

export default {
  props: {
    //  額度轉讓共用
    pageType: {
      default: ""
    }
  },
  components: {
    InfiniteLoading,
    detailList: () =>
      import(/* webpackChunkName: 'detailList' */ "./components/detailList"),
    detailInfo: () =>
      import(/* webpackChunkName: 'detailInfo' */ "./components/detailInfo"),
    datePicker: () =>
      import(/* webpackChunkName: 'datePicker' */ "../../../datePicker/index"),
    pageLoading: () =>
      import(
        /* webpackChunkName: 'pageLoading' */ "@/router/mobile/components/common/pageLoading"
      )
  },
  filters: {
    dateFormat(date) {
      return Vue.moment(date).format("YYYY-MM-DD");
    }
  },
  watch: {
    //   detailInfo(val) {
    //     if (this.isEmbedDetail) {
    //       this.$emit("showDetail", val);
    //     }
    //   }
  },
  data() {
    const estToday = EST(new Date(), "", true);
    const limitTime = new Date(Vue.moment(estToday).add(-29, "days"));

    return {
      estToday,
      startTime: estToday,
      endTime: estToday,
      limitTime,
      isReceive: false,
      showInfinite: true,
      showCondition: "",
      showDatePicker: false,
      currentCategory: {
        key: "deposit",
        text: "充值"
      },
      currentDate: { key: "today", text: this.$text("S_TODDAY", "今日") },
      currentDatePicker: "",
      opcodeList: {},
      detailList: null,
      detailInfo: null,
      type: ["deposit"], // 交易類型 預設開啟存款
      sort: "desc", // 排序方式
      firstResult: 0, // 每頁起始筆數
      maxResults: 20, // 每頁顯示幾筆
      pageNow: 1, // 當前頁
      pageAll: 1, // 總頁數
      isLoading: true,
      categoryOpt: [],
      screenWidthSize: null,
      isCustomTime: false,
      categoryList: [],
      bufferCurrentDate: { key: "today", text: this.$text("S_TODDAY", "今日") }
    };
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig",
      loginStatus: "getLoginStatus"
    }),
    isEmbedDetail() {
      // 共用紀錄
      return ["ingroup_transfer", "internal_memo", "paopao"].includes(
        this.pageType
      );
    },
    routerTPL() {
      return this.siteConfig.ROUTER_TPL;
    },
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    },
    categoryOptions() {
      return [
        { key: "", text: "全部" },
        { key: "deposit", text: "充值" },
        { key: "vendor", text: "转帐" },
        { key: "withdraw", text: "提现" },
        { key: "activity", text: "优惠" },
        { key: "manual", text: "人工" },
        { key: "wage", text: "返利" },
        { key: "ingroup_transfer", text: "转让" }
      ];
    },
    dateOptions() {
      return [
        { key: "today", text: "今日" },
        { key: "yesterday", text: "昨日" },
        { key: "week", text: "近7日" },
        { key: "thirty", text: "近30日" },
        { key: "custom", text: "自定义" }
      ];
    }
  },
  created() {
    if (!this.loginStatus) {
      this.$router.push("/mobile/login");
      return;
    }

    this.getCategoryList();
    if (this.routerTPL === "sg1") {
      sendUmeng(44);
    } else {
      sendUmeng(45);
    }
    if (this.$route.params.page === "detail") {
      let detailparams = localStorage.getItem("money-detail-params");

      if (!this.detailInfo && !detailparams) {
        this.$router.replace("/mobile/mcenter/moneyDetail");
        return;
      }
    }

    // 額度轉讓 porn1/sg1

    this.categoryOpt = this.categoryOptions;

    //取得所有Opcode C02.124
    goLangApiRequest({
      method: "get",
      url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Opcode/Info`
    }).then(res => {
      if (res && res.status !== "000") {
        return;
      }
      this.opcodeList = res.data.ret;
    });

    // 共用額度轉移紀錄
    // 共用红包紀錄
    // 共用泡泡鑽石紀錄
    if (this.pageType && this.isEmbedDetail) {
      this.setDefaultCommonPageType();
    }
  },
  mounted() {
    this.screenWidthSize = document.body.offsetWidth;

    window.addEventListener("resize", this.onResize);
  },
  methods: {
    ...mapActions(["actionSetGlobalMessage"]),
    getCategoryList() {
      goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Cash/Category`
      }).then(res => {
        if (res && res.data && res.data.ret) {
          this.categoryList = res.data.ret;
        }
      });
    },
    onResize() {
      this.screenWidthSize = document.body.offsetWidth;
    },
    getData(cacheParams = null) {
      this.isLoading = true;
      let params = {};

      if (cacheParams) {
        params = cacheParams;
      } else {
        params = {
          startAt: Vue.moment(this.startTime).format(
            "YYYY-MM-DD 00:00:00-04:00"
          ),
          endAt: Vue.moment(this.endTime).format("YYYY-MM-DD 23:59:59-04:00"),
          category: this.type,
          order: this.sort,
          firstResult: this.firstResult,
          maxResults: this.maxResults
        };
      }

      if (this.type.find(i => i === "ingroup_transfer")) {
        params["opcode"] = [
          "8007",
          "1049",
          "5020",
          "5018",
          "5019",
          "5017",
          "5016"
        ];
      }

      if (this.type.find(i => i === "internal_memo")) {
        params["category"] = "";
        params["opcode"] = ["5028"];
      }

      if (this.type.find(i => i === "outer")) {
        params["opcode"] = ["9002"];
      }

      localStorage.setItem("money-detail-params", JSON.stringify(params));
      localStorage.setItem(
        "money-detail-params-category",
        JSON.stringify(this.currentCategory)
      );
      localStorage.setItem(
        "money-detail-params-date",
        JSON.stringify(this.currentDate)
      );

      return goLangApiRequest({
        method: "post",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Cash/Entry`,
        params: { ...params }
      }).then(res => {
        this.isLoading = false;
        if (res && res.msg) {
          this.actionSetGlobalMessage({ msg: `${res.msg}`, code: res.code });
          return;
        }

        if (!res || !res.data || !res.data.ret || res.data.ret.length === 0) {
          return;
        }

        let result = res.data.ret;

        if (this.currentCategory.text === "全部") {
          result = result.filter(i =>
            [
              "deposit",
              "vendor",
              "withdraw",
              "bonus",
              "activity",
              "manual",
              "wage",
              "ingroup_transfer",
              "rebate"
            ].includes(i.category[0])
          );
        }

        this.detailList = result.reduce(
          (init, info) => {
            const date = EST(info.created_at, "YYYY-MM-DD");

            if (!init[date]) {
              return { ...init, [date]: [info] };
            }

            return { ...init, [date]: [...init[date], info] };
          },
          { ...this.detailList }
        );

        if (+res.data.pagination.total === 0) {
          return;
        }

        this.pageAll = Math.ceil(+res.data.pagination.total / this.maxResults);

        // 從聯繫客服返回預設開啟交易詳請
        if (localStorage.getItem("money-detail-params-service")) {
          let id =
            this.$route.query.id || localStorage.getItem("money-detail-id");
          this.detailInfo = result.find(i => i.id === id);
          setTimeout(() => {
            localStorage.removeItem("money-detail-params-service");
            localStorage.removeItem("money-detail-id");
          }, 100);
        }

        return res;
      });
    },
    setDefaultCommonPageType() {
      const typeList = {
        paopao: {
          key: "outer",
          text: "泡泡直播",
          type: "outer"
        },
        ingroup_transfer: {
          key: "ingroup_transfer",
          text: "转让",
          type: "ingroup_transfer"
        },
        internal_memo: {
          key: "internal_memo",
          text: "优惠",
          type: "internal_memo"
        }
      };

      let current = typeList[this.pageType];
      this.type = [current.type];
      this.startTime = new Date(Vue.moment(this.estToday).add(-29, "days"));
      this.endTime = new Date(Vue.moment(this.estToday));
      this.setCategory({ key: current.key, text: current.text });
    },
    setCategory(value) {
      this.currentCategory = value;
      this.type =
        value.key === "activity" ? ["activity", "rebate"] : [value.key];

      this.detailList = null;
      this.firstResult = 0;
      this.pageNow = 1;
      this.pageAll = 1;

      this.changeCondition("");
      this.changeDatePicker("");

      if (
        !localStorage.getItem("money-detail-params-service") ||
        this.isEmbedDetail
      ) {
        if (this.$refs.infiniteLoading) {
          this.$refs.infiniteLoading.stateChanger.reset();
        }
      }
    },
    setDate(value) {
      switch (value.key) {
        case "thirty":
        case "custom":
          this.startTime = new Date(Vue.moment(this.estToday).add(-29, "days"));
          this.endTime = new Date(Vue.moment(this.estToday));
          break;
        case "week":
          this.startTime = new Date(Vue.moment(this.estToday).add(-6, "days"));
          this.endTime = new Date(Vue.moment(this.estToday));
          break;
        case "yesterday":
          this.startTime = new Date(Vue.moment(this.estToday).add(-1, "days"));
          this.endTime = new Date(Vue.moment(this.estToday).add(-1, "days"));
          break;
        default:
          this.startTime = new Date(Vue.moment(this.estToday));
          this.endTime = new Date(Vue.moment(this.estToday));
          break;
      }
      this.isCustomTime = false;
      this.showDatePicker = value.key === "custom";

      this.currentDate = value;
      if (value.key === "custom") {
        return;
      } else {
        this.bufferCurrentDate = value;
      }

      this.detailList = null;
      this.firstResult = 0;
      this.pageNow = 1;
      this.pageAll = 1;

      this.changeCondition("");
      this.changeDatePicker("");

      if (
        !localStorage.getItem("money-detail-params-service") ||
        this.isEmbedDetail
      ) {
        if (this.$refs.infiniteLoading) {
          this.$refs.infiniteLoading.stateChanger.reset();
        }
      }
    },
    changeCondition(value) {
      this.showDatePicker = this.currentDate.key === "custom";
      this.showCondition = this.showCondition === value ? "" : value;

      this.changeDatePicker("");
    },
    changeDatePicker(value) {
      this.currentDatePicker = this.currentDatePicker === value ? "" : value;
    },
    onCancel() {
      this.changeCondition("");
      this.changeDatePicker("");
    },
    onConfirm() {
      if (
        this.startTime > this.endTime &&
        this.startTime.toDateString() !== this.endTime.toDateString()
      ) {
        this.actionSetGlobalMessage({ msg: "开始日期不能大于结束日期" });
        return;
      }

      this.currentDate = { key: "custom", text: "自定义" };
      this.detailList = null;
      this.firstResult = 0;
      this.pageNow = 1;
      this.pageAll = 1;
      this.isCustomTime = true;

      this.changeCondition("");
      this.changeDatePicker("");
      this.getData();
    },
    openSlider() {
      if (this.detailInfo) {
        if (this.isEmbedDetail) {
          this.$emit("showDetail", this.detailInfo);
        }
      }
    },
    /**
     * 捲動加載
     * @param {object} $state - 套件提供的方法
     * @see { @link https://peachscript.github.io/vue-infinite-loading/#!/ }
     */
    infiniteHandler($state) {
      // 防止在切換類別的時候馬上觸發捲動加載，造成有遊戲重複出現的情況
      if (this.isReceive && this.isEmbedDetail) {
        return;
      }

      this.isReceive = true;

      let _params = null;
      if (
        localStorage.getItem("money-detail-params-service") &&
        localStorage.getItem("money-detail-params-category") &&
        localStorage.getItem("money-detail-params-date")
      ) {
        _params =
          JSON.parse(localStorage.getItem("money-detail-params")) || null;
        this.setCategory(
          JSON.parse(localStorage.getItem("money-detail-params-category"))
        );
        this.setDate(
          JSON.parse(localStorage.getItem("money-detail-params-date"))
        );
      }

      this.getData(_params).then(result => {
        this.isReceive = false;

        if (result && result.status !== "000") {
          return;
        }

        if (this.pageNow + 1 > this.pageAll) {
          $state.complete();
          return;
        }

        this.pageNow += 1;
        this.firstResult += this.maxResults;
        $state.loaded();
      });
    }
  }
};
</script>

<style lang="scss" src="./css/porn1.index.scss" module="$style_porn1"></style>
<style lang="scss" src="./css/sg1.index.scss" module="$style_sg1"></style>
