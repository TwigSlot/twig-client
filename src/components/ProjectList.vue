<template>
    <button @click="add_project">Add</button>
    <div v-for="(project, project_idx) in showcased_projects" :key="project_idx">
        <router-link :to="{ path: `/project/${project.uid}` }">
            <h2>{{ project.name }}</h2>
            <h2>{{ project.description }}</h2>
            <ul v-for="(author, author_idx) in project.authors" :key="author_idx">
                <li>{{ author }}</li>
            </ul>
        </router-link>
        <router-link :to="{ name: 'EditProject', params: {id: project.uid }}">edit</router-link><br>
        <br>
    </div>
</template>
<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue';

const kratos_user_id = ref("")
const username = ref("")
const showcased_projects: any = ref([]);

export default defineComponent({
    name: "ProjectList",
    data() {
        return {
            showcased_projects,
            kratos_user_id,
            username
        }
    },
    methods: {
        add_project: function () {
            const request_url = `${import.meta.env.VITE_API_URL}/project/new` +
                `?user=${kratos_user_id.value}`
            axios.put(request_url)
                .then(response => {
                    console.log(response.data)
                })
        },
        get_projects: function () {
            const request_url = import.meta.env.VITE_API_URL + '/user/tch1001'
            axios
                .get(request_url)
                .then(response => {
                    showcased_projects.value = response.data.projects
                    kratos_user_id.value = response.data.user.kratos_user_id
                    username.value = response.data.user.username
                })
        }
    },
    mounted() {
        this.get_projects()
    }
})
</script>