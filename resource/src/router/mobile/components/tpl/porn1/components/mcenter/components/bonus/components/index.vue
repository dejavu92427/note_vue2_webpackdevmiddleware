<template>
  <div>
    <div :class="$style['top']">
      <div :class="$style['menu-wrap-left']">
        <p :class="$style['small']">累计红利总计</p>
        <p :class="$style['big']">
          {{ info !== null ? formatThousandsCurrency(total.amount) : "0.00" }}
        </p>
      </div>
      <div :class="$style['menu-wrap-right']">
        <p :class="$style['small']">未兑现红利总计</p>
        <p :class="$style['big']">
          {{
            info !== null
              ? formatThousandsCurrency(Math.ceil(total.amount).toFixed(2))
              : "0.00"
          }}
        </p>
      </div>
    </div>

    <!-- 有資料-->
    <template v-if="info.length > 0">
      <div :class="$style['template']">
        <div :class="$style['amount']">
          <div :class="$style['list']" v-if="info !== null">
            笔数：{{ info.length }}
          </div>
        </div>
        <hr />
        <div v-for="ret in info" :key="ret.id">
          <!--顯示資料 -->
          <div :class="$style['data-wrap']">
            <div>
              <div :class="$style['title']">
                <p>{{ ret.name }}</p>
              </div>
            </div>
            <div :class="$style['content']">
              <div :class="$style['content-left']">
                <p>累积红利</p>
                <p>流水要求</p>
                <p>累积流水</p>
                <p>未兑现红利</p>
              </div>
              <div :class="$style['content-right']">
                <p>{{ formatThousandsCurrency(ret.amount) }}</p>
                <p>{{ formatThousandsCurrency(ret.total) }}</p>
                <p>{{ formatThousandsCurrency(ret.aggregation) }}</p>
                <p>{{ formatThousandsCurrency(ret.balance) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 無資料 -->
    <template v-if="info.length == 0">
      <div v-if="info.length == 0" :class="$style['no-data']">
        <img
          :src="
            $getCdnPath(
              `/static/image/${themeTPL}/mcenter/img_default_no_data.png`
            )
          "
        />
        <p>
          <template v-if="['porn1', 'sg1'].includes(themeTPL)">
            {{ $text("S_NO_BONUS", "暂时没有新的红利彩金") }}
          </template>
        </p>
      </div>
    </template>
    <infinite-loading
      v-if="showInfinite"
      ref="infiniteLoading"
      @infinite="infiniteHandler"
    >
      <span slot="no-more" />
      <span slot="no-results" />
    </infinite-loading>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";
import goLangApiRequest from "@/api/goLangApiRequest";
import { thousandsCurrency } from "@/lib/thousandsCurrency";

export default {
  components: {
    InfiniteLoading
  },
  data() {
    return {
      isLoading: false,
      isReceive: false,
      showInfinite: false,
      info: {},
      total: {}
    };
  },
  computed: {
    ...mapGetters({
      memInfo: "getMemInfo",
      siteConfig: "getSiteConfig",
      loginStatus: "getLoginStatus"
    }),
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    },
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    }
  },
  created() {
    if (!this.loginStatus) {
      this.$router.back();
      return;
    }

    this.isLoading = true;
    this.getCredit();
  },
  methods: {
    formatThousandsCurrency(value) {
      return thousandsCurrency(value);
    },
    getCredit() {
      //紅利帳戶api C02.112
      goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Gift/Card`
      }).then(res => {
        if (res && res.status === "000") {
          this.info = res.data.ret;
          this.total = res.data.total;
        }
      });
    },
    /**
     * 捲動加載
     * @param {object} $state - 套件提供的方法
     * @see { @link https://peachscript.github.io/vue-infinite-loading/#!/ }
     */
    infiniteHandler($state) {
      if (this.isReceive) {
        return;
      }

      this.isReceive = true;
      this.getCredit().then(({ result }) => {
        /*  method 要換成新的 API*/
        this.isLoading = false;
        this.isReceive = false;
        if (result !== "ok") {
          return;
        }

        if (
          !this.pagination.total ||
          this.mainListData.length === +this.pagination.total
        ) {
          $state.complete();
          return;
        }

        this.showPage += 1;

        $state.loaded();
      });
    }
  }
};
</script>

<style lang="scss" src="../css/porn1.index.scss" module="$style_porn1"></style>
<style lang="scss" src="../css/sg1.index.scss" module="$style_sg1"></style>
