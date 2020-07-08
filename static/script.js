
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

    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
        divFps.innerHTML = engine.getFps().toFixed() + " fps";
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });

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

    var trial = state.trial;

    // updateTrial(trial);


    fetch('/get-sessions')
        .then(response => response.json())
        .then(data => {
            state.sessions = data.sessions;

            $('#selectSession').empty();
            var list = $('#selectSession');
            for(var num=0; num<data.sessions.length; num++) {
                var session = data.sessions[num];
                list.append(new Option(session, session));
            }

            updateSession(data.sessions[0]);
        })

    $('#selectSession').select2({
        matcher: matcher
    });

    $('#selectVideo').select2({
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
        updateTrial(trial)
    });


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

function updateSession(session) {
    fetch('/get-trials/' + session)
        .then(response => response.json())
        .then(data => {
            state.possible = data;

            state.trials = [];
            var ix = 0;

            $('#selectVideo').empty();
            var list = $("#selectVideo");
            for(var folder_num=0; folder_num < data.folders.length; folder_num++) {
                console.log(folder_num);
                var folder = data.folders[folder_num];
                for(var file_num=0; file_num < folder.files.length; file_num++) {
                    var file = folder.files[file_num];
                    file.session = data.session;
                    file.folder = folder.folder;
                    var text = file.vidname + " -- " + file.folder;
                    var key = ix + "";
                    state.trials[key] = file;
                    list.append(new Option(text, key));
                    ix += 1;
                }
            }

            updateTrial(state.trials["0"]);

        });
}

function updateTrial(trial) {
    console.log(trial);
    var url;
    url = '/pose3d/' + trial.session + "/" + trial.folder + "/" + trial.vidname;
    state.data = undefined;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("pose 3d updated");
            state.data = data;
            drawFrame(true);
        });

    url = '/pose2dproj/' + trial.session + "/" + trial.folder + "/" + trial.vidname;
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
            var ctx = canvas.getContext("2d");;
            var container = state.containers[i];

            ctx.canvas.width = width;
            ctx.canvas.height = height;

            state.containers[i].style.width = width +"px";
            state.containers[i].style.height = height + "px";

        }, false);
    }
}

// var check = 0;
// function toggleKeypoints() {
//     var kps = null;
//     if(check == 0) {
//         kps = keypoints2;
//     } else {
//         kps = keypoints;
//     }
//     check = 1-check;
//     updateKeypoints(kps);
// }


var vid_fps = 60.0;
var slowdown = 0.5;
var fps = 60.0;
var rate_estimate = vid_fps/fps*slowdown;
var framenum = 0;
var playing = false;
var prev_num = 0;

function drawFrame(force) {
    if(!playing && !force) return;
    var ft = state.videos[0].currentTime * vid_fps;
    var diff = ft - framenum;
    if(ft > 5) {
        rate_estimate = 0.9 * rate_estimate + 0.1 * diff;
    }
    if(Math.abs(diff) > 6) {
        framenum = ft;
    } else {
        framenum += rate_estimate;
    }
    prev_num = ft;
    // console.log(ft);
    // console.log(rate_estimate, framenum, ft, ft - framenum);
    // if(Math.abs(ft - framenum) > 5) {
    //     framenum = ft;
    // }
    framenum = ft;

    const fix = Math.max(0, Math.min(Math.floor(framenum), state.data.length-1));
    setTimeout(function() {
        updateKeypoints(state.data[fix])
        draw2D(state.data2d[fix]);
    }, 0);
    // setTimeout(drawFrame, 1000.0/fps);
    window.requestAnimationFrame(drawFrame);
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
    draw2D(state.data2d[framenum]);
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
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
//     ctx.strokeStyle = "black";
//     ctx.stroke();
}

function draw2D(all_kps) {
    for(var vidnum=0; vidnum<state.videos.length; vidnum++) {
        var vid = state.videos[vidnum];
        var ratio = vid.clientWidth / vid.videoWidth;
        var canvas = state.canvases[vidnum];
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var kps = all_kps[vidnum];
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
