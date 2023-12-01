<template>
  <div class="list-layout">
    <ul>
      <li v-for="rsc in graphData.nodes" class="list-item">
        <div class="control">
          <h1 class="title is-4">ID : {{ rsc.uid }}</h1>
        </div>
        <div class="control" :style="{marginTop: '10px', width: '90%' }">
          <input class="input is-hovered info-panel-item" type="text" placeholder="Name" :value="rsc.name" />
        </div>
        <div class="control" :style="{marginTop: '10px', width: '90%' }">
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
export default defineComponent({
  name: "ListLayout",
  data() {
    return {
      graphData,
    };
  },
  methods: {},
});
</script>