<template>
  <div slot="content" :class="$style['content-wrap']">
    <account-header :header-config="headerConfig" />
    <div :class="[$style.wrap, 'clearfix']">
      <!-- 錯誤訊息 -->
      <div :class="$style['top-tips']">
        <div v-show="tipMsg">
          {{ tipMsg }}
        </div>
      </div>

      <template v-if="oldEmail.isShow">
        <div :class="$style.block">
          <div :class="$style.title">{{ oldEmail.label }}</div>
          <div :class="$style['input-wrap']">
            <input
              v-model="oldValue"
              :placeholder="oldEmail.placeholerLabel"
              :class="$style.input"
              type="text"
            />
            <div :class="$style['clear-input']" v-if="oldValue">
              <img
                :src="$getCdnPath(`/static/image/common/ic_clear.png`)"
                @click="(oldValue = ''), (buttonShow = false)"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-if="newEmail.isShow">
        <div :class="$style.block">
          <div :class="$style.title">
            {{ newEmail.label }}
          </div>
          <div :class="$style['input-wrap']">
            <input
              v-model="newValue"
              :placeholder="$text('S_PLS_ENTER_NEW_EMAIL', '请输入邮箱帐号')"
              :class="$style.input"
              type="text"
            />
            <div :class="$style['clear-input']" v-if="newValue">
              <img
                :src="$getCdnPath(`/static/image/common/ic_clear.png`)"
                @click="newValue = ''"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-if="checkCode.isShow">
        <div :class="$style.block">
          <div :class="$style.title">
            {{ $text("S_MAIL_CHECK_CODE", "邮箱验证码") }}
          </div>
          <div :class="$style['input-wrap']">
            <input
              v-model="codeValue"
              :placeholder="$text('S_PLS_ENTER_MAIL_CODE', '请输入邮箱验证码')"
              :class="$style.input"
              @input="verification($event.target.value, 'code')"
              type="tel"
            />
            <div :class="$style['clear-input']" v-if="codeValue">
              <img
                :src="$getCdnPath(`/static/image/common/ic_clear.png`)"
                @click="codeValue = ''"
              />
            </div>
            <div
              v-if="sendBtn.isShow"
              :class="[
                $style['btn-send'],
                {
                  [$style.active]: isActive()
                }
              ]"
              @click="handleSend()"
            >
              <template>
                <span v-if="sendBtn.countdownSec">{{
                  `${countdownSec}s`
                }}</span>
                <span v-else> {{ sendBtn.label }} </span>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
    <service-tips :edit="edit" :type="'email'" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { API_MCENTER_USER_CONFIG } from "@/config/api";
import ajax from "@/lib/ajax";
import member from "@/api/member";
import mcenter from "@/api/mcenter";
import serviceTips from "../../serviceTips";
import accountHeader from "../../accountHeader";
import goLangApiRequest from "@/api/goLangApiRequest";

export default {
  components: {
    accountHeader,
    serviceTips
  },
  data() {
    return {
      oldValue: "",
      newValue: "",
      codeValue: "",
      tipMsg: "",
      timer: "",
      countdownSec: 0,
      ttl: 60,
      isSendSMS: false,
      info: {
        key: "email",
        text: "SS_E_MAIL",
        status: "",
        value: "",
        verification: false,
        isShow: true
      },
      edit: false,
      hasVerified: false,
      emailShow: false,
      buttonShow: true
    };
  },
  created() {
    // 取得欄位資訊
    ajax({
      method: "get",
      url: API_MCENTER_USER_CONFIG,
      errorAlert: false
    }).then(response => {
      if (response && response.result === "ok") {
        this.info.verification = response.ret.config[this.info.key].code;
        this.info.isShow = response.ret.config[this.info.key].display;
        this.edit = response.ret.config.email.editable;
        this.hasVerified = response.ret.user.email; //是否已驗證

        if (this.fieldValue) {
          if (this.edit && !this.info.verification) {
            this.emailShow = true;
          } else if (this.info.verification) {
            if (this.hasVerified) {
              this.emailShow = true;
            }
          } else {
            this.emailShow = false;
          }
        }
      }
    });
    this.getEmailTTL().then(() => {
      if (this.ttl > 0) {
        this.locker();
        this.actionSetGlobalMessage(null);
        this.tipMsg = "";
      }
    });
  },
  computed: {
    ...mapGetters({
      memInfo: "getMemInfo",
      webInfo: "getWebInfo",
      siteConfig: "getSiteConfig",
      domainConfig: "getDomainConfig"
    }),
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    },
    fieldValue() {
      return this.memInfo.email.email;
    },
    oldEmail() {
      return {
        label: this.$text("S_ORIGINAL_EMAIL"),
        placeholerLabel: this.$text("S_PLS_ENTER_NEW_EMAIL"),
        // 目前億元/鴨博皆接開關判斷可不可修改信箱
        isShow: this.emailShow
      };
    },
    newEmail() {
      return {
        label: this.emailShow
          ? this.$text("S_NEW_EMAIL")
          : this.$text("S_NEW_EMAIL2"),
        isShow: true
      };
    },
    checkCode() {
      return {
        label: this.$text("S_CHECK_CODE"),
        isShow: this.info.verification
      };
    },
    sendBtn() {
      return {
        label: this.countdownSec
          ? this.$text("S_SEND_CHECK_CODE_ALREADY")
          : this.$text("S_GET_VERIFICATION_CODE"),
        isShow: this.info.verification,
        countdownSec: this.countdownSec
      };
    },
    headerConfig() {
      return {
        prev: true,
        onClick: () => {
          this.$router.back();
        },
        title: this.$text("S_E_MAIL", "电子邮箱"),
        onClickFunc: () => {
          this.handleSubmit();
        },
        funcBtn: this.$text("S_COMPLETE", "完成"),
        funcBtnActive:
          !!this.newValue && (this.info.verification ? !!this.codeValue : true)
      };
    }
  },
  beforeDestroy() {
    this.countdownSec = "";
    clearInterval(this.timer);
    this.timer = null;
  },
  mounted() {
    this.countdownSec = "";
    clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    ...mapActions([
      "actionSetUserdata",
      "actionVerificationFormData",
      "actionSetGlobalMessage"
    ]),
    // 回傳會員手機驗證簡訊剩餘秒數可以重送
    getEmailTTL() {
      return goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Player/Email/TTL`,
        params: {
          lang: "zh-cn"
        }
      })
        .then(res => {
          if (res && res.status === "000") {
            this.ttl = res.data;
          } else {
            if (res.msg) {
              this.errorMsg = res.msg;
            }
          }
        })
        .catch(error => {
          if (error.status) {
            this.tipMsg = `${error.msg}`;
            return;
          }
        });
    },

    locker() {
      this.countdownSec = this.ttl;
      if (!this.domainConfig || !this.domainConfig.auto_keyring) {
        //auto_keyring 臨時驗證碼打開為true
        this.actionSetGlobalMessage({
          msg: this.$text("S_SEND_CHECK_CODE_VALID_TIME_10")
        });
      }
      this.tipMsg =
        this.$text("S_SEND_CHECK_CODE_VALID_TIME_10") +
        this.$text("S_FIND_TRASH");
      this.timer = setInterval(() => {
        if (this.countdownSec <= 1) {
          this.countdownSec = 0;
          clearInterval(this.timer);
          this.timer = null;
          this.tipMsg = "";
          return;
        }
        this.countdownSec -= 1;
      }, 1000);
    },
    verification(value, target) {
      this.actionVerificationFormData({ target: target, value: value }).then(
        val => {
          if (target === "code") {
            this.codeValue = val;
          }
          // 尚未實作
          // if (target === 'newValue') {
          //   this.newValue = val;
          // }

          // if (target === 'oldValue') {
          //   this.oldValue = val;
          // }
        }
      );
    },
    handleSend(send) {
      if (!this.newValue || this.timer || this.isSendSMS) return;

      this.isSendSMS = true;
      const getOldEmail = () => {
        if (this.fieldValue) {
          return this.info.status === "ok"
            ? this.newValue
            : this.oldValue
            ? this.oldValue
            : this.newValue;
        }
        return "";
      };

      mcenter.accountMailSend({
        params: {
          old_email: getOldEmail(),
          email: this.newValue
        },
        success: () => {
          member.joinConfig({
            success: response => {
              if (response.ret.email.code) {
                mcenter.accountMailSec({
                  success: data => {
                    if (data.ret > 0) {
                      this.ttl = data.ret;
                    }
                    this.actionSetUserdata(true);
                    this.locker();
                    this.isSendSMS = false;
                  },
                  fail: res => {
                    this.isSendSMS = false;
                    if (res && res.data && res.data.msg) {
                      this.tipMsg = `${res.data.msg}`;
                    }
                  }
                });
              }
            }
          });
        },
        fail: res => {
          this.isSendSMS = false;
          if (res && res.data && res.data.msg) {
            this.tipMsg = `${res.data.msg}`;
          }
        }
      });
    },
    handleSubmit() {
      // 驗證信箱
      if (this.info.verification) {
        return mcenter.accountMailCheck({
          params: {
            email: this.newValue,
            keyring: this.codeValue
          },
          success: () => {
            localStorage.setItem("set-account-success", true);
            this.$router.push("/mobile/mcenter/accountData");
            this.$emit("success");
          },
          fail: res => {
            if (res && res.data && res.data.msg) {
              this.tipMsg = `${res.data.msg}`;
            }
          }
        });
      }

      // 不驗證直接設定信箱
      return mcenter.accountMailEdit({
        params: {
          email: this.newValue,
          old_email: this.oldValue ? this.oldValue : this.newValue
        },
        success: () => {
          localStorage.setItem("set-account-success", true);
          this.$router.push("/mobile/mcenter/accountData");
          this.$emit("success");
        },
        fail: res => {
          if (res && res.data && res.data.msg) {
            this.tipMsg = `${res.data.msg}`;
          }
        }
      });
    },
    isActive() {
      if (this.buttonShow) {
        return this.newValue && !this.timer;
      }
      return this.newValue && this.oldValue && !this.timer;
    }
  }
};
</script>

<style
  lang="scss"
  src="../../../css/index.module.scss"
  module="$style_porn1"
></style>
