

// setting variables for dom elements

const openModalBtn = document.getElementById('InfiniteAgesGenesis')
const modal = document.getElementById('bookPdfModal')
const closeBtn = document.querySelector('.close-btn')
const pdfViewer = document.getElementById('pdfViewer')
const downloadBtn = document.getElementById('downloadContent')
const modalContent = document.getElementById('modalContent');
const pdfContainer = document.getElementById('pdfContainer');
//Pdf to show
const previewPdfPath = 'data/InfiniteAgesGenesis.pdf'

// check if mobile 
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}
function handlePdfPreview() {
  const isMobile = isMobileDevice();
  const msg = document.getElementById('pdfMobileMsg');

  if (isMobile) {
    pdfViewer.style.display = 'none';
    msg.style.display = 'block';
    msg.innerText = 'Sorry, preview unavailable on mobile.';
  } else {
    pdfViewer.style.display = 'block';
    msg.style.display = 'none';
    pdfViewer.src = previewPath;
  }
}



// to open modal 
openModalBtn.addEventListener('click', () =>  {
    modal.style.display = 'block';
    openModalBtn.style.display = 'none';
    pdfViewer.src = previewPdfPath;
});

//close modal 
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    openModalBtn.style.display = 'block';
    pdfViewer.src = '';
});

downloadBtn.addEventListener('click', () =>{
const link = document.createElement('a');
link.href = previewPdfPath;
link.download = 'InfiniteAgesGenesis.pdf';
link.click();
});

const youtubeVideos = [
    {id:'9sy4PtkokEs', title:'Chapter 1: Midnight Drive'},
    {id:'xcj2s2Qf9dU', title:'Chapter 2: Dockside'},
    {id:'hL5b-Y3XITY', title:'Infinite Ages Character Creation'},
    {id:'U0wIg3gOTjs', title:'Sprite and sprite animations'},
    {id:'EOQ4TBmWhQg', title:'Rts testing'},
];
let currentVideo = 2;

// dom elements for youtube carousel
const ytNext = document.getElementById('ytNext');
const ytPrev = document.getElementById('ytPrev');
const ytVideo = document.getElementById('ytVideo');
const ytTitle = document.getElementById('ytTitle');


function loadYTVideo(index){
const {id,title} = youtubeVideos[index];
ytTitle.textContent = title;
ytVideo.innerHTML=`<iframe id="ytFrame" src="https://www.youtube.com/embed/${id}" title="${title}" allowfullscreen></iframe>`;
};

ytPrev.onclick = function() {
    currentVideo = (currentVideo - 1 + youtubeVideos.length) % youtubeVideos.length;
    loadYTVideo(currentVideo);
};

ytNext.onclick = function() {
    currentVideo = (currentVideo + 1) % youtubeVideos.length;
    loadYTVideo(currentVideo)
};
loadYTVideo