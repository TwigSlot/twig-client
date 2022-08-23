import { Configuration, V0alpha2Api} from '@ory/client'

const basePath = import.meta.env.VITE_ORY_URL || "http://localhost:4455"
let sdk: V0alpha2Api = new V0alpha2Api(
    new Configuration({ 
        basePath: basePath,
        baseOptions:{
            withCredentials: true,
        }
    })
)
export default {sdk, kratosBasePath: basePath}