<template>
  <div class="demo-control-panel">
    <el-tabs type="border-card">
      <el-tab-pane label="Home">
        <div class="base-container">
          <div class="control-item">
            <div class="control">
              <el-button @click="$emit('home')">Home</el-button> <br />
            </div>
            <div class="control">
              <label>Field to show on the label:</label>
              <DropdownComponent :dropdownItem="options"></DropdownComponent>
            </div>
            <div class="control">
              <el-button @click="$emit('save-locations')">Save</el-button>
            </div>
          </div>
          <div class="control-item">
            <slot name="panel"></slot>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
}

.base-container {
  display: flex;
}

.control-item {
  flex: 1
}

</style>

<script lang="ts">
import { defineComponent } from "vue";
import DropdownComponent from "./DropdownComponent.vue";

const options = [
  "Add Vertex (V)",
  "Add Edge (E)",
  "Delete (D)",
  "Look Around (A)",
];

export default defineComponent({
  name: "ControlPanel",
  data() {
    return {
      selected_mode: "move",
      options,
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
  components: { DropdownComponent },
});
</script>

<style lang="scss" scoped>
.control-panel {
  width: 60%;
  background-color: lightblue;
}
.flush-right {
  right: inherit;
}
</style>
