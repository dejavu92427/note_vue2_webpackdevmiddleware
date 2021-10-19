/* eslint-disable camelcase */
/**
 * 網站設定檔預設值
 */
import { basic, getVersion } from "./basic";

export const preset = {
  ...basic,
  BBOS_DOMIAN: "https://bbos.bbin-asia.com/elibomApi/WebService",
  YABO_API_DOMAIN: "https://yaboapi.bbin-asia.com/api",
  YABO_GOLANG_API_DOMAIN: "https://yaboapi.bbin-asia.com/api-v2",
  ACTIVES_BOUNS_WEBSOCKET: "wss://yaboapi.bbin-asia.com/ws/promosocket",
  ACTIVES_BOUNS_WEBSOCKETV2: "wss://yaboapi.bbin-asia.com/wsn/promosocket?"
};

/* ---------- ↓ 測試站 ---------- */

/**
 * 鸭博娱乐 測試站
 */
export const site_500015 = {
  ...preset,
  ROUTER_TPL: "porn1",
  MOBILE_WEB_TPL: "porn1",
  VERSION: getVersion("porn1"),
  SITE_NAME: "鸭博娱乐",
  PORN_CONFIG: {
    ID: {
      SPACE: "1",
      YB: "9",
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
  // YABO_GOLANG_API_DOMAIN: "https://cxbb.bbin-asia.com/api-v2/cxbb",
  YABO_GOLANG_API_DOMAIN: "https://cxbb.bbin-asia.com/api-v2",
  ACTIVES_BOUNS_WEBSOCKETV2: "wss://cxbb.bbin-asia.com/wsn/promosocket?"
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
      YB: "9",
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
      YB: "120"
    }
  }
};

/**
 * 51国际 測試站
 */
export const site_9999905 = {
  ...preset,
  ROUTER_TPL: "sp1",
  MOBILE_WEB_TPL: "porn1",
  VERSION: getVersion("sp1"),
  SITE_NAME: "51国际",
  PORN_CONFIG: {
    ID: {
      SPACE: "1",
      YB: "9"
    }
  }
};
