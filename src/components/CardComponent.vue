<template>
  <div class="card" :style="{marginBottom: '30px'}">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img
              :src="imageUrl"
              alt="Placeholder image"
            />
          </figure>
        </div>
        <div class="media-content">
          <p class="title is-4">{{ user.first_name + ' ' + user.last_name}}</p>
          <p class="subtitle is-6">{{ user.email }}</p>
        </div>
      </div>

      <div class="content">
        This twig germinated on
        <br />
        <time datetime="2016-1-1">{{ new Date(user.created_at) }}</time>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfileCardComponent",
  props: {
    imageUrl: String,
    user: Object,
    content: String,
  },
};
</script>
