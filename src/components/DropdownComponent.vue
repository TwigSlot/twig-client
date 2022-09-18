<template>
  <el-select v-model="value" class="m-2" placeholder="Select" size="small" clearable>
    <el-option
      v-for="(item, index) in dropdownItem"
      :key="index"
      :label="item"
      :value="item"
    ></el-option>
  </el-select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue'

const value = ref('')

export default defineComponent({
  name: "DropdownComponent",
  props: {
    dropdownItem: Object,
  },
  data() {
    return {
      value
    }
  }
});
</script>
