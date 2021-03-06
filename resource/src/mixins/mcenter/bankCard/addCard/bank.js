import { getCookie, setCookie } from "@/lib/cookie";
import { mapActions, mapGetters } from "vuex";

import { API_MCENTER_USER_CONFIG } from "@/config/api";
import ajax from "@/lib/ajax";
import goLangApiRequest from "@/api/goLangApiRequest";

export default {
  data() {
    return {
      // 國碼
      phoneHead: "+86",
      phoneHeadOption: [],
      bankList: [],
      currentBank: "",
      isShowPopBankList: false,
      isVerifyPhone: false,
      formData: {
        accountName: "",
        bankId: "",
        province: "",
        city: "",
        branch: "",
        account: "",
        phone: "",
        keyring: ""
      },
      NextStepStatus: false,
      errorMsg: "",
      lockStatus: false,
      time: 0,
      msg: "",
      smsTimer: null,
      thirdyCaptchaObj: null,
      isShowCaptcha: false,
      isClickedCaptcha: false,
      chooseNameResult: {},
      notMyBankSwitch: false,
      showCityProvinceFields: false
    };
  },
  computed: {
    ...mapGetters({
      memInfo: "getMemInfo",
      siteConfig: "getSiteConfig",
      domainConfig: "getDomainConfig",
      notMyBank: "getNotMyBank"
    }),
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    },
    username() {
      if (!this.memInfo.user.name) {
        return "";
      }

      return this.memInfo.user.name;

      // return this.memInfo.user.name
      //   .split("")
      //   .map((item, index) => {
      //     if (index === 0) {
      //       return item;
      //     }
      //     return "*";
      //   })
      //   .join("");
    },
    checkPhoneVerification() {
      // player_user_bank_phone (會員綁定銀行卡前需手機驗證，0否，1每次，2首次)
      // phone.corfirm (已認證，0未認證/1已認證/2人工驗證)
      let result = null;
      let verifyNum = this.memInfo.config.player_user_bank_phone;
      let isPhoneVerify =
        this.memInfo.phone.phone && this.memInfo.phone.confirm !== 0;

      if (verifyNum === 0 || (verifyNum === 2 && isPhoneVerify)) {
        result = false;
      }

      if (verifyNum === 1 || (verifyNum === 2 && !isPhoneVerify)) {
        result = true;
      }

      return result;
    },
    chooseName() {
      return [
        {
          key: 0,
          title: "本人",
          name: this.username ? this.username : "",
          placeholder: this.username ? "" : "请输入持卡人姓名，仅支持中文、“·”",
          disabled: this.username ? true : false
        },
        {
          key: 1,
          title: "非本人",
          name: "",
          placeholder: "请输入持卡人姓名，仅支持中文、“·”",
          disabled: false
        }
      ];
    }
  },
  watch: {
    addBankCardStep() {
      if (this.addBankCardStep === "one") {
        this.formData.phone = "";
        this.formData.keyring = "";
        this.errorMsg = "";
        this.checkData();
      } else if (this.addBankCardStep === "two") {
        this.errorMsg = "";
      }
    },
    thirdyCaptchaObj() {
      this.getKeyring();
    },
    "formData.phone"() {
      if (this.formData.phone.length < 11 && this.addBankCardStep === "two") {
        this.errorMsg = "手机格式不符合要求";
        this.isVerifyPhone = false;
      } else {
        this.errorMsg = "";
        this.isVerifyPhone = true;
      }
    },
    // 預防從提現資料進到綁定銀行卡，會有無法立即更新 name 的問題
    "memInfo.user.name"() {
      delete this.formData["accountName"];
    }
  },
  created() {
    this.chooseNameResult = this.chooseName[0];

    this.actionSetNotMyBankSwitch().then(() => {
      if (this.notMyBank.otherUbEdit && this.notMyBank.otherUserBank) {
        this.getWidthdrawList().then(data => {
          if (data.length > 0) {
            this.notMyBankSwitch = true;

            if (this.username) {
              delete this.formData["accountName"];
            }
          }
        });
      }
    });

    // 已經有真實姓名時不送該欄位
    if (this.memInfo.user.name) {
      delete this.formData["accountName"];
    }

    //是否顯示省/直轄市、縣/市欄位 (會員銀行卡驗證開關，0：關閉，1：銀行卡二元素，2：銀行卡四元素)
    //0顯示 1或2不顯示
    this.actionSetDomainConfigV2().then(() => {
      const result = this.domainConfig.player_user_bank_verify || 0;
      this.showCityProvinceFields = result === 0 ? true : false;
    });

    // 推播返回 補齊資料
    if (
      localStorage.getItem("click-notification") &&
      localStorage.getItem("add-bank-form")
    ) {
      const data = JSON.parse(localStorage.getItem("add-bank-form"));
      console.log(data);

      this.NextStepStatus = false;
      this.$emit("update:addBankCardStep", "two");
      this.$nextTick(() => {
        this.formData = { ...data };
        localStorage.removeItem("add-bank-form");
        localStorage.removeItem("click-notification");
      });
    }

    // 國碼
    goLangApiRequest({
      method: "get",
      url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Player/UserConfig/WithVerify`,
      params: {
        lang: "zh-cn"
      }
    }).then(res => {
      if (res && res.status === "000") {
        this.phoneHeadOption = res.data.config.phone.country_codes;
      }
    });
  },
  beforeDestroy() {
    if (localStorage.getItem("click-notification")) {
      localStorage.setItem("add-bank-form", JSON.stringify(this.formData));
    }
  },
  methods: {
    ...mapActions([
      "actionSetUserdata",
      "actionVerificationFormData",
      "actionSetGlobalMessage",
      "actionGetToManyRequestMsg",
      "actionSetDomainConfigV2",
      "actionSetNotMyBankSwitch"
    ]),
    setCaptcha(obj) {
      this.thirdyCaptchaObj = obj;
    },
    getWidthdrawList() {
      //回傳銀行卡清單與狀態/查詢會員出款銀行 C02.221
      return goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Player/User/Bank/List`
      })
        .then(response => {
          const { data, status, errorCode } = response;

          if (errorCode !== "00" || status !== "000") {
            return;
          }
          return data;
        })
        .catch(error => {
          const { msg } = error.response.data;
          this.actionSetGlobalMessage({ msg });
        });
    },
    showCaptcha() {
      this.isShowCaptcha = !this.isShowCaptcha;
    },
    sendData() {
      if (this.addBankCardStep === "one" && this.checkPhoneVerification) {
        this.NextStepStatus = false;
        this.$emit("update:addBankCardStep", "two");
        return;
      }

      if (this.lockStatus) {
        return;
      }

      this.lockStatus = true;

      // 已經有真實姓名且是本人銀行卡時不送該欄位
      if (this.memInfo.user.name && this.chooseNameResult.key === 0) {
        delete this.formData["accountName"];
      }

      const params = {
        ...this.formData,
        otherUserBank: this.chooseNameResult.key === 1 ? true : false,
        lang: "zh-cn",
        phone: `${this.phoneHead.replace("+", "")}-${this.formData.phone}`,
        branch: this.formData.branch === "" ? "--" : this.formData.branch
      };

      //不顯示省/直轄市、縣市欄位 api送出預設帶入"-"
      if (!this.showCityProvinceFields) {
        params["province"] = "-";
        params["city"] = "-";
      }

      //新增會員出款帳號資料(有驗證功能)C02.223
      goLangApiRequest({
        method: "post",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Player/User/Bank`,
        headers: {
          kind: "pwa"
        },
        params
      }).then(response => {
        const { status, errorCode, msg, code } = response;

        if (errorCode !== "00" || status !== "000") {
          if (code === "M00001") {
            this.actionSetGlobalMessage({
              msg,
              code
            });
            return;
          }
          this.lockStatus = false;
          this.errorMsg = msg;

          // if (this.addBankCardStep === "one") {
          //   this.msg = msg;
          // }

          return;
        }

        this.msg = "绑定成功";
        this.lockStatus = false;
        this.addBankCardStep === "one";

        if (!this.memInfo.user.name) {
          this.actionSetUserdata(true);
        }
      });

      // ajax({
      //   method: "post",
      //   url: "/api/v1/c/player/user_bank",
      //   errorAlert: false,
      //   params,
      //   success: () => {
      //     this.msg = "绑定成功";
      //     this.lockStatus = false;
      //     this.addBankCardStep === "one";

      //     if (!this.memInfo.user.name) {
      //       this.actionSetUserdata(true);
      //     }
      //   },
      //   fail: error => {
      //     this.lockStatus = false;
      //     this.errorMsg = error.data.msg;

      //     if (this.addBankCardStep === "one") {
      //       this.msg = error.data.msg;
      //     }
      //   }
      // });
    },
    setBank(bank) {
      this.isShowPopBankList = false;
      this.formData.bankId = bank.id;
      this.currentBank = bank.name;
      this.checkData();
    },
    checkData(value, key) {
      if (key === "accountName" && !this.memInfo.user.name) {
        this.actionVerificationFormData({ target: "name", value: value }).then(
          val => {
            this.formData.accountName = val;
          }
        );
      }

      if (key === "notMyBankName") {
        const regex = /[^\u3000\u3400-\u4DBF\u4E00-\u9FFF.．·..]/g;
        value = value.replace(regex, "").substring(0, 30);

        //accountName開戶姓名 (非本人銀行卡時必填)
        this.formData.accountName = this.chooseNameResult.name = value;
      }

      if (key === "province" || key === "city") {
        this.actionVerificationFormData({ target: "name", value: value }).then(
          val => {
            this.formData[key] = val;
          }
        );
      }

      if (key === "branch") {
        const re = /[^\u3000\u3400-\u4DBF\u4E00-\u9FFF]/g;
        this.formData.branch = value.replace(re, "");
      }

      if (key === "account") {
        this.actionVerificationFormData({
          target: "bankCard",
          value: value
        }).then(val => {
          this.formData.account = val;
        });
      }

      if (key === "keyring") {
        this.actionVerificationFormData({ target: "code", value: value }).then(
          val => {
            this.formData.keyring = val;
          }
        );
      }

      this.NextStepStatus = Object.keys(this.formData).every(key => {
        if (this.addBankCardStep === "one") {
          if (key === "account") {
            return this.formData[key].length > 15;
          }

          //開戶分行非必填,提交按鈕不禁能
          if (key === "branch") {
            return true;
          }

          // 需要填入時才檢查
          if (key === "accountName" && this.memInfo.user.name === "") {
            return this.formData["accountName"];
          }

          if (
            key !== "phone" &&
            key !== "keyring" &&
            key !== "city" &&
            key !== "province"
          ) {
            return this.formData[key];
          }

          return true;
        }

        if (this.addBankCardStep === "two") {
          if (key === "phone" || key === "keyring") {
            this.errorMsg = "";
            return this.formData[key];
          }
          return true;
        }

        return true;
      });
    },
    getBankImage(image_url) {
      return {
        src: image_url,
        error: this.$getCdnPath(
          "/static/image/common/default/bank_card_default.png"
        ),
        loading: this.$getCdnPath(
          "/static/image/common/default/bank_card_default.png"
        )
      };
    },
    showCaptchaPopup() {
      if (this.isClickedCaptcha || this.smsTimer) {
        return;
      }
      this.isClickedCaptcha = true;
      setTimeout(() => {
        this.isClickedCaptcha = false;
      }, 2000);

      const params = [
        this.actionSetUserdata(true),
        this.actionSetDomainConfigV2()
      ];

      Promise.all(params).then(() => {
        // 無認證直接呼叫
        if (this.memInfo.config.default_captcha_type === 0) {
          this.getKeyring();
          return;
        }

        // 彈驗證窗並利用Watch thirdyCaptchaObj 來呼叫 getKeyring()
        this.showCaptcha();
      });
    },
    getKeyring() {
      if (this.lockStatus || this.smsTimer) {
        return;
      }
      this.lockStatus = true;

      let captchaParams = {};
      captchaParams["captcha_text"] = this.thirdyCaptchaObj || "";

      goLangApiRequest({
        method: "post",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Player/Verify/UserBank/Sms`,
        params: {
          lang: "zh-cn",
          phone: `${this.phoneHead.replace("+", "")}-${this.formData.phone}`,
          ...captchaParams,
          aid: getCookie("aid") || localStorage.getItem("aid") || ""
        }
      })
        .then(res => {
          this.lockStatus = false;
          if (res && res.status === "000" && res.data === "operate success") {
            if (this.domainConfig && this.domainConfig.auto_keyring) {
            } else {
              this.actionSetGlobalMessage({
                msg: this.$text("S_SEND_CHECK_CODE_VALID_TIME_10")
              });
            }

            goLangApiRequest({
              method: "get",
              url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Player/Phone/TTL`,
              params: {
                lang: "zh-cn"
              }
            })
              .then(res => {
                if (res && res.status === "000") {
                  this.time = res.data;
                  this.smsTimer = setInterval(() => {
                    if (this.time <= 0) {
                      clearInterval(this.smsTimer);
                      this.smsTimer = null;
                      return;
                    }
                    this.time -= 1;
                  }, 1500);
                } else {
                  if (res && res.status === "506") {
                    this.actionGetToManyRequestMsg(res.msg).then(res => {
                      this.errorMsg = res;
                    });
                  } else if (res.msg) {
                    this.errorMsg = res.msg;
                  }
                }
              })
              .catch(error => {
                if (error.status) {
                  this.errorMsg = `${error.msg}`;
                  return;
                }
              });
          } else {
            if (res && res.status === "506") {
              this.actionGetToManyRequestMsg(res.msg).then(res => {
                this.errorMsg = res;
              });
            } else if (res.msg) {
              this.errorMsg = res.msg;
            }
          }
        })
        .catch(error => {
          this.lockStatus = false;

          if (error.response.data && error.response.data.msg) {
            this.errorMsg = error.response.data.msg;
          } else {
            this.errorMsg = error.response.data;
          }
        });
    }
  }
};
