import { PORN_DOMAIN, S_PORN_DOMAIN } from '@/api/config';
import { getCookie, setCookie } from '@/lib/cookie';
import { setup, setupCache } from 'axios-cache-adapter'

import axios from 'axios';
import querystring from 'querystring'
import store from '@/store';

export default ({
    method = 'get',
    params = {},
    data = {},
    timeout = 30000,
    reqHeaders = {},
    url = "",
    // smallPig = false,
    fail = () => { },
}) => {

    const obj = {
        method,
        url: PORN_DOMAIN + url,
        timeout,
        headers: {
            ...reqHeaders,
        },
        params: {
            ...params
        },
        data: querystring.stringify(data)
    };

    const domain = store &&
        store.state &&
        store.state.memInfo &&
        store.state.memInfo.user &&
        store.state.memInfo.user.domain;

    // if (domain === '500015') {
    //     obj['url'] = S_PORN_DOMAIN + url;
    // }

    // if (smallPig) {
    //     // obj['withCredentials'] = true;
    //     const domain = store &&
    //         store.state &&
    //         store.state.memInfo &&
    //         store.state.memInfo.user &&
    //         store.state.memInfo.user.domain;
    // }

    let api = window.PermissionRequest;

    if (!api) {
        //  Create `axios-cache-adapter` instance
        const cache = setupCache({
            maxAge: 30 * 60 * 1000,
            // debug: true,
            exclude: {
                query: false
            }
        })

        // window.PermissionRequest = setup({
        //     ...obj,
        //     baseURL: PORN_DOMAIN,
        //     cache: {
        //         maxAge: 15 * 60 * 1000
        //     }
        // })

        //  Create `axios` instance passing the newly created `cache.adapter`
        window.PermissionRequest = axios.create({
            adapter: cache.adapter
        })
        api = window.PermissionRequest;
    }

    // setCookie('Session', '2Ses38X5WEBcSvBYJX8R5A', { path: '.cdxxx.app', sameSite: 'None' });
    return api(obj).then((res) => {
        if (res && res.data) {
            return res.data;
        } else {
            fail(res.data);
        }
        return res.data;
    })
        .catch((error) => {
            console.log("[PORN request error]")
            console.log(error.response);
            return error;
        });
};
