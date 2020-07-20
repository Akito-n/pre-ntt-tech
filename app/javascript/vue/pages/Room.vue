<template>
  <div id="app">
    <div class="flex">
      <video id="other-video" width="500" autoplay playsinline></video>
      <video
        id="my-video"
        muted="true"
        width="500"
        autoplay
        playsinline
      ></video>
    </div>
    <p>
      Your Peer ID: <span id="my-id">{{ state.peerId }}</span>
    </p>
    <input v-model="state.calltoid" placeholder="call id" />
    <button @click="makeCall" class="button--green">Call</button>
    <br />
    <div v-for="(emoji, i) in emojis" :key="i">
      <span class="mr-2" @click="insert(emoji)">{{ emoji }}</span>
    </div>
    <div>
      <input v-model="state.msgText" placeholder="ここにメッセージ" />
      <button v-if="state.messageChannel" @click="speak">送信</button>
      <p v-for="(message, index) in state.messages" :key="index">
        {{ message.message || 'メッセージなし' }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { defineComponent, reactive, ref, onMounted } from '@vue/composition-api'
import { useResult } from '@vue/apollo-composable'
import { useCurrentUserQuery } from '@/graphql/types'
import { UserConnection, Subscription } from 'graphql/types'
import ActionCable from 'actioncable'
const { VUE_APP_WS } = process.env
const cable = ActionCable.createConsumer(VUE_APP_WS)
Vue.prototype.$cable = cable

export default defineComponent({
  setup(_, context) {
    const { result, loading } = useCurrentUserQuery()
    const email = useResult(result, null, (data) => data.currentUser.email)
    const { VUE_APP_SKYWAY_API_KEY } = process.env

    //yarn無理だったのでcdnにした
    const peer = new Peer({
      key: VUE_APP_SKYWAY_API_KEY
    })

    const state = reactive({
      calltoid: '',
      selectedAudio: '',
      selectedVideo: '',
      peerId: '',
      localStream: null,
      msgText: '',
      messages: [],
      messageChannel: null
    })

    const audios = []
    const videos = []

    const startCamera = () => {
      if (state.selectedAudio != '' && state.selectedVideo != '') {
        connectionCamera()
      }
    }

    const connectionCamera = async () => {
      const constraints = {
        audio: state.selectedAudio
          ? { deviceId: { exact: state.selectedAudio } }
          : false,
        video: state.selectedVideo
          ? { deviceId: { exact: state.selectedVideo } }
          : false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      const video = document.getElementById('my-video') as HTMLVideoElement
      video.srcObject = stream
      state.localStream = stream
    }

    const makeCall = () => {
      console.log(state.calltoid)
      const call = peer.call(state.calltoid, state.localStream)
      connect(call)
    }

    const connect = (call) => {
      call.on('stream', (stream) => {
        const elementObject = document.getElementById('other-video')
        elementObject.srcObject = stream
        elementObject.play()
      })
    }

    onMounted(async () => {
      state.messageChannel = Vue.prototype.$cable.subscriptions.create(
        'MessageChannel',
        {
          received: (data) => {
            state.messages.push(data)
          }
        }
      )
      //console.log(peer)
      peer.on('open', () => (state.peerId = peer.id))
      peer.on('call', (call) => {
        call.answer(state.localStream)
        connect(call)
      })

      //デバイスにアクセスする
      const deviceInfos = await navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true
        })
        .then((stream) => {
          // 成功時にvideo要素にカメラ映像をセットして、再生
          const videoElm = document.getElementById('my-video')
          videoElm.srcObject = stream
          videoElm.play()
          // 着信時に相手にカメラ映像を返せるように、保存しておく
          state.localStream = stream
        })
        .catch((error) => {
          // 失敗時にはエラーログを出力
          console.error('mediaDevice.getUserMedia() error:', error)
          return
        })
    })

    const emojis = ['👍', '🙆', '⭐', '💡', '💯']

    const speak = () => {
      state.messageChannel.perform('speak', {
        message: state.msgText
      })
      state.msgText = ''
    }

    const insert = (emoji) => {
      state.msgText = emoji
    }

    // TODO: mutatioin example
    return {
      state,
      email,
      loading,
      audios,
      videos,
      makeCall,
      startCamera,
      speak,
      emojis,
      insert
    }
  }
})
</script>

<style scoped></style>
