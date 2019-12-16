(function(){  //Copyright 2019 dj  ,License BSD 2-Clause

var i=0; const inp=document.querySelector('input[type=file]'); if(inp) inp.onchange=function(){handleFiles(multiple?this.files:[this.files[0]])}
function handleFiles(files) {  //optional
for (let i = 0; i < files.length; i++) {
const reader = new FileReader();
reader.onload = function(evt) {
 var blob=buffertoblob(evt.target.result)
 blobtovid(blob,files[i].name)
 }
reader.readAsArrayBuffer(files[i])
}
}

var multiple=true; //edit here

var ls=location.search; if(ls.slice(0,4)=='?MV=') imgtoblob(ls.slice(4)).then(blob => blobtovid(blob))  //?MV=MV...jpg
if(ls=='?swap') {multiple=!multiple; ls=false}

async function imgtoblob(img) 
{
 let response = await fetch(img);
 let data = await response.arrayBuffer()
 return buffertoblob(data);
}

function buffertoblob(data) {
 var array=new Uint8Array(data), start
 for (var i = 2; i < array.length; i++) {if (array[i+4]==0x66 && array[i+5]==0x74 && array[i+6]==0x79 && array[i+7]==0x70) {start=i; break}}  //ftyp
 var blob=new Blob([array.subarray(start||0, array.length)], {type:"video/mp4"});
  return blob;
}

function blobtovid(blob,fn) {
 var vid=document.querySelector('video'); if(vid && !multiple) {vid.src=URL.createObjectURL(blob); vid.title=fn||''; return}
 vid=document.createElement("video"); const ref=document.querySelector('ul')||document.body  //HFS2.4
 vid.preload = 'auto'; vid.controls = true
 vid.style = 'height:100vh'
 vid.title = fn||''
 try {blob=new File([blob], fn+'.mp4' ,{type:"video/mp4"})} catch (e) {console.log(e)}  //FF
 vid.src=URL.createObjectURL(blob);
 if(!multiple) {vid.onended= () => {vid.autoplay=1;let r=3;
  if(inp&&inp.files.length) {i=(i+1)%(inp.files.length*r);if(!((i/r)%1)) handleFiles([inp.files[Math.floor(i/r)]]); else vid.play()}
  else if(mv&&mv.length) {i=(i+1)%mv.length;imgtoblob(mv[i].getAttribute('src')).then(blob => blobtovid(blob))}  //
 }} else
 {vid.loop=true;vid.currentTime=1}
 if('pictureInPictureEnabled' in document && !multiple && !ls) vid.onloadedmetadata = (e) => vid.requestPictureInPicture(); //else  //
 {ref.append(vid)}  //;vid.scrollIntoView()
 if (!multiple &&'mediaSession' in navigator) navigator.mediaSession.setActionHandler('nexttrack', vid.onended)  //>5sec click multiple
}

const ref=document.querySelector('#files')||document.body
ref.addEventListener('click', function(){
const img=event.target.getAttribute('href')||event.target.getAttribute('src')
if(event.target.tagName!='IMG' || !/(^|\/)MV.+\.jpg$/.test(img)) return  //motion photos beginns with MV  //edit here 'A' or 'IMG'
event.preventDefault() 
imgtoblob(img).then(blob => blobtovid(blob));
})

var mv=document.querySelectorAll('img')  //'img[src^="MV"]'
})()
