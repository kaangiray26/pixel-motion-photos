<template>
    <div class="row gx-0 justify-content-center">
        <div class="col-11 col-lg-6 my-4">
            <div class="card">
                <div class="card-body">
                    <div>
                        <h1 class="fw-bold">Pixel Motion Photos to Videos</h1>
                    </div>
                    <div class="input-group flex-nowrap mb-2">
                        <span class="input-group-text bi bi-images" id="addon-wrapping"></span>
                        <input ref="file_input" type="file" class="form-control" aria-describedby="addon-wrapping"
                            multiple="true" accept=".jpg">
                    </div>
                    <div class="d-flex flex-row align-items-end" v-if="ffmpeg_loaded">
                        <span class="fs-5 fw-bold text-decoration-underline me-4">Convert to:</span>
                        <button class="btn btn-dark me-2" @click="convert_mp4">MP4</button>
                        <button class="btn btn-dark" @click="convert_webm">WebM</button>
                    </div>
                </div>
            </div>
            <div v-if="!ffmpeg_loaded" class="alert alert-warning appear my-2" role="alert">
                ffmpeg.wasm loading...
            </div>
            <div v-if="ffmpeg_error" class="alert alert-danger appear my-2" role="alert">
                ffmpeg.wasm couldn't be loaded!
            </div>
            <div v-if="alert" class="alert alert-danger appear my-2" role="alert">
                Please select at least one file !
            </div>
            <div v-if="loading" class="alert alert-primary appear my-2" role="alert">
                Loading...
            </div>
            <div v-show="videos.length" class="card mt-2">
                <div class="card-body">
                    <div class="d-flex flex-column mb-2">
                        <button class="btn btn-dark" @click="download">Download All</button>
                    </div>
                    <div class="container">
                        <div class="row row-cols-4 g-2">
                            <div class="col" v-for="video in videos">
                                <video :src="video.src" class="img-fluid" autoplay="true" loop="true"
                                    @error="fallback"></video>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <a ref="downloadLink" class="visually-hidden"></a>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { extract_video, transcode_video_webm, transcode_video_mp4 } from '/js/extract.js';

const alert = ref(false);
const loading = ref(false);
const ffmpeg_loaded = ref(false);
const ffmpeg_error = ref(false);

const fetcher = ref(null);
const ffmpeg = ref(null);

const file_input = ref(null);
const downloadLink = ref(null);

const videos = ref([]);

function reset() {
    alert.value = false;
    loading.value = false;
    videos.value = [];
}

async function fallback(ev) {
    ev.target.classList.add("bg-dark");
}

async function download() {
    let zip = new JSZip();
    for (let i = 0; i < videos.value.length; i++) {
        zip.file(`video${i}.mp4`, videos.value[i].blob);
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {
        downloadLink.value.href = URL.createObjectURL(content);
        downloadLink.value.download = "photos.zip";
        downloadLink.value.click();
    });
}

async function convert_mp4() {
    reset();
    await nextTick();

    if (file_input.value.files.length == 0) {
        alert.value = true;
        return;
    }

    loading.value = true;
    for (let i = 0; i < file_input.value.files.length; i++) {
        let obj = await transcode_video_mp4(file_input.value.files[i], fetcher.value, ffmpeg.value);
        videos.value.push(obj);
    }
    loading.value = false;
}

async function convert_webm() {
    reset();
    await nextTick();

    if (file_input.value.files.length == 0) {
        alert.value = true;
        return;
    }

    loading.value = true;
    for (let i = 0; i < file_input.value.files.length; i++) {
        let obj = await transcode_video_webm(file_input.value.files[i], fetcher.value, ffmpeg.value);
        videos.value.push(obj);
    }
    loading.value = false;
}

onMounted(async function () {
    const { createFFmpeg, fetchFile } = FFmpeg;
    fetcher.value = fetchFile;
    ffmpeg.value = createFFmpeg();
    ffmpeg.value.load().then((response) => {
        ffmpeg_loaded.value = true;
    }).catch((error) => {
        ffmpeg_error.value = true;
    })
})
</script>