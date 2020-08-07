import Vue from 'vue'
import App from './App.vue'
import vantUI from 'vant-ui'

Vue.config.productionTip = false

Vue.use(vantUI)

new Vue({
  render: h => h(App),
}).$mount('#app')
