<template>
  <div>
    <div :class="[$style['code-wrap'], 'clearfix']">
      <div :class="$style.title">
        {{ $text("S_PROMOTION_CODE", "推广代码") }}
      </div>
      <div :class="$style.code">{{ agentLink.agentCode }}</div>
    </div>
    <div v-if="getAgentLink" :class="[$style['promote-wrap'], 'clearfix']">
      <div :class="$style['qrcode-wrap']">
        <qrcode
          :value="getAgentLink"
          :options="{ width: 129, margin: 2 }"
          tag="img"
        />
      </div>
      <div :class="$style['button-wrap']">
        <div class="download-qrcode" @click="onQrcodeOpen">
          <span :class="[$style.icon, $style['icon-qrcode']]" />
          <span :class="$style['button-text']">{{
            $text("S_DOWNLOAD_QRCODE", "下载二维码")
          }}</span>
        </div>
        <div class="copy-link" @click="onCopy('LINK')">
          <span :class="[$style.icon, $style['icon-copy']]" />
          <span :class="$style['button-text']">{{
            $text("S_COPY_PROMOTION_LINK", "复制推广连结")
          }}</span>
        </div>
        <div class="copy-code" @click="onCopy('CODE')">
          <span :class="[$style.icon, $style['icon-copy']]" />
          <span :class="$style['button-text']">{{
            $text("S_COPY_PROMOTION_CODE", "复制推广代码")
          }}</span>
        </div>
      </div>
      <!-- v-if="memInfo.config.infinity_register" -->
      <div
        v-if="memInfo.config.infinity_register"
        :class="$style['button-create']"
        @click="isShow = !isShow"
      >
        <span :class="[$style['icon-arrow'], { [$style.active]: isShow }]" />
        <span>新增一级好友</span>
      </div>
    </div>
    <transition name="slide-down">
      <div v-if="isShow" :class="$style['register-wrap']">
        <div :class="$style.line" />
        <div v-for="key in allInput" :key="key" :class="$style['input-group']">
          <!-- 欄位名稱 -->
          <div :class="$style['input-title']">
            {{ allTip[key].title }}
          </div>
          <!-- 輸入框 -->
          <div
            :class="[
              $style[key],
              $style.placeholder,
              { [$style.error]: allTip[key].error }
            ]"
          >
            <input
              v-if="key !== 'password' && key !== 'confirm_password'"
              v-validate="'required'"
              :class="[
                {
                  [$style.active]: allValue[key],
                  [$style.error]: allTip[key].error,
                  [$style['show-placeholder']]: !allValue[key]
                }
              ]"
              :placeholder="allTip[key].placeholder"
              :maxlength="allTip[key].maxLength"
              v-model="allValue[key]"
              data-vv-scope="form-page"
              @blur="onInput($event.target.value, key)"
              @input="onInput($event.target.value, key)"
              @keydown.13="onSubmit"
            />
            <input
              v-else-if="key === 'password' || key === 'confirm_password'"
              v-validate="'required'"
              :class="[
                {
                  [$style.active]: allValue[key],
                  [$style.error]: allTip[key].error,
                  [$style['show-placeholder']]: !allValue[key]
                }
              ]"
              :placeholder="allTip[key].placeholder"
              :data-key="key"
              :maxlength="allTip[key].maxLength"
              v-model="allValue[key]"
              type="password"
              data-vv-scope="form-page"
              @blur="onInput($event.target.value, key)"
              @input="onInput($event.target.value, key)"
              @keydown.13="onSubmit"
            />
            <div
              v-if="['password', 'confirm_password'].includes(key)"
              :class="[
                $style['btn-show-password'],
                { [$style.active]: isShowEyes }
              ]"
              @click="onShowPassword"
            />
          </div>
          <!-- 錯誤訊息 -->
          <div v-if="allTip[key].error" :class="$style['error-message']">
            {{ allTip[key].error }}
          </div>
        </div>
        <!-- 驗證碼 -->
        <div v-if="memInfo.config.friend_captcha_type === 1">
          <div :class="$style['input-title']" style="font-size: 12px">
            验证码
          </div>
          <div
            :class="[
              $style['captcha-unit'],
              $style['captcha-unit-captcha'],
              $style['clearfix'],
              { [$style.error]: captchaErrorMsg }
            ]"
          >
            <input
              ref="captcha_text"
              v-model="allValue['captcha_text']"
              placeholder="请输入验证码"
              :class="$style['captcha-input']"
              maxlength="4"
              @input="onInput($event.target.value, 'captcha_text')"
              @keydown.13="onSubmit"
            />
            <div class="input-icon"></div>
            <img
              :class="$style['captchaImg']"
              v-if="captchaImg"
              :src="captchaImg"
              height="25"
            />
            <div :class="$style['captchaText-refresh']" @click="getCaptcha">
              <img :src="'/static/image/common/ic_verification_reform.png'" />
            </div>
          </div>
        </div>
        <!-- 錯誤訊息 -->
        <div
          v-if="memInfo.config.friend_captcha_type === 1 && captchaErrorMsg"
          :class="$style['captcha-error']"
        >
          {{ captchaErrorMsg }}
        </div>
        <popup-verification
          v-if="isShowCaptcha"
          @show-captcha="showCaptcha"
          @set-captcha="setCaptcha"
          :page-type="'friends'"
        />
        <button @click="checkInput">{{ $text("S_ADD") }}</button>
      </div>
    </transition>

    <!-- 連結複製提示與 QR Code -->
    <popup
      v-if="isPopup"
      :type="popupType"
      :link="getAgentLink"
      @close="onPopupClose"
    />
  </div>
</template>

<script>
import friendsRecommend from "@/mixins/mcenter/management/friendsRecommend";
import promoteFunction from "@/mixins/mcenter/management/promoteFunction";
import { mapGetters, mapActions } from "vuex";
import popupVerification from "@/components/popupVerification";

export default {
  components: {
    popup: () => import(/* webpackChunkName: 'popup' */ "../popup/index"),
    popupVerification
  },
  mixins: [friendsRecommend, promoteFunction],
  data() {
    return {
      puzzleData: null,
      isGetCaptcha: false, // 重新取得驗證碼
      captchaImg: "",
      thirdyCaptchaObj: null,
      isShowCaptcha: false
    };
  },
  watch: {
    thirdyCaptchaObj(val) {
      if (this.memInfo.config.friend_captcha_type != 1 && val) {
        this.allValue["captcha_text"] = val;
        this.onSubmit();
      }
    }
  },
  computed: {
    ...mapGetters({
      memInfo: "getMemInfo",
      siteConfig: "getSiteConfig",
      isBackEnd: "getIsBackEnd"
    }),
    puzzleObj: {
      get() {
        return this.puzzleData;
      },
      set(value) {
        this.puzzleData = value;
      }
    },
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    }
  },
  created() {
    this.getCaptcha();
  },
  methods: {
    showCaptchaPopup() {
      // 無認證直接呼叫
      if (this.memInfo.config.friend_captcha_type === 0) {
        this.handleSend();
        return;
      }
      // 四碼驗證
      if (this.memInfo.config.friend_captcha_type === 1) {
        this.onSubmit();
        return;
      }

      if ([2, 3, 4, 5].includes(this.memInfo.config.friend_captcha_type)) {
        this.showCaptcha();
      }
    },
    handleSend() {
      this.onSubmit();
    },
    setCaptcha(obj) {
      this.thirdyCaptchaObj = obj;
    },
    showCaptcha() {
      this.isShowCaptcha = !this.isShowCaptcha;
    }
  }
};
</script>

<style lang="scss" src="./css/porn1.module.scss" module="$style_porn1"></style>
<style lang="scss" src="./css/sg1.module.scss" module="$style_sg1"></style>
