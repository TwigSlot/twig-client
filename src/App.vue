<template>
  <div id="graph">
    <v-network-graph ref="graph" v-model:selected-nodes="selectedNodes" v-model:selected-edges="selectedEdges"
                     v-model:zoom-level="zoomLevel" :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs"
                     :event-handlers="eventHandlers" />
  </div>

  <div id="login-form-modal" class="modal">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Authenticate to Neo4j</p>
        <button class="delete" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        <form>
          <div class="row">
            <label class="label" for="server-url">Server URL</label>
            <div class="control">
              <input class="input" type="text" id="server-url" value="neo4j+s://ae6e3bf9.databases.neo4j.io" />
            </div>
          </div>

          <div class="row">
            <label class="label" for="server-username">Username</label>
            <div class="control">
              <input class="input" type="text" id="server-username" value="neo4j"/>
            </div>
          </div>

          <div class="row">
            <label class="label" for="server-password">Password</label>
            <div class="control">
              <input class="input" type="password" id="server-password" value="pxHM45j7jD54_tvddMklXySWjbafvZfv01-B_GIDpVU"/>
            </div>
          </div>

        </form>
      </section>
      <footer class="modal-card-foot">
        <div class="container">
          <button class="button is-danger is-pulled-left">Cancel</button>
          <button class="button is-primary is-pulled-right" type="button" onclick="document.connect()">Connect</button>
        </div>
      </footer>
    </div>

  </div>

  <div id="query-console-modal" class="modal">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Query console</p>
        <button class="delete" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        <textarea type="text" id="query-textarea" v-model="queryRef" placeholder="Enter a cypher query" rows="4"
                  cols="40"></textarea>
      </section>
      <section class="modal-card-foot">
        <div class="container">
          <button class="button is-danger is-pulled-left">Cancel</button>
          <button class="button is-primary is-pulled-right" type="button" id="query-button" onclick="document.query()">
            Execute
          </button>
        </div>
      </section>
    </div>

  </div>

  <div id="config-modal" class="modal">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Configuration</p>
        <button class="delete" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        <form>
          <label class="checkbox">
            <input type="checkbox" id="d3-force-enabled" v-model="d3ForceEnabled" />
            Auto-organise
          </label>
        </form>
      </section>
      <footer class="modal-card-foot">
        <div class="container">
          <button class="button is-primary">Done</button>
        </div>
      </footer>
    </div>
  </div>

  <nav class="navbar" id="control-panel" >
    <div class="navbar-brand">
      <a class="navbar-item" href="#" onclick="document.home()">
        TWIG
      </a>
      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="twig-main-nav">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="twig-main-nav" class="navbar-menu">
      <div class="navbar-start">
        <div class="navbar-item">
          <a href="#" onclick="document.home()">Home</a>
        </div>
        <div class="navbar-item">
          <a class="js-modal-trigger" data-target="config-modal">
            Config
          </a>
        </div>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <a href="https://github.com/tch1001/vue_twig" target="_blank">
            <font-awesome-icon icon="fa-brands fa-github"></font-awesome-icon>
          </a>
        </div>
        <div class="navbar-item">
          <div class="buttons">
            <button class="button is-info js-modal-trigger" data-target="login-form-modal">
              Login
            </button>
            <button class="button is-link js-modal-trigger" data-target="query-console-modal">
              Query
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <div class="info-panel-outer">
    <div class="info-panel-inner">
      <div v-if="dataPanel.labels" v-bind:id="dataPanel.id" class="info-panel-inner-details-id">
        <h3>{{ dataPanel.objType }} Properties</h3>
        <ul>
          <li v-for="(label, index) in dataPanel.labels" :key="index" contenteditable="true" v-on:blur="onInputLabel">
            {{ label }}</li>
          <li v-if="dataPanel.objType == 'Node'"><input type='button' value='Add Label' onclick='document.addLabel()' />
          </li>
        </ul>
        <table>
          <tr>
            <th>&lt;id&gt;</th>
            <th>{{ dataPanel.id }}</th>
          </tr>
          <!-- <p>{{dataPanel.properties}}</p> -->
          <tr v-for="(value, property) in dataPanel.properties" :key="value">
            <th contenteditable="true" v-on:blur="onInputPropertyName">
              {{ property }}
            </th>
            <th v-bind:id="'valueOf' + property" contenteditable="true" v-on:blur="onInputPropertyValue">
              {{ value }}
            </th>
          </tr>
          <tr><input type="button" value="Add Property" onclick="document.addProperty()" /></tr>
        </table>
      </div>
      <div v-else-if="dataPanel.objType">Creating {{ dataPanel.objType }} in Neo4J... Hover over node again later to
        check
      </div>
      <div v-else>Hover over a node/edge to check it out</div>
    </div>
  </div>

  <div class="command-panel">
    Click on a command to replay it
    <div class="command-list">
      <ul>
        <li v-for="(command, index) in commandPanel" :key="index"
            onclick="document.getElementById('query-textarea').value=this.innerText" class="command">
          {{ command }}
        </li>
      </ul>
    </div>
  </div>
  <text id="graph-div-error">ERROR: This message will disappear when the graph div is resized appropriately.</text>
</template>
<script setup>

import neo4j, { session } from 'neo4j-driver'
async function deleteNode(nodeId) { // nodeInfo is the Node from Neo4J, nodeVisual is the SVG object representing the node
  const objId = nodes[nodeId].objInfo.identity.toNumber();
  const query = `MATCH (n) WHERE id(n)=$objId DETACH DELETE n`
  await writeTransaction(query, { objId: objId },
      (res) => {
        delete nodes[nodeId]
      });
}
async function deleteEdge(edgeId) {
  const objId = edges[edgeId].objInfo.identity.toNumber();
  const query = `MATCH (a)-[n]->(b) WHERE id(n)=$objId DELETE n`
  await writeTransaction(query, { objId: objId },
      (res) => {
        delete edges[edgeId]
      });
}
async function getPropertyNameValue(row) { // row is the row of the table
  const objId = parseInt(row.parentElement.parentElement.id); // id in neo4j
  return [objId, row.children[0].innerText, row.children[1].innerText];
}
async function onInputPropertyName(e) { // edit property name
  document.deleteMode = true;
  let [objId, newPropertyName, newPropertyValue] = await getPropertyNameValue(e.target.parentElement)
  var propertyIdx = Array.prototype.indexOf.call(e.target.parentElement.parentElement.children, e.target.parentElement)
  propertyIdx -= 1; // for the <id> row which doesnt change
  const propertyNames = Object.keys(dataPanel.value['properties'])
  const oldPropertyName = propertyNames[propertyIdx]
  var query;
  if (dataPanel.value['objType'] == 'Relationship') {
    query = `MATCH (a)-[n]->(b) WHERE id(n)=$objId`
  } else if (dataPanel.value['objType'] == 'Node') {
    query = `MATCH (n) WHERE id(n)=$objId`
  } else {
    return;
  }
  if (newPropertyName == '') { // removing an old property
    query += ` REMOVE n.\`${oldPropertyName}\` RETURN n`
  } else if (oldPropertyName == newPropertyName) { // either a new property or there are no updates
    return;
  } else { // updating the name of an old property
    query += ` SET n.\`${newPropertyName}\`=n.\`${oldPropertyName}\` REMOVE n.\`${oldPropertyName}\` RETURN n`
  }
  const curObj = dataPanel.value['obj']
  await writeTransaction(query, { objId: objId, newPropertyValue: newPropertyValue },
      (res) => {
        curObj.objInfo = res.records[0].get('n')
        // console.log(curObj, dataPanel.value['obj'], 'ARE NOT NECESSARILY THE SAME')
        if (curObj == dataPanel.value['obj']) {
          const prev = document.fixDataPanel;
          document.fixDataPanel = false;
          updateDataPanel(curObj.objInfo, curObj)
          document.fixDataPanel = prev;
        }
      });
  // const p = res.records[0].get('n')
  // dataPanel.value['obj'].objInfo = p
}
async function onInputPropertyValue(e) { // edit property value
  document.deleteMode = true;
  // name and value of altered property
  let [objId, propertyName, propertyValue] = await getPropertyNameValue(e.target.parentElement)
  if (propertyName == '') return; // in the process of deleting it
  var query;
  if (dataPanel.value['objType'] == 'Relationship') {
    query = `MATCH (a)-[n]->(b) WHERE id(n)=$objId`
  } else if (dataPanel.value['objType'] == 'Node') {
    query = `MATCH (n) WHERE id(n)=$objId`
  } else {
    return;
  }
  query += ` SET n.\`${propertyName}\`=$propertyValue RETURN n` // TODO something went wrong here, when i press tab from name
  const curObj = dataPanel.value['obj'];
  await writeTransaction(query, { objId: objId, propertyName: propertyName, propertyValue: propertyValue },
      (res) => {
        curObj.objInfo = res.records[0].get('n')
        if (curObj == dataPanel.value['obj']) {
          const prev = document.fixDataPanel;
          document.fixDataPanel = false;
          updateDataPanel(curObj.objInfo, curObj)
          document.fixDataPanel = prev;
        }
      });
}
async function onInputLabel(e) {
  const labelIdx = Array.prototype.indexOf.call(e.target.parentElement.children, e.target)
  const oldLabel = dataPanel.value['labels'][labelIdx];
  var newLabel = e.target.textContent;
  if (oldLabel == newLabel) return;
  const objId = parseInt(e.target.parentElement.parentElement.id);
  if (newLabel == '') {
    if (dataPanel.value['objType'] == 'Relationship') {
      newLabel = 'Edge'
    } else {
      const query = `MATCH (n) WHERE id(n)=$objId REMOVE n:\`${oldLabel}\` RETURN n`
      const curObj = dataPanel.value['obj']
      await writeTransaction(query, { objId: objId, oldLabel: oldLabel },
          (res) => {
            curObj.objInfo = res.records[0].get('n')
            if (curObj == dataPanel.value['obj']) {
              const prev = document.fixDataPanel;
              document.fixDataPanel = false;
              updateDataPanel(curObj.objInfo, curObj)
              document.fixDataPanel = prev;
            }
          });
      return;
    }
  }
  var query;
  if (dataPanel.value['objType'] == 'Relationship') {
    query = `MATCH (a)-[n2]->(b) WHERE id(n2)=$objId CREATE (a)-[n:\`${newLabel}\`]->(b) SET n=n2 WITH n,n2,a,b DELETE n2 RETURN a,n,b`
  } else if (dataPanel.value['objType'] == 'Node') {
    query = `MATCH (n) WHERE id(n)=$objId REMOVE n:\`${oldLabel}\` SET n:\`${newLabel}\` RETURN n`
  } else {
    return;
  }
  const curObj = dataPanel.value['obj'];
  await writeTransaction(query, { objId: objId, newLabel: newLabel, oldLabel: oldLabel }, (res) => {
    curObj.objInfo = res.records[0].get('n')
    if (curObj == dataPanel.value['obj']) {
      const prev = document.fixDataPanel;
      document.fixDataPanel = false;
      updateDataPanel(curObj.objInfo, curObj)
      document.fixDataPanel = prev;
    }

  });
}

document.connect = async function () {
  const serverURL = document.getElementById('server-url').value;
  const serverUsername = document.getElementById('server-username').value;
  const serverPassword = document.getElementById('server-password').value;
  console.log('connecting to neo4j')
  document.driver = neo4j.driver(serverURL,
      neo4j.auth.basic(serverUsername, serverPassword))
  document.driver.verifyConnectivity().then(() => {
    console.log('connected');
    queryRef.value = defaultQuery;
    document.query();
  });
}
// document.connect();
document.home = async function () {
  for (var j = 0; j < 1; ++j) { // TODO need to press home button twice
    const inf = 1000000000000;
    var minX = inf, minY = inf, maxX = -inf, maxY = -inf;
    for (const i in layouts.value.nodes) {
      minX = Math.min(minX, layouts.value.nodes[i].x)
      minY = Math.min(minY, layouts.value.nodes[i].y)
      maxX = Math.max(maxX, layouts.value.nodes[i].x)
      maxY = Math.max(maxY, layouts.value.nodes[i].y)
    }
    const padding = 100;
    graph.value.setViewBox({
      left: minX - padding,
      top: minY - padding,
      right: maxX + padding * 5,
      bottom: maxY + padding,
    })
  }
}

document.query = async function () {
  const cypherQuery = queryRef.value;
  commandPanel.value.push(cypherQuery)
  const session = document.driver.session({ database: 'neo4j' });
  const tx = session.beginTransaction();

  const res = await tx.run(cypherQuery);

  for (let i in nodes) delete nodes[i]
  for (let i in edges) delete edges[i]
  const displayableProperties = ['title', 'name']
  res.records.forEach((record, index) => {
    var displayName = `Node ${index}`
    for (const key of record.keys) {
      const field = record._fields[record._fieldLookup[key]]
      if (Object.prototype.hasOwnProperty.call(field.__proto__, "__isNode__")) {
        for (const displayableProperty of displayableProperties) {
          if (displayableProperty in field.properties) {
            displayName = field.properties[displayableProperty]
            break;
          }
        }
        var newVertex = addVertex(0, 0, field.identity.toNumber())
        newVertex.objInfo = field;
        newVertex.name = displayName;
      } else if (Object.prototype.hasOwnProperty.call(field.__proto__, "__isRelationship__")) {
        const s = field.start.toNumber().toString()
        const t = field.end.toNumber().toString()
        var newEdge = document.addEdge(s, t);
        newEdge.objInfo = field;
      }
    }
  })
  session.close();
}
document.addLabel = function () {
  dataPanel.value['labels'].push('NewLabel');
}
document.addProperty = async function () {
  // dataPanel.value['properties']['NewPropertyName'] = 'NewPropertyValue';
  // const objId = document.getElementsByClassName('info-panel-inner-details-id')[0].getAttribute('id')
  const objId = dataPanel.value['obj'].objInfo.identity.toNumber();
  const objType = dataPanel.value['objType']
  var query;
  if (objType == 'Relationship') {
    query = "MATCH (a)-[n]->(b) WHERE id(n)=$objId"
  } else if (objType == 'Node') {
    query = "MATCH (n) WHERE id(n)=$objId"
  }
  query += " SET n.NewPropertyName = 'NewPropertyValue' RETURN n"
  const curObj = dataPanel.value['obj']
  await writeTransaction(query, { objId: objId },
      (res) => {
        curObj.objInfo = res.records[0].get('n')
        // console.log(curObj, dataPanel.value['obj'], 'ARE NOT NECESSARILY THE SAME')
        if (curObj == dataPanel.value['obj']) {
          const prev = document.fixDataPanel;
          document.fixDataPanel = false;
          updateDataPanel(curObj.objInfo, curObj)
          document.fixDataPanel = prev;
        }
      });
}
async function initHandler() {
  document.fixDataPanel = false;
  document.viewClick = () => { };
  document.nodeSelect = () => { };
  document.nodeClick = () => { };
  document.edgeSelect = () => { };
}
initHandler();
async function setHandler(mode) { // event handler (mode is determined by keyboard input)
  initHandler();
  if (mode == 'select') {
    document.fixDataPanel = true;
    const objSelect = function (e, objs) {
      if (e.length == 0) return;
      document.fixDataPanel = false;
      updateDataPanel(objs[e[e.length - 1]].objInfo, objs[e[e.length - 1]])
      console.log(dataPanel.value['obj'])
      document.fixDataPanel = true;
    }
    document.nodeSelect = (e) => { objSelect(e, nodes); }
    document.edgeSelect = (e) => { objSelect(e, edges); }
  } else if (mode == 'vertex') { // adding vertex
    document.viewClick = addVertexWithMouse;
  } else if (mode == 'edge') {
    document.nodeClick = addEdgePrep; // addEdgePrep is a fn that handles one-by-one selection of nodes
    document.nodeSelect = (e) => { // this one handles rect selection
      if (e.length == 0) document.sourceNode = null
      else if (e.length == 2) document.addEdge(e[0], e[1])
    };
    return;
  }
}
setHandler('select') // default mode
document.onkeydown = function (e) {
  if (e.key == 's') setHandler('select')
  else if (e.key == 'v') setHandler('vertex')
  else if (e.key == 'e') setHandler('edge')
  else if (e.key == 'Delete') document.deleteObjects();
}
document.deleteObjects = function () {
  const total = selectedNodes.value.length + selectedEdges.value.length
  if (total > 0) {
    if (confirm(`Confirm deletion of ${total} objects?`)) {
      document.removeNode();
      document.removeEdge();
    }
  }
}
document.addEdge = function (source, target) {
  const edgeId = `edge${nextEdgeIndex.value}`
  edges[edgeId] = { source, target }
  nextEdgeIndex.value++
  return edges[edgeId]
}
async function addEdgePrep(e) {
  if (document.sourceNode == null) {
    document.sourceNode = e.node;
  } else {
    const newEdge = document.addEdge(document.sourceNode, e.node)
    document.sourceNode = null;

    const s = nodes[newEdge.source].objInfo.identity.toNumber();
    const t = nodes[newEdge.target].objInfo.identity.toNumber();
    const query = 'MATCH (a), (b) WHERE id(a)=$s AND id(b)=$t CREATE (a)-[e:Edge]->(b) RETURN e'

    await writeTransaction(query, { s: s, t: t },
        (res) => {
          newEdge.objInfo = res.records[0].get('e')
          const prev = document.fixDataPanel;
          document.fixDataPanel = false;
          updateDataPanel(newEdge.objInfo, newEdge)
          document.fixDataPanel = prev;
        });
  }
}
function addVertex(x, y, nodeId) {
  // add node and its position
  if (nodeId == null) {
    nodeId = `node${nextNodeIndex.value}`
    nextNodeIndex.value++
  }
  const name = `Node ${nextNodeIndex.value}`
  nodes[nodeId] = { name }
  layouts.value.nodes[nodeId] = { x: x, y: y };
  return nodes[nodeId];
}

async function addVertexWithMouse(e) {
  const point = { x: e.offsetX, y: e.offsetY }
  // translate coordinates: DOM -> SVG
  const svgPoint = graph.value.translateFromDomToSvgCoordinates(point)
  const newNode = addVertex(svgPoint.x, svgPoint.y);
  const query = "CREATE (n) SET n.name=$newName RETURN n"
  await writeTransaction(query, { newName: newNode.name },
      (res) => {
        newNode.objInfo = res.records[0].get('n')
        const prev = document.fixDataPanel;
        document.fixDataPanel = false;
        updateDataPanel(newNode.objInfo, newNode)
        document.fixDataPanel = prev;

      })
}

document.removeNode = async function () {
  for (const nodeId of selectedNodes.value) {
    deleteNode(nodeId)
  }
}
document.removeEdge = function () {
  for (const edgeId of selectedEdges.value) {
    deleteEdge(edgeId)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { // Escape key
      closeAllModals();
    }
  });
});

</script>

<script>
import { defineComponent, reactive, ref, computed } from "vue"
import * as vNG from "v-network-graph"
import {
  ForceLayout,
} from "v-network-graph/lib/force-layout"

const original_nodes = {
  node1: { name: "Node 1" },
  node2: { name: "Node 2" },
  node3: { name: "Node 3" },
  node4: { name: "Node 4" },
}
var original_edges = {
  edge1: { source: "node1", target: "node2" },
  edge2: { source: "node2", target: "node3" },
  edge3: { source: "node3", target: "node4" },
}
const graph = ref();
const nodes = reactive({ ...original_nodes })
const edges = reactive({ ...original_edges })
const layouts = ref({
  nodes: {
    node1: { x: 0, y: 0 },
    node2: { x: 50, y: 50 },
    node3: { x: 100, y: 0 },
    node4: { x: 150, y: 50 },
  },
});

const nextNodeIndex = ref(Object.keys(nodes).length + 1)
const nextEdgeIndex = ref(Object.keys(edges).length + 1)

const selectedNodes = ref([]);
const selectedEdges = ref([]);
const eventLogs = reactive([])
const defaultQuery = `MATCH (p)-[e]->(q) RETURN e LIMIT 100
UNION ALL
MATCH (p) RETURN p as e LIMIT 100`
const queryRef = ref(defaultQuery)

const dataPanel = ref({})
const commandPanel = ref([])
async function writeTransaction(query, params, callback) {
  console.log(query, params)
  const session = document.driver.session({
    database: 'neo4j',
  })
  // Create a node within a write transaction
  const res = await session.writeTransaction(tx => {
    return tx.run(query, params)
  })
  // Close the sesssion
  session.close()
  if (callback) callback(res);
  return res
}
function updateDataPanel(objInfo, obj) { // TODO actually can just change the params to obj
  const total = selectedNodes.value.length + selectedEdges.value.length
  if (document.fixDataPanel && total > 0) {
    return
  }
  if (!objInfo) return;
  dataPanel.value = {}
  if (Object.prototype.hasOwnProperty.call(objInfo.__proto__, '__isRelationship__')) {
    dataPanel.value['objType'] = 'Relationship'
    dataPanel.value['labels'] = [objInfo.type];
  } else if (Object.prototype.hasOwnProperty.call(objInfo.__proto__, '__isNode__')) {
    dataPanel.value['objType'] = 'Node'
    dataPanel.value['labels'] = objInfo.labels;
  }
  if (obj) {
    dataPanel.value['obj'] = obj
  }
  dataPanel.value['id'] = objInfo.identity.toNumber();
  dataPanel.value['properties'] = objInfo.properties;
}


export default defineComponent({
  data() {
    const configs = reactive(
        vNG.defineConfigs({
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
    )
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

    const eventHandlers = {
      // wildcard: capture all events
      "*": (type, event) => {
        // if (eventLogs.length > EVENTS_COUNT) {
        //   eventLogs.splice(EVENTS_COUNT, eventLogs.length - EVENTS_COUNT)
        // }
        // if (event instanceof Object && "event" in event) {
        //   Object.assign(event, { event: "(...)" })
        // }
        // eventLogs.unshift([type, JSON.stringify(event)])
        if (type == 'view:click') {
          document.viewClick(event.event);
        } else if (type == 'node:click') {
          document.nodeClick(event);
        } else if (type == 'node:select') {
          document.nodeSelect(event);
        } else if (type == 'node:pointerover') {
          const obj = nodes[event.node]
          updateDataPanel(obj.objInfo, obj)
        } else if (type == 'node:pointerout') {
          // console.log('i')
        } else if (type == 'edge:pointerover') {
          const obj = edges[event.edge]
          updateDataPanel(obj.objInfo, obj)
        } else if (type == 'edge:select') {
          document.edgeSelect(event)
          // console.log(type, event)
        }
      },
    }
    const zoomLevel = ref(1.5)
    // variables to be used in html
    return { graph, nodes, edges, configs, layouts, zoomLevel, d3ForceEnabled, eventHandlers, dataPanel, commandPanel, queryRef }
  },
  methods: {
  },
  mounted() {
    document.getElementById('graph-div-error').remove()
    function resize(ev) {
      var graph = document.getElementById('graph');
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const titleHeight = 0;
      graph.style.setProperty('height', `${windowHeight - titleHeight}px`)
      graph.style.setProperty('width', `${windowWidth}px`)
    }
    window.addEventListener('resize', resize);
    resize();
  }
})
</script>



<style>
#graph {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: aqua;
  margin: 0px;
  height: 10px;
  /* will be set inside js */
  overflow: hidden;
  position: fixed;
  z-index: -1;
  /* visibility: hidden; */
}

.control-panel {
  width: 100%;
  top: 0;
  left: 0;
  background-color: yellow;
  /* position: static; */
  float: left;
}

.control-panel-controls {
  width: auto;
  float: left;
}

.control-panel-login {
  width: auto;
  float: left;
}

.info-panel-outer {
  background-color: greenyellow;
  position: relative;
  clear: left;
  float: right;
  width: 40%;
  /* background-color: rgba(0,0,0,0); */
}

.info-panel-inner {
  position: relative;
  background-color: aliceblue;
  max-height: 60%;
  overflow-y: scroll;
}

.command-list {
  height: 90%;
  background-color: beige;
}

.command-panel {
  width: 40%;
  position: absolute;
  bottom: 0;
  left: 60%;
  background-color: aquamarine;
  max-height: 40%;
  overflow-y: scroll;
}

.command {
  cursor: pointer
}

body {
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>
