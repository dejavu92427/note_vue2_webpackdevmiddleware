<template>
  <div :class="sliderClass">
    <div :class="$style['detail-header']">
      <div :class="$style['btn-prev']">
        <img
          :src="$getCdnPath(`/static/image/common/btn_back_grey.png`)"
          @click="onClose()"
        />
      </div>
      <div :class="$style['title']">交易详情</div>
    </div>
    <detailInfo
      v-if="opcodeList"
      :detail-info="detailInfo"
      :current-category="{ text: 'SWAG' }"
      :opcode-list="opcodeList"
    />
    <page-loading :is-show="!opcodeList" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import detailInfo from "@/router/mobile/components/common/mcenter/theme1/moneyDetail/components/detailInfo/";

export default {
  props: {
    detailInfo: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    }),
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    }
  },
  components: {
    pageLoading: () =>
      import(
        /* webpackChunkName: 'pageLoading' */ "@/router/mobile/components/common/pageLoading"
      ),
    detailInfo
  },
  mounted() {
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
  },
  data() {
    return {
      sliderClass: "slider",
      opcodeList: null
    };
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    })
  },
  methods: {
    onClose() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$emit("close");
        }, 280);
      });
      this.sliderClass = "slider-close slider";
    }
  }
};
</script>

<style lang="scss" src="../css/porn1.module.scss" module="$style_porn1"></style>
<style lang="scss" src="../css/sg1.module.scss" module="$style_sg1"></style>
