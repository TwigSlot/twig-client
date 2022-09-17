<template>
    <button style="margin-left: 50px" @click="add_project">Add</button>
    <div style="height: 50px">

    </div>
    <text>{{connection_status}}</text>
    <div style="margin-left: 50px" v-for="(project, project_idx) in showcased_projects" :key="project_idx">
        <router-link :to="{ path: `/project/${project.project.uid}` }">
            <h2>{{ project.project.name }}</h2>
        </router-link>
            <h2>{{ project.project.description }}</h2>
            <h2>Owner: 
              <router-link :to="{ path: `/user/${project.owner}` }">
                {{ project.owner }}
              </router-link>
            </h2>
        <router-link v-if="project.owner == $store.state.kratos_user_id || connection_status != 'connected'" :to="{ name: 'EditProject', params: {id: project.project.uid }}">edit<br></router-link>
        <button v-if="project.owner == $store.state.kratos_user_id" @click="delete_project(project.project.uid)">delete 
        </button>
        <br v-if="project.owner == $store.state.kratos_user_id"> 
        ---------------
        <br>
    </div>
</template>
<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue';

const kratos_user_id : any = ref("")
const username = ref("")
const showcased_projects: any = ref([]);
const connection_status: any = ref("connecting...")

export default defineComponent({
    name: "ProjectList",
    props: ['explore'],
    data() {
        return {
            showcased_projects,
            kratos_user_id,
            username,
            connection_status
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
            const request_url = `${import.meta.env.VITE_API_URL}`+
                                `/project/${project_id}`+
                                `/delete`
            axios.post(request_url)
                .then(response => {
                    showcased_projects.value = showcased_projects.value.filter((ele: any) => ele.project.uid != project_id)
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
                    if(!this.$props.explore){
                        kratos_user_id.value = response.data.user.kratos_user_id
                        username.value = response.data.user.username
                    }
                    connection_status.value = "connected"
                })
                .catch(err => {
                    connection_status.value = 'failed to connect, err = ' + err
                    showcased_projects.value = [
                        {
                            'owner': 'fake owner 1',
                            'project':{
                                'uid': 1,
                                'name': 'dummy project 1',
                                'description': 'dummy description 1'
                            }
                        }
                    ];
                })
        }
    },
    mounted() {
        kratos_user_id.value = this.$route.params.id;
        axios.defaults.headers.common['X-User'] = this.$store.state.kratos_user_id
        this.get_projects()
    },
    watch: {
        '$route.params.id':{
            handler(){
                if(!this.$route.params.id) return;
                kratos_user_id.value = this.$route.params.id;
                axios.defaults.headers.common['X-User'] = this.$store.state.kratos_user_id
                this.get_projects()
            }
        }
    }
})
</script>