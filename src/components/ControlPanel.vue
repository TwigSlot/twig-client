<template>
    <div class="control-panel">
        <button @click="$emit('home')">Home</button>
        <select v-model="selected_mode" class="flush-right">
            <option value="add-node">Add Vertex (V)</option>
            <option value="add-edge">Add Edge (E)</option>
            <option value="delete">Delete (D)</option>
            <option value="move">Look Around (A)</option>
        </select>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "ControlPanel",
    data(){
        return {
            selected_mode: 'move'
        }
    },
    methods:{
        
    },
    mounted(){
        // this is put here to avoid TypeErrors caused by
        // html loading the following code before control_panel_ref is mounted
        document.addEventListener('keydown', (e) => {
            this.$emit('customkeydown', e)
        })
    }
})
</script>
<style scoped>
.control-panel{
    width: 60%;
    background-color: lightblue;
}
.flush-right{
    right: inherit;
}
</style>