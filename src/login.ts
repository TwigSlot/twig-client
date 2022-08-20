import { Configuration, V0alpha2Api, V0alpha2ApiInterface } from '@ory/client'

const basePath = import.meta.env.VITE_ORY_URL || "http://127.0.0.1:4455"
let sdk: V0alpha2Api = new V0alpha2Api(
    new Configuration({ 
        basePath: basePath,
        baseOptions:{
            withCredentials: true
        }
    })
)
export default {sdk, basePath}