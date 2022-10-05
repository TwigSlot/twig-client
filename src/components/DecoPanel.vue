<template>
    <div class="deco-panel">
        <div id="deco-box">
            <div class="deco-item">
                <h1 class="title is-4 deco-text">
                    Tags:
                </h1>
                <div id="tags-list">
                    <text v-for="tag in tags_list" class="subtitle tag">{{(tag as any).name}}</text>
                </div>
                <br>
                <input class="input is-hovered info-panel-item" type="text" placeholder="Color"
                    v-model="data_panel.color" @focus="pauseKeyDown" @blur="handleBlur()" />
                <input class="input is-hovered info-panel-item" type="text" placeholder="Tag" v-model="tag_name" 
                        autocomplete="on" list="autocomplete_tags"/>
                <datalist id="autocomplete_tags">
                    <option v-for="tag in tags_suggestions_list" :value="(tag as any).name">{{`uid: (${(tag as any).uid})`}}</option>
                </datalist>
                <input class="button is-primary" type="button" value="Add Tag" @click="add_tag" />
                <input class="button is-primary" type="button" value="List ALL Tags" @click="list_all_tags" />
                <input class="button is-primary" type="button" value="Delete Tag (by uid)" @click="delete_tag" />
            </div>
        </div>
        <div id="deco-box">
            <h1 class="title is-4 deco-text">
                Size:
            </h1>
            <div class="slider-demo-block">
                <span class="demonstration">Customized initial value</span>
                <el-slider v-model="data_panel.size" />
            </div>
        </div>
    </div>
</template>
  
<style lang="scss" scoped>
.deco-text {
    color: blue;
}

.tag  {
    margin-inline: 1rem;
}

.deco-panel {

    #deco-box {
        padding-left: 0.5rem;
        align-items: center;
        display: flex;
        padding-top: 0.5rem;
        margin-inline: 0.2rem;
    }

    width: 40%;
    padding-top: 1rem;
    padding-bottom: 1rem;
    padding-left: 1rem;
    border-top-left-radius: 1rem;
    font-family: 'Noto Sans',
    sans-serif;
}
</style>
<script lang="ts">
import { assert } from "@vue/compiler-core";
import axios from "axios";
import { ta } from "element-plus/es/locale";
import { defineComponent, ref } from "vue";

const tag_name = ref("")
const tags_list = ref([]);
const tags_suggestions_list = ref([]);
export default defineComponent({
    name: "DecoPanel",
    props: ["data_panel", "project_id"],
    methods: {
        handleBlur: async function () {
            this.$emit("resumeKeyDown");
        },
        pauseKeyDown: function () {
            this.$emit("pauseKeyDown");
        },
        // checks whether name_of_tag is inside tags
        tag_exists: function(tags: any, name_of_tag: string) {
            const tags_matching_name = tags.filter((tag : any) => tag.name == name_of_tag)
            if(tags_matching_name.length == 0) return tags_matching_name[0]
            else return null
        },
        add_tag: async function (){
            if(tag_name.value == "") return
            const tags = await this.list_all_tags(false)
            var first_tag_matching_name = this.tag_exists(tags, tag_name.value)
            if(first_tag_matching_name == null){
                first_tag_matching_name = await this.create_tag().then((res) => {return res;})
            }
            const resource_id = this.$props.data_panel.uid;
            if(!resource_id) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/add_tag?tag_uid=${(first_tag_matching_name as any).uid}`
            axios.post(request_url)
                .then((response) => {
                    (tags_list.value as any).push(response.data)
                })
        },
        create_tag: async function () {
            if (tag_name.value == "") return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/create_tag?name=${tag_name.value}`
            return axios.post(request_url)
                .then((response) => {
                    return response.data
                })
        },
        list_tags: async function (){
            const resource_id = this.$props.data_panel.uid;
            if(!resource_id) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/list_tags`
            return axios.get(request_url)
                .then((response) => {
                    tags_list.value = response.data
                    return response.data
                })
        },
        list_all_tags: async function (update_tags_list = true) {
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/list_all_tags`
            return axios.get(request_url)
                .then((response) => {
                    if(update_tags_list) tags_list.value = response.data
                    tags_suggestions_list.value = response.data
                    return response.data
                })
        },
        delete_tag: async function () {
            const tags = await this.list_all_tags().then((arr) => {return arr;})
            try{
                assert(!isNaN(parseInt(tag_name.value)))
            }catch{
                return
            }
            if(tags.filter((tag : any) => tag.uid == parseInt(tag_name.value)).length == 0) return 
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/delete_tag?uid=${tag_name.value}`
            axios.post(request_url)
                .then((response) => {
                })
                .catch((err) => {
                    console.log(err)
                })

        }
    },
    data() {
        return {
            tag_name,
            tags_list,
            tags_suggestions_list
        }
    },
    watch: {
        'data_panel.uid'(new_value){
            this.list_tags()
        }
    }
});
</script>
