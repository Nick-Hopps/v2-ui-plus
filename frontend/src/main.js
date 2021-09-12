import { createApp } from "vue";
import App from "./App.vue";
import { Message } from "ant-design-vue";

const app = createApp(App);
app.provide("$message", Message);
app.config.productionTip = false;

app.mount("#app");

import { Inbound } from "./v2ray";
new Inbound();
