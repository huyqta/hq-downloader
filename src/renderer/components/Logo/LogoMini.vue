<template>
  <h1 class="logo-mini">
    <a target="_blank" href="https://hku.app/">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 256 256">
        <rect x="0" y="0" width="256" height="256" rx="50" fill="#2d2d2d"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#4caf50">H</text>
      </svg>
    </a>
  </h1>
</template>

<script>
  export default {
    name: 'mo-logo-mini'
  }
</script>

<style lang="scss">
.logo-mini {
  margin: 0;
  padding: 0;
  width: 100%;
  > a {
    display: block;
    width: 28px;
    height: 28px;
    text-align: center;
    font-size: 0;
    outline: none;
    padding: 2px;
    margin: 0 auto;
  }
}
</style>
