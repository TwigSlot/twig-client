import { createApp } from "vue"
import VNetworkGraph from "v-network-graph"
import "v-network-graph/lib/style.css"

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import App from "./App.vue"
import router from "./router"
import 'bulma/css/bulma.css'

library.add(faGithub)

const app = createApp(App)
app.use(VNetworkGraph)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount("#app")