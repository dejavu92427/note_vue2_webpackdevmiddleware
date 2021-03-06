/* eslint-disable camelcase */
/**
 * 網站設定檔預設值
 */
import { basic, getVersion } from "./basic";

export const preset = {
  ...basic,
  BBOS_DOMIAN: "https://bbos.bbin-asia.com/elibomApi/WebService",
  YABO_API_DOMAIN: "https://yaboapi.bbin-asia.com/api",
  YABO_GOLANG_API_DOMAIN: "", // from API
  ACTIVES_BOUNS_WEBSOCKET: "",
  // 非色站 cxbb
  // https://d15xg0jxmcsiyp.cloudfront.net/json/domainList_yiyuan_qa.json
  LOCAL_JSON_DOMAIN: [
    "https://cos.ap-nanjing.myqcloud.com/rg2d500015-1305726917",
    "https://rg2d500015.oss-cn-hangzhou.aliyuncs.com",
    "https://s3.ap-northeast-1.amazonaws.com/rg2d500015",
    "https://d15xg0jxmcsiyp.cloudfront.net"
  ],
  LOCAL_BASE_DOMAIN: ["https://yaboapi.bbin-asia.com"]
};

/* ---------- ↓ 測試站 ---------- */

/**
 * 币发BIFA 測試站
 */
export const site_500015 = {
  ...preset,
  ROUTER_TPL: "porn1",
  MOBILE_WEB_TPL: "porn1",
  VERSION: getVersion("porn1"),
  SITE_NAME: "币发BIFA",
  PORN_CONFIG: {
    ID: {
      SPACE: "1",
      FREE_SPACE: "123",
      YV: "9",
      SP: "113",
      GAY: "7",
      LES: "8"
    }
  }
};

/**
 * 亿元 測試站
 */
export const site_500023 = {
  ...preset,
  ROUTER_TPL: "ey1",
  MOBILE_WEB_TPL: "ey1",
  VERSION: getVersion("ey1"),
  SITE_NAME: "亿元",
  YABO_API_DOMAIN: "https://cxbb.bbin-asia.com/api",
  YABO_GOLANG_API_DOMAIN: "",
  LOCAL_JSON_DOMAIN: [
    "https://s3.ap-northeast-1.amazonaws.com/hje6xxxx25",
    "https://cos.ap-chongqing.myqcloud.com/hje6xxxx25-1305726917",
    "https://hje6xxxx25.oss-cn-shanghai.aliyuncs.com",
    "https://d15xg0jxmcsiyp.cloudfront.net"
  ],
  LOCAL_BASE_DOMAIN: ["https://cxbb.bbin-asia.com.com"]
};
/* eslint-enable camelcase */

/**
 * 泡泡直播 測試站
 */
export const site_500035 = {
  ...preset,
  ROUTER_TPL: "sg1",
  MOBILE_WEB_TPL: "sg1",
  VERSION: getVersion("sg1"),
  SITE_NAME: "泡泡直播",
  PORN_CONFIG: {
    ID: {
      SPACE: "112",
      FREE_SPACE: "123",
      YV: "9",
      SP: "113",
      GAY: "7",
      LES: "8"
    }
  }
};

/**
 * 澳博国际QA@952t(ID：9999894) 測試站
 */
export const site_9999894 = {
  ...preset,
  ROUTER_TPL: "aobo1",
  MOBILE_WEB_TPL: "porn1",
  VERSION: getVersion("aobo1"),
  SITE_NAME: "澳博国际",
  PORN_CONFIG: {
    ID: {
      SPACE: "119",
      YV: "9",
      AV: "120"
    }
  }
};

/**
 * 51体育 測試站
 */
export const site_9999905 = {
  ...preset,
  ROUTER_TPL: "sp1",
  MOBILE_WEB_TPL: "porn1",
  VERSION: getVersion("sp1"),
  SITE_NAME: "51体育",
  PORN_CONFIG: {
    ID: {
      SPACE: "1",
      YV: "9"
    }
  }
};
