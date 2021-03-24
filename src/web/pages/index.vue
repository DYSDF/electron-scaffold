<template>
  <div>
    <h2>Hello World</h2>
    <p>Event: {{keytype}} / {{keycode}}</p>
  </div>
</template>
<script>
  import { ipcRenderer } from 'electron'
  export default {
    data() {
      return {
        keytype: '',
        keycode: ''
      }
    },
    mounted() {
      ipcRenderer.send('load-iohook')
      ipcRenderer.on('iohook', (e, data) => {
        this.keytype = data.type
        this.keycode = data.keycode
      })
    }
  }
</script>
