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
        <button @click="delete_project(project.uid)">delete</button>
        <br>
    </div>
</template>
<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue';

const kratos_user_id : any = ref("")
const username = ref("")
const showcased_projects: any = ref([]);

export default defineComponent({
    name: "ProjectList",
    props: ['explore'],
    data() {
        return {
            showcased_projects,
            kratos_user_id,
            username
        }
    },
    methods: {
        add_project: function () {
            const request_url = `${import.meta.env.VITE_API_URL}`+
                                `/project/new`+
                                `?user=${kratos_user_id.value}`
            axios.put(request_url)
                .then(response => {
                    showcased_projects.value.unshift(response.data)
                })
        },
        delete_project: function(project_id: any){
            console.log(project_id)
            const request_url = `${import.meta.env.VITE_API_URL}`+
                                `/project/${project_id}`+
                                `/delete`
            axios.post(request_url)
                .then(response => {
                    showcased_projects.value = showcased_projects.value.filter((ele: any) => ele.uid != project_id)
                })
        },
        get_projects: function () {
            var request_url = '';
            if(this.$props.explore){
                request_url = `${import.meta.env.VITE_API_URL}`+
                            `/explore`
            }else{
                request_url = `${import.meta.env.VITE_API_URL}`+
                            `/user/${kratos_user_id.value}`
            }
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
        kratos_user_id.value = this.$route.params.id;
        this.get_projects()
    }
})
</script>