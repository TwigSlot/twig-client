<template>
    <ProjectList :explore="true"></ProjectList>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import ProjectList from '../components/ProjectList.vue';

export default defineComponent({
    name: "Explore",
    components: {
        ProjectList
    },
    data(){
        return {
        }
    }
})
</script>