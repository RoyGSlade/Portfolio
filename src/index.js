

// setting variables for dom elements

const openModalBtn = document.getElementById('InfiniteAgesGenesis')
const modal = document.getElementById('bookPdfModal')
const closeBtn = document.querySelector('.close-btn')
const pdfViewer = document.getElementById('pdfViewer')
const downloadBtn = document.getElementById('downloadContent')
const modalContent = document.getElementById('modalContent');
const pdfContainer = document.getElementById('pdfContainer');
const textBasedBtn = document.getElementById('textbased');

//Pdf to show
const previewPdfPath = '../public/data/InfiniteAgesGenesis.pdf'

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


// Cool countdown to next game release

// Define the segments for each digit (1-9, 0) in a 7-segment display
 var digitSegments = [ 
  [1,2,3,4,5,6],
  [2,3],
  [1,2,7,5,4],
  [1,2,7,3,4],
  [6,7,2,3],
  [1,6,7,3,4],
  [1,6,5,4,3,7],
  [1,2,3],
  [1,2,3,4,5,6,7],
  [1,2,7,3,6]
  ];


  // Define a flag to control the five-second forced update
let fiveSecondUpdate = true;

// Function to set the digit number
var setNumber = function(digit, number) {
    var segments = digit.querySelectorAll('.segment');
    var current = parseInt(digit.getAttribute('data-value'));


    // Update all digits during the first 5 seconds or only if the number has changed after that
    if (fiveSecondUpdate || current !== number) {

        // Remove segments for the current number
        if (!isNaN(current) && digitSegments[current]) {
            digitSegments[current].forEach(function(digitSegment, index) {
                setTimeout(function() {
                    segments[digitSegment - 1].classList.remove('on');
                }, index * 45);
            });
        }

        // Add segments for the new number
        if (digitSegments[number]) {
            setTimeout(function() {
                digitSegments[number].forEach(function(digitSegment, index) {
                    setTimeout(function() {
                        segments[digitSegment - 1].classList.add('on');
                    }, index * 45);
                });
            }, 250);
            
            // Update the data-value to the new number
            digit.setAttribute('data-value', number);
        }
    }
};

// Function to initialize and update the clock
var targetDate = new Date("July 31, 2025 12:00:00");

function updateClock() {
    var currentDate = new Date().getTime();
    var timeDifference = targetDate - currentDate;

    // Calculate the number of days, hours, minutes, and seconds remaining
    var days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    var hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    // Update the display with the remaining time
    setNumber(document.getElementById("days_tens"), Math.floor((days % 100) / 10));
    setNumber(document.getElementById("days_ones"), days % 10);

    setNumber(document.getElementById("hours1"), Math.floor(hours / 10));
    setNumber(document.getElementById("hours2"), hours % 10);

    setNumber(document.getElementById("minutes1"), Math.floor(minutes / 10));
    setNumber(document.getElementById("minutes2"), minutes % 10);

    setNumber(document.getElementById("seconds1"), Math.floor(seconds / 10));
    setNumber(document.getElementById("seconds2"), seconds % 10);
}


// Then, after a short delay, start the countdown
setTimeout(function() {
    updateClock();  // Call updateClock initially to avoid waiting for the first interval
    setInterval(function() {
        updateClock();
    }, 1000);  // Call updateClock every second
}, 500);  // Delay of 500ms before starting the countdown

// Stop the forced updates after 5 seconds
setTimeout(function() {
    console.log('Switching to conditional updates after 5 seconds');
    fiveSecondUpdate = false;  // After 5 seconds, only update if the number changes
}, 100);
 

textBasedBtn.addEventListener('click', () => {
  window.location.href = '../public/textbasedrpg/game.html';
});