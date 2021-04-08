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
import cv2
import string
import random
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

valid_tokens = set()

def atoi(text):
    return int(text) if text.isdigit() else text

def natural_keys(text):
    return [ atoi(c) for c in re.split('(\d+)', text) ]


SERVER_PASSWORD = os.environ.get('ANIPOSE_PASSWORD', 'password')

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

def find_calibration_folder(config, session_path):

    pipeline_calibration_videos = config.get('pipeline', {}).get('calibration_videos', 'calibration')
    nesting = config['nesting']

    # TODO: fix this for nesting = -1
    level = nesting
    curpath = session_path

    while level >= 0:
        checkpath = os.path.join(curpath, pipeline_calibration_videos)
        if os.path.isdir(checkpath):
            return curpath

        curpath = os.path.dirname(curpath)
        level -= 1

def generate_token(length): 
    letters = string.ascii_letters + '_'
    token = ''.join(random.choice(letters) for i in range(length))
    return token

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
            for key in list(bouts.keys()):
                behavior = bouts[key]['behavior']
                unique_behaviors[behavior] = True
                session_behaviors.add(behavior)
            trial_behaviors[rel_path] = unique_behaviors

    session_behaviors = list(session_behaviors)
    return session_behaviors, trial_behaviors

def get_cam_regex(session):
    config_fname = os.path.join(prefix, session, 'config.toml')
    config_fname = os.path.normpath(config_fname)
    config = toml.load(config_fname)
    cam_regex = config['triangulation']['cam_regex']
    return cam_regex

def load_2d_projections(session_path, folders, fname):

    config_fname = os.path.join(session_path, "config.toml")
    config = toml.load(os.path.normpath(config_fname))

    pipeline_calibration_videos = config.get('pipeline', {}).get('calibration_videos', 'calibration')
    search_path = os.path.normpath(os.path.join(session_path, *folders))
    calib_folder = find_calibration_folder(config, search_path) 
    calib_fname = os.path.join(calib_folder, pipeline_calibration_videos, "calibration.toml")
    cgroup = CameraGroup.load(os.path.normpath(calib_fname))

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
    offsets = [config.get('cameras', {}).get(name, {}).get('offset', [0,0]) for name in cam_names]

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

def get_structure(cdir):

    config_path = os.path.join(cdir, 'config.toml')
    single_project = False

    if os.path.exists(config_path):
        prefix = os.path.dirname(cdir) 
        single_project = True
             
    else: 
        (root, dirs, files) = next(os.walk(cdir))
        config_exists = False
        for d in dirs:
            if os.path.exists(os.path.join(cdir, d, 'config.toml')):
                config_exists = True

        if config_exists: 
            prefix = cdir
        else:
            print('No Anipose project found. Exiting...') 
            exit()

    return prefix, single_project


# a route where we will display a welcome message via an HTML template
@app.route('/')
def root():
    return app.send_static_file('index.html')
    # return "hello"

@app.route('/get-sessions')
def get_sessions():
    sessions = []
    if single_project:
        sessions.append(os.path.basename(cdir))
    else: 
        (root, dirs, files) = next(os.walk(prefix))
        dirs = sorted(dirs, key=natural_keys)
        for folder in dirs:
            if os.path.exists(os.path.join(prefix, folder, 'config.toml')):
                sessions.append(folder)

        sessions = sorted(sessions)

    return jsonify({
        'sessions': sessions
    })

@app.route('/pose3d/<session>/<folders>/<filename>')
def get_3d(session, folders, filename):
    folders = folders.split('|')
    path = safe_join(prefix, session, *folders)
    path = safe_join(path, 'pose-3d', filename + '.csv')
    path = os.path.normpath(path)
    data = pd.read_csv(path)

    cols = [x for x in data.columns if '_error' in x]
    bodyparts = [c.replace('_error', '') for c in cols]

    vecs = []
    for bp in bodyparts:
        vec = np.array(data[[bp+'_x', bp+'_y', bp+'_z']])
        vecs.append(vec)

    vecs = np.array(vecs).swapaxes(0, 1)
    m = np.nanmean(vecs, axis = 0)
    std = np.nanmean(np.nanstd(m, axis = 0))
    vecs = 0.3 * vecs / std
    
    cm = np.nanmean(np.nanmean(vecs, axis = 1), axis = 0)
    vecs = vecs - cm
    vecs[~np.isfinite(vecs)] = 0

    return jsonify(vecs.tolist())

@app.route('/pose2dproj/<session>/<folders>/<filename>')
def get_2d_proj(session, folders, filename):

    folders = folders.split('|')
    path = os.path.normpath(safe_join(prefix, session))
    fname = safe_join(path, *folders, 'pose-3d', filename + '.csv')

    projs = load_2d_projections(path, folders, fname)
    return jsonify(projs)

@app.route('/metadata/<session>')
def get_metadata(session):

    config_fname = os.path.join(prefix, session, 'config.toml')
    config = toml.load(config_fname)
    video_speed = config.get('videos', {}).get('video_speed', 1)
    scheme = np.array(config['labeling']['scheme'], dtype = object)

    kps = {}
    ix = 0
    for i in range(len(scheme)):
        for j in range(len(scheme[i])):
            if scheme[i][j] not in kps:
                kps[scheme[i][j]] = ix
                ix = ix + 1

    ix = 0
    new_scheme = []
    for i in range(len(scheme)):
        kps_ix = np.zeros(len(scheme[i]), dtype = int)
        for j in range(len(scheme[i])):
            keypoint = scheme[i][j]
            kps_ix[j] = kps[keypoint]
        new_scheme.append(kps_ix.tolist())

    metadata = {'video_speed': video_speed, 'scheme': new_scheme};

    return jsonify(metadata)

@app.route('/behavior/<session>/<folders>/<filename>')
def get_behaviors(session, folders, filename):

    session_path = safe_join(prefix, session)
    path = safe_join(session_path, 'behaviors.json')
    if not os.path.exists(path):
        return jsonify([])
    
    with open(path) as json_file:
        behavior_dict = json.load(json_file)

    behaviors = behavior_dict.get(folders, {}).get(filename, {})
    # behaviors = add_laser(behaviors, folders, filename)

    return jsonify(behaviors)

# def add_laser(behaviors, folders, filename):

#     if 'sec' not in filename:
#         return behaviors

#     pat = re.compile(r'(\d+)_fly(\d+_\d+) R(\d+)C(\d+)\s+([a-z]+)-([a-z]+)-([0-9.]+) sec')
#     names = ['date', 'fly', 'rep', 'condnum', 'type', 'dir', 'stimlen']
#     groups = pat.match(filename).groups()
#     d = dict(zip(names, groups))
#     stimlen = float(d['stimlen'])

#     if stimlen > 0:
#         start_frame = 150
#         end_frame = int(np.floor(start_frame + 300*stimlen))
#         laser_id = generate_token(22)
#         behaviors[laser_id] = {'filename': filename, 
#                                'folders': folders,
#                                'start': start_frame,
#                                'end': end_frame, 
#                                'bout_id': laser_id,
#                                'behavior': 'laser',
#                                'manual': True}

#     return behaviors

def merge_behavior_changes(behavior_changes):

    session_changes = defaultdict(list)
    for b in list(behavior_changes.keys()):
        changes = behavior_changes[b]
        session_changes[changes[0]['session']].extend(changes)

    for session in session_changes.keys():

        changes = session_changes[session]
        path = safe_join(prefix, session, 'behaviors.json')
        if not os.path.exists(path):
            return [], {}

        with open(path, 'r+') as json_file:
            behavior_dict = json.load(json_file)

            for change in changes:

                if change['modification'] == 'added':
                    bout = change['new']
                    behavior_dict[bout['folders']][bout['filename']][bout['bout_id']] = bout

                elif change['modification'] == 'removed': 
                    bout = change['old']
                    behavior_dict[bout['folders']][bout['filename']].pop(bout['bout_id'])

                else: # properties of an existing bout were edited (resized, translated, behavior name changed)
                    bout = change['old']
                    edits = change['new']
                    for key in list(edits.keys()):
                        bout[key] = edits[key]
                    behavior_dict[bout['folders']][bout['filename']][bout['bout_id']] = bout

            json_file.seek(0)
            json.dump(behavior_dict, json_file, indent = 4)
            json_file.truncate()

    message = 'behavior labels successfully updated' 
    return message

@app.route('/unlock-editing', methods=['POST'])
def authenticate():
    password_req = request.get_json()
    password = password_req['password']
    token = -1
    if password == SERVER_PASSWORD:
        token = generate_token(10)
        valid_tokens.add(token)
    valid = check_token(token)
    response = jsonify({'token': token, 'valid': valid})
    return response

@app.route('/get-token/<token>')
def check_existing_token(token):
    valid = token in valid_tokens
    return jsonify({'valid': valid})

def check_token(token):
    valid = token in valid_tokens
    return valid

@app.route('/update-behavior', methods=['POST'])
def update_behaviors():
    req_data = request.get_json()
    behavior_changes = req_data['allBehaviorChanges']
    token = req_data['token']
    valid = check_token(token)
    updated_behaviors = 'invalid token'
    if valid:   
        updated_behaviors = merge_behavior_changes(behavior_changes)
    return updated_behaviors

@app.route('/download-behavior/<session>')
def download_behaviors(session):
    session_path = safe_join(prefix, session)
    path = safe_join(session_path, 'behaviors.json')
    if not os.path.exists(path):
        return jsonify([])
    
    with open(path) as json_file:
        behaviors = json.load(json_file)

    return jsonify(behaviors)

@app.route('/video/<session>/<folders>/<filename>')
def get_video(session, folders, filename):
    print(session, folders, filename)
    folders = folders.split('|')
    path = safe_join(prefix, session, *folders)
    path = safe_join(path, 'videos-raw-slow')
    print(path, filename + '.mp4')
    return send_from_directory(path, filename + '.mp4')

@app.route('/framerate/<session>/<folders>/<filename>')
def get_framerate(session, folders, filename):
    path = safe_join(prefix, session, folders,'videos-raw-slow', filename + '.mp4')
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    return jsonify(fps)

def group_by_trial(fnames, session):
    cam_regex = get_cam_regex(session)
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
        fnames = group_by_trial(fnames, session)
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

    cdir = os.getcwd()
    prefix, single_project = get_structure(cdir)
    app.run(debug=False, host="0.0.0.0", port=5000)
    # app.run(debug=False, threaded=False, processes=5, host="0.0.0.0", port=5000)
