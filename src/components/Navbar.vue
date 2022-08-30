<template>
  <nav class="navbar" id="control-panel">
    <div class="navbar-brand">
      <a class="navbar-item" href="#">
        TWIGSLOT
      </a>
      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="twig-main-nav">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="twig-main-nav" class="navbar-menu">
      <div class="navbar-start">
        <div class="navbar-item">
          <router-link :to="{path:'/explore'}">Explore</router-link>
        </div>
      </div>
      <div class="navbar-end">

        <div v-if="session" class="navbar-item">
          welcome back {{ session.identity.traits.email }}
        </div>
        <div class="navbar-item">
          <div class="buttons">

            <a v-if="!session" :href="authBasePath + '/login'">Login</a>
            <div v-if="session" class="navbar-item">
              <a :href="logoutUrl">Logout</a>
            </div>
            <div v-if="session" class="navbar-item">
              <a :href="authBasePath + '/settings'">Settings</a>
              <!-- <router-link :to="{ path: `/settings/${session.identity.id}` }">Settings</router-link> -->
            </div>
            <div v-if="session" class="navbar-item">
              <router-link :to="{ path: `/user/${session.identity.id}` }">Profile</router-link>
            </div>
          </div>
        </div>

        <div class="navbar-item">
          <a href="https://github.com/twigslot/twig-client" target="_blank">
            <font-awesome-icon icon="fa-brands fa-github"></font-awesome-icon>
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>
<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue'
import login from '../login'
const kratosBasePath = login.kratosBasePath;
const authBasePath = login.authBasePath;
const flaskBasePath = "http://localhost:5000"

const sdk = login.sdk;
var session: any = null;
var logoutUrl: string = '';


export default defineComponent({
  name: "Navbar",
  components: {

  },
  data() {
    return {
      session, flaskBasePath, kratosBasePath, authBasePath, logoutUrl
    }
  },
  mounted() {
    sdk.toSession().then(({ data }) => {
      this.session = data
      this.$store.state.kratos_user_id = data.identity.id
      axios.defaults.headers.common['X-User'] = this.$store.state.kratos_user_id
      sdk.createSelfServiceLogoutFlowUrlForBrowsers().then(({ data }) => {
        this.logoutUrl = data.logout_url
      })
    })
  }
})
</script>