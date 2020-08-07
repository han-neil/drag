<template>
  <div id="app">
    <div class="test" style="display: inline-block">自由拖动</div>
    <div class="box">
      <div class="content">
        <h1 v-for="(item, index) in list" :key="index" @click="itemClick(index)">{{item}}</h1>
      </div>
    </div>
    <div class="drag-box">
      上下拖动
    </div>
    <div class="drag-box2">向右拖动</div>
  </div>
</template>

<script>
import Drag from './drag.js'
export default {
  name: 'App',
  data() {
    return {
      bScroll: null,
      list: 50
    }
  },
  mounted() {
    new Drag('.drag-box', {
      banDom: '#app',
      xDrag: false,
      y: 0,
      yDistance: {
        min: 0,
        max: 200
      }
    })

    new Drag('.test', {
      banDom: '#app'
    })
    
    new Drag('.drag-box2', {
      banDom: '#app',
      yDrag: false,
      x: -200,
      xDistance: {
        min: -250,
        max: 0
      }
    })
  },
  methods: {
    itemClick(index) {
      console.log(index)
    }
  }
}
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
}
.content {
  text-align: center;
  border-radius: 20px;
  overflow: hidden;
}
h1 {
  background-color: #f6f6f6;
  border-bottom: 1px solid #fff;
  margin: 0;
  color: rgba(0, 0, 0, 0.2);
}

.drag-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 300px;
  background-color: rgba(255, 255, 0, 0.4);
  z-index: 999;
  text-align: center;
  overflow: scroll;
}
.drag-box2 {
  position: fixed;
  left: 0;
  bottom: 300px;
  z-index: 999;
  width: 300px;
  height: 200px;
  background-color: rgba(255, 0, 255, 0.4);
  text-align: right;
}

.test {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: inline-block;
  padding: 30px;
  background-color: rgba(0, 0, 255, 0.4);
}
</style>
