<template>
  <div :class="$style['label-wrap-bg']">
    <div :class="$style['label-block']">
      <swiper
        v-if="isLabelReceive && labelData.length !== 0"
        ref="typeSwiper"
        :options="options"
        class="clearfix"
      >
        <swiper-slide
          v-for="info in labelData"
          :key="`nav-${info.label}`"
          :class="$style['nav-item']"
        >
          <button
            :disabled="label === info.label"
            :class="label === info.label.toString() ? $style['is-current'] : ''"
            @click="changeGameLabel(info.label)"
          >
            {{ info.name }}
          </button>
        </swiper-slide>
      </swiper>
      <span
        v-else-if="!isLabelReceive && labelData.length === 0"
        :class="[
          'ui',
          'active',
          'inline',
          'small',
          'loader',
          'inverted',
          $style['loader']
        ]"
      />
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import { mapGetters } from "vuex";

/**
 * 共用元件 - 手機網頁版 遊戲大廳使用分類選單
 * @param {String} [theme] - 預設樣式鴨脖
 * @param {Boolean} [isLabelReceive=false] - API是否取得分類資料
 * @param {String} [label] - 當前分類
 * @param {Array} [labelData] - 分類資料
 * @param {Function} [changeGameLabel] - 切換分類觸發事件
 */
export default {
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    theme: {
      type: String,
      default: "porn1"
    },
    isLabelReceive: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      required: true
    },
    labelData: {
      type: Array,
      required: true
    },
    changeGameLabel: {
      type: Function,
      required: true
    }
  },
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
    options() {
      return {
        slidesPerView: "auto",
        slideToClickedSlide: true,
        centeredSlides: true,
        centeredSlidesBounds: true,
        spaceBetween: 10,
        slidesOffsetBefore: 15,
        slidesOffsetAfter: 15
      };
    }
  }
};
</script>

<style lang="scss" src="./css/porn1.module.scss" module="$style_porn1"></style>
<style lang="scss" src="./css/sg1.module.scss" module="$style_sg1"></style>
