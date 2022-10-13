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
    <el-table
      :data="querySearch(showcased_projects, search)"
      style="width: 100%"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :label="column.label"
        :prop="column.prop"
        :formatter="column.formatter"
        :min-width="column.minWidth"
      >
        <template v-slot="scope" v-if="column.prop === 'project_name'">
          <a :href="'/project/' + `${scope.row.project.uid}`">{{
            scope.row.project.name
          }}</a>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations">
        <template #header>
          <el-input
            v-model="search"
            size="small"
            placeholder="Type to search"
          />
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
            type="danger"
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
const search = ref("");
const table = ref("");
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
      search,
      table,
      columns: [
        {
          prop: "project_name",
          label: "Project",
        },
        {
          prop: "project.description",
          label: "Description",
          minWidth: "150px",
        },
        {
          prop: "owner",
          label: "Owner",
          formatter: (row: any) => {
            return `${row.owner.first_name} ${row.owner.last_name}`;
          },
        },
      ],
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
          ];
          links.value = showcased_projects.value;
        });
    },
    onLoadSearch: function () {},
    querySearch: function (datatable: any, queryString: string) {
      return datatable.filter(
        (data: any) =>
          !queryString ||
          data.project.name.toLowerCase().includes(queryString.toLowerCase()) ||
          data.project.description
            .toLowerCase()
            .includes(queryString.toLowerCase())
      );
    },
    handleSelect: function (item: ILinkItem) {
      showcased_projects.value = [item];
    }
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
