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

export { extract_video }