<template>
    <div class="info-panel-outer">
        <text>he {{data_panel.uid}}</text><br>
        <input :value="data_panel.name" @blur="handleBlur('name', $event)"/><br>
        <input :value="data_panel.description" @blur="handleBlur('description', $event)"/>
        <h2>Resources</h2>
        <button>Add</button>
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

        }
    }
})
</script>