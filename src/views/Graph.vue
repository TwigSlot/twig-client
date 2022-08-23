<template>
    <div id="graph">
        <v-network-graph ref="graph" v-model:selected-nodes="graphData.selectedNodes"
            v-model:selected-edges="graphData.selectedEdges" :nodes="graphData.nodes" :edges="graphData.edges"
            :layouts="graphData.layouts" :configs="graphData.configs" :event-handlers="graphData.eventHandlers" />
    </div>
    <div class="info-panel-outer">
        <div class="info-panel-inner">
            <div v-if="dataPanel.get('labels')" v-bind:id="dataPanel.get('id')" class="info-panel-inner-details-id">
                <h3>Properties</h3>
                <ul>
                    <li v-for="(label, index) in dataPanel.get('labels')" :key="index" contenteditable="true"
                        v-on:blur="onInputLabel">
                        {{ label }}</li>
                    <li v-if="dataPanel.get('objType') == 'Node'"><input type='button' value='Add Label'
                            onclick='document.addLabel()' />
                    </li>
                </ul>
                <table>
                    <tr>
                        <th>&lt;id&gt;</th>
                        <th>{{ dataPanel.get('id') }}</th>
                    </tr>
                    <!-- <p>{{dataPanel.properties}}</p> -->
                    <tr v-for="(value, property) in dataPanel.get('properties')" :key="value">
                        <th contenteditable="true" v-on:blur="onInputPropertyName">
                            {{ property }}
                        </th>
                        <th v-bind:id="'valueOf' + property" contenteditable="true" v-on:blur="onInputPropertyValue">
                            {{ value }}
                        </th>
                    </tr>
                    <tr><input type="button" value="Add Property" onclick="document.addProperty()" /></tr>
                </table>
            </div>
            <div v-else-if="dataPanel.get('objType')">Creating {{ dataPanel.get('objType') }} in Neo4J... Hover over
                node
                again later to
                check
            </div>
            <div v-else>Hover over a node/edge to check it out</div>
        </div>
    </div>

</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import graphData from "../graphData"
var dataPanel = reactive(new Map<string, any>());
dataPanel.set('labels', [])
dataPanel.set('id', '123')
dataPanel.set('properties', [])
dataPanel.set('objType', [])

export default defineComponent({
    name: "Graph",
    components: {

    },
    data() {
        return {
            project_id: this.$route.params.id,
            graphData,
            dataPanel,
        }
    },
    methods: {
        onInputPropertyName: function() {

        },
        onInputPropertyValue: function() {

        },
        onInputLabel: function () {

        },

    }
})
</script>