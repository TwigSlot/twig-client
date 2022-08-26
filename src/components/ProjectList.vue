<template>
    <div v-for="(project, project_idx) in showcased_projects" :key="project_idx">
        <router-link :to="{ path: `/project/${project.uid}` }">
            <h2>{{ project.name }}</h2>
            <h2>{{ project.description }}</h2>
            <ul v-for="(author, author_idx) in project.authors" :key="author_idx">
                <li>{{ author }}</li>
            </ul>
        </router-link>
        <br>
    </div>
</template>
<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue';

const showcased_projects : any = ref([]);
function get_projects(){
    axios
        .get(import.meta.env.VITE_API_URL + '/user/tch1001')
        .then(response => {
            showcased_projects.value = response.data
        })
}
export default defineComponent({
    name: "ProjectList",
    data(){
        return {
            showcased_projects
            // showcased_projects: [
            //     { uid:1, name: "hello", description: "desc1", authors: ["meow", "tch"] },
            //     { uid:2, name: "bye", description: "desc1", authors: ["meow", "tch"] },
            //     { uid:3, name: "hi", description: "desc1", authors: ["meow", "tch"] },
            // ]
        }
    }, 
    mounted(){
        get_projects()
    }
})
</script>