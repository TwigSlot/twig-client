<template>
  <div class="list-layout">
    <ul>
      <li v-for="rsc in graphData.nodes" class="list-item">
        <div class="control">
          <h1 class="title is-4">ID : {{ rsc.uid }}</h1>
        </div>
        <div class="control" :style="{marginTop: '10px', width: '90%' }">
          <input class="input is-hovered info-panel-item" type="text" placeholder="Name" :value="rsc.name"
           :style="{width: '80%'}"/>
          <a target="_blank" :href="rsc.link">
            <button class="button is-dark info-panel-item">Open</button>
          </a>
        </div>
        <div class="control" :style="{marginTop: '10px', width: '90%' }">
          <input class="input is-hovered info-panel-item" type="text" placeholder="URL" :value="rsc.link" />
        </div>
        <div class="control" :style="{marginTop: '10px', width: '90%' }">
          <textarea class="textarea" rows="5" cols="50" placeholder="Description" :value="rsc.description"></textarea>
        </div>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">

import axios from "axios";
import { defineComponent, ref } from "vue";
import graphData from "../graphData";

const project_id: any = ref("");
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


function get_items() {
  const request_url = import.meta.env.VITE_API_URL + `/project/${project_id.value}`
  axios
      .get(request_url)
      .then(response => {
        graphData.nodes.value = {}
        graphData.edges.value = {}
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
      })
}
export default defineComponent({
  name: "ListLayout",
  data() {
    return {
      graphData,
      project_id
    };
  },
  methods: {
    get_items,
  },
  mounted() {
    axios.defaults.headers.common['X-User'] = this.$store.state.kratos_user_id
    project_id.value = this.$route.params.id
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