import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Graph from '../views/Graph.vue'
import Explore from '../views/Explore.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/project/:id',
        name: "Graph",
        component: Graph
    },
    {
        path: '/project/',
        name: "Graph",
        component: Graph
    },
    {
        path: '/explore',
        name: 'Explore',
        component: Explore
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})
export default router