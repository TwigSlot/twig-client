<template>
  <div class="main-container">
    <div class="buttons">
      <button class="button is-primary is-light" @click="add_project">
        Add Project
      </button>
      <button v-if="connection_status != 'connected'" class="button is-primary is-danger" @click="reconnect">
        Failed to Connect! Click to retry
      </button>
    </div>

    <table
      class="table is-bordered is-fullwidth"
      aria-describedby="project-table"
    >
      <thead>
        <tr>
          <th><abbr title="project-name">Project</abbr></th>
          <th><abbr title="description">Description</abbr></th>
          <th><abbr title="owner">Owner</abbr></th>
          <th><abbr title="edit">Edit</abbr></th>
        </tr>
      </thead>
      <tbody v-for="project in showcased_projects" >
        <td>
          <a :href="'/project/' + `${project.project.uid}`">{{
            project.project.name
          }}</a>
        </td>
        <td>
          {{ project.project.description }}
        </td>
        <td>
          <a :href="'/user/' + `${project.owner}`">{{ project.owner }}</a>
        </td>
        <td
          v-if="
            project.owner == $store.state.kratos_user_id ||
            connection_status != 'connected'
          "
        >
          <div class="button-container">
            <div class="float-child">
              <button
                class="button is-primary is-light is-small is-pulled-left"
                v-if="
                  project.owner == $store.state.kratos_user_id ||
                  connection_status != 'connected'
                "
                @click="edit_project(project.project.uid)"
              >
                Edit
              </button>
            </div>
            <div class="float-child">
              <button
                class="button is-primary is-light is-small is-pulled-left"
                v-if="project.owner == $store.state.kratos_user_id"
                @click="delete_project(project.project.uid)"
              >
                Delete
              </button>
            </div>
          </div>
        </td>
        <td v-else></td>

      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  margin: 20px !important;
}

.button-container {
  display: flex;
}

.float-child {
  flex: 1;
}

.float-child:first-child {
  margin-right: 10px;
}
</style>

<script lang="ts">
import axios from "axios";
import { defineComponent, ref } from "vue";

const kratos_user_id: any = ref("");
const username = ref("");
const showcased_projects: any = ref([]);
const connection_status: any = ref("connecting...");

export default defineComponent({
  name: "ProjectList",
  props: ["explore"],
  data() {
    return {
      showcased_projects,
      kratos_user_id,
      username,
      connection_status,
    };
  },
  methods: {
    reconnect: function(){
      this.get_projects()
    },
    add_project: function () {
      const request_url =
        `${import.meta.env.VITE_API_URL}` +
        `/project/new` +
        `?user=${kratos_user_id.value}`;
      axios.put(request_url).then((response) => {
        showcased_projects.value.unshift(response.data);
      });
    },
    delete_project: function (project_id: any) {
      const request_url =
        `${import.meta.env.VITE_API_URL}` +
        `/project/${project_id}` +
        `/delete`;
      axios.post(request_url).then((response) => {
        showcased_projects.value = showcased_projects.value.filter(
          (ele: any) => ele.project.uid != project_id
        );
      });
    },
    edit_project: function (project_id: any) {
      this.$router.push("/project-edit/" + project_id);
    },
    get_projects: function () {
      var request_url = "";
      if (this.$props.explore) {
        request_url = `${import.meta.env.VITE_API_URL}` + `/explore`;
      } else {
        request_url =
          `${import.meta.env.VITE_API_URL}` + `/user/${kratos_user_id.value}`;
      }
      axios
        .get(request_url)
        .then((response) => {
          showcased_projects.value = response.data.projects;
          if (!this.$props.explore) {
            kratos_user_id.value = response.data.user.kratos_user_id;
            username.value = response.data.user.username;
          }
          connection_status.value = "connected";
        })
        .catch((err) => {
          connection_status.value = "failed to connect, err = " + err;
          showcased_projects.value = [
            {
              owner: "fake owner 1",
              project: {
                uid: 1,
                name: "dummy project 1",
                description: "dummy description 1",
              },
            },
          ];
        });
    },
  },
  mounted() {
    kratos_user_id.value = this.$route.params.id;
    axios.defaults.headers.common["X-User"] = this.$store.state.kratos_user_id;
    this.get_projects();
  },
  watch: {
    "$route.params.id": {
      handler() {
        if (!this.$route.params.id) return;
        kratos_user_id.value = this.$route.params.id;
        axios.defaults.headers.common["X-User"] =
          this.$store.state.kratos_user_id;
        this.get_projects();
      },
    },
  },
});
</script>
