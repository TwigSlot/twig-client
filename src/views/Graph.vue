<template>
    <div id="graph">
        <v-network-graph ref="graphRef" v-model:selected-nodes="graphData.selectedNodes"
            v-model:selected-edges="graphData.selectedEdges" :nodes="graphData.nodes"
            :edges="graphData.edges" :layouts="graphData.layouts"
            :configs="graphData.configs" :event-handlers="eventHandlers" />
    </div>
    <DataPanelVue :data_panel="dataPanel"></DataPanelVue>
</template>
<script lang="ts">
import axios from "axios";
import DataPanelVue from "../components/DataPanel.vue";
import { defineComponent, reactive, ref } from "vue";
import graphData from "../graphData"
import { EventHandlers } from "v-network-graph";
var dataPanel: any = ref({});

const project_id: any = ref("");
const graphRef: any = ref();

function add_node(raw: any) {
    graphData.nodes.value[`node${raw.uid}`] = raw
}

function add_edge(raw: any) {
    graphData.edges.value[raw[1].uid] =
    {
        source: `node${raw[0]}`,
        target: `node${raw[2]}`,
        uid: raw[1].uid
    }
}
function get_items() {
    const request_url = import.meta.env.VITE_API_URL + `/project/${project_id.value}`
    axios
        .get(request_url)
        .then(response => {
            graphData.nodes.value = {}
            graphData.edges.value = {}
            console.log(response.data)
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
                add_edge(item)
            }
        })
}
export default defineComponent({
    name: "Graph",
    components: {
        DataPanelVue
    },
    data() {
        return {
            graphRef,
            project_id,
            graphData,
            dataPanel,
            eventHandlers: {
                // wildcard: capture all events
                "*": (type: string, event: any) => {
                    console.log(type, event)
                    if (type == 'node:pointerover') {
                        dataPanel.value = graphData.nodes.value[event.node]
                    } else if (type == 'view:click') {
                        const request_url = `${import.meta.env.VITE_API_URL}` +
                            `/project/${project_id.value}` +
                            `/new?item=node`
                        axios
                            .post(request_url)
                            .then(response => {
                                this.add_node_with_mouse(response.data, event.event)
                            })
                    }
                },
            }
        }
    },
    methods: {
        onInputPropertyName: function () {

        },
        onInputPropertyValue: function () {

        },
        onInputLabel: function () {

        },
        get_items,
        // add_node,
        // add_edge,
        add_node_with_mouse: function add_node_with_mouse(raw: any, e : any){
            const point = {x: e.offsetX, y: e.offsetY}
            const svgPoint = this.$refs.graphRef.translateFromDomToSvgCoordinates(point)
            graphData.layouts.value.nodes[`node${raw.uid}`] = svgPoint
            add_node(raw)
        }
    },
    mounted() {
        project_id.value = this.$route.params.id
        get_items()
        console.log('refs', this.$refs)
    },
    beforeUnmount() {
        // so that the next time we open the graph,
        // there won't be a flicker from the old graph data
        graphData.nodes.value = {}
        graphData.edges.value = {}
    },
})
</script>