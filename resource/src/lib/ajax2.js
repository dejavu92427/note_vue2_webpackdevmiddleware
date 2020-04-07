
import axios from 'axios';
import { apiErrorAlarm } from './errorConsole';

export default ({
    method = 'get',
    url = '',
    params = {},
    timeout = 30000,
    cache = false,
    responseInfo = false,
    errorAlert = true
}) => {
    const obj = {
        method,
        url,
        timeout,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (method === 'post' || method === 'put' || method === 'delete') {
        obj.data = params;
    } else {
        obj.params = params;
    }

    // 強制更新
    if (!cache) {
        obj.headers['If-Modified-Since'] = '0';
    }

    return axios(obj).then((response) => {
        if (response.data.result === 'error') {
            if (response.data.msg && errorAlert) {
                alert(`${response.data.msg} ${response.data.code ? `(${response.data.code})` : ''}`);
            }

            apiErrorAlarm({ url, response });
        }

        return responseInfo ? response : response.data;
    })
        .catch((error) => {
            if (error.response && error.response.data.msg && errorAlert) {
                alert(`${error.response.data.msg} ${error.response.data.code ? `(${error.response.data.code})` : ''}`);
            }

            if (error.response) {
                return error.response;
            }

            return error.toString();
        });
};
