import { mapActions, mapGetters } from "vuex";

import EST from "@/lib/EST";
import axios from "axios";
import bbosRequest from "@/api/bbosRequest";
import goLangApiRequest from "@/api/goLangApiRequest";
import moment from "moment";

export default {
  props: {},
  data() {
    return {
      rateList: [
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true }
      ],
      currentSelRate: {
        amount: NaN
        // diamond: '0'
      },
      balanceBackLock: false,
      swagDiamondBalance: "0",
      lockedSubmit: true,
      isMaintainSwag: false,
      showTips: false,
      maintainInfo: null,
      updateBalanceTimer: null,
      swagMaintainTimer: null,
      watchNoticeDate: false,
      // banner
      swagBanner: [{ src: "/static/image/porn1/mcenter/swag/banner_swag.png" }],

      isLoading: false,
      isCheckingInit: false
    };
  },
  computed: {
    ...mapGetters({
      loginStatus: "getLoginStatus",
      memInfo: "getMemInfo",
      membalance: "getMemBalance",
      swagBalance: "getSwagBalance",
      swagConfig: "getSwagConfig",
      siteConfig: "getSiteConfig",
      noticeData: "getNoticeData"
    }),
    swagESTMaintainStartAt() {
      return moment(this.swagConfig.maintain_start_at)
        .add(-12, "hours")
        .format("YYYY-MM-DD HH:mm:ss");
    },
    swagESTMaintainEndAt() {
      return moment(this.swagConfig.maintain_end_at)
        .add(-12, "hours")
        .format("YYYY-MM-DD HH:mm:ss");
    },
    resetRateList() {
      return [
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true },
        { loading: true }
      ];
    }
  },
  beforeDestroy() {
    clearInterval(this.updateBalanceTimer);
    this.updateBalanceTimer = null;
    clearTimeout(this.swagMaintainTimer);
    this.swagMaintainTimer = null;
  },
  created() {},
  watch: {
    swagBalance(val) {
      this.swagDiamondBalance = val.balance;
    },
    noticeData() {
      if (
        this.watchNoticeDate &&
        this.noticeData &&
        this.noticeData.length > 0
      ) {
        let temp = this.noticeData[this.noticeData.length - 1];
        if (temp.event === "outer_maintain" && temp.vendor === "swag") {
          setTimeout(() => {
            this.initSWAGConfig(true);
          }, 1500);

          if (temp.turn === "off" || temp.start_at) {
            this.swagMaintainTimer = null;
            this.swagMaintainTimer = setTimeout(() => {
              this.initSWAGConfig(true);
            }, 70000);
          }
        }
      }
    }
  },
  methods: {
    ...mapActions([
      "actionSetUserBalance",
      "actionSetUserdata",
      "actionSetGlobalMessage",
      "actionVerificationFormData",
      "actionSetSwagConfig",
      "actionSetSwagBalance"
    ]),
    initSWAGConfig(onlyCheckMaintain = false, fromClick = false) {
      if (!this.loginStatus) return;
      let isProd =
        this.memInfo.user.domain === "67" || this.memInfo.user.domain == "80";
      // const enable = localStorage.getItem("enable-swag") !== "false" && isProd;
      const enable = false; // ??????swag

      if (this.isCheckingInit || !enable) {
        return new Promise((resolve, reject) => {
          this.isLoading = false;
          resolve(false);
        });
      }

      if (this.loginStatus && !onlyCheckMaintain) {
        this.updateBalance();
      }

      this.isCheckingInit = true;

      if (this.$route.name === "mcenter-swag" && !onlyCheckMaintain) {
        this.rateList = this.resetRateList;
      }
      return this.actionSetSwagConfig().then(() => {
        setTimeout(() => {
          this.isLoading = false;
          this.isCheckingInit = false;
        }, 1000);

        // ????????????
        const maintain_start_at = moment(this.swagConfig.maintain_start_at).add(
          -12,
          "hours"
        );
        const maintain_end_at = moment(this.swagConfig.maintain_end_at).add(
          -12,
          "hours"
        );
        const now = moment(EST(new Date(), "", true));

        // ????????????
        if (this.swagConfig && this.swagConfig.enable === 0) {
          this.isMaintainSwag = true;
          if (this.$route.name === "mcenter-swag" && !fromClick) {
            this.actionSetGlobalMessage({
              msg: `SWAG ?????????`,
              style: "maintain"
            });
          }
        }
        // ???????????? ?????? ????????????
        else if (
          now.isBefore(maintain_end_at) &&
          now.isAfter(maintain_start_at)
        ) {
          this.isMaintainSwag = true;
          if (this.$route.name === "mcenter-swag" && !fromClick) {
            this.actionSetGlobalMessage({
              msg: `SWAG ?????????`,
              style: "maintain"
            });
          }
        } else {
          this.isMaintainSwag = false;
        }

        if (onlyCheckMaintain) {
          return true;
        }

        if (this.$route.name === "mcenter-swag") {
          // ??????????????????/????????????
          if (this.swagConfig.rates) {
            this.rateList = this.swagConfig.rates;

            let tmp_d_currentSelRate = JSON.parse(
              localStorage.getItem("tmp_d_currentSelRate")
            );
            if (
              tmp_d_currentSelRate &&
              this.rateList.find(
                i =>
                  i.amount === tmp_d_currentSelRate.amount &&
                  i.diamond === tmp_d_currentSelRate.diamond
              )
            ) {
              this.selectedRate(tmp_d_currentSelRate);
            } else {
              this.selectedRate(this.rateList[0]);
            }
          }

          if (this.swagConfig.recharge_verify === 1) {
            this.depositCheck().then(result => {
              if (localStorage.getItem("tmp_d_1")) {
                this.submitCheck();
              }
            });
          } else {
            // ????????????????????????
            if (localStorage.getItem("tmp_d_1")) {
              this.submitCheck();
            }
          }
        }
      });
    },
    // ????????????SWAG,????????????
    checkSWAGMaintain(params) {
      let linkTo = (params && params.linkTo) || false,
        origin = (params && params.origin) || "home";

      this.initSWAGConfig(true, true).then(result => {
        this.isLoading = false;

        if (!result) {
          return;
        }

        if (this.isMaintainSwag) {
          if (this.swagConfig.enable === 0) {
            if (origin === "home") {
              return;
            }
            this.actionSetGlobalMessage({
              msg: `SWAG ?????????`,
              style: "maintain"
            });
          } else {
            if (this.maintainInfo) {
              return;
            }

            const start = moment(this.swagConfig.maintain_start_at)
              .add(-12, "hours")
              .format("YYYY-MM-DD HH:mm:ss");
            const end = moment(this.swagConfig.maintain_end_at)
              .add(-12, "hours")
              .format("YYYY-MM-DD HH:mm:ss");

            this.maintainInfo = [
              {
                title: "-????????????-",
                startAt: start,
                endAt: end
              },
              {
                title: "-????????????-",
                startAt: this.swagConfig.maintain_start_at,
                endAt: this.swagConfig.maintain_end_at
              }
            ];
          }
        } else if (linkTo) {
          this.linkToSWAG(origin);
        }
      });
    },
    handleCloseMaintainInfo() {
      this.maintainInfo = null;
    },
    updateBalance() {
      if (this.loginStatus && this.$route.name !== "home") {
        this.actionSetUserBalance();
        if (!this.isMaintainSwag) {
          this.actionSetSwagBalance();
        }

        if (!this.updateBalanceTimer) {
          this.updateBalanceTimer = setInterval(() => {
            if (!this.isMaintainSwag) {
              this.actionSetUserBalance();
              this.actionSetSwagBalance();
            }
          }, 40000);
        }
      }
    },
    balanceBack() {
      if (!this.balanceBackLock) {
        this.balanceBackLock = true;

        axios({
          method: "put",
          url: "/api/v1/c/vendor/recycle/balance"
        })
          .then(res => {
            if (res && res.data && res.data.result === "ok") {
              // this.actionSetGlobalMessage({
              //   msg: "????????????"
              // });

              setTimeout(() => {
                this.balanceBackLock = false;
              }, 1500);
            }

            this.actionSetUserBalance();
            this.actionSetSwagBalance();
          })
          .catch(res => {
            if (res.response && res.response.data && res.response.data.msg) {
              this.actionSetGlobalMessage({
                msg: res.response.data.msg
              });

              setTimeout(() => {
                this.balanceBackLock = false;
              }, 1500);
            }
          });
      }
    },
    selectedRate(item) {
      this.currentSelRate = item;
      this.saveCurrentValue();
      if (this.swagConfig.enable !== 0) {
        this.lockedSubmit = false;
      }
    },
    depositCheck() {
      if (!this.loginStatus) {
        this.actionSetGlobalMessage({
          msg: "???????????????"
        });
      }

      this.isLoading = true;

      return axios({
        method: "get",
        url: "/api/v1/c/user-stat/deposit-withdraw"
      })
        .then(res => {
          this.isLoading = false;
          if (res && res.data) {
            const depositCount = Number(res.data.ret.deposit_count);
            if (depositCount <= 0) {
              this.showTips = true;
              return false;
            } else {
              return true;
            }
          }
        })
        .catch(error => {
          const response = error.response;
          this.actionSetGlobalMessage({
            msg: response.data.msg,
            code: response.data.code
          });
        });
    },
    submitCheck() {
      if (this.isLoading || this.isMaintainSwag || this.lockedSubmit) {
        return;
      }

      this.isLoading = true;

      // ?????????????????? ????????????
      let tmp_currentSelRate = {};
      let params = {
        amount: this.currentSelRate.amount,
        diamond: this.currentSelRate.diamond,
        keyring: localStorage.getItem("tmp_d_1") // ???????????????????????????
      };

      if (localStorage.getItem("tmp_d_currentSelRate")) {
        tmp_currentSelRate = JSON.parse(
          localStorage.getItem("tmp_d_currentSelRate")
        );
        params["amount"] = tmp_currentSelRate.amount;
        params["diamond"] = tmp_currentSelRate.diamond;
      } else {
        params["amount"] = this.currentSelRate.amount;
        params["diamond"] = this.currentSelRate.diamond;
      }

      // axios({
      //   method: "get",
      //   url: "/api/outer/v1/c/ext/swag/transfer/check",
      //   params: { ...params, vendor: 'swag' },
      // })
      //   .then(res => {
      //     console.log(res)
      //   })
      //   .catch(error => {
      //     console.log(error)
      //   });

      // ?????????????????????
      return bbosRequest({
        method: "get",
        url: this.siteConfig.BBOS_DOMIAN + "/Ext/Swag/Vendor/Transfer/Check",
        reqHeaders: {
          Vendor: this.memInfo.user.domain
        },
        params: { ...params, vendor: "swag" }
      }).then(res => {
        if (res && res.status === "000") {
          let ret = res.data;
          if (
            ret &&
            ret.verify_data &&
            ret.verify_balance &&
            ret.verify_rates
          ) {
            this.submit(params);
          } else {
            let msg = "";
            let cb = () => {};
            if (!ret.verify_data) {
              msg = "?????????????????????????????????????????????";
              cb = () => {
                // window.location.reload();
              };
            } else if (!ret.verify_balance) {
              msg = "?????????????????????????????????????????????????????????";
            } else if (!ret.verify_rates) {
              msg = "??????????????????";
              cb = () => {
                this.initSWAGConfig();
              };
            }

            this.actionSetGlobalMessage({
              msg: msg,
              cb: cb
            });

            setTimeout(() => {
              this.isLoading = false;
            }, 1500);
          }
        } else {
          if (res && res.code === 77700036) {
            this.actionSetGlobalMessage({
              msg: "???????????????",
              code: res.code,
              origin: "mcenter/swag"
            });
            return;
          }

          this.checkSWAGMaintain();
          setTimeout(() => {
            this.isLoading = false;
          }, 1500);
        }
      });
    },
    submit(params) {
      if (this.isMaintainSwag || this.lockedSubmit || this.showTips) {
        return;
      }
      this.isLoading = true;

      this.actionSetSwagConfig().then(() => {
        const submitTransfer = () => {
          this.isLoading = true;

          // ??????????????????
          if (
            this.swagConfig &&
            this.swagConfig.phone_verify &&
            +this.swagConfig.phone_verify === 1 &&
            !localStorage.getItem("tmp_d_1")
          ) {
            this.saveCurrentValue();
            this.$router.push(
              "/mobile/mcenter/accountData/phone?redirect=swag"
            );
            return;
          }

          bbosRequest({
            method: "put",
            url: this.siteConfig.BBOS_DOMIAN + "/Ext/Swag/Vendor/Transfer",
            reqHeaders: {
              Vendor: this.memInfo.user.domain
            },
            params: params
          }).then(res => {
            if (res && res.status === "000") {
              this.actionSetGlobalMessage({
                msg: "????????????",
                code: res.code,
                origin: "mcenter/swag"
              });
            } else {
              if (res && res.code === 77700036) {
                this.actionSetGlobalMessage({
                  msg: "???????????????",
                  code: res.code,
                  origin: "mcenter/swag"
                });
                return;
              }

              this.actionSetGlobalMessage({
                msg: res.msg,
                code: res.code,
                origin: "mcenter/swag"
              });

              this.initSWAGConfig();
            }

            this.actionSetUserBalance();
            this.actionSetSwagBalance();

            setTimeout(() => {
              this.isLoading = false;
            }, 1500);
          });

          localStorage.removeItem("tmp_d_1");
          localStorage.removeItem("tmp_d_currentSelRate");
        };

        // ????????????
        if (this.swagConfig.recharge_verify === 1) {
          this.depositCheck().then(check => {
            if (check) {
              submitTransfer();
            }
          });
        } else {
          submitTransfer();
        }
      });
    },
    showDetail(item) {
      this.detailRecoard = item;
    },
    closeDetail() {
      this.detailRecoard = null;
    },
    saveCurrentValue() {
      localStorage.setItem(
        "tmp_d_currentSelRate",
        JSON.stringify(this.currentSelRate)
      );
    },
    handleSWAGBalance() {
      if (this.isMaintainSwag) {
        this.checkSWAGMaintain({});
      }
    },
    linkToSWAG(origin = "mobile") {
      if (!this.loginStatus) {
        this.$router.push("/mobile/login");
        return;
      }

      let userId = "guest";
      if (
        this.memInfo &&
        this.memInfo.user &&
        this.memInfo.user.id &&
        this.memInfo.user.id !== 0
      ) {
        userId = this.memInfo.user.id;
      }

      goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/cxbb/ThirdParty/SWAG/${userId}`
      }).then(res => {
        if (res && res.status !== "000") {
          // ???????????????????????????
          if (res.msg && res.code !== "77700029") {
            this.actionSetGlobalMessage({ msg: res.msg, code: res.code });
          }
          return;
        } else {
          localStorage.setItem("iframe-third-url", res.data);
          localStorage.setItem("iframe-third-origin", origin);
          this.$router.push(`/mobile/iframe/SWAG?`);
          return;
        }
      });
    }
  }
};
