<template>
    <img style="width:40px; height:40px" v-bind:src="profile_picture_src" />
    <h1>{{ user.name }}</h1>
    <h1>{{ user.email }}</h1>
    <ProjectList></ProjectList>
</template>
<script lang="ts">

import login from '../login'
import { defineComponent, ref } from 'vue';
import ProjectList from "../components/ProjectList.vue"

const sdk = login.sdk;
const default_profile_picture = "/profile_pic.jpeg";
const user = ref({
    name: "tan chien hao",
    email: "tanchienhao@gmail.com"
})
export default defineComponent({
    name: "Profile",
    components: {
        ProjectList
    },
    data() {
        return {
            profile_picture_src: default_profile_picture,
            user,
            showcased_projects: [
                { uid: 1, title: "hello", description: "desc1", authors: ["meow", "tch"] },
                { uid: 2, title: "bye", description: "desc1", authors: ["meow", "tch"] },
                { uid: 3, title: "hi", description: "desc1", authors: ["meow", "tch"] },
            ]
        }
    },
    mounted() {
        sdk.toSession().then(({ data }) => {
            user.value.email = data.identity.traits.email
            user.value.name = data.identity.traits.name.first + data.identity.traits.name.last
        })
    }
})
</script>