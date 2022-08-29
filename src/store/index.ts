import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

const store : any = new Vuex.Store ({
    plugins: [
        new VuexPersistence({
            storage: window.localStorage
        }).plugin
    ],
    state: {
        kratos_user_id: 'guest'
    },
    mutations: {
        update_kratos_user_id(state, kratos_user_id){
            state.kratos_user_id = kratos_user_id
        }
    }
})
export default store