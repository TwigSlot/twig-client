<template>
    <div class="control-panel">
        <button class="button is-light" @click="$emit('home')">Home</button>
        <DropdownComponent :dropdownItem="['Add Vertex (V)', 'Add Edge (E)', 'Delete (D)', 'Look Around (A)']"></DropdownComponent>
        <button class="button is-light" @click="$emit('save-locations')">Save Locations</button>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import DropdownComponent from "./DropdownComponent.vue";

export default defineComponent({
    name: "ControlPanel",
    data() {
        return {
            selected_mode: "move"
        };
    },
    methods: {},
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
.control-panel{
    width: 60%;
    background-color: lightblue;
}
.flush-right{
    right: inherit;
}
</style>