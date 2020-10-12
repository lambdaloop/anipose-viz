
var scheme = [
    [0, 1, 2, 3, 4], // L1A-L1E
    [5, 6, 7, 8, 9], // L2A-L2E
    [10, 11, 12, 13, 14], // L3A-L3E
    [15, 16, 17, 18, 19], // R1A-R1E
    [20, 21, 22, 23, 24], // R2A-R2E
    [25, 26, 27, 28, 29], // R3A-R3E
]

var colors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf'
]

var colors2 = [
    '#E27D60',
    '#41B3A3',
    '#E8A87C',
    '#C38D9E',
    '#85DCB'
]

var keypoints =  [
    [-0.005771587567940273, -0.0007108741837451582, 0.009674983999074628],
    [0.024857184080593345, -0.15178868577443394, -0.1643735682604568],
    [-0.22583669405471074, 0.03328422967953504, -0.137548486118793],
    [-0.1352409171074509, -0.09543414113637194, -0.32854085042606584],
    [-0.26592358536333904, -0.1219966697128676, -0.5370412601407795],
    [0.03155373653371996, -0.15570749746959978, -0.0028406348963825323],
    [0.0779122182273948, -0.2915391636822981, -0.1390409726163888],
    [-0.2539858909480355, -0.4103590173115896, -0.01367911893225493],
    [-0.23860050422039605, -0.5124455404612718, -0.30831775812992923],
    [-0.4366239648998951, -0.7038454135388217, -0.5046069879949355],
    [0.06279499342875637, -0.2970917808435227, 0.005748397685589879],
    [0.08286802032959706, -0.4178099801213446, -0.12768985993330514],
    [-0.1398657147016209, -0.6587741944630139, 0.07085638881752132],
    [-0.0549972206205771, -0.7356303025029765, -0.2409572042441779],
    [-0.18221217876961227, -0.9918946505879048, -0.4815441508612883],
    [0.2105196191576724, -0.0039494138790017175, -0.0024736814523613764],
    [0.21104362354566145, -0.05403537414942994, -0.2135936835383472],
    [0.3854972730971173, 0.19330508528408474, -0.17866163110140665],
    [0.3209534710138229, 0.23784638083025644, -0.4056217193882645],
    [0.35151793818305604, 0.3022831063157474, -0.6972150973217737],
    [0.15023150532382878, -0.19653579306858449, -0.019852203792366296],
    [0.1975631902700421, -0.2616816804131967, -0.1638055084315866],
    [0.5590360566798029, -0.17518731181723626, -0.13309516256299506],
    [0.4387152924241455, -0.12246218013169717, -0.4238398962942647],
    [0.4657977776881612, -0.4338012211064877, -0.5307532492016191],
    [0.17373080906156524, -0.32121875686636914, -0.003939891859292999],
    [0.2112417885485094, -0.3884819458340752, -0.15054991982773558],
    [0.4793814308308484, -0.6521828381356847, -0.0899315937495917],
    [0.5431030491067563, -0.8180886585189948, -0.3764665343913389],
    [0.7236225508569571, -1.0205085754824648, -0.5916187610222154]]




var state = {};

window.addEventListener('DOMContentLoaded', function(){
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // createScene function that creates and return the scene
    var createScene = function() {

        // Create the scene space
        var scene = new BABYLON.Scene(engine);

        var ambiance = 0.5;
        scene.ambientColor = new BABYLON.Color3(ambiance, ambiance, ambiance);


        // // Add a camera to the scene and attach it to the canvas
        var camera = new BABYLON.ArcRotateCamera(
            "Camera",
            0, 0, 10,
            BABYLON.Vector3.Zero(),
            scene
        );
        camera.setPosition(new BABYLON.Vector3(0, 0, -10));

        // // Parameters: name, position, scene
        // // var camera = new BABYLON.FlyCamera("FlyCamera", new BABYLON.Vector3(0, 0, 0), scene);
        // var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -6), scene);

        camera.attachControl(canvas, true);
        camera.lowerBetaLimit = null;
        camera.wheelPrecision = 50;
        
        // Add lights to the scene
        var light1 = new BABYLON.HemisphericLight(
            "light1",
            new BABYLON.Vector3(0, 1, 1),
            scene
        );
        light1.intensity = 0.3;

        // var light2 = new BABYLON.PointLight(
        //     "light2",
        //     new BABYLON.Vector3(0, 1, -1),
        //     scene
        // );
        // light2.intensity = 0.2;

        var light3 = new BABYLON.HemisphericLight(
            "light3",
            new BABYLON.Vector3(-1, -1, 0),
            scene
        );
        light3.intensity = 0.3

        var scale = 3;

        state.spheres = [];

        for(var i=0; i<keypoints.length; i++) {
            var kp = keypoints[i];
            // This is where you create and manipulate meshes
            var sphere = BABYLON.MeshBuilder.CreateSphere(
                "sphere",
                { diameter: 0.25, updatable: true },
                scene
            );
            sphere.position = new BABYLON.Vector3(kp[0]*scale, kp[1]*scale, -kp[2]*scale);

            var mat = new BABYLON.StandardMaterial("material", scene);
            mat.ambientColor = new BABYLON.Color3(1, 1, 1);
            sphere.material = mat;

            state.spheres.push(sphere);
        }

        state.tubes = [];
        state.paths = [];
        for(var i=0; i<scheme.length; i++) {
            var links = scheme[i];
            var prev = null;
            var col = colors[i];
            for(var j=0; j<links.length; j++) {
                var kp = keypoints[links[j]]
                var vec = new BABYLON.Vector3(kp[0]*scale, kp[1]*scale, -kp[2]*scale);
                if(j != 0) {
                    var path = [prev, vec];
                    // draw limbs
                    var tube = BABYLON.MeshBuilder.CreateTube(
                        "tube",
                        {path: path, radius: 0.05,
                         sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                         cap: BABYLON.Mesh.CAP_ALL,
                         updatable: true},
                        scene);

                    var mat = new BABYLON.StandardMaterial("material", scene);
                    // mat.ambientColor = new BABYLON.Color3(col[0], col[1], col[2]);
                    mat.ambientColor = new BABYLON.Color3.FromHexString(col);
                    tube.material = mat;

                    state.tubes.push(tube);
                    state.paths.push(path);
                }
                prev = vec;
            }

        }

        state.scene = scene;

        return scene;
    };

    // call the createScene function
    var scene = createScene();
    var divFps = document.getElementById("fps");


    state.filterBehavior = '';
    var selectBehavior = document.getElementById("selectBehavior");
    var actogram = document.getElementById("actogram");
    var toggle2d = document.getElementById('toggle2d');
    toggle2d.addEventListener(
        "click", function() { toggle2D(); },
        false);

    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
        divFps.innerHTML = engine.getFps().toFixed() + " fps"; 
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });

    var progressBar = document.getElementById("progressBar");
    progressBar.addEventListener(
        "mousedown", function(e) { setPlayPosition(e.pageX); },
        false);
    // state.trial = {
    //     session: "5.16.19",
    //     folder: "Fly 2_0",
    //     files: [
    //         "05162019_fly2_0 R1C1 Cam-A str-cw-0 sec",
    //         "05162019_fly2_0 R1C1 Cam-B str-cw-0 sec",
    //         "05162019_fly2_0 R1C1 Cam-C str-cw-0 sec",
    //         "05162019_fly2_0 R1C1 Cam-D str-cw-0 sec",
    //         "05162019_fly2_0 R1C1 Cam-E str-cw-0 sec",
    //         "05162019_fly2_0 R1C1 Cam-F str-cw-0 sec"
    //     ],
    //     vidname: "05162019_fly2_0 R1C1  str-cw-0 sec"
    // }

    // decode the url
    var h = decodeURIComponent(window.location.hash.substring(1));
    var L = h.split("/");
    var state_url = {};
    if(L.length == 3) {
        state_url.session = L[0];
        state_url.folder = L[1];
        state_url.trial = L[2];
    }
    console.log(state_url);

    fetch('/get-sessions')
        .then(response => response.json())
        .then(data => {
            console.log("inside");
            console.log(state_url);
            state.sessions = data.sessions;

            $('#selectSession').empty();
            var list = $('#selectSession');
            for(var num=0; num<data.sessions.length; num++) {
                var session = data.sessions[num];
                list.append(new Option(session, session));
            }

            var ix = state.sessions.indexOf(state_url.session);
            if(ix != -1) {
                list.val(state_url.session);
                updateSession(state_url.session, state_url);
            } else {
                updateSession(data.sessions[0]);
            }
        })

    $('#selectSession').select2({
        matcher: matcher
    });

    $('#selectVideo').select2({
        matcher: matcher
    });

    $('#selectBehavior').select2({
        matcher: matcher
    });

    $('#selectSession').on('select2:select', function(e) {
        var d = $('#selectSession').select2('data');
        var session = d[0].id;
        updateSession(session);
    });

    $('#selectVideo').on('select2:select', function (e) {
        var d = $('#selectVideo').select2('data');
        var trial = state.trials[d[0].id];
        updateTrial(trial);
    });

    $('#selectBehavior').on('select2:select', function (e) {
        var d = $('#selectBehavior').select2('data');
        state.filterBehavior = d[0].id;
        filterTrials();
    });

    updateSpeedText();
});

function matcher(params, data) {
    if ($.trim(params.term) === '') {
        return data;
    }

    keywords=(params.term).split(" ");

    for (var i = 0; i < keywords.length; i++) {
        if (((data.text).toUpperCase()).indexOf((keywords[i]).toUpperCase()) == -1)
            return null;
    }
    return data;
}

function getTrialsByBehavior() {

    console.log(state.behaviorDict)

    var sessionBehaviors = state.possible.sessionBehaviors; 
    var trialBehaviors = state.possible.trialBehaviors; 
    var filenames = Object.keys(trialBehaviors);
    var trialsByBehavior = {};

    var all_vids = {};
    for (var j in filenames) {
        all_vids[filenames[j]] = true;
    }
    trialsByBehavior[''] = all_vids;

    for (var i in sessionBehaviors) {
        var videos = {};
        for (var j in filenames) {
            videos[filenames[j]] = trialBehaviors[filenames[j]][sessionBehaviors[i]];
        }
        trialsByBehavior[sessionBehaviors[i]] = videos;
    }
    return trialsByBehavior;
}

function filterTrials() {

    var ixs = [];
    $('#selectVideo').empty();
    var filteredTrials = $("#selectVideo");
    for (var j in state.trials) {
        var trial = state.trials[j]
        var rel_path = trial.session + '/' + trial.folder + '/' + trial.vidname
        if (state.trialsByBehavior[state.filterBehavior][rel_path]) {
            var text = trial.vidname + " -- " + trial.folder;
            var key = j + "";
            ixs.push(j)
            filteredTrials.append(new Option(text, key))
        }
    }
    updateTrial(state.trials[ixs[0]]);
}

function updateSession(session, state_url) {

    document.getElementById('actogram').innerHTML = '';
    state.behaviorList = undefined
    state.trialsByBehavior = undefined;
    state.trials = undefined;
    fetch('/get-trials/' + session)
        .then(response => response.json())
        .then(data => {
            state.possible = data;
            state.session = data.session;
            state.trialsByBehavior = getTrialsByBehavior();
            state.trials = [];

            $('#selectBehavior').empty();
            var behaviorList = $("#selectBehavior");
            behaviorList.append(new Option('', ''));
            for (var i in data.sessionBehaviors) {
                behaviorList.append(new Option(data.sessionBehaviors[i], data.sessionBehaviors[i]));
            }
            behaviorList.val(state.filterBehavior);

            var ix = 0;
            $('#selectVideo').empty();
            var list = $("#selectVideo");
            var vidname_folder_ix = {};
            for(var folder_num=0; folder_num < data.folders.length; folder_num++) {
                console.log(folder_num);
                var folder = data.folders[folder_num]; 
                for(var file_num=0; file_num < folder.files.length; file_num++) {
                    var file = folder.files[file_num];
                    file.session = data.session;
                    file.folder = folder.folder;
                    var text = file.vidname + " -- " + file.folder;
                    var key = ix + "";
                    vidname_folder_ix[text] = key;
                    state.trials[key] = file;
                    list.append(new Option(text, key));
                    ix++;
                }
            }

            var key = "0";
            if(state_url) {
                var text = state_url.trial + " -- " + state_url.folder;
                var test = vidname_folder_ix[text]
                if(test) {
                    key = test;
                }
            }

            updateTrial(state.trials[key]);
            list.val(key);

        });

}

function updateTrial(trial) {
    console.log(trial);
    var url_suffix = trial.session + "/" + trial.folder + "/" + trial.vidname;
    window.location.hash = "#" + url_suffix;

    state.camnames = trial.camnames;

    playing = false;
    hide2d = false;
    updateSpeedText();
    updatePlayPauseButton();
    updateToggle2DButton();

    var url;
    url = '/pose3d/' + url_suffix;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("pose 3d updated");
            state.data = data;
            drawFrame(true);
        });

    url = '/pose2dproj/' + url_suffix;
    state.data2d = undefined;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("pose 2d updated");
            state.data2d = data;
            drawFrame(true);
        });

    var vidlist = document.getElementById("vidlist");
    state.videos = vidlist.querySelectorAll("video");
    state.canvases = vidlist.querySelectorAll("canvas");
    state.containers = vidlist.querySelectorAll(".container");

    for(var i=0; i<state.videos.length; i++) {
        var video = state.videos[i];
        var url = "/video/" + trial.session + "/" + trial.folder + "/" + trial.files[i];
        video.src = url;
        console.log(url);
    }

    for(var i=0; i<state.canvases.length; i++) {

        var vid = state.videos[i];
        vid.index = i;

        vid.addEventListener("loadedmetadata", function(e) {
            var i = this.index;
            var width = this.clientWidth;
            var height = this.clientHeight;
            console.log(width, height);

            var canvas = state.canvases[i];
            var ctx = canvas.getContext("2d");
            var container = state.containers[i];

            ctx.canvas.width = width;
            ctx.canvas.height = height;

            state.containers[i].style.width = width +"px";
            state.containers[i].style.height = height + "px";

            if(i == 0) {
                updateProgressBar();
            }
        }, false);
    }

    state.videos[0].addEventListener('timeupdate', updateProgressBar, false);

    var url_suffix = trial.session + "/" + trial.folder + "/" + trial.vidname;
    window.location.hash = "#" + url_suffix;
    
    url = '/behavior/' + url_suffix;
    state.behaviorDict = undefined;
    state.behaviors = undefined;
    state.uniqueTrialBehaviors = undefined;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("behavior updated");
            state.behaviorDict = data;
            state.behaviors = data[trial.vidname];
            state.uniqueTrialBehaviors = getUniqueTrialBehaviors();
            drawActogram();
        });
}

var video_speed = 0.2;
var vid_fps = 60.0;
var slowdown = 0.5;
var fps = 60.0;
var rate_estimate = vid_fps/fps*slowdown;
var framenum = 0;
var playing = false;
var display2d = true;
var prev_num = 0;

function drawFrame(force) {
    if(!playing && !force) return;
    var ft = state.videos[0].currentTime * vid_fps;
    // var diff = ft - framenum;
    // if(ft > 5) {
    //     rate_estimate = 0.9 * rate_estimate + 0.1 * diff;
    // }
    // if(Math.abs(diff) > 6) {
    //     framenum = ft;
    // } else {
    //     framenum += rate_estimate;
    // }
    // prev_num = ft;
    // console.log(ft);
    // console.log(rate_estimate, framenum, ft, ft - framenum);
    // if(Math.abs(ft - framenum) > 5) {
    //     framenum = ft;
    // }
    framenum = Math.round(ft+1);

    const fix = Math.max(0, Math.min(Math.floor(framenum), state.data.length-1));
    setTimeout(function() {
        updateKeypoints(state.data[fix])
        draw2D(fix);
    }, 0);
    setTimeout(drawFrame, 1000.0/fps);
    // window.requestAnimationFrame(drawFrame);
}

function getUniqueTrialBehaviors() {
    var uniqueTrialBehaviors = new Set();
    for (var i in state.behaviors) {
        uniqueTrialBehaviors.add(state.behaviors[i]['behavior']);
    }
    var uniqueTrialBehaviors = Array.from(uniqueTrialBehaviors);
    return uniqueTrialBehaviors
}

function drawActogram() {

    actogram.innerHTML = '';
    console.log(state.behaviors);

    for (var i in state.uniqueTrialBehaviors) {

        var behaviorContainer = document.createElement('div');
        behaviorContainer.id = "behaviorContainer";
        behaviorContainer.style.height = '32px';
        actogram.appendChild(behaviorContainer);

        var behaviorName = document.createElement('input');
        behaviorName.className = "behaviorName";
        behaviorName.readOnly = true;
        behaviorName.value = state.uniqueTrialBehaviors[i];
        behaviorName.style.border = '1px solid ' + colors2[i%state.uniqueTrialBehaviors.length];
        behaviorContainer.appendChild(behaviorName);

        var behaviorCanvas = document.createElement('canvas');
        behaviorCanvas.id = state.uniqueTrialBehaviors[i];
        behaviorCanvas.className = 'behaviorCanvas';
        drawBehavior(behaviorCanvas, colors2[i%state.uniqueTrialBehaviors.length]);
        behaviorContainer.appendChild(behaviorCanvas);
    }
}

function drawBehavior(behaviorCanvas, color) {

    var nFrames = 600;
    var ctx = behaviorCanvas.getContext("2d");
    behaviorCanvas, ctx = updateCanvas(behaviorCanvas, ctx);

    behaviorCanvas.style.border ='1px solid ' + color;
    for (var i in state.behaviors) {
        if (state.behaviors[i]['behavior'] == behaviorCanvas.id) {
            var start = state.behaviors[i]['start'];
            var end = state.behaviors[i]['end'];
            ctx.fillStyle = color;
            ctx.fillRect(Math.round(behaviorCanvas.width*(start/nFrames)), 0, Math.round(behaviorCanvas.width*((end-start)/nFrames)), behaviorCanvas.height);
        }
    }    
}

function updateCanvas(behaviorCanvas, ctx) {

    ctx.translate(0.5, 0.5);
    var sizeWidth = 80 * window.innerWidth / 100;
    var sizeHeight = 100 * window.innerHeight / 100 || 766; 

    behaviorCanvas.width = sizeWidth;
    behaviorCanvas.height = sizeHeight;
    behaviorCanvas.style.width = sizeWidth;
    behaviorCanvas.style.height = sizeHeight;

    return behaviorCanvas, ctx
}

function updateProgressBar() {
    var video = state.videos[0];
    var progressBar = document.getElementById('progressBar');
    var percentage = Math.floor((100 / video.duration) * video.currentTime);
    progressBar.value = percentage;
    progressBar.innerHTML = percentage + '% played';
}

// Set the play position of the video based on the mouse click at x
function setPlayPosition(x) {
    var progressBar = document.getElementById("progressBar");
    var value = (x - findPos(progressBar));
    var timeToSet = ((state.videos[0].duration / progressBar.offsetWidth) * value);

    for(var i=0; i<state.videos.length; i++) {
        state.videos[i].currentTime = timeToSet;
    }
    drawFrame(true);
}

// Find the real position of obj
function findPos(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        do { curleft += obj.offsetLeft; } while (obj = obj.offsetParent);
    }
    return curleft;
}


function play() {
    playing = true;
    var t = state.videos[0].currentTime;
    framenum = state.videos[0].currentTime * vid_fps;
    rate_estimate = vid_fps/fps*slowdown;
    for(var i=0; i<state.videos.length; i++) {
        state.videos[i].currentTime = t;
        state.videos[i].playbackRate = slowdown;
        state.videos[i].loop = true;
        state.videos[i].preload = "auto";
        state.videos[i].play();
    }
    // state.videos[0].play();
    setTimeout(drawFrame, 150.0);
}

function pause() {
    var t = state.videos[0].currentTime;
    for(var i=0; i<state.videos.length; i++) {
        state.videos[i].currentTime = t;
        state.videos[i].pause();
    }
    t = state.videos[0].currentTime;
    var framenum = Math.round(t * vid_fps);
    playing = false;
    updateKeypoints(state.data[framenum])
    draw2D(framenum);
}

function togglePlayPause() {
    if(!playing) {
        play();
    } else {
        pause();
    }
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    var button = document.getElementById("play")
    if(playing) {
        button.innerHTML = "pause";
    } else {
        button.innerHTML = "play";
    }
}

function toggle2D() {
    if (!display2d) {
        display2d = true;
    } else {
        display2d = false;
    }
    draw2D(framenum);
    updateToggle2DButton();
}

function updateToggle2DButton() {
    var button = document.getElementById("toggle2d")
    if(display2d) {
        button.innerHTML = "hide 2d";
    } else {
        button.innerHTML = "display 2d";
    }
}

function slowdownVideo() {
    slowdown = slowdown / Math.sqrt(2);
    if(playing) { play(); }
    updateSpeedText();
}

function speedupVideo() {
    slowdown = slowdown * Math.sqrt(2);
    if(playing) { play(); }
    updateSpeedText();
}

function updateSpeedText() {
    var full_slow = slowdown * video_speed;
    var text = "";
    if(Math.abs(full_slow - 1.0) < 1e-3) {
        text = "actual speed";
    } else if(full_slow < 1.0) {
        text = "slowed x" + (1/full_slow).toFixed(1);
    } else if(full_slow > 1.0) {
        text = "sped up x" + full_slow.toFixed(1);
    }
    var span = document.getElementById("speed");
    span.innerHTML = text;
}

function updateKeypoints(kps) {
    var scale = 3;
    for(var i=0; i<kps.length; i++) {
        var kp = kps[i];
        // state.spheres[i].position = new BABYLON.Vector3(kp[0]*scale, kp[1]*scale, -kp[2]*scale);
        state.spheres[i].position.x = kp[0]*scale;
        state.spheres[i].position.y = kp[1]*scale;
        state.spheres[i].position.z = -kp[2]*scale;
    }

    var tubecount = 0;
    for(var i=0; i<scheme.length; i++) {
        var links = scheme[i];
        var prev = null;
        for(var j=1; j<links.length; j++) {
            var prev = kps[links[j-1]];
            var vec = kps[links[j]];
            // var vec = new BABYLON.Vector3(kp[0]*scale, kp[1]*scale, -kp[2]*scale);
            state.paths[tubecount][0].x = prev[0]*scale;
            state.paths[tubecount][0].y = prev[1]*scale;
            state.paths[tubecount][0].z = -prev[2]*scale;
            state.paths[tubecount][1].x = vec[0]*scale;
            state.paths[tubecount][1].y = vec[1]*scale;
            state.paths[tubecount][1].z = -vec[2]*scale;

            var tube = BABYLON.MeshBuilder.CreateTube(
                null,
                {path: state.paths[tubecount],
                 instance: state.tubes[tubecount]});
            tubecount++;

        }
    }

}

function drawPath(ctx, path, color) {
    if(!display2d) return; 

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    for(var i=0; i<path.length; i++) {
        var pt = path[i];
        if(i == 0) {
            ctx.moveTo(pt[0], pt[1]);
        } else {
            ctx.lineTo(pt[0], pt[1]);
        }
    }
    ctx.stroke();
}

function drawPoint(ctx, x, y, color) {
    if(!display2d) return; 

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
//     ctx.strokeStyle = "black";
//     ctx.stroke();
}

function draw2D(framenum) {
    if(!state.data2d) return;

    for(var vidnum=0; vidnum<state.videos.length; vidnum++) {
        var vid = state.videos[vidnum];
        var ratio = vid.clientWidth / vid.videoWidth;
        var canvas = state.canvases[vidnum];
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var cname = state.camnames[vidnum];
        var kps = state.data2d[cname][framenum];
        for(var i=0; i<scheme.length; i++) {
            var links = scheme[i];
            var col = colors[i];
            var path = [];
            for(var j=0; j<links.length; j++) {
                var kp = kps[links[j]]
                path.push([kp[0]*ratio, kp[1]*ratio]);
            }
            drawPath(ctx, path, col);
        }
        for(var i=0; i<kps.length; i++) {
            var kp = kps[i];
            drawPoint(ctx, kp[0]*ratio, kp[1]*ratio, "white");
        }
    }
}
