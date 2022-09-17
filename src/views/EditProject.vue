<template>
  <div class="main-container">
    <h1 class="title is-3">Project ID: {{ project.id }}</h1>

    <div class="control">
      <input
        class="input is-hovered"
        type="text"
        placeholder="Project Name"
        @blur="handleBlur('name', $event)"
        :value="project.name"
      />
    </div>
    <div class="control">
      <textarea
        class="textarea"
        :placeholder="project.description"
        :value="project.description"
        @blur="handleBlur('description', $event)"
      ></textarea>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  margin: 20px !important;
}
</style>

<script lang="ts">
import axios from "axios";
import { defineComponent, ref } from "vue";
const project: any = ref({ id: 0, name: "Loading...", description: "" });
export default defineComponent({
  name: "EditProject",
  setup() {},
  data() {
    return {
      project,
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
    project.id = this.$route.params.id;
    const request_url =
      `${import.meta.env.VITE_API_URL}` +
      `/project/${project.id}` +
      `?list_items=0`;
    axios.defaults.headers.common["X-User"] = this.$store.state.kratos_user_id;
    axios.get(request_url).then((response) => {
      project.value = response.data.project;
      project.value.id = response.data.project.uid;
    });
  },
});
</script>
