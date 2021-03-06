import { mapActions, mapGetters } from "vuex";

import EST from "@/lib/EST";
import Vue from "vue";
import axios from "axios";
import { thousandsCurrency } from "@/lib/thousandsCurrency";

export default {
  props: {},
  data() {
    const estToday = EST(new Date(), "", true);
    const startTime = estToday;
    const endTime = estToday;
    return {
      // 額度轉讓
      formData: {
        target_username: "", //接收使用者帳號
        amount: "", //轉點額度
        phone: "", //手機號碼
        keyring: "" //驗證碼
      },
      displayAmount: "", //千分位 輸入額度
      errorMessage: {
        target_username: "",
        amount: "",
        phone: "",
        keyring: ""
      },
      tipMsg: "", // api message
      isSendKeyring: false,
      isSendRecharge: false,
      isVerifyForm: false,
      isVerifyPhone: false,
      isShowLoading: true,
      ttl: 0,

      //轉讓額度設定
      maxRechargeBalance: 0,

      // 轉讓紀錄
      rechargeRecoard: null,
      detailRecoard: null,
      startTime,
      endTime,

      promotionTips: "",
      updateBalance: null,
      bonusList: null,
      amountFixType: false
    };
  },
  computed: {
    ...mapGetters({
      memInfo: "getMemInfo",
      pwdResetInfo: "getPwdResetInfo",
      membalance: "getMemBalance",
      rechargeConfig: "getRechargeConfig",
      rechargeBonusConfig: "getRechargeBonusConfig",
      siteConfig: "getSiteConfig",
      domainConfig: "getDomainConfig"
    }),
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    },
    inputInfo() {
      return [
        {
          key: "target_username",
          title: "转入帐号",
          error: "",
          placeholder: "请输入下线帐号",
          show: true
        },
        {
          key: "amount",
          title: "转让金额",
          error: "",
          placeholder: `请输入转让金额`,
          show: true
        },
        {
          key: "phone",
          title: "手机号码",
          error: "",
          placeholder: "请输入手机号码",
          maxlength: 11,
          show: this.rechargeConfig.sms_verify
        },
        {
          key: "keyring",
          title: "获取验证码",
          error: "",
          placeholder: "请输入验证码",
          maxlength: 6,
          show: this.rechargeConfig.sms_verify
        }
      ].filter(i => i.show);
    },
    hasBonusRule() {
      return (
        this.rechargeConfig.first_bonus_enable ||
        this.rechargeConfig.monthly_bonus_enable ||
        this.rechargeConfig.weekly_bonus_enable
      );
    }
  },
  beforeDestroy() {
    clearInterval(this.updateBalance);
    this.updateBalance = null;
  },
  created() {
    // this.setPromotionTips();
    this.actionSetRechargeBonusConfig();
    this.updateBalance = setInterval(() => {
      this.actionSetUserBalance();
    }, 30000);
  },
  watch: {
    membalance() {
      this.getRechargeBalance();
    },
    rechargeBonusConfig() {
      let data = this.rechargeBonusConfig;
      if (!data) return;

      let bonusArrays = {};

      // 確保目前開放的欄位 first / monthly / weekly
      if (this.hasBonusRule) {
        let keys = Object.keys(data);

        // 根據目前有開放的欄位放入
        for (let i = 0; i < keys.length; i++) {
          bonusArrays[keys[i]] = data[keys[i]].map(item => {
            return item.bonus;
          });
        }
      }
      this.bonusList = [];

      if (bonusArrays.first) {
        let firstAmount = Math.max(...bonusArrays.first);
        firstAmount = thousandsCurrency(firstAmount);

        this.bonusList.push({
          key: "first",
          text: `喜讯：首次额度转让旗下会员赠彩金${firstAmount}元/位`,
          isShow: this.rechargeConfig.first_bonus_enable
        });
      }

      if (bonusArrays.monthly) {
        let monthlyAmount = Math.max(...bonusArrays.monthly);
        monthlyAmount = thousandsCurrency(monthlyAmount);

        this.bonusList.push({
          key: "monthly",
          text: `喜讯：每月首次额度转让旗下会员赠${monthlyAmount}元/位`,
          isShow: this.rechargeConfig.monthly_bonus_enable
        });
      }

      if (bonusArrays.weekly) {
        let monthlyWeekly = Math.max(...bonusArrays.weekly);
        monthlyWeekly = thousandsCurrency(monthlyWeekly);

        this.bonusList.push({
          key: "weekly",
          text: `喜讯：每周首次额度转让旗下会员赠${monthlyWeekly}元/位`,
          isShow: this.rechargeConfig.weekly_bonus_enable
        });
      }

      this.bonusList = this.bonusList.filter(item => item.isShow);
    }
  },
  methods: {
    ...mapActions([
      "actionSetUserBalance",
      "actionSetUserdata",
      "actionSetGlobalMessage",
      "actionSetRechargeConfig",
      "actionVerificationFormData",
      "actionGetMemInfoV3",
      "actionGetRechargeStatus",
      "actionSetRechargeBonusConfig",
      "actionGetToManyRequestMsg",
      "actionSetDomainConfigV2"
    ]),
    // setPromotionTips() {
    //     let result = ''
    //     if (+this.rechargeConfig.first_bonus_enable==true) {

    //         result += `<div>喜讯：首次额度转让给旗下会员加赠代理彩金${this.rechargeBonusConfig.first.bonus}元/位 <a title="奖励规则">奖励规则</a><div>`;
    //     }
    //     if (+this.rechargeConfig.monthly_bonus_enable==true) {
    //         result += `<div>喜讯：每月首次额度转让给旗下会员赠代理彩金${this.rechargeConfig.monthly_bonus}元/位 <a title="奖励规则">奖励规则</a><div>`;
    //     }

    //     if (+this.rechargeConfig.weekly_bonus_enable==true) {
    //         result += `<div>喜讯：每周首次额度转让给旗下会员赠代理彩金${this.rechargeConfig.weekly_bonus}元/位 <a title="奖励规则">奖励规则</a><div>`;
    //     }
    //     this.promotionTips = result;
    // },

    onGoToRewardRules() {
      return this.$router.push("/mobile/mcenter/rewardRules");
    },
    verification(item, value) {
      let errorMessage = "";
      if (item.key === "phone") {
        this.actionVerificationFormData({
          target: "phone",
          value: this.formData.phone
        }).then(val => {
          this.formData.phone = val;
        });

        if (this.formData.phone.length < 11) {
          errorMessage = "手机格式不符合要求";
          this.isVerifyPhone = false;
        } else {
          errorMessage = "";
          this.isVerifyPhone = true;
        }
      }

      if (item.key === "amount") {
        this.amountFixType = true;
        const limit = Number(this.rechargeConfig.recharge_limit) || 0;
        const amount = Number(value);

        this.formData.amount = value.replace(/[^0-9]/g, "").substring(0, 16);
        this.displayAmount = thousandsCurrency(this.formData.amount);

        if (amount === 0) {
          errorMessage = "请输入转让金额";
        }

        // 客端不判斷金額大小
        // else if (limit && amount < limit) {
        //   // errorMessage = "转帐金额低于最低限额";
        // } else if (amount > this.maxRechargeBalance) {
        //   // errorMessage = "馀额不足";
        // }
        else {
          errorMessage = "";
        }
      }

      if (item.key == "target_username") {
        const data = this.pwdResetInfo["username"];
        const re = new RegExp(data.regExp);
        const msg = this.$t(data.errorMsg);

        this.actionVerificationFormData({
          target: "username",
          value: this.formData.target_username
        }).then(val => {
          this.formData.target_username = val;
        });

        if (!re.test(this.formData.target_username)) {
          errorMessage = msg;
        }
      }

      this.errorMessage[item.key] = errorMessage;

      // 檢查無錯誤訊息
      let noError = true;
      this.inputInfo.forEach(item => {
        if (this.errorMessage[item.key]) {
          noError = false;
        }
      });

      let hasValue = true;
      this.inputInfo.forEach(item => {
        if (!this.formData[item.key]) {
          hasValue = false;
        }
      });

      this.isVerifyForm = noError && hasValue;
    },
    // 可轉讓額度
    getRechargeBalance() {
      return axios({
        method: "get",
        url: "/api/v1/c/recharge/balance"
      })
        .then(res => {
          if (res && res.data && res.data.result === "ok") {
            this.maxRechargeBalance = res.data.ret.balance;
          } else {
            this.actionSetGlobalMessage(res.data.msg);
          }
        })
        .catch(error => {
          this.tipMsg = `${error.response.data.msg}`;
        });
    },
    rechargeCheck() {
      if (!this.formData.phone && this.isSendKeyring) {
        return;
      }

      this.isSendKeyring = true;

      return this.actionGetRechargeStatus("recharge").then(res => {
        if (res !== "ok") {
          return res;
        }
        return axios({
          method: "get",
          url: "/api/v1/c/recharge/check",
          params: {
            target_username: this.formData.target_username,
            amount: this.formData.amount
          }
        })
          .then(res => {
            this.actionSetUserBalance();
            this.isSendKeyring = false;

            if (res && res.data && res.data.result === "ok") {
              return true;
            } else {
              if (res.data.errors.amount) {
                this.errorMessage.amount = res.data.errors.amount;
              }

              if (res.data.errors.user) {
                this.errorMessage.target_username = res.data.errors.user;
              }

              this.setErrorCode(res.data);
              return false;
            }
          })
          .catch(error => {
            this.isSendKeyring = false;
            this.setErrorCode(error.response.data);
            return false;
          });
      });
    },
    getPhoneTTL() {
      return axios({
        method: "get",
        url: "/api/v1/c/player/phone/ttl"
      })
        .then(res => {
          if (res && res.data && res.data.result === "ok") {
            this.ttl = res.data.ret;
          }
        })
        .catch(error => {
          this.tipMsg = `${error.response.data.msg}`;
        });
    },
    // 獲取驗證碼
    getKeyring(captcha) {
      if (!this.formData.phone && this.isSendKeyring) {
        return;
      }

      this.tipMsg = "";
      this.isSendKeyring = true;
      axios({
        method: "post",
        url: "/api/v1/c/player/valet/recharge/sms",
        data: {
          phone: "86-" + this.formData.phone,
          captcha_text: captcha ? captcha : ""
        }
      })
        .then(res => {
          if (res && res.data && res.data.result === "ok") {
            this.errorMessage.phone = "";
            this.getPhoneTTL().then(() => {
              this.timer = setInterval(() => {
                if (this.ttl === 0) {
                  this.isSendKeyring = false;
                  clearInterval(this.timer);
                  this.timer = null;
                  if (this.tipMsg.indexOf("已发送")) {
                    this.tipMsg = "";
                  }
                  return;
                }
                this.ttl -= 1;
              }, 1000);
              if (this.domainConfig && this.domainConfig.auto_keyring) {
              } else {
                this.actionSetGlobalMessage({
                  msg: this.$text("S_SEND_CHECK_CODE_VALID_TIME_10")
                });
              }
            });
          } else {
            setTimeout(() => {
              this.isSendKeyring = false;
            }, 1000);
            this.errorMessage.phone = `${res.data.msg}`;
          }
        })
        .catch(error => {
          setTimeout(() => {
            this.isSendKeyring = false;
          }, 1000);

          if (error.response && error.response.status === 429) {
            this.actionGetToManyRequestMsg(error.response.data.message).then(
              res => {
                this.errorMessage.phone = res;
              }
            );
            return;
          }

          this.ttl = "";

          if (error.response.data && error.response.data.msg) {
            this.errorMessage.phone = `${error.response.data.msg}`;
          } else {
            this.errorMessage.phone = `${error.response.data}`;
          }
        });
    },
    sendRecharge() {
      if (!this.isVerifyForm || this.isSendRecharge) {
        return;
      }
      this.tipMsg = "";
      this.isSendRecharge = true;

      return this.actionGetRechargeStatus("recharge").then(() => {
        let data = { ...this.formData };
        if (this.rechargeConfig.sms_verify) {
          data["amount"] = Number(this.formData.amount);
          data["phone"] = "86-" + this.formData.phone;
        }

        axios({
          method: "post",
          url: "/api/v1/c/recharge",
          data: data
        })
          .then(res => {
            this.actionSetUserBalance();
            if (res && res.data && res.data.result === "ok") {
              this.displayAmount = "";
              this.formData.amount = "";
              this.formData.phone = "";
              this.formData.target_username = "";
              this.formData.keyring = "";
              this.actionSetGlobalMessage({ msg: "转让成功" });
            } else {
              this.setErrorCode(res.data);
            }

            this.actionSetUserdata(true);
            setTimeout(() => {
              this.isVerifyForm = false;
              this.isSendRecharge = false;
            }, 1000);
          })
          .catch(error => {
            this.setErrorCode(error.response.data);
            setTimeout(() => {
              this.isVerifyForm = false;
              this.isSendRecharge = false;
            }, 1000);
          });
      });
    },
    getRechargeRecoard() {
      return axios({
        method: "get",
        url: "/api/v1/c/cash/entry",
        params: {
          start_at: Vue.moment(this.startTime).format(
            "YYYY-MM-DD 00:00:00-04:00"
          ),
          end_at: Vue.moment(this.endTime).format("YYYY-MM-DD 23:59:59-04:00"),
          category: "ingroup_transfer",
          first_result: 0 // 每頁起始筆數
          // maxResults: 20, // 每頁顯示幾筆
        }
      })
        .then(res => {
          if (res && res.data && res.data.result === "ok") {
            this.rechargeRecoard = res.data.ret;
          } else {
            this.actionSetGlobalMessage({ msg: res.data.msg });
          }
        })
        .catch(error => {
          this.actionSetGlobalMessage({
            msg: error.response.data.msg
          });
        });
    },
    showDetail(item) {
      this.detailRecoard = item;
    },
    closeDetail() {
      this.detailRecoard = null;
    },
    // 客制錯誤訊息
    setErrorCode(data) {
      this.isVerifyForm = false;
      const setErrorMsg = (msg, isAudit) => {
        this.actionSetRechargeConfig().then(() => {
          const config = this.rechargeConfig;

          let msg_desc = msg ? msg + "，" : "";

          if (!msg_desc || msg == "可转金额不足") {
            this.errorMessage.amount = msg;
            return;
          }
          if (!isAudit || msg.includes("未完成")) {
            msg_desc += `单笔转让最低${thousandsCurrency(
              config.recharge_limit_unaudited_min
            )}元`;

            if (config.recharge_limit_unaudited_max_enable) {
              msg_desc += `、最高${thousandsCurrency(
                config.recharge_limit_unaudited_max
              )}元`;
            }
            this.errorMessage.amount = msg_desc;
            return;
          } else if (isAudit || msg.includes("完成")) {
            msg_desc += `单笔转让最低${thousandsCurrency(
              config.recharge_limit_audited_min
            )}元`;

            if (config.recharge_limit_audited_max_enable) {
              msg_desc += `、最高${thousandsCurrency(
                config.recharge_limit_audited_max
              )}元`;
            }

            this.errorMessage.amount = msg_desc;
            return;
          } else {
            this.errorMessage.amount = msg_desc;
            return;
          }
        });
      };
      const code = data.code;
      const msg = data.msg;
      switch (code) {
        case "M00001":
        case "C600001":
          this.actionSetGlobalMessage({ code: code, msg: msg });
          break;
        case "C650001":
        case "C650008":
        case "C650009":
          this.errorMessage.target_username = msg;
          break;
        case "C650004":
        case "C650005":
        case "C650006":
        case "C650007":
        case "C650019":
        case "C650020":
          this.errorMessage.amount = msg;
          break;
        // msg: "完成提现流水要求"
        case "C650016":
        case "C650021":
          setErrorMsg(data.errors ? data.errors.amount : msg, true);
          break;
        // msg: "未完成提现流水要求"
        case "C650017":
        case "C650022":
          setErrorMsg(data.errors ? data.errors.amount : msg, false);
          break;
        case "C650011":
        case "C20182":
          this.errorMessage.phone = msg;
          break;
        case "C650012":
        case "C650013":
        case 40128:
          this.errorMessage.keyring = msg;
          break;
        case "C650023":
        case "C650003":
        case "C650018":
          break;
        default:
          this.tipMsg = msg;
          break;
      }
    }
  }
};
