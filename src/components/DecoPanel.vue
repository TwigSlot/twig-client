<template>
    <div class="deco-panel">
        <h1 class="title is-4 deco-text">
            Tags: {{ showing_tags_for }}
            <button class="button" @click="hide_deco_panel = !hide_deco_panel">{{ hide_deco_panel ? "Show" : "Hide"}}</button>
        </h1>
        <div v-if="!hide_deco_panel">
            <div id="deco-box">
                <div class="deco-item">
                    <div>
                        <div id="tags-list">
                            <text @contextmenu.prevent="dissociate_tag((tag as any).name)" v-for="tag in tags_list"
                                class="subtitle tag" :style="{'background-color': (tag as any).color}"
                                @click="click_tag(tag)">
                                {{(tag as any).name}}
                            </text>
                        </div>
                        <br>
                        Tag Color:
                        <input class="input is-hovered info-panel-item" type="text" placeholder="Tag Color"
                            :value="tag_color" @input="preview_tag_color" @change="update_tag_color"
                            @focus="pauseKeyDown" @blur="handleBlur()" />
                        <div class="slider-demo-block">
                            <el-slider style="width: 10rem" v-model="tag_priority" @change="tag_priority_change" />
                        </div>
                        Tag Name:
                        <input class="input is-hovered info-panel-item" type="text" placeholder="Tag Name"
                            v-model="tag_name" @change="update_tag_name" @focus="pauseKeyDown" @blur="handleBlur()"
                            autocomplete="on" list="autocomplete_tags" />
                        <datalist id="autocomplete_tags">
                            <option v-for="tag in tags_suggestions_list" :value="(tag as any).name">{{`uid: (${(tag as
                            any).uid})`}}</option>
                        </datalist>
                        <input class="button is-primary" type="button" value="Color Graph" @click="click_all_tags" />
                        <input class="button is-primary" type="button" value="Add Tag" @click="add_tag"
                            :disabled="disable_add" />
                        <input class="button is-primary" type="button" value="List ALL Tags in Project"
                            @click="list_all_tags(true)" />
                        <input class="button is-primary" type="button" value="Delete Tag (by uid)"
                            @click="delete_tag" />
                    </div>
                </div>
            </div>
            <div id="deco-box">
                <h1 class="title is-4 deco-text">
                    Node Size:
                </h1>
                <div class="slider-demo-block">
                    <el-slider style="width: 10rem" v-model="data_panel.size" @change="node_size_change" />
                </div>
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
import { tag } from "type-fest/source/opaque";
import { defineComponent, ref } from "vue";

const tags_list = ref([]);
const tags_suggestions_list = ref([]);
const all_tags = ref([]);
const all_tag_resources = ref({});
const showing_tags_for = ref("");
const disable_add = ref(false);
const tag_focus = ref(null);
const tag_name_input = ref("");
const hide_deco_panel = ref(true);
export default defineComponent({
    name: "DecoPanel",
    props: ["data_panel", "project_id"],
    methods: {
        node_size_change: function (e: any) {
            const resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/edit?size=${e}`
            this.$emit('add_log', 'DecoPanel', 'edit size...');
            axios.post(request_url)
                .then(response => {
                    this.$emit('add_log', 'DecoPanel', 'edit size ok');
                })
                .catch(err => {
                    this.$emit('add_log', 'ERROR', 'edit size');
                    throw err
                })
        },
        tag_priority_change: function (e: any) {
            if (tag_focus.value == null) return
            console.log(e)
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${(tag_focus as any).value.uid}` +
                `/update_priority?priority=${e}`
            this.$emit('add_log', 'DecoPanel', 'update_priority...');
            axios.post(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'update priority ok');
                    tag_focus.value = response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'update priority error');
                    throw err
                })
        },
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
            if (first_tag_matching_name == null) {
                first_tag_matching_name = await this.create_tag().then((res) => { return res; })
            }
            const resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/add_tag?tag_uid=${(first_tag_matching_name as any).uid}`
            this.$emit('add_log', 'DecoPanel', 'add tag...');
            axios.post(request_url)
                .then((response) => {
                    (tags_list.value as any).push(response.data);
                    (all_tags.value as any).push(response.data);
                    this.$emit('add_log', 'DecoPanel', 'add tag ok');
                    this.sort_tags_list()
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'add tag error');
                    throw err
                })
        },
        create_tag: async function () {
            if (this.tag_name_input == "") return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/create_tag?name=${this.tag_name_input}`
            this.$emit('add_log', 'DecoPanel', 'create tag...');
            return axios.post(request_url)
                .then((response) => {
                    (all_tags.value as any).push(response.data);
                    this.$emit('add_log', 'DecoPanel', 'create tag ok');
                    return response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'create tag error');
                    throw err
                })
        },
        sort_tags_list() {
            tags_list.value.sort(function (a: any, b: any) {
                if (!('priority' in a)) a.priority = 0
                if (!('priority' in b)) b.priority = 0
                return a.priority - b.priority
            })
        },
        async click_all_tags() {
            for (const x of tags_list.value) {
                await this.click_tag(x)
            }
        },
        list_tags: async function () {
            const resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/list_tags`
            this.$emit('add_log', 'DecoPanel', 'list tag...');
            return axios.get(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'list tag ok');
                    tags_list.value = response.data
                    this.sort_tags_list()
                    disable_add.value = false;
                    return response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'list tag error');
                    throw err
                })
        },
        list_all_tags: async function (update_tags_list: boolean) {
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/list_all_tags`
            this.$emit('add_log', 'DecoPanel', 'list all tag...');
            return axios.get(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'list all tag ok');
                    if (update_tags_list) {
                        tags_list.value = response.data
                        this.sort_tags_list()
                        showing_tags_for.value = "Entire Project"
                        disable_add.value = true
                    }
                    all_tags.value = response.data
                    tags_suggestions_list.value = response.data
                    return response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'list all tag error');
                    throw err
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
            this.$emit('add_log', 'DecoPanel', 'delete tag...');
            axios.post(request_url)
                .then((response) => {
                    all_tags.value = all_tags.value.filter((tag: any) => tag.uid != this.tag_name_input)
                    this.$emit('add_log', 'DecoPanel', 'delete tag ok');
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'delete tag error');
                    throw err
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
            this.$emit('add_log', 'DecoPanel', 'diss tag...');
            axios.post(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'diss tag ok');
                    this.list_tags()
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'diss tag error');
                    throw err
                })
        },
        filter_suggestions: function () {
            tags_suggestions_list.value = tags_suggestions_list.value.filter((v: any) =>
                (this.tag_exists(tags_list.value, v.name) == null))
        },
        update_tag_color: function (e: any) {
            if (tag_focus.value == null) return
            const tag_id = (tag_focus as any).value.uid
            const new_color = e.target.value
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/update_color?color=${new_color}`
            this.$emit('add_log', 'DecoPanel', 'update tag color...');
            axios.post(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'update tag color ok');
                    (all_tags.value.find((tag: any) => tag.uid == tag_id) as any).color = new_color;
                    tag_focus.value = response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'update tag color error');
                    throw err
                })
        },
        preview_tag_color: function (e: any) {
            if (tag_focus.value == null) return
            (tag_focus as any).value.color = e.target.value
        },
        update_tag_name: function (e: any) {
            if(tag_focus.value == null) return;
            const tag_id = (tag_focus as any).value.uid
            const new_name = e.target.value
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/update_name?name=${new_name}`
            this.$emit('add_log', 'DecoPanel', 'update tag name...');
            axios.post(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'update tag name ok');
                    (all_tags.value.find((tag: any) => tag.uid == tag_id) as any).name= new_name;
                    tag_focus.value = response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'update tag name error');
                    throw err
                })

        },
        click_tag: async function(tag: any){
            if(tag.value == null) return
            if(tag.value.uid in all_tag_resources.value) 
                return (all_tag_resources as any).value[tag.value.id]
            else return this.click_tag_pull_from_online(tag)
        },
        click_tag_pull_from_online: async function (tag: any) {
            (tag_focus as any).value = tag
            const tag_id = (tag_focus as any).value.uid
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/list_resources`
            this.$emit('add_log', 'DecoPanel', 'click tag...');
            await axios.get(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'click tag ok');
                    (all_tag_resources as any).value[tag_id] = response.data
                    var arr = []
                    for (const i of response.data) {
                        arr.push(i.uid)
                    }
                    this.$emit('color_nodes', arr, (tag_focus as any).value.color)
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'click tag error');
                    throw err
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
            tag_name_input,
            hide_deco_panel
        }
    },
    watch: {
        async 'data_panel.uid'(new_value) {
            await this.list_tags()
            await this.list_all_tags(false)
            this.filter_suggestions()
            showing_tags_for.value = "Node " + new_value
            tag_focus.value = null
        },
        async 'project_id'(new_value) {
            await this.list_all_tags(true)
            this.click_all_tags()
        }
    },
    computed: {
        tag_name: {
            get: function () {
                return tag_focus.value == null ? '' : (tag_focus as any).value.name
            },
            set: function (nv: string) {
                this.tag_name_input = nv
            }
        },
        tag_color() {
            return tag_focus.value == null ? '' : (tag_focus as any).value.color
        },
        tag_priority: {
            get: function () {
                return tag_focus.value == null ? 0 : (tag_focus as any).value.priority
            },
            set: function (nv: number) {
                (tag_focus as any).value.priority = nv
            }
        }
    }
});
</script>
