import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      platformName: '',
      titleList: [
        'VIP等级',
        '体育返水',
        '电竞返水',
        '视讯返水',
        '电子返水',
        '棋牌返水',
        '返水上限'
      ],
      list: [
        ['VIP0', '0.38%', '0.48%', '0.40%', '0.80%', '0.55%', '10,888'],
        ['VIP1', '0.38%', '0.48%', '0.45%', '0.90%', '0.60%', '12,888'],
        ['VIP2', '0.38%', '0.48%', '0.45%', '0.90%', '0.75%', '16,888'],
        ['VIP3', '0.40%', '0.55%', '0.55%', '0.95%', '0.80%', '18,888'],
        ['VIP4', '0.45%', '0.55%', '0.55%', '0.95%', '0.85%', '28,888'],
        ['VIP5', '0.45%', '0.55%', '0.60%', '1.00%', '0.90%', '38,888'],
        ['VIP6', '0.50%', '0.60%', '0.65%', '1.00%', '0.95%', '58,888'],
        ['VIP7', '0.55%', '0.70%', '0.70%', '1.10%', '1.00%', '88,888'],
        ['VIP8', '0.68%', '0.80%', '0.75%', '1.10%', '1.05%', '128,888'],
        ['VIP9', '0.80%', '0.90%', '0.85%', '1.20%', '1.10%', '188,888'],
        ['VIP10', '1.00%', '1.10%', '1.00%', '1.20%', '1.20%', '388,888']

      ]
    }
  },
  computed: {
    ...mapGetters({
      loginStatus: 'getLoginStatus'
    }),
    isApp() {
      const isApp = !!(
        (this.$route.query && this.$route.query.app)
        || (this.$route.query && this.$route.query.APP)
      );
      if (isApp) {
        document.title = 'VIP详请';
      }
      return isApp;
    },
  },
  methods: {
    backToTop() {
      $('#mobile-wrap').animate({ scrollTop: 0 }, 1000);
    }
  }
}
