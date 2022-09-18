<template>
    <div class="select">
      <select v-model="selected" @change="change($event)">
        <option v-for="(item, index) in dropdownItem" v-bind:value="index">{{ item.label }}</option>
      </select>
    </div>
</template>

<script>
export default {
  name: "DropdownComponent",
  props: {
    dropdownItem: Array,
  },
  methods:{
    change: function(event){
      this.$emit('custom_change', parseInt(event.target.value))
    }
  },
  computed:{
    selected(){
      var idx = 0
      for(var x of this.$props.dropdownItem){
        if(x.name == this.$store.state.selected_mode){
          return idx
        }
        idx += 1
      }
      return -1
    }
  }
};
</script>
