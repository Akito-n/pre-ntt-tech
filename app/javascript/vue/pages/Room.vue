<template>
  <div id="app">
    <video id="their-video" width="200" autoplay playsinline></video>
    <video id="my-video" muted="true" width="500" autoplay playsinline></video>
    <p>
      Your Peer ID: <span id="my-id">{{ api }}</span>
    </p>
    <input v-model="state.calltoid" placeholder="call id" />
    <button @click="makeCall" class="button--green">Call</button>
    <br />

    マイク:
    <select v-model="state.selectedAudio" @change="startCamera">
      <option disabled value="">Please select one</option>
      <option
        v-for="(audio, key, index) in audios"
        v-bind:key="index"
        :value="audio.value"
      >
        {{ audio.text }}
      </option>
    </select>

    カメラ:
    <select v-model="state.selectedVideo" @change="startCamera">
      <option disabled value="">Please select one</option>
      <option
        v-for="(video, key, index) in videos"
        v-bind:key="index"
        :value="video.value"
      >
        {{ video.text }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { defineComponent, reactive, ref } from '@vue/composition-api'
import { useResult } from '@vue/apollo-composable'
import { useCurrentUserQuery } from '@/graphql/types'
import { UserConnection } from 'graphql/types'

export default defineComponent({
  setup(_, context) {
    const { result, loading } = useCurrentUserQuery()
    const email = useResult(result, null, (data) => data.currentUser.email)

    const api = process

    const state = reactive({
      calltoid: '',
      selectedAudio: '',
      selectedVideo: '',
      localStream: null
    })

    const audios = ref([])
    const videos = ref([])

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
      const video = <HTMLVideoElement>document.getElementById('my-video')
      video.srcObject = stream
      state.localStream = stream
    }

    const makeCall = () => {
      const call =
    }

    // TODO: mutatioin example
    return { state, email, loading, audios, videos, api, makeCall, startCamera }
  }
})
</script>

<style scoped></style>
