import atexit
import json
import logging
import os
import platform
import re
import subprocess
import sys
import time
from collections import deque
from threading import Timer, Lock
from typing import Optional, List

import psutil

from util import config, list_util, cmd_util, file_util, json_util
from v2ray.models import Inbound


__is_windows: bool = platform.system() == "Windows"
__v2_cmd_name: str = "xray" if config.get_v2_core_xray() else "v2ray"

if __is_windows:
    __v2ray_file_name: str = __v2_cmd_name + ".exe"
    __v2ctl_file_name: str = "v2ctl.exe" if __v2_cmd_name == "v2ray" else "xray.exe"
else:
    __v2ray_file_name: str = __v2_cmd_name
    __v2ctl_file_name: str = "v2ctl" if __v2_cmd_name == "v2ray" else "xray"

__v2ray_cmd: str = os.path.join(config.BASE_DIR, "bin", __v2ray_file_name)
__v2ctl_cmd: str = os.path.join(config.BASE_DIR, "bin", __v2ctl_file_name)
__conf_path: str = os.path.join(config.BASE_DIR, "bin", "config.json")

__process: Optional[subprocess.Popen] = None
__process_lock: Lock = Lock()
__error_msg: str = ""
__version: str = ""

# traffic statistics based on tag
# __traffic_pattern_inbound = re.compile(
#     'stat:\s*<\s*name:\s*"inbound>>>(?P<tag>[^>]+)>>>traffic>>>(?P<type>uplink|downlink)"(\s*value:\s*(?P<value>\d+))?'
# )
# traffic statistics based on email
__traffic_pattern_user = re.compile(
    'stat:\s*<\s*name:\s*"user>>>(?P<email>[^>]+)>>>traffic>>>(?P<type>uplink|downlink)"(\s*value:\s*(?P<value>\d+))?'
)

V2_CONF_KEYS = [
    "log",
    "api",
    "dns",
    "routing",
    "policy",
    "inbounds",
    "outbounds",
    "transport",
    "stats",
    "reverse",
]


def start_v2ray():
    global __process
    encoding = "gbk" if __is_windows else "utf-8"
    __process = subprocess.Popen(
        [__v2ray_cmd, "-config", __conf_path],
        shell=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        encoding=encoding,
    )
    logging.info(f"start {__v2_cmd_name}")

    def f():
        global __error_msg
        last_lines: deque = deque()
        try:
            while __process.poll() is None:
                line = __process.stdout.readline()
                if not line:
                    break
                if len(last_lines) >= 10:
                    last_lines.popleft()
                last_lines.append(line)
        except Exception as e:
            logging.warning(e)
        finally:
            __error_msg = "\n".join(last_lines)

    __error_msg = ""
    Timer(0, f).start()


def stop_v2ray():
    global __process
    # if __is_windows:
    #     for p in psutil.process_iter():
    #         if __v2_core_type in p.name():
    #             p.terminate()
    if __process is not None:
        try:
            __process.terminate()
            logging.info(f"stop {__v2_cmd_name}")
        except Exception as e:
            logging.warning(f"stop {__v2_cmd_name} error: {e}")
        finally:
            __process = None


def restart_v2ray():
    with __process_lock:
        stop_v2ray()
        start_v2ray()


def config_merge(inbounds):
    inbounds_merged = []
    if not (len(inbounds) > 1):
        return inbounds
    for inbound in inbounds:
        if inbounds_merged and inbounds_merged[-1]["tag"] == inbound["tag"]:
            if inbound["protocol"] in ["vmess", "vless", "trojan"]:
                inbounds_merged[-1]["settings"]["clients"] += inbound["settings"]["clients"]
            if inbound["protocol"] in ["socks", "http"]:
                inbounds_merged[-1]["settings"]["accounts"] += inbound["settings"]["accounts"]
            if inbound["protocol"] == "shadowsocks":
                inbounds_merged[-1]["settings"] += inbound["settings"]
        else:
            inbounds_merged.append(inbound)
    return inbounds_merged


def gen_v2_config_from_db():
    inbounds = Inbound.query.filter_by(enable=True).all()
    inbounds = [inbound.to_v2_json() for inbound in inbounds]
    inbounds = config_merge(inbounds)
    v2_config = json.loads(config.get_v2_template_config())
    v2_config["inbounds"] += inbounds
    for conf_key in V2_CONF_KEYS:
        if conf_key not in v2_config:
            v2_config[conf_key] = {}
    return v2_config


def read_v2_config() -> Optional[dict]:
    try:
        content = file_util.read_file(__conf_path)
        return json.loads(content)
    except Exception as e:
        logging.error(
            f"An error occurred while reading the {__v2_cmd_name} configuration file: " + str(e)
        )
        return None


def write_v2_config(v2_config: dict):
    if read_v2_config() == v2_config:
        return
    try:
        file_util.write_file(__conf_path, json_util.dumps(v2_config))
        restart(True)
    except Exception as e:
        logging.error(
            f"An error occurred while writing the {__v2_cmd_name} configuration file: " + str(e)
        )


def __get_api_address_port():
    template_config = json.loads(config.get_v2_template_config())
    inbounds = template_config["inbounds"]
    api_inbound = list_util.get(inbounds, "tag", "api")
    return api_inbound["listen"], api_inbound["port"]


def __get_stat_code():
    if __process is None or __process.poll() is not None:
        if __error_msg != "":
            return 2
        return 1
    return 0


def get_v2ray_version():
    global __version
    if __version != "":
        return __version
    result, code = cmd_util.exec_cmd(f"{__v2ray_cmd} -version")
    if code != 0:
        return "Unknown"
    else:
        try:
            __version = result.split(" ")[1]
            return __version
        except Exception as e:
            logging.warning(f"get {__v2_cmd_name} version failed: {e}")
            return "Error"


def get_v2ray_error_msg():
    return __error_msg


def is_running():
    return __get_stat_code() == 0


def restart(now=False):
    def f():
        try:
            restart_v2ray()
        except Exception as e:
            logging.warning(f"restart {__v2_cmd_name} error: {e}")

    if now:
        f()
    else:
        Timer(3, f).start()


try:
    __api_address, __api_port = __get_api_address_port()
    if not __api_address or __api_address == "0.0.0.0":
        __api_address = "127.0.0.1"
except Exception as e:
    logging.error(f"Failed to open {__v2_cmd_name} api, please reset all panel settings.")
    logging.error(str(e))
    sys.exit(-1)


def __get_v2ray_api_cmd(address, service, method, pattern, reset):
    if __v2_cmd_name == "v2ray":
        cmd = "%s api --server=%s:%d %s.%s 'pattern: \"%s\" reset: %s'" % (
            __v2ctl_cmd,
            address,
            __api_port,
            service,
            method,
            pattern,
            reset,
        )
    else:
        cmd = '%s api %s --server=%s:%d -pattern "%s" -reset "%s"' % (
            __v2ctl_cmd,
            service,
            address,
            __api_port,
            pattern,
            reset,
        )
    return cmd


def get_inbounds_traffic(reset=True):
    if __api_port < 0:
        logging.warning(f"{__v2_cmd_name} api port is not configured.")
        return None
    if __v2_cmd_name == "v2ray":
        cmd = __get_v2ray_api_cmd(
            "127.0.0.1", "StatsService", "QueryStats", "", "true" if reset else "false"
        )
    else:
        cmd = __get_v2ray_api_cmd("127.0.0.1", "statsquery", "", "", "true" if reset else "false")
    result, code = cmd_util.exec_cmd(cmd)
    if code != 0:
        logging.warning(f"{__v2_cmd_name} api code %d" % code)
        return None
    inbounds = []
    for match in __traffic_pattern_user.finditer(result):
        email = match.group("email")
        traffic_type = match.group("type")
        value = match.group("value")
        if not value:
            value = 0
        else:
            value = int(value)
        inbound = list_util.get(inbounds, "email", email)
        if inbound:
            inbound[traffic_type] = value
        else:
            inbounds.append({"email": email, traffic_type: value})
    return inbounds


def init_v2ray():
    file_util.write_file(__conf_path, "{}")
    v2_config = gen_v2_config_from_db()
    write_v2_config(v2_config)


@atexit.register
def on_exit():
    stop_v2ray()
