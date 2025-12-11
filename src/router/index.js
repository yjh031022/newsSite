import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home/home.vue'
import Category from '../views/category/category.vue'
import NewsDetail from '../views/NewsDetail/newsDetail.vue'
import UserInfo from '@/views/personal center/userinfo.vue'
import Subscribe from '@/views/subscribe/subscribe.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/like.html')
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    // meta: { requiresAuth: true }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: Category,
    // meta: { requiresAuth: true }
  },
  {
    path: '/news-detail/:id',
    name: 'NewsDetail',
    component: NewsDetail,
    // meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register.vue')
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import('../views/About/About.vue'),
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/ArticleList/ArticleList.vue'),
    // meta: { requiresAuth: true }
  },
  // {
  //   path: '/range',
  //   name: 'Range',
  //   component: () => import('../views/range/range.vue'),
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/newsType',
    name: 'NewsType',
    component: () => import('../views/newsType/newsType.vue'),
    // meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserInfo',
    component: UserInfo,
    // meta: { requiresAuth: true }
  },
  {
    path: '/subscribe',
    name: 'Subscribe',
    component: Subscribe,
    // meta: { requiresAuth: true }
  },
  // 404 页面（可选）
  {
    path: '*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null; // 检查是否已登录

  // 如果目标路由需要登录且用户未登录，则重定向至登录页并保存原路径
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      // query: { redirect: to.fullPath } // 保存跳转来源
    });
  } else {
    // 对于其他情况，直接放行
    next();
  }
});







export default router
