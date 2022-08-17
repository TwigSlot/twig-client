<template>
  <div id="graph">
    <v-network-graph ref="graph" v-model:selected-nodes="graphData.selectedNodes"
      v-model:selected-edges="graphData.selectedEdges" :nodes="graphData.nodes" :edges="graphData.edges"
      :layouts="graphData.layouts" :configs="graphData.configs" :event-handlers="graphData.eventHandlers" />
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
            <label class="label" for="login-username">Username/Email</label>
            <div class="control">
              <input class="input" type="text" id="login-username" value="" />
            </div>
          </div>

          <div class="row">
            <label class="label" for="login-password">Password</label>
            <div class="control">
              <input class="input" type="password" id="login-password" value="" />
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
            <input type="checkbox" id="d3-force-enabled" v-model="graphData.d3ForceEnabled" />
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

  <nav class="navbar" id="control-panel">
    <div class="navbar-brand">
      <a class="navbar-item" href="#">
        TWIGSLOT
      </a>
      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="twig-main-nav">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="twig-main-nav" class="navbar-menu">
      <div class="navbar-start">
        <div class="navbar-item">
          <a href="#">Explore</a>
        </div>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <button class="button is-info js-modal-trigger" data-target="login-form-modal">
              Login
            </button>
          </div>
        </div>

        <div class="navbar-item">
          <a href="https://github.com/twigslot/twig-client" target="_blank">
            <font-awesome-icon icon="fa-brands fa-github"></font-awesome-icon>
          </a>
        </div>
      </div>
    </div>
  </nav>
  <div class="info-panel-outer">
    <div class="info-panel-inner">
      <div v-if="dataPanel.labels" v-bind:id="dataPanel.id" class="info-panel-inner-details-id">
        <h3>Properties</h3>
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

</template>
<!-- <script lang="ts">
// document.addEventListener('DOMContentLoaded', () => {
//   // Functions to open and close a modal
//   function openModal($el : any) {
//     $el.classList.add('is-active');
//   }

//   function closeModal($el : any) {
//     $el.classList.remove('is-active');
//   }

//   function closeAllModals() {
//     (document.querySelectorAll('.modal') || []).forEach(($modal) => {
//       closeModal($modal);
//     });
//   }

//   // Add a click event on buttons to open a specific modal
//   (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger : any) => {
//     const modal = $trigger.dataset.target;
//     const $target = document.getElementById(modal);

//     $trigger.addEventListener('click', () => {
//       openModal($target);
//     });
//   });

//   // Add a click event on various child elements to close the parent modal
//   (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
//     const $target = $close.closest('.modal');

//     $close.addEventListener('click', () => {
//       closeModal($target);
//     });
//   });

//   // Add a keyboard event to close all modals
//   document.addEventListener('keydown', (event) => {
//     const e = event || window.event;

//     if (e.keyCode === 27) { // Escape key
//       closeAllModals();
//     }
//   });
// });


</script> -->
<script lang="ts">

import { defineComponent, ref, reactive } from 'vue'
import neo4j, { session } from 'neo4j-driver'
import graphData from "./graphData"
import sdk from './login'
sdk.initializeSelfServiceLoginFlowForBrowsers()

var dataPanel: Map<string, any> = new Map<string, any>();
// const graph = graphData.graph
// const nodes = graphData.nodes
// const edges = graphData.edges
// const configs = graphData.configs
// const layouts = graphData.layouts
// const selectedNodes = graphData.selectedNodes
// const selectedEdges = graphData.selectedEdges
// const d3ForceEnabled = graphData.d3ForceEnabled
// const eventHandlers = graphData.eventHandlers
export default defineComponent({
  name: "GraphView",
  components: {

  },
  data() {
    return { dataPanel, graphData }
  },
  methods: {
    keyDown: function () {
      console.log("hello there")
    },

    modalEvent: function () {
      // Functions to open and close a modal
      function openModal($el: any) {
        $el.classList.add('is-active');
      }

      function closeModal($el: any) {
        $el.classList.remove('is-active');
      }

      function closeAllModals() {
        (document.querySelectorAll('.modal') || []).forEach(($modal) => {
          closeModal($modal);
        });
      }

      // Add a click event on buttons to open a specific modal
      (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger: any) => {
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
    }
  },
  created: function () {
    window.addEventListener('keydown', this.keyDown)
    document.addEventListener("DOMContentLoaded", this.modalEvent)
  }
});
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
  overflow: hidden;
  position: fixed;
  z-index: -1;
  /* visibility: hidden; */
  width: 100%;
  height: 100%;
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
