<template>
  <div id="app">
    <img src="./assets/logo.png" alt="" />
    <div>
      <p>
        If Ant-Design-Vue is successfully added to this project, you'll see an
        <code v-text="'<a-pagination>'"></code>
        below
      </p>
      <a-pagination size="small" :total="50" showSizeChanger showQuickJumper />
    </div>
  </div>
</template>

<script>
import { Pagination } from "ant-design-vue";

export default {
  name: "app",
  data() {
    return {
      text: "Primary",
    };
  },
  components: {
    APagination: Pagination,
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-bottom: 20px;
}
</style>
