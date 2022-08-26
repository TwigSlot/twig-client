<template>
    <img v-bind:src="profile_picture_src"/>
    <h1>{{ user.name }}</h1>
    <h1>{{ user.username }}</h1>
    <h1>{{ user.email }}</h1>
    <ProjectList></ProjectList>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import ProjectList from "../components/ProjectList.vue"

const default_profile_picture = "/profile_pic.jpeg";
const user = {
    name: "tan chien hao",
    username: "tch1001",
    email: "tanchienhao@gmail.com"
}
export default defineComponent({
    name: "Profile",
    components:{
        ProjectList
    },
    data(){
        return {
            profile_picture_src: default_profile_picture,
            user,
            showcased_projects: [
                { uid:1, title: "hello", description: "desc1", authors: ["meow", "tch"] },
                { uid:2, title: "bye", description: "desc1", authors: ["meow", "tch"] },
                { uid:3, title: "hi", description: "desc1", authors: ["meow", "tch"] },
            ]
        }
    }
})
</script>