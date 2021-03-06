import { mapActions, mapGetters } from "vuex";

import EST from "@/lib/EST";
import Vue from "vue";
import goLangApiRequest from "@/api/goLangApiRequest";

export default {
  data() {
    return {};
  },
  filters: {
    dateFormat(date) {
      return EST(Vue.moment(date).format("YYYY-MM-DD HH:mm:ss"));
    },
    shortDateFormat(date) {
      return Vue.moment(EST(date)).format("YYYY-MM-DD");
    }
  },
  computed: {
    ...mapGetters({
      memInfo: "getMemInfo",
      siteConfig: "getSiteConfig"
    }),
    themeTPL() {
      return this.siteConfig.MOBILE_WEB_TPL;
    }
  },
  methods: {
    setTitleContent(content) {
      if (!content) {
        return;
      }
      // let urlRegex = /\<p\>|\<\/p\>|\n|\<\/br\>/g;
      // return content.replace(urlRegex, "");
      return content;
    },
    getImage(imageID) {
      return goLangApiRequest({
        method: "get",
        url: `${this.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Image/${imageID}`
      }).then(res => {
        return res.data;
      });
    },
    setContent(content, fromPopup) {
      if (!content) {
        return;
      }

      let urlRegex = new RegExp(
        /(https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/,
        "g"
      );

      // if (fromPopup) {
      //   return content.replace("href=", " target='_blank' href=");
      // }

      return content.replace("href=", " target='_blank' href=");
      // .replace(urlRegex, function(url) {
      //   console.log(url);
      //   return '<a href="' + url + '" target="_blank">' + url + "</a>";
      // });
    }
  }
};
