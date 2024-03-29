import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

const store : any = new Vuex.Store ({
    plugins: [
        new VuexPersistence({
            storage: window.localStorage
        }).plugin
    ],
    state: {
        kratos_user_id: 'guest',
        selected_mode: 'move',
        mobileView: false,
        showInfo: true,
        layout: 0,
        project_id: '0',
    },
    mutations: {
        update_kratos_user_id(state, kratos_user_id){
            state.kratos_user_id = kratos_user_id
        },
        update_selected_mode(state, new_mode){
            state.selected_mode = new_mode
        },
        toggle_view(state){
            state.mobileView = !state.mobileView
        },
        toggle_layout(state){
            state.layout = (state.layout + 1) % 2;
        },
        toggle_info(state){
            state.showInfo = !state.showInfo;
        },
        update_project_id(state, project_id){
            state.project_id = project_id;
        }
    }
})
export default store