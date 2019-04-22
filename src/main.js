import Vue from 'vue'
import App from './App'
import router from './router'

import './assets/css/global.css'

import axios from 'axios'

import './assets/fonts/iconfont.css'

import ElementUI from 'element-ui'
Vue.use(ElementUI)

axios.defaults.baseURL = 'http://127.0.0.1:11333/api/private/v1/'
Vue.prototype.$http = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
