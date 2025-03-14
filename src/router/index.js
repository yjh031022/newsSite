import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home/home.vue'
import Category from '../views/category/category.vue'
import NewsDetail from '../views/NewsDetail/newsDetail.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: Category
  },
  {
    path: '/news-detail/:id',
    name: 'NewsDetail',
    component: NewsDetail
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About/About.vue')
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/ArticleList/ArticleList.vue')
  },
  {
    path: '/range',
    name: 'Range',
    component: () => import('../views/range/range.vue')
  },
  {
    path: '/newsType',
    name: 'NewsType',
    component: () => import('../views/newsType/newsType.vue')
  }


//   {
//     path: '*',
//     name: 'NotFound',
//     component: () => import('../views/NotFound.vue')
//   }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
