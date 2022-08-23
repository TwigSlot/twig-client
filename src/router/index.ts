import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Graph from '../views/Graph.vue'
import Explore from '../views/Explore.vue'
import Profile from '../views/Profile.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/project',
        name: "Graph",
        component: Graph
    },
    {
        path: '/project/:id',
        name: "Graph",
        component: Graph
    },
    {
        path: '/user/:id', // note id could be the kratos_user_id or username
        name: "Profile",
        component: Profile,
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