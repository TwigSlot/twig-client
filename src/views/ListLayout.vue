<template>
  <div class="list-layout">
    <ul>
      <li v-for="rsc in graphData.nodes" class="list-item" ref="nodes">
        <div v-if="!focus_resource_id || (focus_resource_id && rsc.uid == focus_resource_id)">
          <div class="list-sidebyside">
            <div class="list-editable">
              <div class="control">
                <h1 class="title is-4">ID : {{ rsc.uid }}</h1>
              </div>
              <div class="control" :style="{ marginTop: '10px', width: '90%' }">
                <input class="input is-hovered info-panel-item" type="text" placeholder="Name" :value="rsc.name"
                  :style="{ width: '80%' }" @focus="pauseKeyDown" @blur="handleBlur('name', $event, rsc)" />
                <a target="_blank" :href="rsc.link">
                  <button class="button is-dark info-panel-item">Open</button>
                </a>
              </div>
              <div class="control" :style="{ marginTop: '10px', width: '90%' }">
                <input class="input is-hovered info-panel-item" type="text" placeholder="URL" :value="rsc.link"
                  @focus="pauseKeyDown" @blur="handleBlur('link', $event, rsc)" />
              </div>
              <div class="control" :style="{ marginTop: '10px', width: '90%' }">
                <textarea class="textarea" rows="5" cols="50" placeholder="Description" :value="rsc.description"
                  @focus="pauseKeyDown" @blur="handleBlur('description', $event, rsc)"></textarea>
              </div>
            </div>
            <div class="list-markdown">
              <text>Incoming edges:</text>
              <ul>
                <li v-if="graphData.adjacency_list" v-for="towards in graphData.adjacency_list[rsc.uid]"
                  class="list-item">
                  <!-- <router-link :to="{ name: 'FocusListLayout', params: { id: project_id, resource_id: towards } }"
                  @click="forceReload(towards)"> -->
                  <a :href="'/project/' + project_id + '/list/' + towards">
                    {{ graphData.nodes['node' + towards].uid }} : {{ graphData.nodes['node' + towards].name }}
                  </a>
                  <!-- </router-link> -->
                </li>
              </ul>
              <div v-if="rsc.markdown_description">
                <katex-element :expression="rsc.markdown_description">
                  {{ rsc.markdown_description }}
                </katex-element>
              </div>
              <text> Outgoing edges: </text>
              <ul>
                <li v-if="graphData.adjacency_list_reverse" v-for="towards in graphData.adjacency_list_reverse[rsc.uid]"
                  class="list-item">
                  <!-- <router-link :to="{ name: 'FocusListLayout', params: { id: project_id, resource_id: towards } }"
                  @click="forceReload(towards)"> -->
                  <a :href="'/project/' + project_id + '/list/' + towards">
                    {{ graphData.nodes['node' + towards].uid }} : {{ graphData.nodes['node' + towards].name }}
                  </a>
                  <!-- </router-link> -->
                </li>
              </ul>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">

import axios from "axios";
import { defineComponent, ref } from "vue";
import graphData from "../graphData";
import { transferCheckedChangeFn } from "element-plus";

const project_id: any = ref("");
const focus_resource_id: any = ref("");
function add_node(raw: any) {
  if (!('color' in raw)) raw.color = 'blue'
  if (!('size' in raw)) raw.size = 20
  else raw.size = parseInt(raw.size)
  graphData.nodes.value[`node${raw.uid}`] = raw
  if ('pos_x' in raw && 'pos_y' in raw) {
    graphData.layouts.value.nodes[`node${raw.uid}`] = {
      'x': raw['pos_x'],
      'y': raw['pos_y']
    }
  }
}
function add_edge(s: string, t: string, uid: any) {
  graphData.edges.value[uid] =
  {
    source: s,
    target: t,
    uid: uid
  }
}

function add_edge_raw(raw: any) {
  add_edge(`node${raw[0]}`, `node${raw[2]}`, raw[1].uid)
}
function populate_adjacency_list() {
  console.log(graphData.edges.value)
  for (const edge of Object.values(graphData.edges.value)) {
    var source_id = edge.source.replace('node', '')
    var target_id = edge.target.replace('node', '')
    if (!(source_id in graphData.adjacency_list)) {
      graphData.adjacency_list[source_id] = []
    }
    if (!(target_id in graphData.adjacency_list_reverse)) {
      graphData.adjacency_list_reverse[target_id] = []
    }
    graphData.adjacency_list[source_id].push(target_id)
    graphData.adjacency_list_reverse[target_id].push(source_id)
  }
}
function render_markdown(text: string) {
  var lines = text.split('\n\n')
  // for each line, turn the things that are not math into \text{...}
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var new_line = '\\text{'
    var in_math = false
    for (var j = 0; j < line.length; j++) {
      var char = line[j]
      if (char == '$') {
        if (in_math) {
          new_line += '\\text{'
        } else {
          new_line += '}'
        }
        in_math = !in_math
      } else {
        new_line += char
      }
    }
    if (!in_math) {
      new_line += '}'
    }
    lines[i] = new_line
  }
  return lines.join('\\\\')
}
function get_items() {
  const request_url = import.meta.env.VITE_API_URL + `/project/${project_id.value}`
  axios
    .get(request_url)
    .then(response => {
      console.log(response.data)
      graphData.nodes.value = {}
      graphData.edges.value = {}
      graphData.adjacency_list = {}
      graphData.adjacency_list_reverse = {}
      var edge_queue: Array<Object> = []
      for (const item of response.data.items) {
        if (item instanceof Array) {
          // only propagate edge info afer all node info has been done
          // this is because edge info depends on node_uid_name_mapping
          edge_queue.push(item)
        } else {
          add_node(item)
        }
      }
      for (const item of edge_queue) {
        add_edge_raw(item)
      }
      for (const node of Object.values(graphData.nodes.value)) {
        node.markdown_description = render_markdown(node.description)
      }
      populate_adjacency_list()
    })
}
export default defineComponent({
  name: "ListLayout",
  data() {
    return {
      graphData,
      project_id,
      focus_resource_id
    };
  },
  methods: {
    get_items,

    pauseKeyDown: function () {
      this.$emit("pauseKeyDown");
    },
    handleBlur: async function (property: string, e: any, resource: any) {
      this.$emit("resumeKeyDown");
      const new_value = e.target.value;
      const resource_id = resource.uid;
      if (!project_id.value) return;
      if (!resource_id) return;
      const request_url_pre =
        `${import.meta.env.VITE_API_URL}` +
        `/project/${project_id.value}` +
        `/resource/${resource_id}` +
        `/edit?`;
      var request_url_post = `${property}=${encodeURIComponent(new_value)}`;
      graphData.nodes.value[`node${resource_id}`].markdown_description = '';
      axios.post(request_url_pre + request_url_post).then((response) => {
        graphData.nodes.value[`node${response.data.uid}`] = response.data;
        graphData.nodes.value[`node${response.data.uid}`].markdown_description = render_markdown(response.data.description);
      }).catch((err) => {
        alert(err)
      })
    },
    // forceReload: function (towards: any) {
    //   focus_resource_id.value = towards
    // }
  },
  mounted() {
    axios.defaults.headers.common['X-User'] = this.$store.state.kratos_user_id
    project_id.value = this.$route.params.id
    focus_resource_id.value = this.$route.params.resource_id 
    this.$store.commit('update_project_id', project_id.value)
    get_items()
  },
  beforeUnmount() {
    // so that the next time we open the graph,
    // there won't be a flicker from the old graph data
    graphData.nodes.value = {}
    graphData.edges.value = {}
  }
});
</script>