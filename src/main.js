import Vue from 'vue'
import App from './App'
import router from './router'
import moment from 'moment'
import NProgress from 'nprogress'

import './assets/css/global.css'
import '../node_modules/nprogress/nprogress.css'

import axios from 'axios'
import comCrumb from './components/Share/Crumb.vue'

import './assets/fonts/iconfont.css'

import ELEMENT from 'element-ui'
Vue.use(ELEMENT)

Vue.component('com-crumb', comCrumb)

axios.defaults.baseURL = 'http://127.0.0.1:11333/api/private/v1/'

axios.interceptors.request.use(
  function(config) {
    NProgress.start()
    var token = window.sessionStorage.getItem('token')
    config.headers.Authorization = token
    return config
  },
  function(error) {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  function(response) {
    // 对响应数据做点什么
    // 结束动画

    NProgress.done()

    return response
  },
  function(error) {
    // 对响应错误做点什么
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
