import json
import random

from sqlalchemy import Column, Integer, String, BIGINT, Boolean
from init import db

<<<<<<< HEAD
def generate_random_str(length=10):
    random_str = ''
    base_str = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789'
    for i in range(length):
        random_str += base_str[random.randint(0, len(base_str) - 1)]
    return random_str
=======
>>>>>>> refs/remotes/origin/master

class Inbound(db.Model):
    __tablename__ = "inbound"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    port = Column(Integer, nullable=False)
    listen = Column(String(50), default="0.0.0.0")
    protocol = Column(String(50), nullable=False)
    settings = Column(String, nullable=False)
    stream_settings = Column(String, nullable=False)
    tag = Column(String(255), default="", nullable=False)
    sniffing = Column(String, default='{"enabled":true,"destOverride":["http","tls"]}')
    remark = Column(String(255), default="", nullable=False)
    up = Column(BIGINT, default=0, nullable=False)
    down = Column(BIGINT, default=0, nullable=False)
    enable = Column(Boolean, default=True, nullable=False)

    def __init__(
        self,
        user_id=None,
        port=None,
        listen=None,
        protocol=None,
        settings=None,
        stream_settings=None,
        sniffing=None,
        remark=None,
        enable=None,
    ):
        self.user_id = user_id
        self.port = port
        self.listen = listen
        self.protocol = protocol
        self.settings = settings
        self.stream_settings = stream_settings
        self.tag = "inbound-%d" % self.port
        self.sniffing = sniffing
        self.remark = remark
        self.up = 0
        self.down = 0
        self.enable = enable

    def to_json(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "port": self.port,
            "listen": self.listen,
            "protocol": self.protocol,
            "settings": json.loads(self.settings),
            "stream_settings": json.loads(self.stream_settings),
            "sniffing": json.loads(self.sniffing),
            "remark": self.remark,
            "up": self.up,
            "down": self.down,
            "enable": self.enable,
        }

    def to_v2_json(self):
        return {
            "port": self.port,
            "listen": self.listen,
            "protocol": self.protocol,
            "settings": json.loads(self.settings),
            "streamSettings": json.loads(self.stream_settings),
            "sniffing": json.loads(self.sniffing),
            "tag": self.tag,
        }

    def to_v2_str(self):
        return json.dumps(
            self.to_v2_json(),
            indent=2,
            separators=(",", ": "),
            sort_keys=True,
            ensure_ascii=False,
        )
