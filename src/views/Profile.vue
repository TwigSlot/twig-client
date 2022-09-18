<template>
    <CardComponent
      :imageUrl="profile_picture_src"
      :name="user.name"
      :email="user.email"
      content="Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Phasellus nec iaculis mauris."
    ></CardComponent>
  <ProjectList></ProjectList>
</template>

<script lang="ts">
import login from "../login";
import { defineComponent, ref } from "vue";
import ProjectList from "../components/ProjectList.vue";
import CardComponent from "../components/CardComponent.vue";

const sdk = login.sdk;
const default_profile_picture = "/profile_pic.jpeg";
const user = ref({
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
  mounted() {
    sdk.toSession().then(({ data }) => {
      user.value.email = data.identity.traits.email;
      user.value.name =
        data.identity.traits.name.first + data.identity.traits.name.last;
    });
  },
});
</script>
