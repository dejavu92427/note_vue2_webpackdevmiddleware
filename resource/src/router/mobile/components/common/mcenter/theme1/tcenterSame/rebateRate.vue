<template>
  <div :class="sliderClass">
    <div :class="[$style['serial-header'], [$style[themeTPL]]]">
      <div :class="$style['btn-prev']">
        <img :src="$getCdnPath(closeImage)" @click="onClose()" />
      </div>
      <span :class="$style['title']"> {{ "返利比例" }}</span>
    </div>

    <div v-if="gameRateResult.length > 0">
      <div
        :class="[$style['serial-number-wrap']]"
        v-for="(name, index) in gameRateResult"
        :key="index"
      >
        <div
          :class="[
            $style['serial-number-title'],
            $style[siteConfig.ROUTER_TPL]
          ]"
        >
          {{ name.title }}
        </div>
        <div
          :class="[
            $style['serial-number-cell'],
            $style[siteConfig.ROUTER_TPL],
            { [$style.active]: item.rate == 0 }
          ]"
          v-for="(item, index2) in name.item"
          :key="index2"
        >
          <span :class="$style['title']">{{ item.alias }}</span>
          <span :class="$style['rate']"> {{ item.rate }}% </span>
        </div>
      </div>
    </div>
    <div v-else :class="$style['no-data']">
      <img
        :src="
          $getCdnPath(
            `/static/image/${themeTPL}/mcenter/img_default_no_data.png`
          )
        "
      />
      <p>{{ $text("S_NO_DATA_YET", "暂无资料") }}</p>
    </div>
  </div>
</template>

<script>
import mixin from "@/mixins/mcenter/withdraw/serialNumber";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [mixin],
  components: {},
  data() {
    return {
      sliderClass: "slider",
      serialNumberList: [],
      selectedSerialDetail: {},
      isShow: true,
      showDetail: false
    };
  },
  props: {
    handleClose: {
      type: Function,
      default: () => {}
    },
    gameRateResult: {
      type: Array,
      default: []
    }
  },
  created() {},
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    }),
    $style() {
      return this[`$style_${this.themeTPL}`] || this.$style_porn1;
    },
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    },
    closeImage() {
      let color = "";
      switch (this.themeTPL) {
        case "sg1":
        case "porn1":
          color = "black";
          break;
      }
      return `/static/image/common/btn_close_${color}.png`;
    }
  },
  watch: {},
  methods: {
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

<style lang="scss" src="./css/porn1.module.scss" module="$style_porn1"></style>
<style lang="scss" src="./css/sg1.module.scss" module="$style_sg1"></style>
