<template>
  <CardComponent :imageUrl="profile_picture_src" :user="user" content="Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Phasellus nec iaculis mauris."></CardComponent>
  <ProjectList></ProjectList>
</template>

<script lang="ts">
import login from "../login";
import { defineComponent, ref } from "vue";
import ProjectList from "../components/ProjectList.vue";
import CardComponent from "../components/CardComponent.vue";
import axios from "axios";

const sdk = login.sdk;
const default_profile_picture = "/profile_pic.jpeg";
const user : any = ref({
  name: "tan chien hao",
  email: "tanchienhao@gmail.com",
});
export default defineComponent({
  name: "Profile",
  components: {
    ProjectList,
    CardComponent,
  },
  data() {
    return {
      profile_picture_src: default_profile_picture,
      user,
      showcased_projects: [
        {
          uid: 1,
          title: "hello",
          description: "desc1",
          authors: ["meow", "tch"],
        },
        {
          uid: 2,
          title: "bye",
          description: "desc1",
          authors: ["meow", "tch"],
        },
        { uid: 3, title: "hi", description: "desc1", authors: ["meow", "tch"] },
      ],
    };
  },
  methods: {
    update_user: function(id: String, dict: any) {
      var args = ""
      for(var x in dict){
        if(dict[x] == undefined) dict[x] = '';
        args += x + '=' + encodeURIComponent(dict[x]) + '&'
      }
      const request_url_update_user = `${import.meta.env.VITE_API_URL}` +
        `/user/update/${id}` +
        `?${args}`
      console.log(request_url_update_user)
      return axios.post(request_url_update_user)
    }
  },
  mounted() {
    sdk.toSession().then(({ data }) => {
      if (data.identity.id == this.$route.params.id) {
        const request_url =
          `${import.meta.env.VITE_API_URL}` + `/user/${data.identity.id}`;
        axios
          .get(request_url)
          .then((response) => {
            console.log('api', response.data.user)
            console.log('kratos', data.identity.traits)
            const pairs : any = { // key and desired values
              'first_name': data.identity.traits.name.first,
              'last_name': data.identity.traits.name.last,
              'created_at': data.identity.created_at,
              'email': data.identity.traits.email,
            }
            for(var x in pairs){
              if((x in response.data.user && response.data.user[x] == pairs[x]) || false){
                user.value[x] = pairs[x]
              }else{
                this.update_user(data.identity.id, pairs).then((updated_response : any) => {
                  for(var y in pairs){
                    user.value[y] = updated_response.data.user[y]
                  }
                })
                break
              }
            }
          })
      }else{
        const request_url =
          `${import.meta.env.VITE_API_URL}` + `/user/${this.$route.params.id}`;
        axios
          .get(request_url).then((response) => {
            user.value = response.data.user
            console.log(response.data.user)
          })
      }
    })
  },
});
</script>
