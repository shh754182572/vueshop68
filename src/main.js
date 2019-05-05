import Vue from 'vue'
import App from './App'
import router from './router'
import moment from 'moment'

import './assets/css/global.css'

import axios from 'axios'
import comCrumb from './components/Share/Crumb.vue'

import './assets/fonts/iconfont.css'

import ElementUI from 'element-ui'
Vue.use(ElementUI)

Vue.component('com-crumb', comCrumb)

axios.defaults.baseURL = 'http://127.0.0.1:11333/api/private/v1/'

axios.interceptors.request.use(
  function(config) {
    var token = window.sessionStorage.getItem('token')
    config.headers.Authorization = token
    return config
  },
  function(error) {
    return Promise.reject(error)
  }
)

Vue.prototype.$http = axios

Vue.filter('dateFormat', v => {
  return moment(v).format('YYYY-MM-DD HH:mm:ss')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
