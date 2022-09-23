<template>
    <div class="control-panel">
        <div id="control-box">
            <button class="button is-light control-box-item" @click="$emit('home')">Center</button>
            <DropdownComponent @custom_change="changed_item" :dropdownItem="options"></DropdownComponent>
            <button class="button is-light control-box-item" @click="$emit('save-locations')">Save Locations </button>
            <text class="title is-4 control-box-item">{{ save_locations_status }}</text>
        </div>
        <div id="information-box-thing">
            <text>Pressing <i>delete</i> will remove selected items. </text><br>
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
const save_locations_status = ref("")
export default defineComponent({
    name: "ControlPanel",
    data() {
        return {
            options,
            save_locations_status,
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
<style lang="scss" scoped>
.control-panel {
    #information-box-thing {
      padding-left: 0.5rem;
      padding-top: 0.5rem;
    }
    #control-box{
      padding-left: 0.5rem;
      align-items: center;
      display: flex;
      padding-top: 0.5rem;
      .control-box-item{
        margin-inline: 0.2rem;
      }
    }
    width: 40%;
    padding-bottom: 1rem;
    border-bottom-right-radius: 25px;
    background-color: lightblue;
    font-family: 'Noto Sans', sans-serif;
}
i {
    font-style: italic;
}

.flush-right {
    right: inherit;
}
</style>