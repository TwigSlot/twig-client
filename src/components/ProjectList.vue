<template>
    <div v-for="project in showcased_projects">
        <router-link :to="{ path: `/project/${project.uid}` }">
            <h2>{{ project.title }}</h2>
            <h2>{{ project.description }}</h2>
            <ul v-for="author in project.authors">
                <li>{{ author }}</li>
            </ul>
        </router-link>
        <br>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "ProjectList",
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