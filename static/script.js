
var keypoints = [
    [-0.010046134112373976, -0.0016186289779516413, 0.006648627728730346],
    [-0.00834018846774353, -0.0019780042430017847, -0.0004641694124311842],
    [-0.018145650846508203, -0.008097098055308139, -0.001118699007610604],
    [-0.0198553217968701, -0.009802823316934071,-0.009742183139637565],
    [-0.02503878792807012, -0.014401476688853632, -0.018018624609985566],
    [-0.004415295700152082, -0.001926048308348993, 0.006796762778442019],
    [-0.00021883055025672532, -0.0009670944701154705, 0.0016844034571646144],
    [0.002899174079922802, -0.014886450349812308, 0.004681542648174804],
    [0.00688777899070437, -0.0168887814802239, -0.0061698368973137335],
    [0.012778552758626945, -0.02501716925839672, -0.015587688903448275],
    [0.0008963828907880902, -0.0015511373489667465, 0.006211125895201371],
    [0.004185723711409248, -0.0011653016889714648, 0.0020140334005698535],
    [0.004543562617709392, -0.014933479555162353, 0.005681296917660535],
    [0.01189482922160557, -0.010545492188112982, -0.0027970183552789834],
    [0.018797159029353097, -0.022435557712227508, 0.0006248518850567059],
    [-0.009425312964420722, 0.006274583216528496, 0.007952273969495745],
    [-0.006221046232900533, 0.0035973790552388035, 0.0013665160395550952],
    [-0.01479728457925266, 0.010978120610272568, 0.004351240438716071],
    [-0.010989075301636723, 0.007453378046088122, -0.002810304777668384],
    [-0.013928176148932596, 0.011476461518625558, -0.011983340479978706],
    [-0.003395942720565307, 0.002613472893789193, 0.007010541432961566],
    [-0.0005634120172482906, 0.003475304641568289, 0.0024769122038053332],
    [0.00373432898461846, 0.014484628315630554, 0.009398425916041816],
    [0.004677657014452335, 0.018575460980511528, -0.0019481590582244024],
    [0.00842478958238558, 0.02926207522665478, -0.009461423560197716],
    [0.0017791071076099837, 0.0012064639324231633, 0.006461544487327749],
    [0.004242669041917176, 0.00332479983082632, 0.003081588882545535],
    [0.011638576865933406, 0.011594304507168893, 0.011162394355077408],
    [0.018297247206904843, 0.00936481883085347, 0.00036469926624452427],
    [0.029702920262990276, 0.01253329203620799, -0.00786733350099597]]

var keypoints2 = [
    [-0.010214493924636855, -0.0018681923444065311, 0.006638108130354326],
    [-0.004988034690347639, -0.0023005636652525903, 0.0015455255412681447],
    [-0.012175831128665656, -0.01081374545585582, -0.0014567343030243316],
    [-0.008069765970120265, -0.012314688488854678, -0.009286648657393745],
    [-0.007374532821004805, -0.018973180630579217, -0.01762961352105612],
    [-0.004584991164678417, -0.002070210267583731, 0.006571380674899663],
    [-1.0212698786059293e-06, -0.0007390341003720527, 0.0018803348209352599],
    [0.0005385044741446667, -0.014960393019316879, 0.00491121747148755],
    [0.0034896165674618874, -0.01307249604906661, -0.006266399966264258],
    [0.0079120177069168, -0.021624678891050058, -0.013533957208192993],
    [0.0006307842830620171, -0.0013639819998948848, 0.007436499815573328],
    [0.005017590957966446, -0.0037511640750726256, 0.005597974220655733],
    [-0.004925593034548811, -0.013472055083262472, 0.00928180109367034],
    [0.002245804933742438, -0.01845043143559037, 0.0008602651219217885],
    [0.009498853491069884, -0.02216961410904254, -0.013653256114502011],
    [-0.009165292895716156, 0.006048953254945329, 0.007499442000572687],
    [-0.006488539432213777, 0.0041678531416927305, 0.00042586431666120656],
    [-0.014920307867779033, 0.012332482708833657, -0.0005882331197000663],
    [-0.017074814026568127, 0.011950159016349401, -0.009171072986339058],
    [-0.022289241806135947, 0.017234693693735162, -0.01587920393883806],
    [-0.0029678131761522947, 0.0025913328342446933, 0.007008790909040785],
    [-6.997956175974415e-05, 0.0036187311189367, 0.0025506385522120036],
    [0.0052994308602579195, 0.014304198553534228, 0.009212942745496066],
    [0.006710166207505811, 0.017297628422627016, -0.0024385745853206407],
    [0.011865219503657994, 0.02745834452149561, -0.009348396172957726],
    [0.002195344369927915, 0.0010438699153981397, 0.006988569904129394],
    [0.005036476495719203, 0.0030651208189767703, 0.0038561083735106473],
    [0.00990534658576554, 0.013639076594157713, 0.01111889549856544],
    [0.02059473687829466, 0.010220551292946595, 0.004864178936885688],
    [0.03437035945471295, 0.012971433727327304, 0.0010035524457489677]]


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


        // Add a camera to the scene and attach it to the canvas
        var camera = new BABYLON.ArcRotateCamera(
            "Camera",
            Math.PI,
            Math.PI,
            10,
            BABYLON.Vector3.Zero(),
            scene
        );
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

        var scale = 100;

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
        });

    url = '/pose2dproj/' + trial.session + "/" + trial.folder + "/" + trial.vidname;
    state.data2d = undefined;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("pose 2d updated");
            state.data2d = data;
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

var check = 0;
function toggleKeypoints() {
    var kps = null;
    if(check == 0) {
        kps = keypoints2;
    } else {
        kps = keypoints;
    }
    check = 1-check;
    updateKeypoints(kps);
}


var vid_fps = 60.0;
var slowdown = 0.5;
var fps = 60.0;
var rate_estimate = vid_fps/fps*slowdown;
var framenum = 0;
var playing = false;
var prev_num = 0;

function drawFrame() {
    if(!playing) return;
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
        draw2D(state.data2d[fix]);
        updateKeypoints(state.data[fix])
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
    updateKeypoints(state.data[framenum])
    draw2D(state.data2d[framenum]);
    playing = false;
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
