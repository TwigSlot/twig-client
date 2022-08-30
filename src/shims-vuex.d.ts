import { Store } from 'vuex'

declare module '@vue/runtime-core' {
    interface State {
        kratos_user_id: string
    }
    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}
