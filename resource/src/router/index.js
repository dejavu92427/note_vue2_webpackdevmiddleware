import { getCookie, setCookie } from "@/lib/cookie";

import Router from "vue-router";
import Vue from "vue";
import agent from "./agent";
import error404 from "./404";
import error500 from "./500";
import game from "./game";
import mobile from "./mobile";
import noService from "./no_service";
import popControl from "./popcontrol";
import staticService from "./static/";
import timeout from "./timeout";
import upup from "./upup";

// prevent NavigationDuplicated error see: https://github.com/vuejs/vue-router/issues/2881
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => err);
};

const mobileMainbody = () =>
  import(/* webpackChunkName: 'mainbody' */ "./mobile/components");
Vue.use(Router);
export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: mobileMainbody,
      beforeEnter: (to, from, next) => {
        // const isPc = document.cookie.indexOf("pc=1");

        // if (isPc !== -1) {
        //   next();
        //   return;
        // }
        if (to.query.page && to.query.page === "pwdreset") {
          next(`/mobile/resetPwd?kr=${to.query.kr}&type=${to.query.type}`);
          return;
        }

        const code = to.query.code || "";
        const channelid = to.query.channelid || "";
        const action = to.query.action;
        const toLive = to.query.toLive;

        // 直播PWA/launch
        let isLive = toLive && toLive == "true";
        localStorage.removeItem("x-action");

        // 渠道ID優先
        if (
          (channelid && channelid !== "undefined") ||
          (code && code !== "undefined")
        ) {
          localStorage.removeItem("x-code");
          localStorage.removeItem("x-channelid");
          localStorage.removeItem("x-action");

          localStorage.setItem("x-channelid", channelid);
          localStorage.setItem("x-code", code);

          setCookie("cid", "");
          setCookie("aid", "");

          localStorage.removeItem("aid");
          window.RESET_LOCAL_SETTING();
          window.RESET_MEM_SETTING();

          if (action && action !== "undefined") {
            localStorage.setItem("x-action", action);
          }
        }

        if (isLive) {
          next(`/mobile/live/iframe/home?hasFooter=true`);
        } else {
          next(`/mobile`);
        }
        return;
      }
    },
    {
      path: "/a/:code",
      beforeEnter(to, from, next) {
        const urlParams = new URLSearchParams(window.location.search);
        const channelid = urlParams.get("channelid");
        const code = to.params.code;

        if (code && code !== undefined) {
          localStorage.setItem("x-code", code || "");
          localStorage.setItem("x-channelid", "");

          setCookie("cid", "");
          setCookie("aid", "");
          localStorage.removeItem("aid");
          window.RESET_LOCAL_SETTING();
          window.RESET_MEM_SETTING();

          if (channelid && channelid !== undefined) {
            localStorage.setItem("x-channelid", channelid);
            next(`/mobile?code=${code}&channelid=${channelid}`);
            return;
          }

          next(`/mobile?code=${code}`);
          return;
        }

        next("/mobile");
      }
    },
    popControl,
    game,
    agent,
    mobile,
    error500,
    noService,
    upup,
    timeout,
    error404,
    staticService
  ]
});
