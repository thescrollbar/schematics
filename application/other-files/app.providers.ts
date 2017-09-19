import { environment } from '../environments/environment';

const DEV_PROVIDERS = [

];

const PROD_PROVIDERS = [

];

const COMMON_PROVIDERS = [

];

export const APP_PROVIDERS = !environment.production
? [ ...COMMON_PROVIDERS, ...DEV_PROVIDERS ]
: [ ...COMMON_PROVIDERS, ...PROD_PROVIDERS ];
