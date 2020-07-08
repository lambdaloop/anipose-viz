#!/usr/bin/env python3
from flask import Flask
from flask import url_for, render_template
from flask import jsonify
from flask import request, safe_join, send_from_directory
from flask_compress import Compress
# from flask_squeeze import Squeeze

from glob import glob
import os
from collections import deque, defaultdict
import re

import pandas as pd
import numpy as np

from aniposelib.cameras import CameraGroup
import toml

## folders that are needed within each session
## angles, pose-2d-filtered, pose-3d, videos-raw-slow
## Calibration (with calibration.toml)
## config.toml

# prefix = '/home/pierre/data/tuthill/FicTrac Raw Data'
prefix = '/media/turritopsis/pierre/gdrive/viz'

cam_regex = "Cam-? ?([A-Z])"

sessions = []

def atoi(text):
    return int(text) if text.isdigit() else text

def natural_keys(text):
    return [ atoi(c) for c in re.split('(\d+)', text) ]

(root, dirs, files) = next(os.walk(prefix))
dirs = sorted(dirs, key=natural_keys)
for folder in dirs:
    if os.path.exists(os.path.join(prefix, folder, 'config.toml')):
        sessions.append(folder)

# creates a Flask application, named app
app = Flask(__name__)
# app.config['COMPRESS_LEVEL'] = 8
# app.config['COMPRESS_ALGORITHM'] = 'br'
Compress(app)
# squeeze = Squeeze()
# squeeze.init_app(app)

def true_basename(fname):
    basename = os.path.basename(fname)
    basename = os.path.splitext(basename)[0]
    return basename

def get_cam_name(cam_regex, fname):
    basename = true_basename(fname)
    match = re.search(cam_regex, basename)
    if not match:
        return None
    else:
        name = match.groups()[0]
        return name.strip()

def get_video_name(cam_regex, fname):
    basename = true_basename(fname)
    vidname = re.sub(cam_regex, '', basename)
    return vidname.strip()

def get_video_fnames(session_path):
    fnames = glob(os.path.join(session_path, 'videos-raw-slow', '*.mp4'))
    return fnames

def get_folders(path):
    folders = next(os.walk(path))[1]
    return sorted(folders)

def process_all(source_dir, process_session, **args):
    pipeline_prefix = source_dir

    output = dict()

    x = process_session(pipeline_prefix, **args)
    if x is not None:
        output[()] = x

    folders = get_folders(pipeline_prefix)
    level = 1

    q = deque()

    next_folders = [ (os.path.join(pipeline_prefix, folder),
                      (folder,),
                      level)
                     for folder in folders ]
    q.extend(next_folders)

    while len(q) != 0:
        path, past_folders, level = q.popleft()

        x = process_session(path, **args)
        if x is not None:
            output[past_folders] = x

        folders = get_folders(path)
        next_folders = [ (os.path.join(path, folder),
                          past_folders + (folder,),
                          level+1)
                         for folder in folders ]
        q.extend(next_folders)

    return output


def load_2d_projections(session_path, fname):
    calib_fname = os.path.join(session_path, "Calibration", "calibration.toml")
    cgroup = CameraGroup.load(calib_fname)

    config_fname = os.path.join(session_path, "config.toml")
    config = toml.load(config_fname)

    data = pd.read_csv(fname)
    
    offsets = [config['cameras'][name]['offset'] for name in cgroup.get_names()]

    M = np.identity(3)
    center = np.zeros(3)
    for i in range(3):
        center[i] = np.mean(data['center_{}'.format(i)])
        for j in range(3):
            M[i, j] = np.mean(data['M_{}{}'.format(i, j)])

    cols = [x for x in data.columns if '_error' in x]
    bodyparts = [c.replace('_error', '') for c in cols]

    vecs = []
    for bp in bodyparts:
        vec = np.array(data[[bp+'_x', bp+'_y', bp+'_z']])
        vecs.append(vec)
    p3d = np.array(vecs).swapaxes(0, 1)

    # project to 2d
    n_cams = len(cgroup.cameras)
    n_frames, n_joints, _ = p3d.shape

    all_points_flat = p3d.reshape(-1, 3)
    all_points_flat_t = (all_points_flat + center).dot(np.linalg.inv(M.T))

    points_2d_proj_flat = cgroup.project(all_points_flat_t)
    points_2d_proj = points_2d_proj_flat.reshape(n_cams, n_frames, n_joints, 2)

    points_2d_proj = points_2d_proj.swapaxes(0, 1)

    for i in range(n_cams):
        dx = offsets[i][0]
        dy = offsets[i][1]
        points_2d_proj[:, i, :, 0] -= dx
        points_2d_proj[:, i, :, 1] -= dy
    
    return np.int32(np.round(points_2d_proj))


# a route where we will display a welcome message via an HTML template
@app.route('/')
def root():
    return app.send_static_file('index.html')
    # return "hello"

@app.route('/get-sessions')
def get_sessions():
    return jsonify({
        'sessions': sessions
    })

@app.route('/pose3d/<session>/<folders>/<filename>')
def get_3d(session, folders, filename):
    folders = folders.split('|')
    path = safe_join(prefix, session, *folders)
    path = safe_join(path, 'pose-3d', filename + '.csv')
    data = pd.read_csv(path)

    cols = [x for x in data.columns if '_error' in x]
    bodyparts = [c.replace('_error', '') for c in cols]

    vecs = []
    for bp in bodyparts:
        vec = np.array(data[[bp+'_x', bp+'_y', bp+'_z']])
        vecs.append(vec)
    vecs = np.array(vecs).swapaxes(0, 1)

    return jsonify(vecs.tolist())

@app.route('/pose2dproj/<session>/<folders>/<filename>')
def get_2d_proj(session, folders, filename):
    folders = folders.split('|')
    session_path = safe_join(prefix, session)
    path = safe_join(session_path, *folders)
    path = safe_join(path, 'pose-3d', filename + '.csv')

    projs = load_2d_projections(session_path, path)
    return jsonify(projs.tolist())

@app.route('/video/<session>/<folders>/<filename>')
def get_video(session, folders, filename):
    print(session, folders, filename)
    folders = folders.split('|')
    path = safe_join(prefix, session, *folders)
    path = safe_join(path, 'videos-raw-slow')
    print(path, filename + '.mp4')
    return send_from_directory(path, filename + '.mp4')

def group_by_trial(fnames, cam_regex):
    cam_videos = defaultdict(list)
    for fname in fnames:
        name = get_video_name(cam_regex, fname)
        cam_videos[name].append(fname)
    names = sorted(cam_videos.keys(), key=natural_keys)
    out = []
    for name in names:
        fnames = [true_basename(x) for x in cam_videos[name]]
        out.append({
            'vidname': name,
            'files': fnames
        })
    return out

@app.route('/get-trials/<session>')
def get_trials(session):
    # session = request.args['session']
    path = safe_join(prefix, session)
    print(path)
    fnames_dict = process_all(path, get_video_fnames)
    out = []
    for key, fnames in fnames_dict.items():
        if len(fnames) == 0:
            continue
        fnames = sorted(fnames, key=natural_keys)
        fnames = group_by_trial(fnames, cam_regex)
        d = {
            'folder': '|'.join(key),
            'files': fnames
        }
        out.append(d)

    return jsonify({
        "session": session,
        "folders": out
    })


# run the application
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
