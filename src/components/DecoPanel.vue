<<<<<<< HEAD
<template>
    <div class="deco-panel">
        <h1 class="title is-4 deco-text">
            Tags: {{ showing_tags_for }}
            <button class="button" @click="hide_deco_panel = !hide_deco_panel">
                {{ hide_deco_panel ?
                "Show" :
                "Hide"}}
            </button>
            <button class="button" @click="repull">
                Resync All Tags
            </button>
        </h1>
        <div v-if="!hide_deco_panel">
            <div id="deco-box">
                <div class="deco-item">
                    <div>
                        <div id="tags-list">
                            <text v-for="tag in tags_list" @contextmenu.prevent="
                                disable_add ? delete_tag((tag as any).uid) : dissociate_tag((tag as any).name)
                            " class="subtitle tag" :style="{'background-color': (tag as any).color}"
                                @click="click_tag(tag)">
                                {{(tag as any).name}}
                            </text>
                        </div>
                        <text>
                            {{ chosen_tag == '' ?  `Left-click a tag to edit it` : `Edit Tag : ${ chosen_tag }` }}
                        </text>
                        <br>
                        <div v-if="tag_focus != null">
                            Tag Color:
                            <input class="input is-hovered info-panel-item" type="text" placeholder="Tag Color"
                                :value="tag_color" @input="preview_tag_color" @change="update_tag_color"
                                @focus="pauseKeyDown" @blur="handleBlur" />
                        </div>
                        <div v-if="tag_focus != null" class="slider-demo-block">
                            <el-slider style="width: 10rem" v-model="tag_priority" @change="tag_priority_change" />
                        </div>
                        <div>
                            Tag Name:
                            <input class="input is-hovered info-panel-item" type="text" placeholder="Tag Name"
                                v-model="tag_name" @change="update_tag_name" @focus="pauseKeyDown" @blur="handleBlur()"
                                autocomplete="on" list="autocomplete_tags" />
                        </div>
                        <datalist id="autocomplete_tags">
                            <option v-for="tag in tags_suggestions_list" :value="(tag as any).name">{{`uid: (${(tag as
                            any).uid})`}}</option>
                        </datalist>
                        <input class="button is-primary" type="button" value="Color Graph" @click="color_all_nodes" />
                        <input class="button is-primary" type="button" value="Plain Graph" @click="plain_graph" />
                        <input class="button is-primary" type="button" :value="add_tag_button" @click="batch_add_tag()"
                            :disabled="disable_add" />
                        <input class="button is-primary" type="button" value="List ALL Tags in Project"
                            @click="list_all_tags(true)" />
                    </div>
                </div>
            </div>
            <div id="deco-box">
                <h1 class="title is-4 deco-text">
                    Node Size:
                </h1>
                <div class="slider-demo-block">
                    <el-slider style="width: 10rem" v-model="data_panel.size" @change="node_size_change"/>
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
import { defineComponent, ref } from "vue";

const tags_list = ref([]);
const tags_suggestions_list = ref([]);
const all_tags = ref([]);
const all_tag_resources = ref({});
const showing_tags_for = ref("");
const disable_add = ref(false);
const tag_focus = ref(null);
const tag_name_input = ref("");
const hide_deco_panel = ref(false);
export default defineComponent({
    name: "DecoPanel",
    props: ["data_panel", "project_id", "selected_nodes"],
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
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${(tag_focus as any).value.uid}` +
                `/update_priority?priority=${e}`
            this.$emit('add_log', 'DecoPanel', 'update_priority...');
            axios.post(request_url)
                .then(async (response) => {
                    this.$emit('add_log', 'DecoPanel', 'update priority ok');
                    this.sort_tags_list()
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
        tag_resource: function (tag_id: string, resource_id: any) {
            if (resource_id == null) { // serves as initializer
                (all_tag_resources as any).value[tag_id] = [];
                return
            }
            if (!(tag_id in all_tag_resources.value))
                (all_tag_resources as any).value[tag_id] = [];
            (all_tag_resources as any).value[tag_id].push(resource_id);
        },
        update_suggestions_list: async function () {
            tags_suggestions_list.value = await this.list_all_tags(false)
            this.filter_suggestions()
        },
        batch_add_tag: async function(){
            const tag_name = this.tag_name_input
            const tags = await this.list_all_tags(false)
            var first_tag_matching_name = this.tag_exists(tags, tag_name)
            if (first_tag_matching_name == null) {
                first_tag_matching_name = await this.create_tag().then((res) => { return res; })
            }
            const sn = this.$props.selected_nodes
            for(const x of sn){
                this.add_tag(x.substr(4), first_tag_matching_name)
            }
        },
        add_tag: async function (resource_id : any, tag : any) {
            if(!tag) return
            const tags = await this.list_all_tags(false)
            if(!resource_id) resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const tag_id = tag.uid
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/add_tag?tag_uid=${tag_id}`
            this.$emit('add_log', 'DecoPanel', 'add tag...');
            axios.post(request_url)
                .then(async (response) => {
                    this.tag_resource(tag_id, resource_id);
                    this.sort_tags_list()
                    await this.list_tags(resource_id)
                    this.filter_suggestions()
                    this.$emit('add_log', 'DecoPanel', 'add tag ok');
                    this.$emit('color_node', resource_id, tag.color, tag.priority, true)
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
        get_tag_by_id: function (tag_id: string) {
            const one = all_tags.value.filter(tag => (tag as any).uid == parseInt(tag_id))
            return one.length == 0 ? null : one[0];
        },

        list_tags: async function (resource_id: string) { // list tags for a specific resource
            if (!resource_id) return
            if (all_tags.value.length == 0) await this.list_all_tags(false)
            tags_list.value = []
            for (const x in all_tags.value) { // for all tags
                const tag = (all_tags as any).value[x]
                const tr: any = await this.list_tag_resources(tag)
                if (tr.indexOf(resource_id) != -1) {
                    (tags_list as any).value.push(tag)
                }
            }
            this.sort_tags_list()
            disable_add.value = false;
            return tags_list.value
        },
        // list all tags
        list_all_tags: async function (update_tags_list: boolean) {
            if (all_tags.value.length == 0) {
                all_tags.value = await this.list_all_tags_pull_from_online(update_tags_list);
            }
            if (update_tags_list) {
                tags_list.value = all_tags.value
                this.sort_tags_list()
                showing_tags_for.value = "Entire Project"
                disable_add.value = true
            }
            tags_suggestions_list.value = all_tags.value
            return all_tags.value
        },
        list_all_tags_pull_from_online: async function (update_tags_list: boolean) {
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/list_all_tags`
            this.$emit('add_log', 'DecoPanel', 'list all tag...');
            return axios.get(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'list all tag ok');
                    return response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'list all tag error');
                    throw err
                })
        },
        delete_tag: async function (tag_id: string) {
            try {
                assert(!isNaN(parseInt(tag_id)))
            } catch {
                return
            }
            const tag = this.get_tag_by_id(tag_id);
            if (tag == null) return
            const tr: any = await this.list_tag_resources(tag)
            if (tr.length > 0) {
                if (!confirm(`there are ${tr.length} resources with this tag? delete for sure?`)) return
            }
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/delete_tag?uid=${tag_id}`
            this.$emit('add_log', 'DecoPanel', 'delete tag...');
            axios.post(request_url)
                .then((response) => {
                    all_tags.value = all_tags.value.filter((tag: any) => tag.uid != parseInt(tag_id))
                    tags_list.value = all_tags.value
                    this.sort_tags_list()
                    this.$emit('add_log', 'DecoPanel', 'delete tag ok');
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'delete tag error');
                    throw err
                })
        },
        dissociate_tag: async function (name_of_tag: string) {
            var first_tag_matching_name = this.tag_exists(tags_list.value, name_of_tag)
            if (first_tag_matching_name == null) return
            const resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const tag = (first_tag_matching_name as any)
            const tag_id = tag.uid
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/dissociate_tag?tag_uid=${tag_id}`
            this.$emit('add_log', 'DecoPanel', 'diss tag...');
            axios.post(request_url)
                .then(async (response) => {
                    this.$emit('add_log', 'DecoPanel', 'diss tag ok');
                    delete (all_tag_resources as any).value[tag_id]
                    this.list_tag_resources(this.get_tag_by_id(tag_id))
                    const existing_tags: any = await this.list_tags(resource_id)
                    this.update_suggestions_list()
                    await this.$emit('color_node', resource_id, 'blue', tag.priority, true)
                    for (const et in existing_tags) {
                        this.$emit('color_node', resource_id,
                            existing_tags[et].color,
                            existing_tags[et].priority,
                            false)
                    }
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
            const tag: any = this.get_tag_by_id(tag_id)
            const new_color = e.target.value
            if(new_color == '') return;
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/update_color?color=${new_color}`
            this.$emit('add_log', 'DecoPanel', 'update tag color...');
            axios.post(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'update tag color ok');
                    tag.color = new_color;
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
            if (tag_focus.value == null) return;
            const tag_id = (tag_focus as any).value.uid
            const tag : any = this.get_tag_by_id(tag_id)
            const new_name = e.target.value
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/update_name?name=${new_name}`
            this.$emit('add_log', 'DecoPanel', 'update tag name...');
            axios.post(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'update tag name ok');
                    tag.name = new_name
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'update tag name error');
                    throw err
                })

        },
        color_nodes: async function (tag: any, override: boolean) {
            const tr = await this.list_tag_resources(tag)
            // tr is the array of nodes to color <color>
            for (const x in tr) {
                this.$emit('color_node', tr[x], tag.color, tag.priority, override)
            }
        },
        click_tag: async function (tag: any) {
            (tag_focus as any).value = tag
            this.color_nodes(tag, true)
        },
        // lists the resources associated with this tag
        list_tag_resources: async function (tag: any) {
            const tag_id = tag.uid;
            var all_tr = (all_tag_resources as any).value
            if (!(tag_id in all_tr)) {
                var data = await this.list_tag_resources_pull_from_online(tag);
                this.tag_resource(tag_id, null)
                for (const i of data) {
                    await this.tag_resource(tag_id, i.uid)
                }
            }
            return all_tr[tag_id]
        },
        list_tag_resources_pull_from_online: async function (tag: any) {
            if (this.$props.project_id == undefined) return
            const tag_id = tag.uid
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/list_resources`
            this.$emit('add_log', 'DecoPanel', 'click tag...');
            return await axios.get(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'click tag ok');
                    return response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'click tag error');
                    throw err
                })
        },
        list_all_tag_resources: function () {
            for (const i in all_tags.value) {
                this.list_tag_resources(all_tags.value[i])
            }
        },
        color_all_nodes: function () {
            for (const x in (all_tags as any).value) {
                this.color_nodes((all_tags as any).value[x], false)
            }
        },
        plain_graph: function(){
            this.$emit('plain_graph')
        },
        repull: async function () {
            all_tags.value = [];
            all_tag_resources.value = {};
            await this.list_all_tags(true)
            await this.list_all_tag_resources()
            this.color_all_nodes()
        }
    },
    data() {
        return {
            tags_list,
            tags_suggestions_list,
            disable_add,
            tag_focus,
            tag_name_input,
            hide_deco_panel
        }
    },
    watch: {
        async 'data_panel.uid'(new_value) {
            await this.list_tags(this.$props.data_panel.uid)
            this.filter_suggestions()
            showing_tags_for.value = "Node " + new_value
            tag_focus.value = null
        },
        async 'project_id'(new_value) {
            await this.repull()
        }
    },
    computed: {
        showing_tags_for(){
            if(!this.$props.selected_nodes) return "Select a node"
            const sn = this.$props.selected_nodes
            const len = sn.length 
            if(len == 1) return `Node ${sn[0].substr(4)}`
            return `${len} nodes`
        },
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
        },
        chosen_tag() {
            return tag_focus.value ? (tag_focus as any).value.uid : ''
        },
        add_tag_button(){
            if(!this.$props.selected_nodes) return "Add Tag"
            const len = this.$props.selected_nodes.length 
            if(len <= 1){
                return "Add Tag"
            } 
            return `Add Tag (${len})` 
        }
    }
});
</script>
||||||| 223d967
=======
<template>
    <div class="deco-panel">
        <h1 class="title is-4 deco-text">
            Tags: {{ showing_tags_for }}
            <button class="button" @click="hide_deco_panel = !hide_deco_panel">
                {{ hide_deco_panel ?
                "Show" :
                "Hide"}}
            </button>
            <button class="button" @click="repull">
                Resync All Tags
            </button>
        </h1>
        <div v-if="!hide_deco_panel">
            <div id="deco-box">
                <div class="deco-item">
                    <div>
                        <div id="tags-list">
                            <text v-for="tag in tags_list" @contextmenu.prevent="
                                disable_add ? delete_tag((tag as any).uid) : dissociate_tag((tag as any).name)
                            " class="subtitle tag" :style="{'background-color': (tag as any).color}"
                                @click="click_tag(tag)">
                                {{(tag as any).name}}
                            </text>
                        </div>
                        <text>
                            {{ chosen_tag == '' ?  `Left-click a tag to edit it` : `Edit Tag : ${ chosen_tag }` }}
                        </text>
                        <br>
                        <div v-if="tag_focus != null">
                            Tag Color:
                            <input class="input is-hovered info-panel-item" type="text" placeholder="Tag Color"
                                :value="tag_color" @input="preview_tag_color" @change="update_tag_color"
                                @focus="pauseKeyDown" @blur="handleBlur" />
                        </div>
                        <div v-if="tag_focus != null" class="slider-demo-block">
                            <el-slider style="width: 10rem" v-model="tag_priority" @change="tag_priority_change" />
                        </div>
                        <div>
                            Tag Name:
                            <input class="input is-hovered info-panel-item" type="text" placeholder="Tag Name"
                                v-model="tag_name" @change="update_tag_name" @focus="pauseKeyDown" @blur="handleBlur()"
                                autocomplete="on" list="autocomplete_tags" />
                        </div>
                        <datalist id="autocomplete_tags">
                            <option v-for="tag in tags_suggestions_list" :value="(tag as any).name">{{`uid: (${(tag as
                            any).uid})`}}</option>
                        </datalist>
                        <input class="button is-primary" type="button" value="Color Graph" @click="color_all_nodes" />
                        <input class="button is-primary" type="button" value="Plain Graph" @click="plain_graph" />
                        <input class="button is-primary" type="button" :value="add_tag_button" @click="batch_add_tag()"
                            :disabled="disable_add" />
                        <input class="button is-primary" type="button" value="List ALL Tags in Project"
                            @click="list_all_tags(true)" />
                    </div>
                </div>
            </div>
            <div id="deco-box">
                <h1 class="title is-4 deco-text">
                    Node Size:
                </h1>
                <div class="slider-demo-block">
                    Tag Priority:
                    <el-slider style="width: 10rem" v-model="tag_priority" @change="tag_priority_change"/>
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
import { defineComponent, ref } from "vue";

const tags_list = ref([]);
const tags_suggestions_list = ref([]);
const all_tags = ref([]);
const all_tag_resources = ref({});
const showing_tags_for = ref("");
const disable_add = ref(false);
const tag_focus = ref(null);
const tag_name_input = ref("");
const hide_deco_panel = ref(false);
export default defineComponent({
    name: "DecoPanel",
    props: ["data_panel", "project_id", "selected_nodes"],
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
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${(tag_focus as any).value.uid}` +
                `/update_priority?priority=${e}`
            this.$emit('add_log', 'DecoPanel', 'update_priority...');
            axios.post(request_url)
                .then(async (response) => {
                    this.$emit('add_log', 'DecoPanel', 'update priority ok');
                    this.sort_tags_list()
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
        tag_resource: function (tag_id: string, resource_id: any) {
            if (resource_id == null) { // serves as initializer
                (all_tag_resources as any).value[tag_id] = [];
                return
            }
            if (!(tag_id in all_tag_resources.value))
                (all_tag_resources as any).value[tag_id] = [];
            (all_tag_resources as any).value[tag_id].push(resource_id);
        },
        update_suggestions_list: async function () {
            tags_suggestions_list.value = await this.list_all_tags(false)
            this.filter_suggestions()
        },
        batch_add_tag: async function(){
            const tag_name = this.tag_name_input
            const tags = await this.list_all_tags(false)
            var first_tag_matching_name = this.tag_exists(tags, tag_name)
            if (first_tag_matching_name == null) {
                first_tag_matching_name = await this.create_tag().then((res) => { return res; })
            }
            const sn = this.$props.selected_nodes
            for(const x of sn){
                this.add_tag(x.substr(4), first_tag_matching_name)
            }
        },
        add_tag: async function (resource_id : any, tag : any) {
            if(!tag) return
            const tags = await this.list_all_tags(false)
            if(!resource_id) resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const tag_id = tag.uid
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/add_tag?tag_uid=${tag_id}`
            this.$emit('add_log', 'DecoPanel', 'add tag...');
            axios.post(request_url)
                .then(async (response) => {
                    this.tag_resource(tag_id, resource_id);
                    this.sort_tags_list()
                    await this.list_tags(resource_id)
                    this.filter_suggestions()
                    this.$emit('add_log', 'DecoPanel', 'add tag ok');
                    this.$emit('color_node', resource_id, tag.color, tag.priority, true)
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
        get_tag_by_id: function (tag_id: string) {
            const one = all_tags.value.filter(tag => (tag as any).uid == parseInt(tag_id))
            return one.length == 0 ? null : one[0];
        },

        list_tags: async function (resource_id: string) { // list tags for a specific resource
            if (!resource_id) return
            if (all_tags.value.length == 0) await this.list_all_tags(false)
            tags_list.value = []
            for (const x in all_tags.value) { // for all tags
                const tag = (all_tags as any).value[x]
                const tr: any = await this.list_tag_resources(tag)
                if (tr.indexOf(resource_id) != -1) {
                    (tags_list as any).value.push(tag)
                }
            }
            this.sort_tags_list()
            disable_add.value = false;
            return tags_list.value
        },
        // list all tags
        list_all_tags: async function (update_tags_list: boolean) {
            if (all_tags.value.length == 0) {
                all_tags.value = await this.list_all_tags_pull_from_online(update_tags_list);
            }
            if (update_tags_list) {
                tags_list.value = all_tags.value
                this.sort_tags_list()
                showing_tags_for.value = "Entire Project"
                disable_add.value = true
            }
            tags_suggestions_list.value = all_tags.value
            return all_tags.value
        },
        list_all_tags_pull_from_online: async function (update_tags_list: boolean) {
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/list_all_tags`
            this.$emit('add_log', 'DecoPanel', 'list all tag...');
            return axios.get(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'list all tag ok');
                    return response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'list all tag error');
                    throw err
                })
        },
        delete_tag: async function (tag_id: string) {
            try {
                assert(!isNaN(parseInt(tag_id)))
            } catch {
                return
            }
            const tag = this.get_tag_by_id(tag_id);
            if (tag == null) return
            const tr: any = await this.list_tag_resources(tag)
            if (tr.length > 0) {
                if (!confirm(`there are ${tr.length} resources with this tag? delete for sure?`)) return
            }
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/delete_tag?uid=${tag_id}`
            this.$emit('add_log', 'DecoPanel', 'delete tag...');
            axios.post(request_url)
                .then((response) => {
                    all_tags.value = all_tags.value.filter((tag: any) => tag.uid != parseInt(tag_id))
                    tags_list.value = all_tags.value
                    this.sort_tags_list()
                    this.$emit('add_log', 'DecoPanel', 'delete tag ok');
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'delete tag error');
                    throw err
                })
        },
        dissociate_tag: async function (name_of_tag: string) {
            var first_tag_matching_name = this.tag_exists(tags_list.value, name_of_tag)
            if (first_tag_matching_name == null) return
            const resource_id = this.$props.data_panel.uid;
            if (!resource_id) return
            const tag = (first_tag_matching_name as any)
            const tag_id = tag.uid
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/resource/${resource_id}` +
                `/dissociate_tag?tag_uid=${tag_id}`
            this.$emit('add_log', 'DecoPanel', 'diss tag...');
            axios.post(request_url)
                .then(async (response) => {
                    this.$emit('add_log', 'DecoPanel', 'diss tag ok');
                    delete (all_tag_resources as any).value[tag_id]
                    this.list_tag_resources(this.get_tag_by_id(tag_id))
                    const existing_tags: any = await this.list_tags(resource_id)
                    this.update_suggestions_list()
                    await this.$emit('color_node', resource_id, 'blue', tag.priority, true)
                    for (const et in existing_tags) {
                        this.$emit('color_node', resource_id,
                            existing_tags[et].color,
                            existing_tags[et].priority,
                            false)
                    }
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
            const tag: any = this.get_tag_by_id(tag_id)
            const new_color = e.target.value
            if(new_color == '') return;
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/update_color?color=${new_color}`
            this.$emit('add_log', 'DecoPanel', 'update tag color...');
            axios.post(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'update tag color ok');
                    tag.color = new_color;
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
            if (tag_focus.value == null) return;
            const tag_id = (tag_focus as any).value.uid
            const tag : any = this.get_tag_by_id(tag_id)
            const new_name = e.target.value
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/update_name?name=${new_name}`
            this.$emit('add_log', 'DecoPanel', 'update tag name...');
            axios.post(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'update tag name ok');
                    tag.name = new_name
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'update tag name error');
                    throw err
                })

        },
        color_nodes: async function (tag: any, override: boolean) {
            const tr = await this.list_tag_resources(tag)
            // tr is the array of nodes to color <color>
            for (const x in tr) {
                this.$emit('color_node', tr[x], tag.color, tag.priority, override)
            }
        },
        click_tag: async function (tag: any) {
            (tag_focus as any).value = tag
            this.color_nodes(tag, true)
        },
        // lists the resources associated with this tag
        list_tag_resources: async function (tag: any) {
            const tag_id = tag.uid;
            var all_tr = (all_tag_resources as any).value
            if (!(tag_id in all_tr)) {
                var data = await this.list_tag_resources_pull_from_online(tag);
                this.tag_resource(tag_id, null)
                for (const i of data) {
                    await this.tag_resource(tag_id, i.uid)
                }
            }
            return all_tr[tag_id]
        },
        list_tag_resources_pull_from_online: async function (tag: any) {
            if (this.$props.project_id == undefined) return
            const tag_id = tag.uid
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/tag/${tag_id}` +
                `/list_resources`
            this.$emit('add_log', 'DecoPanel', 'click tag...');
            return await axios.get(request_url)
                .then((response) => {
                    this.$emit('add_log', 'DecoPanel', 'click tag ok');
                    return response.data
                })
                .catch(err => {
                    this.$emit('add_log', 'DecoPanel', 'click tag error');
                    throw err
                })
        },
        list_all_tag_resources: function () {
            for (const i in all_tags.value) {
                this.list_tag_resources(all_tags.value[i])
            }
        },
        color_all_nodes: function () {
            for (const x in (all_tags as any).value) {
                this.color_nodes((all_tags as any).value[x], false)
            }
        },
        plain_graph: function(){
            this.$emit('plain_graph')
        },
        repull: async function () {
            all_tags.value = [];
            all_tag_resources.value = {};
            await this.list_all_tags(true)
            await this.list_all_tag_resources()
            this.color_all_nodes()
        }
    },
    data() {
        return {
            tags_list,
            tags_suggestions_list,
            disable_add,
            tag_focus,
            tag_name_input,
            hide_deco_panel
        }
    },
    watch: {
        async 'data_panel.uid'(new_value) {
            await this.list_tags(this.$props.data_panel.uid)
            this.filter_suggestions()
            showing_tags_for.value = "Node " + new_value
            tag_focus.value = null
        },
        async 'project_id'(new_value) {
            await this.repull()
        }
    },
    computed: {
        showing_tags_for(){
            if(!this.$props.selected_nodes) return "Select a node"
            const sn = this.$props.selected_nodes
            const len = sn.length 
            if(len == 1) return `Node ${sn[0].substr(4)}`
            return `${len} nodes`
        },
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
        },
        chosen_tag() {
            return tag_focus.value ? (tag_focus as any).value.uid : ''
        },
        add_tag_button(){
            if(!this.$props.selected_nodes) return "Add Tag"
            const len = this.$props.selected_nodes.length 
            if(len <= 1){
                return "Add Tag"
            } 
            return `Add Tag (${len})` 
        }
    }
});
</script>
>>>>>>> 7525c4323540924fcbe2d9db0247c8b3c01d5f95
