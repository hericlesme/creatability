let canvas = document.getElementById('output');
let ctx = canvas.getContext('2d');

let livestreamCanvas = document.getElementById('livestream');

let poseDetection;
let video;
let videoWidth, videoHeight;

let sketchGuiState = {
    showVideo: true,
    keypoints: {
        showPoint: true,
        controlPointLocation: 'nose',
        pointsColor: '#e1e1e1',
        pointsStyle: 'fill',
        pointSize: 10,
    }
};


export function setupSketch(
    thePoseDetection,
    theVideo,
    theVideoWidth,
    theVideoHeight
) {
    poseDetection = thePoseDetection;
    video = theVideo;
    videoWidth = theVideoWidth;
    videoHeight = theVideoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    livestreamCanvas.width = videoWidth;
    livestreamCanvas.height = videoHeight;

    sketchLoop();
}

export function initSketchGui(gui) {
    gui.open();

    // Affecting control point
    let keypoints = gui.addFolder('Keypoints');
    keypoints.add(sketchGuiState.keypoints, 'showPoint');
    keypoints.add(sketchGuiState.keypoints, 'controlPointLocation', [
        'nose',
        'rightEye',
        'rightEar',
        'rightShoulder',
        'rightElbow',
        'rightWrist',
        'rightHip',
        'rightKnee',
        'rightAnkle',
        'leftEye',
        'leftEar',
        'leftShoulder',
        'leftElbow',
        'leftWrist',
        'leftHip',
        'leftKnee',
        'leftAnkle',
    ]);
    keypoints.addColor(sketchGuiState.keypoints, 'pointsColor');
    keypoints.add(sketchGuiState.keypoints, 'pointsStyle', ['fill', 'outline']);
    keypoints
        .add(sketchGuiState.keypoints, 'pointSize')
        .min(1)
        .max(200)
        .step(1);
}


let poses;
async function sketchLoop() {

    poses = await poseDetection.getPoses();

    let minPoseConfidence;
    let minPartConfidence;

    switch (poseDetection.guiState.algorithm) {
        case 'single-pose':
            minPoseConfidence = +poseDetection.guiState.singlePoseDetection
                .minPoseConfidence;
            minPartConfidence = +poseDetection.guiState.singlePoseDetection
                .minPartConfidence;
            break;
        case 'multi-pose':
            minPoseConfidence = +poseDetection.guiState.multiPoseDetection
                .minPoseConfidence;
            minPartConfidence = +poseDetection.guiState.multiPoseDetection
                .minPartConfidence;
            break;
    }

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (poses[0]) {
        let parts = poses[0].parts;
        let controlPoint = parts[sketchGuiState.keypoints.controlPointLocation];
        let controlPointY = controlPoint.position.y;
        let controlPointX = controlPoint.position.x;

        if (sketchGuiState.keypoints.showPoint) {
            drawPoint(
                ctx,
                controlPointY,
                controlPointX,
                sketchGuiState.keypoints.pointSize,
                sketchGuiState.keypoints.pointsColor
            );
        }
        ctx.restore();
    } else {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    requestAnimationFrame(sketchLoop);
}

function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    if (sketchGuiState.keypoints.pointsStyle == 'fill') {
        ctx.fill();
    } else if (sketchGuiState.keypoints.pointsStyle == 'outline') {
        ctx.stroke();
    }
}