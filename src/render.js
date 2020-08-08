// Getting buttons 
// Click to start recording
const startButton = document.getElementById('startButton');
startButton.onclick = e => {
    // Run only when a video source has been selected
    if (!mediaRecorder) {
        document.getElementById('feedback').innerText = 'Please select a video source first'
    }
    else {
        mediaRecorder.start();
        startButton.classList.add('warning');
        startButton.querySelector('.button__text').innerText = 'Recording';
    }
}
// Change inner text of button when an event is triggered
function changeText(newText) {
    querySelector('.button__text').innerText = newText;
}

function reset(buttonRef) {
    buttonRef.classList.remove('warning', 'secondary');
    switch (buttonRef) {
        case 'startButton':
            buttonRef.changeText('Start');
            break;
        case 'pauseButton':
            buttonRef.changeText('Pause');
            break;
        default:
            return
    }
}

// Click to stop the  recording
const stopButton = document.getElementById('stopButton');
stopButton.onclick = e => {
    // Run only when a video source has been selected
    if (!mediaRecorder) {
        document.getElementById('feedback').innerText = 'Please select a video source first'
    }
    else {
        mediaRecorder.stop();
        startButton.classList.add('secondary');
        reset(startButton);
    }
    
}

// Click to pause the recording
const pauseButton = document.getElementById('pauseButton');
pauseButton.onclick = e => {
    // Run only when a video source has been selected
    if (!mediaRecorder) {
        document.getElementById('feedback').innerText = 'Please select a video source first'
    }
    else if (mediaRecorder.state == "inactive") {
        document.getElementById('feedback').innerText = 'Please start recording first'
    }
    else if (mediaRecorder.state !== "paused") {
        mediaRecorder.pause();
        pauseButton.querySelector('.button__text').innerText = 'Resume';
        pauseButton.classList.remove('warning');
        pauseButton.classList.add('success');
    }
        else {
            mediaRecorder.resume();
            pauseButton.querySelector('.button__text').innerText = 'Pause';
            pauseButton.classList.add('warning');
            // reset(pauseButton);
        }
        
}


// Click to list all available video sources
const selectVideoSource = document.getElementById('selectVideoSource');
// Preview for video source
const previewVideo = document.querySelector('video');
selectVideoSource.onclick = getVideoSources;


const { desktopCapturer, remote } = require('electron');
const { Menu, dialog } = remote;
const { writeFile } = require('fs');
const { checkServerIdentity } = require('tls');

// Get the Available video sources
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    // Populate the available video sources in a Menu/Dropdown
    const VideoSourceOptions = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source),
            };
        })
    );


    VideoSourceOptions.popup();
}


// Empty array for populating recorded data
const chunks = [];
let mediaRecorder;

// Setup Options for MediaRecorder
const mediaRecorderOptions = { mimeType: 'video/webm; codecs=vp9' };
// MIME types (IANA media types)
// A media type (also known as a Multipurpose Internet Mail Extensions or MIME type) 
// Is a standard that indicates the nature and format of a document, file, or assortment of bytes.


// Select video source from the list
async function selectSource(source) {
    selectVideoSource.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id,

            }
        }
    }

    // Create stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Set the video source object on the frontend to be the stream
    previewVideo.srcObject = stream;
    previewVideo.play();

    // ===== Start RECORDING ===== //


    // The MediaRecorder interface of the MediaStream Recording API provides functionality to easily record media. 
    // Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
    mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

    // Some Events when recording starts
    mediaRecorder.ondataavailable = handleVideoDataExists;
    mediaRecorder.onstop = handleVideoDataStopped;

    
}


// Combine video chunks into one array
function handleVideoDataExists(e) {
    chunks.push(e.data);
}

const { mimeType } = mediaRecorderOptions;

// Save video file
async function handleVideoDataStopped(e) {
    const blob = new Blob(chunks, {
        type: mimeType
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    // https://stackoverflow.com/questions/11821096/what-is-the-difference-between-an-arraybuffer-and-a-blob
    // ArrayBuffer -  for manipulations to a Blob
    // The buffers module provides a way of handling streams of binary data.
    // Ref: https://www.w3schools.com/nodejs/ref_buffer.asp

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: "Save Video",
        defaultPath: `twa me ScreenRecording-01.webm`,
    });

    document.querySelector('.saveLocation').innerText = `video saved at  ${filePath}`;
    writeFile(filePath, buffer);
}



