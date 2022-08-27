<template>
  <Navbar></Navbar>
  <router-view/>
</template>

<script lang="ts">

import { defineComponent, ref, reactive } from 'vue'
import graphData from './graphData';
import Navbar from './components/Navbar.vue';

export default defineComponent({
  name: "App",
  components: {
    Navbar,
  },
  data() {
    return { graphData }
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
    document.addEventListener("DOMContentLoaded", this.modalEvent)
  },
  
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
