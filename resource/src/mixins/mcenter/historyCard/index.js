export default {
  data() {
    return {
      // Page 相關參數
      currentTab: 1,
      currentPage: "walletCardInfo",
      isShowTab: false,

      editDetailStatus: false,
      isAuditStatus: false,
      showDetailStatus: false,
    };
  },
  computed: {
    showDetail: {
      get() {
        return this.showDetailStatus;
      },
      set(value) {
        this.showDetailStatus = value;
      }
    },
    editStatus: {
      get() {
        return this.editDetailStatus;
      },
      set(value) {
        this.editDetailStatus = value;
      }
    },
    isAudit: {
      get() {
        return this.isAuditStatus;
      },
      set(value) {
        this.isAuditStatus = value;
      }
    }
  },
  methods: {
    changePage(value) {
      this.currentPage = value;
    }
  }
};
