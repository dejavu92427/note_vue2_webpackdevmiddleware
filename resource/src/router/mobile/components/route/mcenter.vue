<script>
import kebabCase from "lodash/kebabCase";
import config from "./config";
import { mapGetters } from "vuex";

export default {
  components: config.mcenter,
  props: {
    headerConfig: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapGetters({
      siteConfig: "getSiteConfig"
    }),
    headerConfigValue: {
      get() {
        return this.headerConfig;
      },
      set(value) {
        this.$emit("update:headerConfig", value);
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  render(createElement) {
    const routeName = this.$route.name.replace(/^mcenter-/, "");
    let ROUTER_TPL =
      this.siteConfig.ROUTER_TPL || this.siteConfig.MOBILE_WEB_TPL;
    let target = `${routeName}-${ROUTER_TPL}`;

    return createElement(kebabCase(target), {
      props: {
        headerConfig: this.headerConfigValue
      },
      on: {
        "update:headerConfig": value => {
          this.headerConfigValue = value;
        }
      }
    });
  }
};
</script>
