<template>
  <div :class="$style['hot-lobby']">
    <!-- 遊戲列表 -->
    <div :class="$style['game-item-wrap']">
      <template v-for="(item, index) in gameData">
        <game-item
          :game-data="item"
          :lobby-info="lobbyInfo"
          :key="'image-' + index"
        />
      </template>
    </div>

    <!-- 無資料 -->
    <template v-if="gameData && gameData.length <= 0">
      <div :class="$style['empty-wrap']">
        <div :class="$style['empty-icon']" />
        <div>{{ $text("S_NO_GAME", "未查询到相关游戏") }}</div>
      </div>
    </template>

    <template v-if="isShowSearch">
      <game-search :update-search-status="updateSearchStatus" />
    </template>
    <envelope
      v-if="needShowRedEnvelope"
      @closeEvelope="closeEvelope"
      :redEnvelopeData="redEnvelopeData"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import gameItem from "./components/gameItem";
import gameSearch from "./components/gameSearch";
import mixin from "@/mixins/hotLobby";

export default {
  components: {
    gameSearch,
    gameItem,
    envelope: () =>
      import(
        /* webpackChunkName: 'pageLoading' */ "@/router/mobile/components/common/home/redEnvelope"
      )
  },
  mixins: [mixin],
  props: {
    isShowSearch: {
      type: Boolean,
      default: false
    },
    lobbyName: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      needShowRedEnvelope: false,
      redEnvelopeData: {}
    };
  },
  watch: {
    showRedEnvelope() {
      // if(this.showRedEnvelope.data.status != -1){
      this.needShowRedEnvelope = true;
      this.redEnvelopeData = this.showRedEnvelope;
      // }

      // console.log(`showRedEnvelope is ${this.showRedEnvelope}`);
    }
  },
  computed: {
    ...mapGetters({
      loginStatus: "getLoginStatus",
      siteConfig: "getSiteConfig",
      showRedEnvelope: "getShowRedEnvelope"
    }),
    $style() {
      return (
        this[`$style_${this.siteConfig.MOBILE_WEB_TPL}`] || this.$style_porn1
      );
    }
  },
  created() {
    // 回傳至父層給予熱門大廳的 Title
    this.$emit("update:lobbyName", this.lobbyInfo.name);
  },
  mounted() {
    if (!this.loginStatus) {
      this.$router.push("/mobile/login");
    }
    this.getUserViplevel();
    // this.getGameList();
  },
  methods: {
    updateSearchStatus() {
      this.$emit("update:isShowSearch");
    },

    closeEvelope() {
      this.needShowRedEnvelope = false;
      this.actionSetGlobalMessage({
        msg: "红包派发中，到帐后即可畅玩游戏"
      });
    }
  }
};
</script>

<style lang="scss" src="./css/porn1.index.scss" module="$style_porn1"></style>
