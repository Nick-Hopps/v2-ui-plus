FROM python:3.8-slim-buster

WORKDIR /root

COPY requirements.txt requirements.txt
RUN set -ex \
	&& mkdir -p /var/log/v2ray \
  && pip3 install -r requirements.txt

COPY . .

CMD ["python3", "v2-ui.py"]
