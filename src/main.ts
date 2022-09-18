import { createApp } from "vue"
import VNetworkGraph from "v-network-graph"
import "v-network-graph/lib/style.css"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import App from "./App.vue"
import router from "./router"
import 'bulma/css/bulma.css'
import store from './store'

library.add(faGithub)

const app = createApp(App)
app.use(VNetworkGraph)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.use(ElementPlus)
app.use(store)
app.mount("#app")