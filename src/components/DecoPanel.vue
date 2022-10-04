<template>
    <div class="deco-panel">
        <div id="deco-box">
            <h1 class="title is-4 deco-text">
                Tags:
            </h1>
        </div>
        <div id="deco-box">
            <h1 class="title is-4 deco-text">
                Size:
            </h1>
        </div>
    </div>
</template>
  
<style lang="scss" scoped>
.deco-text {
    color: blue;
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
import { defineComponent, ref } from "vue";

export default defineComponent({
    name: "DecoPanel",
});
</script>