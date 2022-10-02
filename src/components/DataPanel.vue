<template>
  <div class="info-panel-outer">
    <h1 class="title is-4">ID : {{ (data_panel.uid ? data_panel.uid : "Hover over a node") }}</h1>
    <div class="control">
      <input class="input is-hovered info-panel-item" type="text" placeholder="Name" :value="data_panel.name"
        @focus="pauseKeyDown" @blur="handleBlur('name', $event)" v-show="in_edit_mode" />
      <p id="rendered-name" v-show="!in_edit_mode">{{data_panel.name}}</p>
    </div>
    <div class="control" :style="{marginBottom: '5px'}">
      <input class="input is-hovered info-panel-item" type="text" placeholder="URL" :value="data_panel.link"
        @focus="pauseKeyDown" @blur="handleBlur('link', $event)" v-show="in_edit_mode" />
      <p id="rendered-link" v-show="!in_edit_mode">{{data_panel.link}}</p>
    </div>
    <div class="control">
      <a target="_blank" :href="data_panel.link">
        <button class="button is-dark">Open</button>
      </a>
      <text class="subtitle is-4 data-panel-item">{{ retrieval_status }}</text>
    </div>
    <div class="control" :style="{marginTop: '10px', marginBottom: '10px'}">
      <textarea class="textarea" rows="5" cols="50" placeholder="Description" :value="data_panel.description"
        @focus="pauseKeyDown" @blur="handleBlur('description', $event)" v-show="in_edit_mode"></textarea>
      <p id="rendered-description" v-show="!in_edit_mode" class="has-text-white">{{data_panel.description}}</p>
    </div>
    <button class="button" :class="{ 'is-success': in_edit_mode, 'is-info': !in_edit_mode }"
            @click="in_edit_mode = !in_edit_mode">{{ in_edit_mode ? "Save": "Edit"}}</button>

    <div class="info-panel-inner">
      <div></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.control{
  align-items: center;
  display: flex;
}
.data-panel-item {
  margin-inline: 0.2rem;
  color: white;
}

.info-panel-outer {
  background-color: green;

  h1 {
    color: white;
  }

  font-family: 'Noto Sans',
  sans-serif;
  padding: 1rem;
  border-bottom-left-radius: 25px;
}

.info-panel-item {
  margin: 0.1rem;
}

.hide {
  visibility: hidden !important;
}

.show {
  visibility: visible !important;
}
</style>

<script lang="ts">
import axios from "axios";
import { defineComponent, ref } from "vue";
import graphData from "../graphData";

const project_id: any = ref("");
const retrieval_status = ref("")
export default defineComponent({
  name: "DataPanel",
  setup() { },
  props: ["data_panel"],
  mounted() {
    axios.defaults.headers.common["X-User"] = this.$store.state.kratos_user_id;
    project_id.value = this.$route.params.id;
  },
  data() {
    return {
      in_edit_mode: false,
      retrieval_status: retrieval_status
    }
  },
  methods: {
    handleBlur: async function (property: string, e: any) {
      this.$emit("resumeKeyDown");
      const new_value = e.target.value;
      const resource_id = this.$props.data_panel.uid;
      if (!project_id.value) return;
      if (!resource_id) return;
      const request_url_pre =
        `${import.meta.env.VITE_API_URL}` +
        `/project/${project_id.value}` +
        `/resource/${resource_id}` +
        `/edit?`;
      var request_url_post = `${property}=${encodeURIComponent(new_value)}`;
      if (property == "link" && this.$props.data_panel.link != new_value) {
        const autofill_request_url =
          `${import.meta.env.VITE_AUTOFILL_URL}` + `/?url=${new_value}`;
        var name = "",
          link = "",
          description = "";
        try {
          retrieval_status.value = "Retrieving website info..."
          const response = await axios.get(autofill_request_url);
          name = response.data.title;
          link = response.data.url;
          description = response.data.summary;
        } catch (err) {
          name = `${new_value}`;
          link = new_value;
          description = `description for ${new_value}`;
        }
        const nameLengthLimit = 100;
        name =
          name.substring(0, nameLengthLimit) +
          (name.length > nameLengthLimit ? "..." : "");
        name = encodeURIComponent(name);
        link = encodeURIComponent(link);
        description = encodeURIComponent(description);
        request_url_post = `name=${name}&link=${link}&description=${description}`;
      }
      const requestLengthLimit = 4000;
      request_url_post =
        request_url_post.substring(0, requestLengthLimit) +
        (request_url_post.length > requestLengthLimit ? "..." : "");
      retrieval_status.value = "Saving..."
      axios.post(request_url_pre + request_url_post).then((response) => {
        console.log(response.data);
        graphData.nodes.value[`node${response.data.uid}`] = response.data;
        if (this.$props.data_panel.uid == response.data.uid) {
          this.$emit("updatedDataPanel");
        }
        retrieval_status.value = "Saved!"
        setTimeout(() => {
          retrieval_status.value = ""
        }, 1000)
      });
    },
    onInputPropertyName: function () { },
    onInputPropertyValue: function () { },
    onInputLabel: function () { },
    pauseKeyDown: function () {
      this.$emit("pauseKeyDown");
    },
  },
});
</script>
