import { reactive, ref, computed, VNodeRef } from "vue"
import * as vNG from "v-network-graph"
import { Nodes, Edges, Layouts } from "v-network-graph"
import {
  ForceLayout,
} from "v-network-graph/lib/force-layout"

const original_nodes: Nodes = {
  node1: { name: "Node 1" },
  node2: { name: "Node 2" },
  node3: { name: "Node 3" },
  node4: { name: "Node 4" },
}
var original_edges: Edges = {
  edge1: { source: "node1", target: "node2" },
  edge2: { source: "node2", target: "node3" },
  edge3: { source: "node3", target: "node4" },
}
const graph = ref<VNodeRef>();
const nodes = reactive({ ...original_nodes })
const edges = reactive({ ...original_edges })
const layouts = ref<Layouts>({
  nodes: {
    node1: { x: 0, y: 0 },
    node2: { x: 50, y: 50 },
    node3: { x: 100, y: 0 },
    node4: { x: 150, y: 50 },
  },
});

const selectedNodes = ref<Nodes>();
const selectedEdges = ref<Edges>();

var configs = vNG.defineConfigs({
  view: {
    scalingObjects: true,
    minZoomLevel: 0.1,
    maxZoomLevel: 16,
    boxSelectionEnabled: true,
    selection: {
      box: {
        color: "#0000ff20",
        strokeWidth: 5,
        strokeColor: "#aaaaff",
        strokeDasharray: "0",
      },
    },
    layoutHandler: new ForceLayout({ positionFixedByClickWithAltKey: true, })
  },
  node: {
    selectable: true,
  },
  edge: {
    selectable: true,
    normal: {
      width: 3,
      color: "#4466cc",
      dasharray: "0",
      linecap: "butt",
      animate: false,
      animationSpeed: 50,
    },
    marker: {
      source: {
        type: "none",
        width: 4,
        height: 4,
        margin: -1,
        units: "strokeWidth",
        color: null,
      },
      target: {
        type: "arrow",
        width: 4,
        height: 4,
        margin: -1,
        units: "strokeWidth",
        color: null,
      },
    },
  }
})
const d3ForceEnabled = computed({
  get: () => configs.view.layoutHandler instanceof ForceLayout,
  set: (value) => {
    if (value) {
      configs.view.layoutHandler = new ForceLayout()
    } else {
      configs.view.layoutHandler = new vNG.SimpleLayout()
    }
  },
})

const EVENTS_COUNT = 6

const eventHandlers: vNG.EventHandlers = {
  // wildcard: capture all events
  "*": (type, event) => {
    console.log(type, event)
  },
}
export default {
  graph,
  nodes, edges, 
  layouts, d3ForceEnabled,
  configs,
  selectedNodes, selectedEdges, 
  eventHandlers
}