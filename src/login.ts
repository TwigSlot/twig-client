import { Configuration, V0alpha2Api, V0alpha2ApiInterface } from '@ory/kratos-client'

const apiBaseUrl = "http://127.0.0.1:4455"
let sdk: V0alpha2ApiInterface = new V0alpha2Api(
    new Configuration({ basePath: apiBaseUrl })
)
export default sdk