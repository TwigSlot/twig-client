<template>
  <div class="main-container">
    <div class="prev-page">
      <el-button-group>
        <el-button type="primary" :icon="ArrowLeft" @click="$router.go(-1)"
          >Previous Page</el-button
        >
      </el-button-group>
    </div>

    <h1 class="title is-3 has-text-centered">
      Project ID: <span class="is-family-monospace">{{ project.id }}</span>
    </h1>

    <div class="control" :style="{ paddingBottom: '30px' }">
      <el-input
        v-model="project.name"
        size="large"
        placeholder="Project Name"
        @blur="handleBlur('name', $event)"
      />
    </div>
    <div class="control">
      <el-input
        v-model="project.description"
        :autosize="{ minRows: 2, maxRows: 10 }"
        type="textarea"
        :placeholder="project.description"
        @blur="handleBlur('description', $event)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  margin: 20px !important;
  font-family: "Noto Sans", sans-serif;
}

.prev-page {
  margin-bottom: 30px;
}
</style>

<script lang="ts">
import axios from "axios";
import { defineComponent, ref } from "vue";
import { ArrowLeft } from "@element-plus/icons-vue";

const project: any = ref({ id: 0, name: "Loading...", description: "" });



export default defineComponent({
  name: "EditProject",
  setup() {
  },
  data() {
    return {
      project,
      ArrowLeft,
    };
  },
  methods: {
    handleBlur: function (property: string, e: any) {
      const new_value = e.target.value;
      const request_url =
        `${import.meta.env.VITE_API_URL}` +
        `/project/${project.id}` +
        `/edit?${property}=${new_value}`;
      console.log(request_url);
      axios.post(request_url).then((response) => {
        project.value = response.data;
        project.value.id = response.data.uid;
      });
    },
  },
  mounted() {
    project.id = this.$route.query.id;
    const request_url =
      `${import.meta.env.VITE_API_URL}` +
      `/project/${project.id}` +
      `?list_items=0`;
    axios.defaults.headers.common["X-User"] = this.$store.state.kratos_user_id;
    axios.get(request_url).then((response) => {
      project.value = response.data.project;
      project.value.id = response.data.project.uid;
    });
  }
});
</script>
