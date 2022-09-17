<template>
    <div class="select">
      <select :select="0">
        <option  v-for="(item, index) in dropdownItem" v-bind:value="index">{{ item }}</option>
      </select>
    </div>
</template>

<script>
export default {
  name: "DropdownComponent",
  props: {
    dropdownItem: Array,
  },
};
</script>
