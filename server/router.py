import logging
import os
import platform
import stat
import sys
import time
import traceback
from typing import List

import requests
from flask import abort, jsonify, request
from flask.blueprints import Blueprint
from flask_babel import gettext
from sqlalchemy import and_

from base.models import Msg, User
from v2ray.models import Inbound
from init import db
from util import config, server_info, file_util, session_util, v2_jobs, v2_util


server_bp = Blueprint("server", __name__, url_prefix="/server")

v2_core = "xray" if config.get_v2_core_xray() else "v2ray"


def add_if_not_none(dict, key, value):
    if value is not None:
        dict[key] = value


@server_bp.route("/status", methods=["GET"])
def status():
    result = server_info.get_status()
    return jsonify(result)


@server_bp.route("/settings", methods=["GET"])
@session_util.require_admin
def settings():
    sets = config.all_settings()
    return jsonify([s.to_json() for s in sets])


@server_bp.route("/setting/update/<int:setting_id>", methods=["POST"])
@session_util.require_admin
def update_setting(setting_id):
    key = request.form["key"]
    name = request.form["name"]
    value = request.form["value"]
    value_type = request.form["value_type"]
    if key == "cert_file" or key == "key_file":
        if value and not file_util.is_file(value):
            return jsonify(Msg(False, gettext("File <%(file)s> does not exist.", file=value)))
    config.update_setting(setting_id, key, name, value, value_type)
    if key == "v2_template_config":
        __v2_config_changed = True
    return jsonify(
        Msg(
            True,
            gettext("Updated successfully."),
        )
    )


@server_bp.route("/users", methods=["GET"])
@session_util.require_admin
def users():
    return jsonify([user.to_json() for user in User.query.all()])


@server_bp.route("/user/add", methods=["POST"])
@session_util.require_admin
def add_user():
    username = request.form["username"]
    if User.query.filter_by(username=username).count() > 0:
        return jsonify(Msg(False, gettext("User exists.")))
    password = request.form["password"]
    is_admin = request.form["is_admin"].lower() == "true"
    user = User(username, password, is_admin)
    db.session.add(user)
    db.session.commit()
    return jsonify(Msg(True, gettext("User added Successfully.")))


@server_bp.route("/user/update/<int:in_id>", methods=["POST"])
@session_util.require_admin
def update_user(in_id):
    update = {}
    username = request.form.get("username")
    if username:
        if User.query.filter(and_(User.id != in_id, User.username == username)).count() > 0:
            return jsonify(Msg(False, gettext("User exists.")))
    add_if_not_none(update, "username", username)
    old_password = request.form.get("old_password")
    if old_password:
        if User.query.filter(and_(User.id == in_id, User.password != old_password)).count() > 0:
            return jsonify(Msg(False, gettext("Wrong old password.")))
    password = request.form.get("password")
    if len(password) == 0:
        password = None
    add_if_not_none(update, "password", password)
    is_admin = request.form.get("is_admin")
    if is_admin:
        add_if_not_none(update, "is_admin", is_admin.lower() == "true")
    User.query.filter_by(id=in_id).update(update)
    db.session.commit()
    return jsonify(Msg(True, gettext("User updated Successfully.")))


@server_bp.route("/user/del/<int:in_id>", methods=["POST"])
@session_util.require_admin
@v2_jobs.v2_config_change
def del_user(in_id):
    User.query.filter_by(id=in_id).delete()
    Inbound.query.filter_by(user_id=in_id).delete()
    db.session.commit()
    return jsonify(Msg(True, gettext("User deleted Successfully.")))


last_get_version_time = 0
v2ray_versions = []


@server_bp.route("/get_v2ray_versions", methods=["GET"])
@session_util.require_admin
def get_v2ray_versions():
    global v2ray_versions, last_get_version_time
    try:
        now = time.time()
        if now - last_get_version_time < 60:
            return jsonify(
                Msg(
                    True,
                    msg=gettext("Get %(v2_core)s version successfully.", v2_core=v2_core),
                    obj=v2ray_versions,
                )
            )

        if v2_core == "v2ray":
            with requests.get("https://api.github.com/repos/v2fly/v2ray-core/releases") as response:
                release_list: List[dict] = response.json()
        else:
            with requests.get("https://api.github.com/repos/XTLS/Xray-core/releases") as response:
                release_list: List[dict] = response.json()

        versions = [release.get("tag_name") for release in release_list]
        if len(versions) == 0 or versions[0] is None:
            raise Exception()
        v2ray_versions = versions
        last_get_version_time = now
        return jsonify(
            Msg(
                True,
                msg=gettext("Get %(v2_core)s version successfully.", v2_core=v2_core),
                obj=versions,
            )
        )
    except Exception as e:
        logging.error(gettext("Get %(v2_core)s version failed.", v2_core=v2_core))
        logging.error(e)
        return jsonify(
            Msg(
                False,
                msg=gettext(
                    "Failed to check %(v2_core)s version from Github, please try again after a while.",
                    v2_core=v2_core,
                ),
            )
        )


@server_bp.route("/install_v2ray/<version>", methods=["POST"])
@session_util.require_admin
def install_v2ray_by_version(version: str):
    if v2_core == "v2ray":
        url = f"https://github.com/v2fly/v2ray-core/releases/download/{version}/v2ray-linux-64.zip"
    else:
        url = f"https://github.com/XTLS/Xray-core/releases/download/{version}/Xray-linux-64.zip"

    filename = config.get_dir("v2ray_temp.zip")
    zip_dest_dir = config.get_dir("temp_v2ray")

    try:
        with requests.get(url, stream=True) as response:
            with open(filename, "wb") as f:
                for data in response.iter_content(8192):
                    f.write(data)
        file_util.mkdirs(zip_dest_dir)
        file_util.unzip_file(filename, zip_dest_dir)

        bin_dir = config.get_dir("bin")

        if v2_core == "v2ray":
            filenames = ["v2ray", "v2ctl", "geoip.dat", "geosite.dat"]
        else:
            filenames = ["xray", "geoip.dat", "geosite.dat"]

        for i in range(len(filenames)):
            name = filenames[i]

            dest_file_path = os.path.join(bin_dir, name)
            # del old file
            file_util.del_file(dest_file_path)

            # move new file to dest
            file_util.mv_file(os.path.join(zip_dest_dir, name), dest_file_path)

            # +x
            os.chmod(dest_file_path, stat.S_IEXEC | stat.S_IREAD | stat.S_IWRITE)

        v2_util.__version = ""
        v2_util.restart()

        return jsonify(
            Msg(True, gettext("Switch %(v2_core)s version successfully.", v2_core=v2_core))
        )
    except Exception as e:
        logging.error("Download %(v2_core)s {version} failed.", v2_core=v2_core)
        logging.error(e)
        traceback.print_exc()
        return jsonify(
            Msg(False, gettext("Switch %(v2_core)s-core version failed.", v2_core=v2_core))
        )
    finally:
        file_util.del_file(filename)
        file_util.del_dir(zip_dest_dir)


@server_bp.route("/restart_script", methods=["GET"])
@session_util.require_admin
def restart_script():
    if session_util.is_admin():
        os.execl(sys.executable, sys.executable, *sys.argv)
    else:
        return jsonify(Msg(False, gettext("Permission Denied.")))