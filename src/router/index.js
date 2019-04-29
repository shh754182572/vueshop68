import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import User from '@/components/User'
import Right from '@/components/Right'
import Role from '@/components/Role'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: User },
        { path: '/rights', component: Right },
        { path: '/roles', component: Role }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  var token = window.sessionStorage.getItem('token')

  if (token === null && to.path !== '/login') {
    return next('/login')
  }
  next()
})

export default router
