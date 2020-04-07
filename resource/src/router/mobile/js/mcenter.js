const component = () => import(/* webpackChunkName: 'component' */'../components/route/mcenter');

export default {
    path: 'mcenter',
    name: 'mcenter',
    redirect: '/mobile/mcenter/home',
    component,
    children: [
        { // 會員中心首頁
            path: 'home',
            name: 'mcenter-home',
            component
        },
        { // 帳戶資料
            path: 'accountData/:id?',
            name: 'mcenter-accountData',
            component
        },
        { // 裝置管理
            path: 'bindingDevice',
            name: 'mcenter-bindingDevice',
            component
        },
        { // 額度轉換
            path: 'balanceTrans',
            name: 'mcenter-balanceTrans',
            component
        },
        { // 綁定銀行卡
            path: 'bankCard',
            name: 'mcenter-bankCard',
            component
        },
        { // 我的返水
            path: 'bankRebate',
            name: 'mcenter-bankRebate',
            component
        },
        { // 投注記錄
            path: 'betRecord',
            name: 'mcenter-betRecord',
            component
        },
        { // 紅利帳戶
            path: 'bonusAccount',
            name: 'mcenter-bonusAccount',
            component
        },
        { // 站內信
            path: 'message',
            name: 'mcenter-message',
            component
        },
        { // 資金明細
            path: 'moneyDetail',
            name: 'mcenter-moneyDetail',
            component
        },
        { // 公告
            path: 'post',
            name: 'mcenter-post',
            component
        },
        { // 信息中心
            path: 'information/:id/:pid?',
            name: 'mcenter-information',
            component
        },
        { // 取款
            path: 'withdraw',
            name: 'mcenter-withdraw',
            component
        },
        { // 存款
            path: 'deposit',
            name: 'mcenter-deposit',
            component
        },
        { // 意見反饋
            path: 'feedback',
            name: 'mcenter-feedback',
            component
        },
        { // app分享
            path: 'share',
            name: 'mcenter-share',
            component
        },
        { // 優惠
            path: 'promotion',
            name: 'promotion',
            component
        },
        { // VIP中心
            path: 'vipCenter',
            name: 'mcenter-vipCenter',
            component
        },
        { // 代理合作
            path: 'cooperation',
            name: 'mcenter-cooperation',
            component
        },
        { // 選擇語系
            path: 'changeLang',
            name: 'mcenter-changeLang',
            component
        },
        { // VIP
            path: 'accountVip',
            name: 'mcenter-accountVip',
            component
        },
        // { // 贊助信息
        //     path: 'sponsor',
        //     name: 'mcenter-sponsor',
        //     component
        // },
        // { // 玩法教程
        //     path: 'play',
        //     name: 'mcenter-play',
        //     component
        // },
        { // 幫助中心
            path: 'help',
            name: 'mcenter-help',
            component,
            children: [
                {
                    path: 'electronic',
                    name: 'mcenter-help-electronic',
                    component
                },
                {
                    path: 'lottery',
                    name: 'mcenter-help-lottery',
                    component
                },
                {
                    path: 'question',
                    name: 'mcenter-help-question',
                    component
                },
                {
                    path: 'real',
                    name: 'mcenter-help-real',
                    component
                },
                {
                    path: 'recharge',
                    name: 'mcenter-help-recharge',
                    component
                },
                {
                    path: 'sport',
                    name: 'mcenter-help-sport',
                    component
                },
                {
                    path: 'withdrawal',
                    name: 'mcenter-help-withdrawal',
                    component
                }
            ]
        },
        { // 關於我們
            path: 'about',
            name: 'mcenter-about',
            component,
            children: [
                {
                    path: 'sport',
                    name: 'mcenter-about-sport',
                    component
                },
                {
                    path: 'trust',
                    name: 'mcenter-about-trust',
                    component
                },
                {
                    path: 'agreement',
                    name: 'mcenter-about-agreement',
                    component
                },
                {
                    path: 'term',
                    name: 'mcenter-about-term',
                    component
                },
                {
                    path: 'privacy',
                    name: 'mcenter-about-privacy',
                    component
                }
            ]
        },
        {
            path: 'tcenter',
            name: 'mcenter-tcenter',
            component,
            redirect: '/mobile/mcenter/tcenter/management',
            children: [
                {
                    path: 'commission/:id?/:period?',
                    name: 'mcenter-tcenter-commission',
                    component
                },
                {
                    path: 'gameRecord/:page?',
                    name: 'mcenter-tcenter-gameRecord',
                    component
                },
                {
                    path: 'management',
                    name: 'mcenter-tcenter-management',
                    component
                }
            ]
        }
    ]
};
