<template>
  <div :class="$style['vip-container']">
    <div :class="$style['vip-top-info']">
      <!-- Header -->
      <div :class="$style['header-block']">
        <div :class="$style['btn-back']" @click="$router.back()">
          <img
            :src="$getCdnPath(`/static/image/common/btn_back_black.png`)"
            alt="btn_back"
          />
        </div>

        <div :class="$style['header-title']">
          <span
            :class="{
              [$style['active']]: item.config_id === currentConfigID
            }"
            v-for="item in userVipInfo"
            :key="item.config_id"
            @click="
              loginStatus
                ? handleConfigId(item.config_id)
                : $router.push('/mobile/login')
            "
            >{{ item.config_name }}</span
          >
        </div>
      </div>

      <!-- user info -->
      <template v-if="userVipInfo">
        <vip-user
          :vipLevelList="vipLevelList"
          :vipConfig="
            vipConfigList.find(item => item.id === this.currentConfigID)
          "
          :userVipInfo="
            userVipInfo.find(item => item.config_id === this.currentConfigID)
          "
        />
      </template>
    </div>

    <!-- level card -->
    <template v-if="vipLevelList && userVipInfo">
      <vip-level-card
        :currentLevelData.sync="setCurrentLevel"
        :vipLevelList="vipLevelList"
        :vipConfig="
          vipConfigList.find(item => item.id === this.currentConfigID)
        "
        :userVipInfo="
          userVipInfo.find(item => item.config_id === this.currentConfigID)
        "
      />
    </template>

    <!-- desc -->
    <template v-if="setCurrentLevel">
      <vip-info :currentLevelData="setCurrentLevel" />
    </template>
    <!-- <live-info /> -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import { getCookie } from "@/lib/cookie";
import vipUser from "./vipUser";
import vipLevelCard from "./vipLevelCard";
import vipInfo from "./vipInfo";
import goLangApiRequest from "@/api/goLangApiRequest";

export default {
  components: {
    Swiper,
    SwiperSlide,
    vipUser,
    vipLevelCard,
    vipInfo
  },
  data() {
    return {
      currentConfigID: 0,
      userVipInfo: null,
      vipLevelList: [],
      vipConfigList: [],
      currentLevelData: {}
    };
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig",
      memInfo: "getMemInfo",
      loginStatus: "getLoginStatus",
      allVip: "getAllVip"
    }),
    $style() {
      const style =
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1;
      return style;
    },
    setCurrentLevel: {
      get() {
        return this.currentLevelData;
      },
      set(value) {
        this.currentLevelData = value;
      }
    }
  },
  created() {
    this.getUserDetail();

    if (!this.loginStatus) {
      this.$router.push("/mobile/login");
    }

    this.actionSetVip().then(() => {
      if (!this.allVip || this.allVip.length === 0) {
        this.actionSetGlobalMessage({
          msg: "VIP尚未开放，请联系在线客服",
          cb: () => {
            this.$router.push("/mobile");
          }
        });
      }
    });

    this.getVipConfig();
  },
  methods: {
    ...mapActions(["actionSetGlobalMessage", "actionSetVip"]),
    getUserDetail() {
      goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/cxbb/Player/vipinfo`,
        headers: {
          cid: getCookie("cid")
        }
      }).then(res => {
        if (res.code === "M00001") {
          this.actionSetGlobalMessage({ msg: "请重新登入", code: res.code });
          return;
        }

        this.userVipInfo = res.data;

        if (localStorage.getItem("vip_config_id")) {
          this.currentConfigID = localStorage.getItem("vip_config_id");
          localStorage.removeItem("vip_config_id");
        } else {
          // 起始預設 config_id 為分類中的第一筆
          this.currentConfigID = this.userVipInfo[0].config_id;
        }
      });
    },
    getVipLevel() {
      if (!this.loginStatus || !getCookie("cid")) {
        this.$router.push("/mobile/login");
      }

      // 依vip分類回傳所有等級清單(不分⾴)
      goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/cxbb/Player/viplevel/${this.currentConfigID}`,
        headers: {
          cid: getCookie("cid")
        }
      }).then(res => {
        if (res.code === "M00001") {
          this.actionSetGlobalMessage({ msg: "请重新登入", code: res.code });
          return;
        }
        this.vipLevelList = res.data;
      });
    },

    getVipConfig() {
      if (!this.loginStatus || !getCookie("cid")) {
        this.$router.push("/mobile/login");
      }
      //取得vip參數檔(即後台vip標籤項目列表) rd5 第三方 C07.04
      goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Vip/Config/List`,
        headers: {
          cid: getCookie("cid")
        },
        params: {
          lang: "zh-cn"
        }
      }).then(res => {
        if (res.code === "M00001") {
          this.actionSetGlobalMessage({ msg: "请重新登入", code: res.code });
          return;
        }
        this.vipConfigList = res.data;
      });
    },
    handleConfigId(value) {
      this.currentConfigID = value;
      localStorage.setItem("vip_config_id", value);
    }
  },
  watch: {
    currentConfigID() {
      this.getVipLevel();
    }
  }
};
</script>

<style
  lang="scss"
  src="@/css/page/vip/porn1.vip.scss"
  module="$style_porn1"
></style>
<style
  lang="scss"
  src="@/css/page/vip/sg1.vip.scss"
  module="$style_sg1"
></style>
