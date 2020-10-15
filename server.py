#!/usr/bin/env python3
from flask import Flask
from flask import url_for, render_template
from flask import jsonify
from flask import Response
from flask import request, safe_join, send_from_directory
from flask_compress import Compress
# from flask_squeeze import Squeeze
from flask_ipban import IpBan

from glob import glob
import os
from collections import deque, defaultdict
import re
from datetime import datetime

import pandas as pd
import numpy as np

from aniposelib.cameras import CameraGroup
import toml
import json

## folders that are needed within each session
## pose-3d, videos-raw-slow
## angles, pose-2d-filtered not currently needed but may be in the future
## Calibration (with calibration.toml)
## config.toml

# prefix = '/home/pierre/data/tuthill/FicTrac Raw Data'
prefix = '/media/turritopsis/pierre/gdrive/viz'
# prefix = 'C:/Users/Rupp/Downloads/tuthilllab/apviz/raw_data'

cam_regex = "Cam-? ?([A-Z])"


def atoi(text):
    return int(text) if text.isdigit() else text

def natural_keys(text):
    return [ atoi(c) for c in re.split('(\d+)', text) ]


# creates a Flask application, named app
app = Flask(__name__)
# app.config['COMPRESS_LEVEL'] = 8
# app.config['COMPRESS_ALGORITHM'] = 'br'
Compress(app)
# squeeze = Squeeze()
# squeeze.init_app(app)

ip_ban = IpBan(ban_seconds=3600, ban_count=5, persist=True, ipc=True)
ip_ban.init_app(app)
ip_ban.load_nuisances()

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


def get_unique_behaviors(session_path):

    session = os.path.basename(session_path)
    path = safe_join(session_path, 'behaviors.json')
    if not os.path.exists(path):
        return [], {}

    with open(path) as json_file:
        behaviors = json.load(json_file)

    session_behaviors = set()
    trial_behaviors = {}
    folders = list(behaviors.keys())
    for folder in folders:
        filenames = list(behaviors[folder].keys())
        for file in filenames:
            unique_behaviors = {}
            rel_path = safe_join(session, folder, file)
            bouts = behaviors[folder][file]
            for bout in bouts:
                behavior = bout['behavior']
                unique_behaviors[behavior] = True
                session_behaviors.add(behavior)
            trial_behaviors[rel_path] = unique_behaviors

    session_behaviors = list(session_behaviors)
    return session_behaviors, trial_behaviors

def load_2d_projections(session_path, fname):
    calib_fname = os.path.join(session_path, "Calibration", "calibration.toml")
    cgroup = CameraGroup.load(calib_fname)

    config_fname = os.path.join(session_path, "config.toml")
    config = toml.load(config_fname)

    data = pd.read_csv(fname)

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

    # points_2d_proj = points_2d_proj.swapaxes(0, 1)
    cam_names = cgroup.get_names()
    offsets = [config['cameras'][name]['offset'] for name in cam_names]

    for i in range(n_cams):
        dx = offsets[i][0]
        dy = offsets[i][1]
        points_2d_proj[i, :, :, 0] -= dx
        points_2d_proj[i, :, :, 1] -= dy

    points_2d_proj = np.int32(np.round(points_2d_proj))
    out = dict()
    for i, cname in enumerate(cam_names):
        out[cname] = points_2d_proj[i].tolist()

    return out


# a route where we will display a welcome message via an HTML template
@app.route('/')
def root():
    return app.send_static_file('index.html')
    # return "hello"

@app.route('/get-sessions')
def get_sessions():
    sessions = []
    (root, dirs, files) = next(os.walk(prefix))
    dirs = sorted(dirs, key=natural_keys)
    for folder in dirs:
        if os.path.exists(os.path.join(prefix, folder, 'config.toml')):
            sessions.append(folder)
    # sort in reverse chronological order
    sessions = sorted(sessions, key=lambda x: datetime.strptime(x, '%m.%d.%y'))
    sessions = list(reversed(sessions))

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

    lengths = np.linalg.norm(vecs[:,0] - vecs[:,1], axis=1)
    L = np.median(lengths)
    vecs = vecs / L * 0.22;

    return jsonify(vecs.tolist())

@app.route('/pose2dproj/<session>/<folders>/<filename>')
def get_2d_proj(session, folders, filename):

    folders = folders.split('|')
    session_path = safe_join(prefix, session)
    path = safe_join(session_path, *folders)
    path = safe_join(path, 'pose-3d', filename + '.csv')

    projs = load_2d_projections(session_path, path)
    return jsonify(projs)

@app.route('/behavior/<session>/<folders>/<filename>')
def get_behaviors(session, folders, filename):

    folders = folders.split('|')
    session_path = safe_join(prefix, session)
    path = safe_join(session_path, 'behaviors.json')
    with open(path) as json_file:
        behavior_dict = json.load(json_file)
    behaviors = behavior_dict[folders[0]][filename]
    return jsonify(behaviors)

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
        cnames = [get_cam_name(cam_regex, f) for f in fnames]
        out.append({
            'vidname': name,
            'camnames': cnames,
            'files': fnames
        })
    return out

@app.route('/get-trials/<session>')
def get_trials(session):
    # session = request.args['session']
    path = safe_join(prefix, session)
    print(path)
    session_behaviors, trial_behaviors = get_unique_behaviors(path)
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

    out = sorted(out, key=lambda x: natural_keys(x['folder']))

    return jsonify({
        "session": session,
        "folders": out,
        "trialBehaviors": trial_behaviors,
        "sessionBehaviors": session_behaviors
    })


# run the application
if __name__ == "__main__":
    app.run(debug=False, threaded=False, processes=5, host="0.0.0.0", port=5000)
