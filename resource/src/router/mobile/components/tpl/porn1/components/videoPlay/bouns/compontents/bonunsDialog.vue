<template>
  <div
    v-if="isShow"
    :class="
      isClose ? [$style['dialog'], $style['dialog-close']] : $style['dialog']
    "
  >
    <div
      :class="{ [$style['earn-wrap']]: !type.includes('tips') }"
      id="earn-wrap"
      ref="wrap"
    >
      <div
        v-if="['porn1', 'sg1'].includes(routerTPL)"
        :class="$style['title-coin']"
        :style="
          dialogHeight && { top: `calc(100% - ${dialogHeight}px - 64px)` }
        "
      >
        <img
          :src="$getCdnPath('/static/image/porn1/activesBouns/coin_title.png')"
        />
      </div>
      <!-- 第一行文字 -->
      <div :class="$style['title']">
        <template v-if="type.includes('full-open')">
          请推广好友充值<br />
          领取更多礼金&nbsp;享受每月分红
        </template>
        <template v-else-if="type.includes('poor')">
          {{ $text("S_ACTIVITY_SHORT", "余额不足 请先充值") }}
        </template>
        <div
          v-else-if="missionDesc && type.includes('wait')"
          v-html="getDesc(missionDesc)"
        ></div>
        <!-- <template v-else-if="isUnloginMode">
          加入娱乐会员<br />
          享有观影送钱
        </template> -->
        <template v-else-if="type.includes('disable')">
          <span
            v-if="['porn1', 'sg1'].includes(routerTPL)"
            style="margin-top: 12%;display: block;font-size: 20px;"
          >
            <template v-if="source === 'free-yv'">
              {{ $text("S_ACTIVITY_SLOGAN3", "立即注册 免费观看火热视频") }}
            </template>
            <template v-else>
              {{ $text("S_ACTIVITY_SLOGAN2", "海量精彩视频 任意充值永久观看") }}
            </template>
          </span>
          <span v-else style="margin-top: 12%;display: block;font-size: 20px;">
            观看视频&nbsp;请先登录
          </span>
        </template>
        <template v-else>
          <span style="margin-top: 10%;display: block;">
            {{ $text("S_ACTIVITY_SLOGAN", "看视频送现金 天天看天天送") }}
          </span>
        </template>
      </div>
      <!-- 第二行文字或按鈕 -->
      <template
        v-if="
          type == 'tips' ||
            type.includes('poor') ||
            type.includes('wait') ||
            type.includes('full-open') ||
            type.includes('disable')
        "
      >
        <div :class="$style['bouns-func']">
          <!-- 左邊第一個按鈕 -->
          <!-- <div v-if="isUnloginMode" @click="handleClose">
            继续观影
          </div> -->
          <div v-if="type.includes('disable')" @click="$router.push('/mobile')">
            {{ $text("S_FIRST_LOOK", "先去逛逛") }}
          </div>
          <div
            v-else-if="
              (missionDesc && type.includes('wait')) ||
                earnCellNum === hadEarnNum
            "
            @click="handleClose"
          >
            {{ "继续看" }}
          </div>

          <div v-else @click="handleBack">
            {{ $text("S_FIRST_LOOK", "先去逛逛") }}
          </div>

          <!-- 右邊第一個按鈕 -->
          <div
            v-if="type.includes('disable')"
            @click="toJoin"
            :class="$style['active-btn']"
          >
            <template v-if="['porn1', 'sg1'].includes(routerTPL)">
              {{ $text("S_JOIN_MEMBER", "加入会员") }}
            </template>
            <template v-else>
              会员登录
            </template>
          </div>
          <div
            v-else-if="type.includes('poor')"
            @click="$router.push('/mobile/mcenter/deposit')"
            :class="$style['active-btn']"
          >
            {{ $text("S_GO_DEPOSIT", "去充值") }}
          </div>
          <div
            v-else-if="type.includes('wait') && missionActionType"
            @click="handleAcionType"
            :class="$style['active-btn']"
          >
            {{ getActionName(missionActionType) }}
          </div>
          <div
            v-else-if="earnCellNum === hadEarnNum && hadEarnNum !== 0"
            @click="$router.push('/mobile/mcenter/makeMoney')"
            :class="$style['active-btn']"
          >
            去推广
          </div>
          <div v-else @click="handleAcionType" :class="$style['active-btn']">
            {{ getActionName(missionActionType) }}
          </div>
        </div>
      </template>
      <template v-else>
        <div :class="$style['bouns-earn-wrap']">
          <div :class="$style['earn-title']">
            <template v-if="earnCellNum === hadEarnNum && hadEarnNum !== 0">
              <span>
                恭喜获得今日最高彩金
              </span>
              <span>&nbsp;¥&nbsp;{{ limitAmount }} </span>
            </template>
            <template v-else>
              <span>
                恭喜获得彩金
              </span>
              <span>&nbsp;¥&nbsp;{{ earnCurrentNum }} </span>
            </template>
          </div>
          <div :class="$style['earn-cell-wrap']">
            <div
              v-for="index in earnCellNum"
              :key="index"
              :class="[
                $style['earn-cell'],
                { [$style['active']]: index <= hadEarnNum }
              ]"
            >
              <div>
                <div>
                  <img
                    :src="
                      $getCdnPath(
                        '/static/image/porn1/activesBouns/coin_solid.png'
                      )
                    "
                  />
                </div>
                <div :class="[$style['earn-single-num']]">
                  +{{ earnSingleNum }}
                </div>
                <img
                  v-if="index <= hadEarnNum"
                  :class="[$style['had-earned']]"
                  :src="
                    $getCdnPath('/static/image/porn1/activesBouns/get_icon.png')
                  "
                />
              </div>
            </div>
          </div>
        </div>
        <div @click="handleClose" :class="[$style['earn-keep-btn']]">
          {{ $text("S_ACTIVITY_KEEP", "继续看片") }}
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { getCookie } from "@/lib/cookie";
import { mapGetters, mapActions } from "vuex";
import goLangApiRequest from "@/api/goLangApiRequest";
import yaboRequest from "@/api/yaboRequest";
import Vue from "vue";

export default {
  props: {
    type: {
      type: String,
      default: "tips"
    },
    videoid: {
      type: Number,
      default: ""
    },
    isUnloginMode: {
      type: Boolean
    }
  },
  watch: {
    type() {
      console.log(this.type);
    },
    earnCellNum() {
      if (this.earnCellNum < 0) {
        this.earnCellNum = 6; //暫時防呆
      }
    },
    isShow() {
      setTimeout(() => {
        this.$nextTick(() => this.getDialogHeight());
      });
    }
  },
  data() {
    return {
      isShow: false,
      dialogHeight: 0,
      isClose: false,
      earnCellNum: 0, // 可獲得彩金數
      hadEarnNum: 0, // 已經獲得彩金數
      earnSingleNum: 0, //每次獲得彩金
      earnCurrentNum: 0, //獲得彩金
      limitAmount: 0, //最高彩金
      missionDesc: "", //任務標題
      missionActionType: 0, //任務動作 去充值 去綁定 去推廣
      isFinishMissio: false, //是否完成今年任務,
      tagId: 0,
      unlocked: false,
      source: this.$route.query.source || "yv"
    };
  },
  computed: {
    ...mapGetters({
      memInfo: "getMemInfo",
      siteConfig: "getSiteConfig",
      loginStatus: "getLoginStatus"
    }),
    routerTPL() {
      return this.siteConfig.ROUTER_TPL;
    }
  },
  mounted() {
    window.addEventListener("resize", this.getDialogHeight);
    setTimeout(() => {
      this.$nextTick(() => this.getDialogHeight());
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.getDialogHeight);
  },
  methods: {
    ...mapActions([
      "actionGetLayeredURL",
      "actionGetActingURL",
      "actionGetRegisterURL"
    ]),
    handleBack() {
      this.$router.back();
    },
    getDesc(desc) {
      let split = desc.split(" ");
      // //  今年額滿
      // if (this.isFinishMission) {
      //   if (split && split.length > 0) {
      //     let max = split[1];
      //     return `${split[1]}<br />${split[2]}`;
      //   }
      // }

      // // 任務
      // if (split && split.length > 0) {
      //   return `${split[split.length - 1]}<br />即可继续享有观影送钱！`;
      // }
      let result = "";
      for (let idx in split) {
        if (idx === "0") {
          result += split[0];
        } else {
          result += "<br />" + split[idx];
        }
      }
      return result;
    },
    getActionName() {
      switch (this.missionActionType) {
        case 1:
        case 8:
          return "去绑定";
        case 2:
          return "去充值";
        case 3:
        case 4:
        case 6:
          return "去推广";
        case 5:
        case 7:
          return "去查看";
        default:
          return;
      }
    },
    handleAcionType() {
      let redirect = `?redirect=videoPlay-${this.videoid}`;
      switch (this.missionActionType) {
        case 1:
          this.$router.push(
            `/mobile/mcenter/bankCard${redirect}&type=bankCard`
          );
          return;
        case 2:
          this.$router.push(`/mobile/mcenter/deposit${redirect}`);
          return;
        case 3:
          this.$router.push(`/mobile/mcenter/makeMoney`);
          return;
        case 4:
          this.$router.push(`/mobile/mcenter/tcenter/management/member`);
          return;
        case 5:
          this.unlockTag();
          return;
        case 6:
          this.$router.push(`/mobile/mcenter/makeMoney`);
          return;
        case 7:
        case 8:
          this.$router.push("/mobile/login");
          return;
        default:
          return;
      }
    },
    unlockTag() {
      if (this.unlocked) {
        return;
      }
      this.unlocked = true;
      let cid = getCookie("cid");

      yaboRequest({
        method: "get",
        url: `${this.siteConfig.YABO_API_DOMAIN}/Account/GetAuthorizationToken`
      }).then(res => {
        if (res.data) {
          this.yToken = res.data;
          Vue.cookie.set("y_token", res.data);

          yaboRequest({
            method: "put",
            url: `${this.siteConfig.YABO_API_DOMAIN}/Account/UnlockTagId`,
            params: {
              cid: cid,
              userid: this.memInfo.user.id,
              tagId: this.tagId,
              domain: this.memInfo.user.domain
            }
          }).then(res => {
            setTimeout(() => {
              this.unlocked = false;
              this.$router.push(`/mobile/mcenter/makeMoney`);
            }, 200);
          });
        }
      });
    },
    getDialogHeight() {
      let t = document.getElementById("earn-wrap");
      if (t && t.offsetHeight) {
        this.dialogHeight = t.offsetHeight;
      }
    },
    handleClose() {
      this.isClose = true;
      setTimeout(() => {
        this.$emit("close", this.type.includes("wait") ? true : false);
        this.isShow = false;
        this.isClose = false;
      }, 300);
    },
    toJoin() {
      if (this.routerTPL == "aobo1") {
        this.$router.push(`/mobile/login`);
      } else {
        if (getCookie("platform") === "h") {
          // this.actionGetActingURL().then(res => {
          //   if (res.length > 0 && res.indexOf(window.location.host) != -1) {
          //     this.$router.push(`/mobile/joinmember`);
          //   } else {
          //     this.actionGetLayeredURL().then(res => {
          //       if (res.indexOf(window.location.host) != -1 || res.length < 1) {
          //         this.$router.push(`/mobile/joinmember`);
          //       } else {
          //         window.location.replace(
          //           `https://${res[0]}/mobile/joinmember`
          //         );
          //       }
          //     });
          //   }
          // });
          this.actionGetRegisterURL().then(res => {
            console.log(res);
            if (res.redirect_url) {
              window.location.replace(res.redirect_url + "/mobile/joinmember");
            } else {
              this.$router.push(`/mobile/joinmember`);
            }
          });
        } else {
          this.$router.push(`/mobile/joinmember`);
        }
      }
    }
  }
};
</script>
<style src="../index.scss" lang="scss" module></style>
