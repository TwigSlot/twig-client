import { Configuration, V0alpha2Api} from '@ory/client'

const kratosBasePath = import.meta.env.VITE_ORY_URL || "http://localhost:4455"
const authBasePath = import.meta.env.VITE_AUTH_URL || "http://localhost:4455"
let sdk: V0alpha2Api = new V0alpha2Api(
    new Configuration({ 
        basePath: kratosBasePath,
        baseOptions:{
            withCredentials: true,
        }
    })
)
export default {sdk, kratosBasePath: kratosBasePath, authBasePath: authBasePath }