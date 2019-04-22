import Vue from 'vue'
import App from './App'
import router from './router'

import './assets/css/global.css'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
