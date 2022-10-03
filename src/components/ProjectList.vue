<template>
  <div class="main-container">
    <div class="buttons">
      <button class="button is-primary is-light" @click="add_project">
        Add Project
      </button>
      <button
        v-if="connection_status != 'connected'"
        class="button is-primary is-danger"
        @click="reconnect"
      >
        Failed to Connect! Click to retry
      </button>
    </div>

    <el-table :data="showcased_projects" style="width: 100%">
      <el-table-column fixed prop="project.name" label="Project" />
      <el-table-column prop="project.description" label="Description" />
      <el-table-column prop="owner" label="Owner" />
      <el-table-column fixed="right" label="Operations">
        <template #header>
          <el-autocomplete
            clearable
            v-model="state"
            :fetch-suggestions="querySearch"
            popper-class="my-autocomplete"
            placeholder="Please input"
            @select="handleSelect"
          >
            <template #default="{ item }">
              <div class="value">{{ item.owner }}</div>
              <span class="link">{{ item.project.description }}</span>
            </template>
          </el-autocomplete>
        </template>
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="small"
            @click="edit_project(scope.$index, scope.row)"
            >Edit</el-button
          >
          <el-button
            link
            type="primary"
            size="small"
            @click="delete_project(scope.$index, scope.row)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  margin: 20px !important;
  font-family: "Noto Sans", sans-serif;
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

.my-autocomplete li {
  line-height: normal;
  padding: 7px;
}
.my-autocomplete li .name {
  text-overflow: ellipsis;
  overflow: hidden;
}
.my-autocomplete li .addr {
  font-size: 12px;
  color: #b4b4b4;
}
.my-autocomplete li .highlighted .addr {
  color: blue;
}
</style>

<script lang="ts">
import axios from "axios";
import { defineComponent, onMounted, ref } from "vue";

const kratos_user_id: any = ref("");
const username = ref("");
const showcased_projects: any = ref([]);
const connection_status: any = ref("connecting...");
const state = ref("");
const links = ref<ILinkItem[]>([]);

interface ILinkItem {
  owner: string;
  projects: {
    uid: number;
    name: string;
    description: string;
  }[];
}

export default defineComponent({
  name: "ProjectList",
  props: ["explore"],
  data() {
    return {
      showcased_projects,
      kratos_user_id,
      username,
      connection_status,
      state,
    };
  },
  methods: {
    reconnect: function () {
      this.get_projects();
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
    delete_project: function (index: number, row: any) {
      if (
        !window.confirm(
          `Do you really want to delete project ${row.project.uid}`
        )
      )
        return;
      const request_url =
        `${import.meta.env.VITE_API_URL}` +
        `/project/${row.project.uid}` +
        `/delete`;
      axios.post(request_url).then((response) => {
        showcased_projects.value = showcased_projects.value.filter(
          (ele: any) => ele.project.uid != row.project.uid
        );
      });
    },
    edit_project: function (index: number, row: any) {
      this.$router.push({
        path: "/project-edit/",
        query: { id: row.project.uid },
      });
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
            {
              owner: "fake owner 2",
              project: {
                uid: 1,
                name: "dummy project 2",
                description: "dummy description 2",
              },
            },
          ];
          links.value = showcased_projects.value;
        });
    },
    onLoadSearch: function () {},
    querySearch: function (queryString: string, cb: Function) {
      const results = queryString
        ? links.value.filter(this.createFilter(queryString))
        : links.value;
      cb(results);
    },
    createFilter: function (queryString: string) {
      return (res: any) => {
        const { description, name } = res.project;
        const owner = res.owner;
        return (
          name.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
          description.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
          owner.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    handleSelect: function (item: ILinkItem) {
      showcased_projects.value = [item];
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
  computed: {
    console: () => console,
    window: () => window,
  },
});
</script>
