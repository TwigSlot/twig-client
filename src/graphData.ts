import { reactive, ref, computed, VNodeRef } from "vue"
import * as vNG from "v-network-graph"
import { Nodes, Edges, Layouts, LayoutHandler } from "v-network-graph"
import {
  ForceLayout,
} from "v-network-graph/lib/force-layout"

const original_nodes: Nodes = {}
var original_edges: Edges = {}
const nodes : any = ref({ original_nodes })
const edges : any = ref({ original_edges })
const layouts = ref<Layouts>({
  nodes: {
  },
});

const selectedNodes = ref<Nodes>();
const selectedEdges = ref<Edges>();
const default_layout_handler: LayoutHandler = new ForceLayout({ positionFixedByClickWithAltKey: true, })

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
    layoutHandler: default_layout_handler 
  },
  node: {
    selectable: true,
    normal: {
      color: node => node.color,
    }
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

const graphData = {
  nodes, edges, 
  layouts, d3ForceEnabled,
  configs,
  selectedNodes, selectedEdges
}
export default graphData