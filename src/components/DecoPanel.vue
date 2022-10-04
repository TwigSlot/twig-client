<template>
    <div class="deco-panel">
        <div id="deco-box">
            <div class="deco-item">
                <h1 class="title is-4 deco-text">
                    Tags:
                </h1>
                <div id="tags-list">
                    <text class="subtitle tag">hi</text>
                </div>
                <input class="input is-hovered info-panel-item" type="text" placeholder="Color"
                    v-model="data_panel.color" @focus="pauseKeyDown" @blur="handleBlur()" />
                <input class="input is-hovered info-panel-item" type="text" placeholder="Tag" v-model="tag_name" />
                <input class="button is-primary" placeholder="Add Tag" @click="add_tag" />
                <input class="button is-primary" placeholder="List Tags" @click="list_tags" />
                <input class="button is-primary" placeholder="Delete Tag (by uid)" @click="delete_tag" />
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
        add_tag: function () {
            if (tag_name.value == "") return
            console.log("adding", tag_name.value)
            console.log('inside project', this.$props.project_id)
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/create_tag?name=${tag_name.value}`
            axios.post(request_url)
                .then((response) => {
                    console.log(response.data)
                })
        },
        list_tags: async function () {
            const request_url = `${import.meta.env.VITE_API_URL}` +
                `/project/${this.$props.project_id}` +
                `/list_tags`
            return axios.get(request_url)
                .then((response) => {
                    console.log(response.data)
                    return response.data
                })
        },
        delete_tag: async function () {
            const tags = await this.list_tags().then((arr) => {return arr;})
            console.log(tags)
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
                    console.log(response.data)
                })
                .catch((err) => {
                    console.log(err)
                })

        }
    },
    data() {
        return {
            tag_name
        }
    }
});
</script>
