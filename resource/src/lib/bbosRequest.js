import axios from 'axios';
import { getCookie } from '@/lib/cookie';

export default ({
    method = 'get',
    moudle = '',
    params = {},
    timeout = 30000,
    reqHeaders = {},
    url = "",
    fail = () => { },
}) => {
    const bbosHeader = {
        // to do 廳別應該統一控制
        // "Vendor": '500015' | '67' | '69',
        "Useragent": navigator.userAgent,
        "Ekey": "sobb",
        'Content-Type': 'application/json',
        'cid': getCookie('cid') ? getCookie('cid') : ''
    }

    const bbosParams = {
        "lang": "zh-cn"
    }

    const obj = {
        method,
        url,
        timeout,
        headers: {
            ...bbosHeader,
            ...reqHeaders,
        },
        params: {
        },
        data: {
        }
    };

    // 不需要formdata params
    if (method === 'post' || method === 'put' || method === 'delete') {
        obj.data = { ...bbosParams, ...params };
    }
    else {
        obj.params = { ...bbosParams, ...params };
    }

    return axios(obj).then((response) => {
        if (process.env.NODE_ENV === "development") {
            console.log("[bbos request]")
            console.log(response.data)
        }

        if (response && response.data && response.data.status === "000") {
            return response.data;
        } else {
            fail(response.data);
        }
        return response.data;
    })
        .catch((error) => {
            console.log(error);
            return error;
        });
};
