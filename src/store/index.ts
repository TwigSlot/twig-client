import { createStore } from 'vuex'

const store : any = createStore({
    state(){
        return {
            kratos_user_id: 'guest'
        }
    },
    mutations: {
        update_kratos_user_id(state, kratos_user_id){
            state.kratos_user_id = kratos_user_id
        }
    }
})
export default store