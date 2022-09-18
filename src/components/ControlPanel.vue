<template>
    <div class="control-panel">
        <button class="button is-light" @click="$emit('home')">Home</button>
        <DropdownComponent @custom_change="changed_item" :dropdownItem="options"></DropdownComponent>
        <button class="button is-light" @click="$emit('save-locations')">Save Locations</button>
        <div>
            <text>Pressing delete will remove selected items. </text>
            <text>{{ instructions }}</text>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import DropdownComponent from "./DropdownComponent.vue";

const options = [
    { name: 'add-node', label: 'Add Vertex (V)' },
    { name: 'add-edge', label: 'Add Edge (E)', },
    { name: 'move', label: 'Look Around (A)' }];
export default defineComponent({
    name: "ControlPanel",
    data() {
        return {
            options,
        };
    },
    methods: {
        changed_item: function (e: any) {
            this.$store.commit('update_selected_mode', options[e].name)
        }
    },
    mounted() {
        // this is put here to avoid TypeErrors caused by
        // html loading the following code before control_panel_ref is mounted
        document.addEventListener("keydown", (e) => {
            this.$emit("customkeydown", e);
        });
    },
    computed: {
        instructions(){
            const selected_mode = (this.$store.state as any).selected_mode
            if(selected_mode == 'move'){
                return 'Use your mouse to pan around, hover over nodes to view their data.'
            }else if(selected_mode == 'add-node'){
                return 'Click somewhere to add a node!'
            }else if(selected_mode == 'add-edge'){
                if((this.$store.state as any).edge_source_node){
                    return 'Click on the target node.'
                }else{
                    return 'Click on the source node.'
                }
            }
        }
    },
    components: { DropdownComponent }
})
</script>
<style scoped>
.control-panel {
    width: 60%;
    background-color: lightblue;
}

.flush-right {
    right: inherit;
}
</style>