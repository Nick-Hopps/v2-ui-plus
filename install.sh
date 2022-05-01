#!/usr/bin/env bash

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
plain='\033[0m'

cur_dir=$(pwd)

# check root
[[ $EUID -ne 0 ]] && echo -e "${red}Error：${plain} Vui lòng chạy tập lệnh với tư cách người dùng root！\n" && exit 1

# check os
if [[ -f /etc/redhat-release ]]; then
    release="centos"
elif cat /etc/issue | grep -Eqi "debian"; then
    release="debian"
elif cat /etc/issue | grep -Eqi "ubuntu"; then
    release="ubuntu"
elif cat /etc/issue | grep -Eqi "centos|red hat|redhat"; then
    release="centos"
elif cat /proc/version | grep -Eqi "debian"; then
    release="debian"
elif cat /proc/version | grep -Eqi "ubuntu"; then
    release="ubuntu"
elif cat /proc/version | grep -Eqi "centos|red hat|redhat"; then
    release="centos"
else
    echo -e "${red}Phiên bản hệ thống không được phát hiện, vui lòng liên hệ với tác giả kịch bản！${plain}\n" && exit 1
fi

if [ $(getconf WORD_BIT) != '32' ] && [ $(getconf LONG_BIT) != '64' ] ; then
    echo "Phần mềm này không hỗ trợ hệ thống 32-bit (x86), vui lòng sử dụng hệ thống 64-bit (x86_64)"
    exit -1
fi

os_version=""

# os version
if [[ -f /etc/os-release ]]; then
    os_version=$(awk -F'[= ."]' '/VERSION_ID/{print $3}' /etc/os-release)
fi
if [[ -z "$os_version" && -f /etc/lsb-release ]]; then
    os_version=$(awk -F'[= ."]+' '/DISTRIB_RELEASE/{print $2}' /etc/lsb-release)
fi

if [[ x"${release}" == x"centos" ]]; then
    if [[ ${os_version} -le 6 ]]; then
        echo -e "${red}Vui lòng sử dụng CentOS 7 trở lên！${plain}\n" && exit 1
    fi
elif [[ x"${release}" == x"ubuntu" ]]; then
    if [[ ${os_version} -lt 16 ]]; then
        echo -e "${red}Vui lòng sử dụng Ubuntu 16 trở lên！${plain}\n" && exit 1
    fi
elif [[ x"${release}" == x"debian" ]]; then
    if [[ ${os_version} -lt 8 ]]; then
        echo -e "${red}Vui lòng sử dụng Debian 8 trở lên！${plain}\n" && exit 1
    fi
fi

confirm() {
    if [[ $# > 1 ]]; then
        echo && read -p "$1 [mặc định$2]: " temp
        if [[ x"${temp}" == x"" ]]; then
            temp=$2
        fi
    else
        read -p "$1 [y/n]: " temp
    fi
    if [[ x"${temp}" == x"y" || x"${temp}" == x"Y" ]]; then
        return 0
    else
        return 1
    fi
}

install_base() {
    if [[ x"${release}" == x"centos" ]]; then
        yum install wget curl tar unzip -y
    else
        apt install wget curl tar unzip -y
    fi
}

uninstall_old_v2ray() {
    if [[ -f /usr/bin/v2ray/v2ray ]]; then
        confirm "Đã phát hiện phiên bản v2ray，Bạn có gỡ cài đặt hay không，sẽ xoá /usr/bin/v2ray/ 与 /etc/systemd/system/v2ray.service" "Y"
        if [[ $? != 0 ]]; then
            echo "v2-ui không thể cài đặt nếu không gỡ cài đặt"
            exit 1
        fi
        echo -e "${green}Gỡ cài đặt phiên bản v2ray cũ${plain}"
        systemctl stop v2ray
        rm /usr/bin/v2ray/ -rf
        rm /etc/systemd/system/v2ray.service -f
        systemctl daemon-reload
    fi
    if [[ -f /usr/local/bin/v2ray ]]; then
        confirm "Đã phát hiện thấy v2ray được cài đặt theo những cách khác, có nên gỡ cài đặt hay không, v2-ui đi kèm với hạt nhân v2ray chính thức, để tránh xung đột cổng của nó, bạn nên gỡ cài đặt" "Y"
        if [[ $? != 0 ]]; then
            echo -e "${red}Nếu bạn chọn không gỡ cài đặt, hãy đảm bảo rằng các tập lệnh khác đã được cài đặt v2ray và v2-ui ${green}đi kèm với chính thức v2ray hạt nhân${red}Không có xung đột cổng${plain}"
        else
            echo -e "${green}Bắt đầu gỡ cài đặt các cài đặt khác v2ray${plain}"
            systemctl stop v2ray
            bash <(curl https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh) --remove
            systemctl daemon-reload
        fi
    fi
}

install_v2ray() {
    uninstall_old_v2ray
    echo -e "${green}Bắt đầu cài đặt hoặc nâng cấp v2ray${plain}"
    bash <(curl https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)
    if [[ $? -ne 0 ]]; then
        echo -e "${red}cài đặt hoặc nâng cấp v2ray không thành công，Vui lòng kiểm tra thông báo lỗi${plain}"
        echo -e "${yellow}Phần lớn nguyên nhân có thể là do khu vực đặt máy chủ hiện tại của bạn không tải được gói cài đặt v2ray, trường hợp này thường xảy ra hơn trên các máy trong nước, giải pháp là cài đặt v2ray theo cách thủ công. Vui lòng tham khảo thông báo lỗi trên để biết nguyên nhân cụ thể.${plain}"
        exit 1
    fi
    echo "
[Unit]
Description=V2Ray Service
After=network.target nss-lookup.target

[Service]
User=root
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
NoNewPrivileges=true
Environment=V2RAY_LOCATION_ASSET=/usr/local/share/v2ray/
ExecStart=/usr/local/bin/v2ray -confdir /usr/local/etc/v2ray/
Restart=on-failure

[Install]
WantedBy=multi-user.target
" > /etc/systemd/system/v2ray.service
    if [[ ! -f /usr/local/etc/v2ray/00_log.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/00_log.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/01_api.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/01_api.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/02_dns.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/02_dns.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/03_routing.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/03_routing.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/04_policy.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/04_policy.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/05_inbounds.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/05_inbounds.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/06_outbounds.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/06_outbounds.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/07_transport.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/07_transport.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/08_stats.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/08_stats.json
    fi
    if [[ ! -f /usr/local/etc/v2ray/09_reverse.json ]]; then
        echo "{}" > /usr/local/etc/v2ray/09_reverse.json
    fi
    systemctl daemon-reload
    systemctl enable v2ray
    systemctl start v2ray
}

#close_firewall() {
#    if [[ x"${release}" == x"centos" ]]; then
#        systemctl stop firewalld
#        systemctl disable firewalld
#    elif [[ x"${release}" == x"ubuntu" ]]; then
#        ufw disable
#    elif [[ x"${release}" == x"debian" ]]; then
#        iptables -P INPUT ACCEPT
#        iptables -P OUTPUT ACCEPT
#        iptables -P FORWARD ACCEPT
#        iptables -F
#    fi
#}

install_v2-ui() {
    systemctl stop v2-ui
    cd /usr/local/
    if [[ -e /usr/local/v2-ui/ ]]; then
        rm /usr/local/v2-ui/ -rf
    fi

    if  [ $# == 0 ] ;then
        last_version=$(curl -Ls "https://api.github.com/repos/sprov065/v2-ui/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
        if [[ ! -n "$last_version" ]]; then
            echo -e "${red}Không phát hiện được phiên bản v2-ui, có thể đã vượt quá giới hạn API Github, vui lòng thử lại sau hoặc chỉ định phiên bản v2-ui để cài đặt theo cách thủ công${plain}"
            exit 1
        fi
        echo -e "v2-ui đã phát hiện phiên bản mới nhất：${last_version}，bắt đầu cài đặt"
        wget -N --no-check-certificate -O /usr/local/v2-ui-linux.tar.gz https://github.com/sprov065/v2-ui/releases/download/${last_version}/v2-ui-linux.tar.gz
        if [[ $? -ne 0 ]]; then
            echo -e "${red}Không tải xuống được v2-ui, hãy đảm bảo máy chủ của bạn có thể tải xuống tệp Github${plain}"
            exit 1
        fi
    else
        last_version=$1
        url="https://github.com/sprov065/v2-ui/releases/download/${last_version}/v2-ui-linux.tar.gz"
        echo -e "bắt đầu cài đặt v2-ui v$1"
        wget -N --no-check-certificate -O /usr/local/v2-ui-linux.tar.gz ${url}
        if [[ $? -ne 0 ]]; then
            echo -e "${red}下载 v2-ui v$1 không thành công, hãy đảm bảo rằng phiên bản này tồn tại${plain}"
            exit 1
        fi
    fi

    tar zxvf v2-ui-linux.tar.gz
    rm v2-ui-linux.tar.gz -f
    cd v2-ui
    chmod +x v2-ui bin/v2ray-v2-ui bin/v2ctl
    cp -f v2-ui.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable v2-ui
    systemctl start v2-ui
    echo -e "${green}v2-ui v${last_version}${plain} Quá trình cài đặt hoàn tất, bảng điều khiển được khởi chạy，"
    echo -e ""
    echo -e "Nếu đó là một cài đặt mới, cổng web mặc định là ${green}65432${plain}，Tên người dùng và mật khẩu đều theo mặc định ${green}admin${plain}"
    echo -e "Hãy đảm bảo rằng cổng này không bị các chương trình khác chiếm giữ，${yellow}và đảm bảo rằng port 54321 được mở${plain}"
    echo -e "Nếu bạn muốn sửa đổi port 54321 thành một cổng khác, hãy nhập lệnh v2-ui để sửa đổi nó và cũng đảm bảo rằng cổng bạn sửa đổi cũng được phép"
    echo -e ""
    echo -e "Nếu đó là bảng cập nhật, hãy truy cập bảng như bạn đã làm trước đây"
    echo -e ""
    curl -o /usr/bin/v2-ui -Ls https://raw.githubusercontent.com/sprov065/v2-ui/master/v2-ui.sh
    chmod +x /usr/bin/v2-ui
    echo -e "v2-ui Cách sử dụng tập lệnh quản lý: "
    echo -e "----------------------------------------------"
    echo -e "v2-ui              - Hiển thị menu quản lý (nhiều chức năng hơn)"
    echo -e "v2-ui start        - Khởi động v2-ui"
    echo -e "v2-ui stop         - Dừng bảng điều khiển v2-ui"
    echo -e "v2-ui restart      - Khởi động lại bảng điều khiển v2-ui"
    echo -e "v2-ui status       - Xem trạng thái v2-ui"
    echo -e "v2-ui enable       - Đặt v2-ui để bắt đầu tự động khi khởi động"
    echo -e "v2-ui disable      - Hủy tự động khởi động v2-ui"
    echo -e "v2-ui log          - Xem log v2-ui"
    echo -e "v2-ui update       - Cập nhật v2-ui"
    echo -e "v2-ui install      - Cài đặt v2-ui"
    echo -e "v2-ui uninstall    - Gỡ cài đặt v2-ui"
    echo -e "----------------------------------------------"
}

echo -e "${green}bắt đầu cài đặt${plain}"
install_base
uninstall_old_v2ray
#close_firewall
install_v2-ui $1
