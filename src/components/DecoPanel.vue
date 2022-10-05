<template>
    <div class="deco-panel">
        <div id="deco-box">
            <div class="deco-item">
                <h1 class="title is-4 deco-text">
                    Tags: {{ showing_tags_for }}
                </h1>
                <div id="tags-list">
                    <text @contextmenu.prevent="dissociate_tag((tag as any).name)" 
                        v-for="tag in tags_list" 
                        class="subtitle tag"
                        :style="{'background-color': (tag as any).color}"
                        @click="click_tag(tag)">
                        {{(tag as any).name}}
                    </text>
                </div>
                <br>
                <input class="input is-hovered info-panel-item" type="text" placeholder="Color"
                    :value="tag_color" @input="preview_tag_color" @change="update_tag_color" @focus="pauseKeyDown" @blur="handleBlur()" />
                <input class="input is-hovered info-panel-item" type="text" placeholder="Tag" 
                    v-model="tag_name" @change="update_tag_name"
                    autocomplete="on" list="autocomplete_tags" />
                <datalist id="autocomplete_tags">
                    <option v-for="tag in tags_suggestions_list" :value="(tag as any).name">{{`uid: (${(tag as
                    any).uid})`}}</option>
                </datalist>
                <input class="button is-primary" type="button" value="Add Tag" @click="add_tag"
                    :disabled="disable_add" />
                <input class="button is-primary" type="button" value="List ALL Tags in Project"
                    @click="list_all_tags(true)" />
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

.tag {
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
import { defineComponent, ref } from "vue";

const tags_list = ref([]);
const tags_suggestions_list = ref([]);
const showing_tags_for = ref("");
const disable_add = ref(false);
const tag_focus = ref(null);
const tag_name_input = ref("");
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
        // returning the first one if it does
        tag_exists: function (tags: any, name_of_tag: string) {
            const tags_matching_name = tags.filter((tag: any) => tag.name == name_of_tag)
            if (tags_matching_name.length > 0) return tags_matching_name[0]
            else return null
        },
        add_tag: async function () {
            if (this.tag_name_input == "") return
            const tags = await this.list_all_tags(false)
            var first_tag_matching_name = this.tag_exists(tags, this.tag_name_input)
            console.log(first_tag_matching_name)
            if (first_tag_matching_name == null) {
                first_tag_matching_name = await this.create_tag().then((res) => { return res; })
            }
            const resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
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
            if (this.tag_name_input == "") return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/create_tag?name=${this.tag_name_input}`
            return axios.post(request_url)
                .then((response) => {
                    return response.data
                })
        },
        list_tags: async function () {
            const resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/list_tags`
            return axios.get(request_url)
                .then((response) => {
                    tags_list.value = response.data
                    disable_add.value = false;
                    return response.data
                })
        },
        list_all_tags: async function (update_tags_list: boolean) {
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/list_all_tags`
            return axios.get(request_url)
                .then((response) => {
                    if (update_tags_list) {
                        tags_list.value = response.data
                        showing_tags_for.value = "Entire Project"
                        disable_add.value = true
                    }
                    tags_suggestions_list.value = response.data
                    return response.data
                })
        },
        delete_tag: async function () {
            const tags = await this.list_all_tags(false).then((arr) => { return arr; })
            try {
                assert(!isNaN(parseInt(this.tag_name_input)))
            } catch {
                return
            }
            if (tags.filter((tag: any) => tag.uid == parseInt(this.tag_name_input)).length == 0) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/delete_tag?uid=${this.tag_name_input}`
            axios.post(request_url)
                .then((response) => {
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        dissociate_tag: async function (name_of_tag: string) {
            console.log('diss', name_of_tag)
            var first_tag_matching_name = this.tag_exists(tags_list.value, name_of_tag)
            if (first_tag_matching_name == null) return
            const resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/dissociate_tag?tag_uid=${(first_tag_matching_name as any).uid}`
            axios.post(request_url)
                .then((response) => {
                    this.list_tags()
                })
        },
        filter_suggestions: function () {
            tags_suggestions_list.value = tags_suggestions_list.value.filter((v: any) =>
                (this.tag_exists(tags_list.value, v.name) == null))
        },
        update_tag_color: function(e: any){
            if(tag_focus.value == null) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${(tag_focus as any).value.uid}` +
                `/update_color?color=${e.target.value}`
            axios.post(request_url)
                .then((response) => {
                    tag_focus.value = response.data
                })
        },
        preview_tag_color: function(e: any){
            if(tag_focus.value == null) return
            (tag_focus as any).value.color = e.target.value
        },
        update_tag_name: function(e: any){
            console.log(e)
        },
        click_tag: function(tag: any){
            (tag_focus as any).value = tag
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${(tag_focus as any).value.uid}` +
                `/list_resources`
            axios.get(request_url)
                .then((response) => {
                    var arr = []
                    for(const i of response.data){
                        arr.push(i.uid)
                    }
                    this.$emit('color_nodes', arr, (tag_focus as any).value.color)
                })
        }
    },
    data() {
        return {
            tags_list,
            tags_suggestions_list,
            showing_tags_for,
            disable_add,
            tag_focus,
            tag_name_input
        }
    },
    watch: {
        async 'data_panel.uid'(new_value) {
            await this.list_tags()
            await this.list_all_tags(false)
            this.filter_suggestions()
            showing_tags_for.value = "Node " + new_value
        }
    },
    computed: {
        tag_name: {
            get: function(){
                return tag_focus.value == null ? '' : (tag_focus as any).value.name
            },
            set: function(nv: string) {
                this.tag_name_input = nv
            }
        },
        tag_color(){
            return tag_focus.value == null ? '' : (tag_focus as any).value.color
        }
    }
});
</script>
