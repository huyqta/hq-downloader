<template>
  <div class="logo">
    <a target="_blank" href="https://hku.app/">
      <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 512 512">
        <rect x="0" y="0" width="512" height="512" rx="100" fill="#2d2d2d"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="#4caf50">HKU</text>
      </svg>
    </a>
  </div>
</template>

<script>
  export default {
    name: 'mo-logo',
    props: {
      width: {
        type: Number,
        default: 62
      },
      height: {
        type: Number,
        default: 14
      }
    }
  }
</script>

<style lang="scss">
.logo {
  display: inline-block;
  margin: 0;
  padding: 0;
  > a {
    display: block;
    width: 100%;
    height: 100%;
    outline: none;
    border: none;
    text-align: center;
    font-size: 0;
    color: $--app-logo-color;
  }
  svg {
    fill: currentColor;
  }
}
</style>
