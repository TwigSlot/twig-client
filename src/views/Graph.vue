<template>
    <div id="graph" ref="div_ref">
        <v-network-graph ref="graph_ref" v-model:selected-nodes="graphData.selectedNodes"
            v-model:selected-edges="graphData.selectedEdges" :nodes="graphData.nodes"
            :edges="graphData.edges" :layouts="graphData.layouts"
            :configs="graphData.configs" :event-handlers="eventHandlers" />
    </div>
    <DataPanelVue :data_panel="dataPanel"></DataPanelVue>
    <ControlPanelVue @home="home" ref="control_panel_ref"></ControlPanelVue>
</template>
<script lang="ts">
import axios from "axios";
import DataPanelVue from "../components/DataPanel.vue";
import ControlPanelVue from "../components/ControlPanel.vue";
import { defineComponent, reactive, ref } from "vue";
import graphData from "../graphData"
var dataPanel: any = ref({});

const project_id: any = ref("");
const graph_ref: any = ref();
const control_panel_ref: any = ref();

function add_node(raw: any) {
    graphData.nodes.value[`node${raw.uid}`] = raw
}
function add_edge(s: string, t: string, uid: any){
    graphData.edges.value[uid] =
    {
        source: s,
        target: t,
        uid: uid
    }
}
var edge_source_node : any = null;
var selected_nodes = ref([]);
function create_edge(s: string, t: string){
    console.log(s.substring(4))
    console.log(t.substring(4))
    const request_url = `${import.meta.env.VITE_API_URL}`+
                    `/project/${project_id.value}`+
                    `/new?item=relationship`+
                    `&a_id=${s.substring(4)}&b_id=${t.substring(4)}`
    axios.post(request_url)
        .then(response => {
            graphData.edges.value[response.data.uid] = {
                source: s,
                target: t,
                uid: response.data.uid
            }
        })
    edge_source_node = null
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
                add_edge_raw(item)
            }
        })
}
export default defineComponent({
    name: "Graph",
    components: {
        DataPanelVue,
        ControlPanelVue
    },
    data() {
        return {
            graph_ref,
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
                        this.handle_view_click(event)
                    } else if (type == 'node:select'){
                        this.handle_node_select(event)
                    } else if(type == 'node:click'){
                        this.handle_node_click(event)
                    }
                },
            }
        }
    },
    methods: {
        handle_view_click: function (event: any) {
            const selected_mode = this.$refs.control_panel_ref.selected_mode 
            if (selected_mode == 'add-node') {
                const request_url = `${import.meta.env.VITE_API_URL}` +
                    `/project/${project_id.value}` +
                    `/new?item=node`
                axios
                    .post(request_url)
                    .then(response => {
                        this.add_node_with_mouse(response.data, event.event)
                    })
                this.$refs.control_panel_ref.selected_mode = 'move'
            }else if(selected_mode == 'add-edge'){
                edge_source_node = null;
            }
        },
        handle_node_click: function(event: any){
            const selected_mode = this.$refs.control_panel_ref.selected_mode 
            if(selected_mode == 'add-edge'){
                if(edge_source_node){
                    create_edge(edge_source_node, event.node)
                    this.$refs.control_panel_ref.selected_mode = 'move'
                }
            }else{
                edge_source_node = event.node
            }
        },
        handle_node_select: function(event: any){
            const selected_mode = this.$refs.control_panel_ref.selected_mode
            if(selected_mode == 'add-edge'){
                if(event.length == 0) edge_source_node = null;
                else if(event.length == 1){
                    edge_source_node = event[0]
                }else if(event.length == 2){
                    create_edge(event[0], event[1])
                    this.$refs.control_panel_ref.selected_mode = 'move'
                } 
            }
            selected_nodes.value = event
        },
        home: function () {
            const inf = 10000000000000000;
            var minX = inf, minY = inf, maxX = -inf, maxY = -inf;
            for (const i in graphData.layouts.value.nodes) {
                const node = graphData.layouts.value.nodes[i]
                minX = Math.min(minX, node.x)
                maxX = Math.max(maxX, node.x)
                minY = Math.min(minY, node.y)
                maxY = Math.max(maxY, node.y)
            }
            const padding = 100;
            this.$refs.graph_ref.setViewBox({
                left: minX - padding,
                top: minY - padding,
                right: maxX + padding * 5,
                bottom: maxY + padding,
            })
        },
        get_items,
        // add_node,
        // add_edge_raw,
        add_node_with_mouse: function (raw: any, e: any) {
            const point = { x: e.offsetX, y: e.offsetY }
            const svgPoint = this.$refs.graph_ref.translateFromDomToSvgCoordinates(point)
            graphData.layouts.value.nodes[`node${raw.uid}`] = svgPoint
            add_node(raw)
        }
    },
    mounted() {
        project_id.value = this.$route.params.id
        get_items()
        document.addEventListener('keydown', (e: any) => {
            if(e.key == 'e'){
                this.$refs.control_panel_ref.selected_mode = 'add-edge'
                if(selected_nodes.value.length == 2){
                    create_edge(selected_nodes.value[0], selected_nodes.value[1])
                    this.$refs.control_panel_ref.selected_mode = 'move'
                }
            }else if(e.key == 'v'){
                this.$refs.control_panel_ref.selected_mode = 'add-node'
            }else if(e.key == 'a'){
                this.$refs.control_panel_ref.selected_mode = 'move'
            }else if(e.key == 'd'){
                this.$refs.control_panel_ref.selected_mode = 'delete'
            }
        })
    },
    beforeUnmount() {
        // so that the next time we open the graph,
        // there won't be a flicker from the old graph data
        graphData.nodes.value = {}
        graphData.edges.value = {}
    },
})
</script>