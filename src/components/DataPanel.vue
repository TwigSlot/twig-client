<template>
    <div class="info-panel-outer">
        <text>Id: {{data_panel.uid}}</text><br>
        <input :value="data_panel.name" @focus="pauseKeyDown" @blur="handleBlur('name', $event)"/><br>
        <input :value="data_panel.link" @focus="pauseKeyDown" @blur="handleBlur('link', $event)"/><a :href="data_panel.link" target="_blank">open</a><br>
        <textarea :value="data_panel.description" @focus="pauseKeyDown" @blur="handleBlur('description', $event)"/><br>
        <div class="info-panel-inner">
            <div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue'
import graphData from '../graphData';

const project_id: any = ref("")
export default defineComponent({
    name: "DataPanel",
    setup() {
    },
    props: ["data_panel"],
    mounted(){
        project_id.value = this.$route.params.id
    },
    methods: {
        handleBlur: function(property: string ,e: any) {
            this.$emit('resumeKeyDown')
            const new_value = e.target.value
            const resource_id = (this.$props.data_panel.uid)
            const request_url = `${import.meta.env.VITE_API_URL}`+
                    `/project/${project_id.value}`+
                    `/resource/${resource_id}`+
                    `/edit?${property}=${new_value}`
            if(!project_id.value) return
            if(!resource_id) return
            console.log(request_url)
            axios
                .post(request_url)
                .then(response => {
                    console.log(response.data)
                    graphData.nodes.value[`node${response.data.uid}`] = response.data
                })
        },
        onInputPropertyName: function () {

        },
        onInputPropertyValue: function () {

        },
        onInputLabel: function () {

        },
        pauseKeyDown: function () { this.$emit('pauseKeyDown') }
    }
})
</script>