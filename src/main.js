import 'element-ui/lib/theme-chalk/index.css';

import {Aside, Badge, Breadcrumb, BreadcrumbItem, Button, Card, Checkbox, Col, Collapse, CollapseItem, Container, DatePicker, Dialog, Dropdown, DropdownItem, DropdownMenu, Form, FormItem, Header, Icon, Input, Loading, Main, Menu, MenuItem, Message, MessageBox, Option, Pagination, Popover, Radio, RadioGroup, Row, Select, Step, Steps, Submenu, Switch, Table, TableColumn, TabPane, Tabs, Tag, Tooltip, Tree, Upload} from 'element-ui';
import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.prototype.$ELEMENT = {
  size: 'small',
  zIndex: 3000
};
Vue.use(Switch);
Vue.use(CollapseItem);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(DatePicker);
Vue.use(Upload);
Vue.use(Row);
Vue.use(Col);
Vue.use(Option);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Header);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Checkbox);
Vue.use(FormItem);
Vue.use(Collapse);
Vue.use(Popover);
Vue.use(Menu);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Dropdown);
Vue.use(Steps);
Vue.use(Step);
Vue.use(Tooltip);
Vue.use(Tree);
Vue.use(Pagination);
Vue.use(Badge);
Vue.use(Loading);
Vue.use(Button);
Vue.use(Input);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Dialog);
Vue.use(Card);
Vue.use(Container);
Vue.use(Icon);
Vue.use(Select);
Vue.use(Form);
Vue.use(Tag);
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm

import{postRequest} from './utils/api';
import {postKeyValueRequest} from './utils/api';
import {putRequest} from './utils/api';
import {deleteRequest} from './utils/api';
import {getRequest} from './utils/api';
import {initMenu} from './utils/menus';
import 'font-awesome/css/font-awesome.min.css'
import axios from 'axios';

Vue.prototype.postRequest = postRequest;
Vue.prototype.postKeyValueRequest = postKeyValueRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.getRequest = getRequest;

Vue.config.productionTip = false

router
    .beforeEach((to, from, next) => {
      if (to.path == '/') {
        next();
      } else {
        if (window.sessionStorage.getItem('user')) {
          initMenu(router, store);
          next();
        } else {
          next('/?redirect=' + to.path);
        }
      }
    })

        new Vue({router, store, render: h => h(App)})
    .$mount('#app')

// 添加请求拦截器
axios.interceptors.request.use(
    function(config) {
      // 在发送请求之前做些什么
      // 判断是否存在token,如果存在将每个页面header添加token
      if (sessionStorage.getItem('token')) {
        config.headers.common['Authorization'] =
            sessionStorage.getItem('token');
      }
      if (sessionStorage.getItem('cid')) {
        config.headers.common['X-Client-Id'] = sessionStorage.getItem('cid');
      }
      return config
    },
    function(error) {
      router.push('/login')
      return Promise.reject(error)
    })

// 添加响应拦截器
axios.interceptors.response.use(
    function(response) {
      if (response.headers) {
        // 从响应头中获取 'Token' 的值
        const token = response.headers['token'];
        sessionStorage.setItem('token', token);
      }
      return response
    },
    // function(error) {
    //   // 对响应错误做点什么
    //   if (error.response) {
    //     switch (error.response.status) {
    //       case 401:
    //         store.commit('del_token')
    //         router.push('/login')
    //     }
    //   }
    //   return Promise.reject(error)
    // }
)
