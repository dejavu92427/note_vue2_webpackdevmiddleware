// Doamin
const PORN1_DOMAIN_DEV = 'http://192.168.133.98:8080';
const PORN1_DOMAIN_PROD = 'https://yaboapi.bbin-asia.com';
export const PORN1_DOMAIN = process.env.NODE_ENV !== 'development' ? PORN1_DOMAIN_DEV : PORN1_DOMAIN_PROD;

const BBOS_DOMIAN_QA = 'https://bbos.canarycherrytart.com/elibomApi/WebService';
const BBOS_DOMIAN_PROD = 'https://bbos.bbin-asia.com/elibomApi/WebService';
export const BBOS_DOMIAN = process.env.NODE_ENV !== 'development' ? BBOS_DOMIAN_QA : BBOS_DOMIAN_PROD;

export const ACTIVES_BOUNS_WEBSOCKET = 'ws://192.168.133.98:8080/xxx/promosocket';

export const CONTACT_US = '/api/system/contactus';

export default {

}
