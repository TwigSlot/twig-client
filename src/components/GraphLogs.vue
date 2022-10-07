<template>
  <div class="graph-logs-panel" @click="show_all = !show_all">
    <text v-if="show_all" class="log-message" v-for="log in logs">{{ log.type }} : {{ log.message }}<br></text>
    <text v-else class="log-message">{{ logs[logs.length-1].type }} : {{ logs[logs.length-1].message }}<br></text>
  </div>
</template>
<style>
.log-message{
  width: 10rem;
}
</style>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
const logs = ref([{ type: 'hello', message: 'world' }]);
const show_all = ref(false);
export default {
  name: "DropdownComponent",
  data() {
    return {
      logs,
      show_all
    }
  },
  methods: {
    add_log: function(type: string, message: string){
      logs.value.push({type: type, message: message});
    }
  },
};
</script>
