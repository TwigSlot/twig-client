import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GraphLayout from '../views/GraphLayout.vue'
import ListLayout from '../views/ListLayout.vue'
import Explore from '../views/Explore.vue'
import Profile from '../views/Profile.vue'
import EditProject from '../views/EditProject.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/project',
        name: "GraphBlank",
        component: GraphLayout
    },
    {
        path: '/project/:id',
        name: "GraphLayout",
        component: GraphLayout
    },
    {
        path: '/project/:id/list',
        name: "ListLayout",
        component: ListLayout,
    },
    {
        path: '/project-edit',
        name: 'EditProject',
        component: EditProject,
        props: (route: any) => ({id: route.query.id})
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
    routes,
    linkActiveClass: 'is-active'
})
export default router