<template>
    <div id="graph">
        <v-network-graph ref="graph" v-model:selected-nodes="graphData.selectedNodes"
            v-model:selected-edges="graphData.selectedEdges" :nodes="graphData.nodes" :edges="graphData.edges"
            :layouts="graphData.layouts" :configs="graphData.configs" :event-handlers="eventHandlers" />
    </div>
    <DataPanelVue :data_panel="dataPanel"></DataPanelVue>
</template>
<script lang="ts">
import axios from "axios";
import DataPanelVue from "../components/DataPanel.vue";
import { defineComponent, reactive, ref } from "vue";
import graphData from "../graphData"
import { EventHandlers } from "v-network-graph";
var dataPanel : any = ref({});

const project_id: any = ref("");
var loaded_nodes: any = {}
var loaded_edges: any = {}

function add_node(raw: any) {
    loaded_nodes[`node${raw.uid}`] = raw 
}
function add_edge(raw: any) {
    loaded_edges[raw[1].uid] =
    {
        source: `node${raw[0]}`,
        target: `node${raw[2]}`,
        uid: raw[1].uid
    }
}
function update_graph(){
    console.log(loaded_nodes, loaded_edges)
    graphData.nodes.value = {} // buggy
    graphData.edges.value = {}
    graphData.nodes.value = loaded_nodes
    graphData.edges.value = loaded_edges
    console.log(graphData.nodes.value, graphData.edges.value)
}
function get_items() {
    axios
        .get(import.meta.env.VITE_API_URL + `/project/${project_id.value}`)
        .then(response => {
            loaded_nodes = {}
            loaded_edges = {}
            console.log(response.data)
            var edge_queue: Array<Object> = []
            for (const item of response.data) {
                if (item instanceof Array) {
                    // only propagate edge info afer all node info has been done
                    // this is because edge info depends on node_uid_name_mapping 
                    edge_queue.push(item) 
                } else {
                    add_node(item)
                }
            }
            for (const item of edge_queue) {
                add_edge(item)
            }
            console.log(loaded_nodes, loaded_edges)
            // batch loading (saves time + prevents some refreshing bugs)
            update_graph()
        })
}
const eventHandlers: EventHandlers = {
  // wildcard: capture all events
  "*": (type, event) => {
    console.log(type, event)
    if(type == 'node:pointerover'){
        dataPanel.value = graphData.nodes.value[event.node]
    }else if(type == 'view:click'){
        const query_url = `${import.meta.env.VITE_API_URL}`+
                        `/project/${project_id.value}`+
                        `/new?item=node`
        axios
            .post(query_url)
            .then(response => {
                console.log(response.data)
                add_node(response.data)
                update_graph();
            })
    }
  },
}
export default defineComponent({
    name: "Graph",
    components: {
        DataPanelVue
    },
    data() {
        return {
            project_id,
            graphData,
            dataPanel,
            eventHandlers,
        }
    },
    methods: {
        onInputPropertyName: function () {

        },
        onInputPropertyValue: function () {

        },
        onInputLabel: function () {

        },
        get_items
    },
    mounted() {
        project_id.value = this.$route.params.id
        get_items()
        this.$forceUpdate()
    },
    beforeUnmount() {
        // so that the next time we open the graph,
        // there won't be a flicker from the old graph data
        graphData.nodes.value = {}
        graphData.edges.value = {}
    },
})
</script>