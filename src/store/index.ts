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
    },
    mutations: {
        update_kratos_user_id(state, kratos_user_id){
            state.kratos_user_id = kratos_user_id
        },
        update_selected_mode(state, new_mode){
            state.selected_mode = new_mode
        }
    }
})
export default store