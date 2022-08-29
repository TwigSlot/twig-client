<template>
    <h1>{{project.id}}</h1>
    <input type='text' :value="project.name" @blur="handleBlur('name', $event)"/><br>
    <textarea type='text' :value="project.description" @blur="handleBlur('description', $event)"></textarea>
</template>
<script lang="ts">
import axios from 'axios'
import { defineComponent, ref } from 'vue'
const project: any = ref({ id: 0, name: 'Loading...', description: '' })
export default defineComponent({
    name: "EditProject",
    setup() {
    },
    data(){
        return {
            project 
        }
    },
    methods: {
        handleBlur: function(property: string, e: any){
            const new_value = e.target.value
            const request_url = `${import.meta.env.VITE_API_URL}`+
                    `/project/${project.id}`+
                    `/edit?${property}=${new_value}`
            console.log(request_url)
            axios
                .post(request_url)
                .then(response => {
                    project.value = response.data
                    project.value.id = response.data.uid
                })
        }
    },
    mounted(){
        project.id = this.$route.params.id
        const request_url = `${import.meta.env.VITE_API_URL}`+
                        `/project/${project.id}`+
                        `?list_items=0`
        axios.get(request_url)
            .then(response => {
                project.value = response.data.project
                project.value.id = response.data.project.uid
            })
    }
})
</script>
