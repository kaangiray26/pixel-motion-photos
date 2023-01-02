// extract.js
function buffertoblob(data) {
    let start = 0;
    let array = new Uint8Array(data);
    for (let i = 0; i < array.length; i++) {
        if (array[i + 4] == 0x66 && array[i + 5] == 0x74 && array[i + 6] == 0x79 && array[i + 7] == 0x70) {
            start = i;
            break
        }
    }
    console.log(start);
    return new Blob([array.subarray(start, array.length)], { type: "video/mp4" });
}

async function extract_video(file) {
    let buffer = await file.arrayBuffer();
    let blob = buffertoblob(buffer);
    return { "src": URL.createObjectURL(blob), "blob": blob }
}

async function transcode_video_mp4(file, fetcher, ffmpeg) {
    let buffer = await file.arrayBuffer();
    let blob = buffertoblob(buffer);
    let data = await fetcher(blob);

    ffmpeg.FS('writeFile', 'video.mp4', data);
    await ffmpeg.run('-i', 'video.mp4', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '19', '-c:a', 'copy', 'output.mp4');

    let output = await ffmpeg.FS('readFile', 'output.mp4');
    let b = new Blob([output.buffer], { type: "video/mp4" });

    return { "src": URL.createObjectURL(b), "blob": b };
}

async function transcode_video_webm(file, fetcher, ffmpeg) {
    let buffer = await file.arrayBuffer();
    let blob = buffertoblob(buffer);
    let data = await fetcher(blob);

    ffmpeg.FS('writeFile', 'video.mp4', data);
    await ffmpeg.run('-i', 'video.mp4', '-c:v', 'libvpx-vp9', '-crf', '19', '-b:v', '0', 'output.webm');

    let output = await ffmpeg.FS('readFile', 'output.webm');
    let b = new Blob([output.buffer], { type: "video/webm" });

    return { "src": URL.createObjectURL(b), "blob": b };
}

export { extract_video, transcode_video_mp4, transcode_video_webm }