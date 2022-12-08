<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/"> TWIGSLOT </a>

      <a class="navbar-item" :style="{ marginLeft: '10px' }" @click="toggleLayout">
        <text v-if="this.$store.state.layout == 0"> Graph </text>
        <text v-if="this.$store.state.layout == 1"> List </text>
      </a>
      <a class="navbar-item" :style="{ marginLeft: '10px' }" @click="toggleInfo"
         v-if="this.$store.state.mobileView && this.$store.state.layout == 0"
      >
        <text v-if="this.$store.state.showInfo"> Show Info </text>
        <text v-else> Hide Info </text>
      </a>
      <a class="navbar-item" @click="toggleView" >
        <text v-if="this.$store.state.mobileView"> Mobile View </text>
        <text v-else> Desktop View </text>
      </a>
      <a
          role="button"
          class="navbar-burger"
          data-target="navMenu"
          aria-label="menu"
          aria-expanded="false"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <NavBurger>
      <div class="navbar-start">
        <a class="navbar-item" href="/explore" :style="{ marginLeft: '10px' }">
          Explore
        </a>
      </div>
      <div class="navbar-end">
        <div v-if="session" class="navbar-item">
          Welcome back {{ session.identity.traits.email }}
        </div>
        <div class="navbar-item">
          <div class="navbar-item">
            <a
                v-if="!session"
                class="navbar-item"
                :style="{ padding: 0 }"
                :href="authBasePath + '/login'"
            >
              Login
            </a>
            <a
                v-if="session"
                class="navbar-item"
                :href="logoutUrl"
                @click="logout"
            >
              Logout
            </a>
            <a
                v-if="session"
                class="navbar-item"
                :href="authBasePath + '/settings'"
            >
              Settings
            </a>
            <a
                v-if="session"
                class="navbar-item"
                :href="'/user/' + `${session.identity.id}`"
            >
              Profile
            </a>
            <a
                href="https://github.com/twigslot"
                :style="{ marginLeft: '20px' }"
            >
              <font-awesome-icon
                  icon="fa-brands fa-github"
                  class="icon"
              ></font-awesome-icon>
            </a>
          </div>
        </div>
      </div>
    </NavBurger>
  </nav>
</template>

<style lang="scss" scoped>
.icon {
  margin-top: 10px;
}

.list-item {
  padding-top: 10px;
}

nav {
  font-family: "Noto Sans", sans-serif;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import login from "../login";
import NavBurger from "./NavBurger.vue";

const kratosBasePath = login.kratosBasePath;
const authBasePath = login.authBasePath;
const flaskBasePath = "http://localhost:5000";
const sdk = login.sdk;
const session: any = null;
const logoutUrl: string = "";

export default defineComponent({
  name: "Navbar",
  components: {
    NavBurger,
  },
  methods: {
    logout: function () {
      this.$store.commit("update_kratos_user_id", "guest");
    },
    toggleView: function() {
      this.$store.commit("toggle_view" );
    },
    toggleLayout: function(){
      this.$store.commit("toggle_layout")
    },
    toggleInfo: function(){
      this.$store.commit("toggle_info")
    }

  },
  data() {
    return {
      session,
      flaskBasePath,
      kratosBasePath,
      authBasePath,
      logoutUrl,
    };
  },
  mounted() {
    sdk.toSession().then(({ data }) => {
      this.session = data;
      this.$store.commit("update_kratos_user_id", data.identity.id);
      sdk.createSelfServiceLogoutFlowUrlForBrowsers().then(({ data }) => {
        this.logoutUrl = data.logout_url;
      });
    });
  },
});
</script>
