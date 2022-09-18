<template>
    <div class="control-panel">
        <button class="button is-light" @click="$emit('home')">Home</button>
        <DropdownComponent @custom_change="changed_item" :dropdownItem="options"></DropdownComponent>
        <button class="button is-light" @click="$emit('save-locations')">Save Locations</button>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import DropdownComponent from "./DropdownComponent.vue";

const options = [
    { name: 'add-node', label: 'Add Vertex (V)' },
    { name: 'add-edge', label: 'Add Edge (E)', },
    { name: 'move', label: 'Look Around (A)' }];
export default defineComponent({
    name: "ControlPanel",
    data() {
        return {
            options
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