<template>
    <ProjectList :showcased_projects='showcased_projects'></ProjectList>
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
            showcased_projects: [
                { uid:1, title: "hello", description: "desc1", authors: ["meow", "tch"] },
                { uid:2, title: "bye", description: "desc1", authors: ["meow", "tch"] },
                { uid:3, title: "hi", description: "desc1", authors: ["meow", "tch"] },
            ]
        }
    }
})
</script>