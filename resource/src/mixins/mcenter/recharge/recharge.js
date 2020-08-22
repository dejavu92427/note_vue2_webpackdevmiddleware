import { mapActions, mapGetters } from 'vuex';

import EST from '@/lib/EST';
import Vue from 'vue';
import axios from 'axios';

export default {
    props: {

    },
    data() {
        const estToday = EST(new Date(), '', true);
        const startTime = estToday;
        const endTime = estToday;
        return {
            // 額度轉讓
            formData: {
                target_username: "", //接收使用者帳號
                amount: "", //轉點額度
                phone: "", //手機號碼
                keyring: "", //驗證碼
            },
            errorMessage: {
                target_username: "",
                amount: "",
                phone: "",
                keyring: "",
            },
            tipMsg: '', // api message
            isSendKeyring: false,
            isSendRecharge: false,
            isVerifyForm: false,
            isVerifyPhone: false,
            isShowLoading: true,
            times: 0,

            //轉讓額度設定
            maxRechargeBalance: 0,

            // 轉讓紀錄
            rechargeRecoard: null,
            detailRecoard: null,
            startTime,
            endTime,

            promotionTips: ''
        };
    },
    computed: {
        ...mapGetters({
            memInfo: "getMemInfo",
            pwdResetInfo: 'getPwdResetInfo',
            membalance: "getMemBalance",
            rechargeConfig: "getRechargeConfig"
        }),
        inputInfo() {
            return [
                { key: "target_username", title: "转入帐号", error: "", placeholder: "请输入下线帐号", },
                { key: "amount", title: "转让金额", error: "", placeholder: `请输入转让金额` },
                { key: "phone", title: "手机号码", error: "", placeholder: "请输入手机号码", maxlength: 11 },
                { key: "keyring", title: "获取验证码", error: "", placeholder: "请输入验证码", maxlength: 4 }
            ]
        },
    },
    created() {
        this.actionSetRechargeConfig();
        this.setPromotionTips();
    },
    watch: {
        membalance() {
            this.getRechargeBalance();
        },
    },
    methods: {
        ...mapActions([
            'actionSetUserBalance',
            'actionSetUserdata',
            'actionSetGlobalMessage',
            'actionSetRechargeConfig'
        ]),
        setPromotionTips() {
            let result = ''
            if (+this.rechargeConfig.monthly_bonus) {
                result += `<div>喜讯：首次额度转让给旗下会员加赠代理彩金${this.rechargeConfig.monthly_bonus}元/位<div>`;
            }

            if (+this.rechargeConfig.weekly_bonus) {
                result += `<div>喜讯：每周首次额度转让给旗下会员赠代理彩金${this.rechargeConfig.weekly_bonus}元/位<div>`;
            }

            if (+this.rechargeConfig.first_bonus) {
                result += `<div>喜讯：每周首次额度转让给旗下会员赠代理彩金${this.rechargeConfig.first_bonus}元/位<div>`;
            }

            this.promotionTips = result;
        },
        verification(item) {
            let errorMessage = '';
            if (item.key === "phone") {
                if (this.formData.phone.length < 11) {
                    errorMessage = "手机格式不符合要求";
                    this.isVerifyPhone = false;
                } else {
                    errorMessage = "";
                    this.isVerifyPhone = true;
                }
            }

            if (item.key === "amount") {
                const limit = Number(this.rechargeConfig.recharge_limit) || 0;
                const amount = Number(this.formData.amount);
                if (!amount || amount === 0) {
                    errorMessage = "请输入转让金额";
                } else if (limit &&
                    amount < limit) {
                    errorMessage = "转帐金额低于最低限额";
                } else if (amount > this.maxRechargeBalance) {
                    // errorMessage = "馀额不足";
                } else {
                    errorMessage = "";
                }
            }

            if (item.key == "target_username") {
                const data = this.pwdResetInfo["username"];
                const re = new RegExp(data.regExp);
                const msg = this.$t(data.errorMsg);

                this.formData.target_username = this.formData.target_username
                    .toLowerCase()
                    .replace(' ', '')
                    .trim()
                    .replace(/[\W]/g, '');

                if (!re.test(this.formData.target_username)) {
                    errorMessage = msg;
                }

            }

            this.errorMessage[item.key] = errorMessage;

            // 檢查無錯誤訊息
            const noError = this.inputInfo.every((item) => {
                if (this.errorMessage[item.key]) {
                    return false;
                } else {
                    return true;
                }
            })
            const hasValue = this.inputInfo.every((item) => {
                if (!this.formData[item.key]) {
                    return false;
                } else {
                    return true;
                }
            })
            this.isVerifyForm = noError && hasValue;
        },
        // 可轉讓額度
        getRechargeBalance() {
            return axios({
                method: 'get',
                url: '/api/v1/c/recharge/balance'
            }).then(res => {
                if (res && res.data && res.data.result === "ok") {
                    this.maxRechargeBalance = res.data.ret.balance;
                } else {
                    this.actionSetGlobalMessage(res.data.msg);
                }
            }).catch(error => {
                this.tipMsg = `${error.response.data.msg}`;
            })
        },
        rechargeCheck() {
            if (!this.formData.phone && this.isSendKeyring) {
                return;
            }

            this.isSendKeyring = true;
            return axios({
                method: 'get',
                url: '/api/v1/c/recharge/check',
                params: {
                    target_username: this.formData.target_username,
                    amount: this.formData.amount
                }
            }).then(res => {
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

                    this.setErrorCode(res.data, res.data.errors.amount);
                    return false;
                }
            }).catch(error => {
                this.isSendKeyring = false;
                this.setErrorCode(error.response.data, res.data.errors.amount);
                return false;
            })
        },
        // 獲取驗證碼
        getKeyring() {
            if (!this.formData.phone && this.isSendKeyring) {
                return;
            }

            this.tipMsg = "";
            this.isSendKeyring = true;
            axios({
                method: 'post',
                url: '/api/v1/c/player/valet/recharge/sms',
                data: {
                    phone: "86-" + this.formData.phone,
                    captcha_text: this.captchaData ? this.captchaData : ''
                }
            }).then(res => {
                if (res && res.data && res.data.result === "ok") {
                    this.times = 60;
                    this.timer = setInterval(() => {
                        if (this.times === 0) {
                            this.isSendKeyring = false;
                            clearInterval(this.timer);
                            this.timer = null;
                            return;
                        }
                        this.times -= 1;
                    }, 1000);
                    this.tipMsg = this.$text("S_SEND_CHECK_CODE_VALID_TIME").replace("%s", 5);
                } else {
                    setTimeout(() => {
                        this.isSendKeyring = false;
                    }, 1500)
                    this.errorMessage.phone = `${res.data.msg}`;
                }
            }).catch(error => {
                this.times = '';
                this.tipMsg = `${error.response.data.msg}`;
                setTimeout(() => {
                    this.isSendKeyring = false;
                }, 1500)
            })
        },
        sendRecharge() {
            if (!this.isVerifyForm || this.isSendRecharge) {
                return;
            }
            this.tipMsg = "";
            this.isSendRecharge = true;

            axios({
                method: 'post',
                url: '/api/v1/c/recharge',
                data: {
                    ...this.formData,
                    amount: Number(this.formData.amount),
                    phone: "86-" + this.formData.phone,
                }
            }).then(res => {
                this.actionSetUserBalance();
                if (res && res.data && res.data.result === "ok") {
                    this.actionSetGlobalMessage({ msg: "转让成功" });
                } else {
                    this.setErrorCode(res.data);
                }

                this.actionSetUserdata(true);
                setTimeout(() => {
                    this.isSendRecharge = false;
                }, 1500)
            }).catch(error => {
                this.setErrorCode(error.response.data);
                setTimeout(() => {
                    this.isSendRecharge = false;
                }, 1500)
            })
        },
        getRechargeRecoard() {
            return axios({
                method: 'get',
                url: '/api/v1/c/cash/entry',
                params: {
                    start_at: Vue.moment(this.startTime).format('YYYY-MM-DD 00:00:00-04:00'),
                    end_at: Vue.moment(this.endTime).format('YYYY-MM-DD 23:59:59-04:00'),
                    category: "ingroup_transfer",
                    firstResult: 0, // 每頁起始筆數
                    // maxResults: 20, // 每頁顯示幾筆
                }
            }).then(res => {
                if (res && res.data && res.data.result === "ok") {
                    this.rechargeRecoard = res.data.ret;
                } else {
                    this.actionSetGlobalMessage({ msg: res.data.msg });
                }
            }).catch(error => {
                this.actionSetGlobalMessage({ msg: error.response.data.msg });
            })
        },
        showDetail(item) {
            this.detailRecoard = item;
        },
        closeDetail() {
            this.detailRecoard = null;
        },
        // 客制錯誤訊息
        setErrorCode(data, amountMsg = '') {
            const setErrorMsg = (msg, isAudit) => {
                this.actionSetRechargeConfig().then(() => {
                    const config = this.rechargeConfig;
                    let msg_desc = msg;

                    if (isAudit) {
                        msg_desc += `，单笔转让最低${config.recharge_limit_audited_min}元`;

                        if (config.recharge_limit_audited_max_enable) {
                            msg_desc += `、最高${config.recharge_limit_audited_max}元`;
                        }

                        this.errorMessage.amount = msg_desc;
                        return;
                    } else {
                        msg_desc += `，单笔转让最低${config.recharge_limit_unaudited_min}元`;

                        if (config.recharge_limit_unaudited_max_enable) {
                            msg_desc += `、最高${config.recharge_limit_unaudited_max}元`;
                        }

                        this.errorMessage.amount = msg_desc;
                        return;
                    }
                })
            }

            const code = data.code;
            const msg = amountMsg || data.msg;
            switch (code) {
                case "C650001":
                case "C650008":
                case "C650009":
                case "C650018":
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
                    setErrorMsg(msg, true);
                    break;
                // msg: "未完成提现流水要求"
                case "C650017":
                case "C650022":
                    setErrorMsg(msg, false);
                    break;
                case "C650011":
                    this.errorMessage.phone = msg;
                    break;
                case "C650012":
                case "C650013":
                    this.errorMessage.keyring = msg;
                    break;
                default:
                    this.tipMsg = msg;
                    break;
            }
        }
    }
};