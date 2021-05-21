import * as moment from "moment-timezone";

import axios from "axios";
import goLangApiRequest from "@/api/goLangApiRequest";
import i18n from "@/config/i18n";
import { lib_useGlobalWithdrawCheck } from "@/lib/withdrawCheckMethod";
import links from "@/config/links";
import openGame from "@/lib/open_game";
import router from "@/router";
import store from "@/store";

export default target => {
  const curLang = store.state.curLang || "zh-cn";
  const linkType = target?.linkType?.[curLang] || target?.linkType;
  const linkTo = target?.linkTo?.[curLang] || target?.linkTo;
  const linkItem = target?.linkItem?.[curLang];

  if (process.env.NODE_ENV === "development") {
    console.log(target);
    console.log(
      "linkType:",
      linkType,
      "linkTo:",
      linkTo,
      "linkItem:",
      linkItem
    );
  }

  // 空白連結
  if (!linkType || linkType === "nolink") {
    return;
  }

  let linkTitle = "";
  switch (store.state.webDomain.site) {
    case "porn1":
    case "ey1":
    case "sg1":
      // linkTitle = '鸭博娱乐';
      // linkTitle = '亿元娱乐';
      // linkTitle = '丝瓜直播';
      linkTitle = "优惠活动";
      break;
    default:
      break;
  }

  let newWindow;

  // 外部連結 視為優小秘
  // if (linkType === "external") {
  //   newWindow = window.open(`${linkTo}`, "_blank");
  //   return;
  // }

  // 優小祕
  if ((linkType === "mi" || linkType === "external") && linkTo) {
    // 未知用途
    // window.open(
    //   `/popcontrol/promo/${JSON.stringify({ linkItem })}`,
    //   "_blank"
    // );

    axios({
      method: "get",
      url: "/api/v1/c/link/customize",
      params: {
        code: "promotion",
        client_uri: linkTo
      }
    })
      .then(res => {
        if (res && res.data && res.data.ret && res.data.ret.uri) {
          localStorage.setItem("iframe-third-url", res.data.ret.uri);
          localStorage.setItem("iframe-third-url-title", linkTitle);
          localStorage.setItem("iframe-third-origin", `home`);
          window.location.href = `/mobile/iframe/promotion`;
        }
      })
      .catch(error => {
        if (newWindow) {
          newWindow.close();
        }
        if (error && error.data && error.data.msg) {
          store.dispatch("actionSetGlobalMessage", { msg: error.data.msg });
        }
      });

    return;
  }

  //  固定連結
  if (linkType === "static") {
    // 活動頁面
    if (/^festival*/g.test(linkTo)) {
      const festivalControl = (name, stime, etime, key) => {
        // 判斷是否登入 (此活動頁需登入後才可開啟)
        if (!store.state.loginStatus) {
          alert(i18n.t("S_LOGIN_TIPS"));
          return;
        }

        const now = moment(store.state.systemTime).tz("Asia/Shanghai");
        const start = moment(stime).tz("Asia/Shanghai");
        const end = moment(etime).tz("Asia/Shanghai");

        // 活動已結束
        if (now.isAfter(end)) {
          alert(i18n.t("S_PROMOTION_END"));
          return;
        }

        // 活動進行中
        if (now.isBetween(start, end)) {
          newWindow = window.open(
            `/popcontrol/festival/${key.vendor}/${key.id}`,
            "_blank"
          );
        }
      };

      // 活動連結判斷
      const festival = links.static.filter(casino => casino.stime);

      festival.some(key => {
        if (linkTo === key.value) {
          festivalControl(linkTo, key.stime, key.etime, key);
          return true;
        }
        return false;
      });
      return;
    }

    // 在線客服
    if (/^service*/g.test(linkTo)) {
      let url = store.state.mobileInfo.service.url;
      window.open(url);

      // 在線客服流量分析事件
      window.dataLayer.push({
        dep: 2,
        event: "ga_click",
        eventCategory: "online_service",
        eventAction: "online_service_contact",
        eventLabel: "online_service_contact"
      });
      return;
    }

    return;
  }

  if (linkType === "internal") {
    switch (linkTo) {
      case "join":
        if (store.state.loginStatus) {
          return;
        }
        router.push("/mobile/joinmember");
        return;

      case "promotion":
        router.push("/mobile/promotion");
        return;
      // ?
      case "home":
        // router.push("/mobile/home");
        return;

      case "service":
        router.push("/mobile/service?prev=false");
        return;

      // 需登入
      case "deposit":
      case "withdraw":
      case "bankRebate":
        if (!store.state.loginStatus) {
          if (store.state.webDomain.site === "ey1") {
            router.push("/mobile/login");
          } else {
            router.push("/mobile/joinmember");
          }
          return;
        }

        router.push(`/mobile/mcenter/${linkTo}`);
        return;

      case "cgPay":
      case "mobileBet":
      default:
        return;
    }
  }

  // 遊戲需登入
  if (!store.state.loginStatus) {
    if (store.state.webDomain.site === "ey1") {
      router.push("/mobile/login");
    } else {
      router.push("/mobile/joinmember");
    }
    return;
  }

  const gameList = [
    "sport",
    "live",
    "casino",
    "card",
    "lottery",
    "mahjong",
    "lg_yb_casino",
    "lg_yb_card"
  ];

  // 遊戲連結
  if (gameList.includes(linkType)) {
    // 熱門
    switch (linkTo) {
      case "lg_yb_card":
      // case "lg_ey_card":
      // case "lg_sg_card":
      case "lg_yb_casino":
        // case "lg_ey_casino":
        // case "lg_sg_casino":
        if (!linkItem) {
          router.push(`/mobile/hotLobby/${linkTo}`);
          return;
        }

      default:
        break;
    }

    let kind = "";
    let code = linkItem || "";
    let vendor = linkTo;

    let notVipGame = JSON.parse(
      localStorage.getItem("needFilterGameData")
    ).find(filterData => {
      return filterData.gameCode === code;
    });
    // console.log(notVipGame);
    if (linkTo === "lg_yb_card" && notVipGame) {
      store.dispatch("actionSetGlobalMessage", { msg: "VIP等级不足" });
      return;
    }
    switch (linkType) {
      case "sport":
        kind = 1;
        break;

      case "live":
        kind = 2;
        break;

      case "casino":
        kind = 3;
        break;

      case "lottery":
        kind = 4;
        break;

      case "card":
        kind = 5;
        break;

      case "mahjong":
        kind = 6;
        break;

      default:
        break;
    }

    const gameData = store.state.gameData["_allGame"];
    let activedGame = gameData.some(i => {
      if (i.vendor === linkTo && i.kind === kind) {
        linkTitle = i.alias;
        return true;
      }
    });
    // let activedGame = Object.keys(gameData).some(obj => {
    //   if (gameData[obj].vendor === linkTo && gameData[obj].kind === kind) {
    //     linkTitle = gameData[obj].alias;
    //     return true;
    //   }
    // });

    if (!activedGame) {
      console.log("游戏未开放");
      return;
    }

    // 有遊戲大廳的遊戲
    const hasHall = [3, 5];
    if (hasHall.includes(kind) && !linkItem) {
      switch (kind) {
        case 3:
          router.push(`/mobile/casino/${vendor}`);
          break;
        case 5:
          router.push(`/mobile/card/${vendor}`);
          break;
        // case 6:
        //   router.push(`/mobile/mahjong/${vendor}`);
        //   break;
        default:
          return;
      }
      return;
    }

    // 未開放其他大廳
    if ([6].includes(kind) && !linkItem) {
      return;
    }

    // 當前平台維護狀態
    const isVendorMaintain = () => {
      let isMaintain = false;
      let list = JSON.parse(localStorage.getItem("vendorMaintainList"));

      isMaintain = list.some(item => {
        return (
          item.vendor === linkTo.toUpperCase() ||
          item.vendor === linkTo.toLowerCase()
        );
      });

      return isMaintain;
    };

    // 0421 進入遊戲前檢查withdrawcheck
    if (!store.state.withdrawCheckStatus.account && !isVendorMaintain()) {
      lib_useGlobalWithdrawCheck("home");
      return;
    }

    let gameName = "";
    goLangApiRequest({
      method: "post",
      url: `${store.state.siteConfig.YABO_GOLANG_API_DOMAIN}/xbb/Games`,
      params: {
        lang: "zh-cn",
        kind: kind,
        vendor: vendor,
        code: code,
        firstResult: 0,
        maxResults: 20
      }
    }).then(res => {
      if (res && res.data && res.data.ret && res.data.ret[0]) {
        gameName = res.data.ret[0].name;
      }

      openGame(
        {
          kind: kind,
          vendor: vendor,
          code: code,
          gameName: gameName
        },
        openGameSuccessFunc,
        openGameFailFunc
      );
    });

    const openGameSuccessFunc = res => {};

    const openGameFailFunc = res => {
      if (res && res.data) {
        let data = res.data;
        store.dispatch("actionSetGlobalMessage", {
          msg: data.msg,
          code: data.code,
          origin: "home"
        });
      }
    };
  }
};
