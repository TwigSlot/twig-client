<template>
    <div id="graph">
        <v-network-graph ref="graph" v-model:selected-nodes="graphData.selectedNodes"
            v-model:selected-edges="graphData.selectedEdges" :nodes="graphData.nodes" :edges="graphData.edges"
            :layouts="graphData.layouts" :configs="graphData.configs" :event-handlers="graphData.eventHandlers" />
    </div>
    <div class="info-panel-outer">
        <div class="info-panel-inner">
            <div v-if="dataPanel.get('labels')" v-bind:id="dataPanel.get('id')" 
                class="info-panel-inner-details-id">
                <h3>Properties</h3>
                <ul>
                    <li v-for="(label, index) in dataPanel.get('labels')" :key="index" 
                        contenteditable="true"
                        v-on:blur="onInputLabel">
                        {{ label }}</li>
                    <li v-if="dataPanel.get('objType') == 'Node'">
                        <input type='button' value='Add Label'
                            onclick='document.addLabel()' />
                    </li>
                </ul>
                <table>
                    <tr>
                        <th>&lt;id&gt;</th>
                        <th>{{ dataPanel.get('id') }}</th>
                    </tr>
                    <!-- <p>{{dataPanel.properties}}</p> -->
                    <tr v-for="(value, property) in dataPanel.get('properties')" 
                        :key="value">
                        <th contenteditable="true" v-on:blur="onInputPropertyName">
                            {{ property }}
                        </th>
                        <th v-bind:id="'valueOf' + property" contenteditable="true" 
                            v-on:blur="onInputPropertyValue">
                            {{ value }}
                        </th>
                    </tr>
                    <tr>
                        <input type="button" value="Add Property" 
                            onclick="document.addProperty()" />
                    </tr>
                </table>
            </div>
            <div v-else-if="dataPanel.get('objType')">
                Creating 
                {{ dataPanel.get('objType') }} 
                in Neo4J... Hover over node again later to check
            </div>
            <div v-else>Hover over a node/edge to check it out</div>
        </div>
    </div>
</template>
<script lang="ts">
import axios from "axios";
import { Node, Edge } from "v-network-graph";
import { defineComponent, reactive, ref } from "vue";
import graphData from "../graphData"
var dataPanel = reactive(new Map<string, any>());
dataPanel.set('labels', [])
dataPanel.set('id', '123')
dataPanel.set('properties', [])
dataPanel.set('objType', [])

const project_id: any = ref("");
const node_uid_name_mapping: any = {}
var loaded_nodes: any = {}
var loaded_edges: any = {}
function add_node(raw: any) {
    const num_nodes = Object.keys(loaded_nodes).length;
    const node_name = `node${num_nodes + 1}`
    loaded_nodes[node_name] = { name: raw.title, description: raw.description, uid: raw.uid }
    node_uid_name_mapping[raw.uid] = node_name
}
function add_edge(raw: any) {
    const num_edges = Object.keys(loaded_edges).length;
    loaded_edges[`edge${num_edges + 1}`] =
    {
        source: node_uid_name_mapping[raw[0]],
        target: node_uid_name_mapping[raw[2]],
        uid: raw[1].uid
    }
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
            graphData.nodes.value = loaded_nodes
            graphData.edges.value = loaded_edges
        })
}

export default defineComponent({
    name: "Graph",
    data() {
        return {
            project_id,
            graphData,
            dataPanel,
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
        this.$forceUpdate();
    },
    beforeUnmount() {
        // so that the next time we open the graph,
        // there won't be a flicker from the old graph data
        graphData.nodes.value = {}
        graphData.edges.value = {}
    }
})
</script>