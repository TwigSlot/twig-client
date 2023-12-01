<template>
  <div class="info-panel-outer" v-if="!this.$store.state.showInfo">
    <h1 class="title is-4">ID : {{ (data_panel.uid ? data_panel.uid : "Hover over a node") }}</h1>
    <div class="control">
      <input class="input is-hovered info-panel-item" type="text" placeholder="Name" :value="data_panel.name"
        @focus="pauseKeyDown" @blur="handleBlur('name', $event)" 
        :disabled="this.$store.state.kratos_user_id == 'guest'"/>
    </div>
    <div class="control" :style="{marginBottom: '5px'}">
      <input class="input is-hovered info-panel-item" type="text" placeholder="URL" :value="data_panel.link"
        @focus="pauseKeyDown" @blur="handleBlur('link', $event)" 
        :disabled="this.$store.state.kratos_user_id == 'guest'"/>
    </div>
    <div class="control">
      <a target="_blank" :href="data_panel.link">
        <button class="button is-dark info-panel-item">Open</button>
      </a>
      <button v-if="!this.$store.state.mobileView" @click="hide_description = !hide_description" class="button info-panel-item">{{ hide_description ? "Show"
      : "Hide"}} description</button>
      <text class="subtitle is-4 data-panel-item">{{ retrieval_status }}</text>
    </div>
    <div class="control" :style="{marginTop: '10px'}" v-if="!hide_description">
      <textarea class="textarea" rows="5" cols="50" placeholder="Description" :value="data_panel.description"
        @focus="pauseKeyDown" @blur="handleBlur('description', $event)"
        :disabled="this.$store.state.kratos_user_id == 'guest'"></textarea>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control {
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
</style>

<script lang="ts">
import axios from "axios";
import { defineComponent, ref } from "vue";
import graphData from "../graphData";

const project_id: any = ref("");
const retrieval_status = ref("")
const hide_description = ref(true);
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
      retrieval_status,
      hide_description
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
          description = this.$props.data_panel.description;
        try {
          retrieval_status.value = "Retrieving website info..."
          const response = await axios.get(autofill_request_url);
          name = response.data.title;
          link = response.data.url;
          description += response.data.summary;
        } catch (err) {
          name = `${new_value}`;
          link = new_value;
          description += `\n\ndescription for ${new_value}`;
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
      this.$emit('add_log', 'DataPanel', 'saving data panel...')
      axios.post(request_url_pre + request_url_post).then((response) => {
        console.log(response.data);
        graphData.nodes.value[`node${response.data.uid}`] = response.data;
        if (this.$props.data_panel.uid == response.data.uid) {
          this.$emit("updatedDataPanel");
        }
        retrieval_status.value = "Saved!"
        this.$emit('add_log', 'DataPanel', 'saved')
        setTimeout(() => {
          retrieval_status.value = ""
        }, 1000)
      }).catch((err) => {
        console.log(err);
        retrieval_status.value = "Error!"
        this.$emit('add_log', 'DataPanel', 'error')
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
