#!/bin/bash

#======================================================
#   System Required: CentOS 7+ / Debian 8+ / Ubuntu 16+
#   Description: Manage v2-ui
#   Author: sprov
#   Blog: https://blog.sprov.xyz
#   Github - v2-ui: https://github.com/sprov065/v2-ui
#======================================================

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
plain='\033[0m'

# check root
[[ $EUID -ne 0 ]] && echo -e "${red}错误: ${plain} Tập lệnh này phải được chạy với tư cách người dùng root！\n" && exit 1

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
        echo && read -p "$1 [mặc định $2]: " temp
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

confirm_restart() {
    confirm "Có khởi động lại bảng điều khiển hay không, việc khởi động lại bảng điều khiển cũng sẽ khởi động lại v2ray" "y"
    if [[ $? == 0 ]]; then
        restart
    else
        show_menu
    fi
}

before_show_menu() {
    echo && echo -n -e "${yellow}Nhấn enter để quay lại menu chính: ${plain}" && read temp
    show_menu
}

install() {
    bash <(curl -Ls https://blog.sprov.xyz/v2-ui.sh)
    if [[ $? == 0 ]]; then
        if [[ $# == 0 ]]; then
            start
        else
            start 0
        fi
    fi
}

update() {
    confirm "Chức năng này sẽ buộc cài đặt lại phiên bản mới nhất hiện tại, dữ liệu sẽ không bị mất, có tiếp tục không?" "n"
    if [[ $? != 0 ]]; then
        echo -e "${red}Đã hủy${plain}"
        if [[ $# == 0 ]]; then
            before_show_menu
        fi
        return 0
    fi
    bash <(curl -Ls https://blog.sprov.xyz/v2-ui.sh)
    if [[ $? == 0 ]]; then
        echo -e "${green}Cập nhật hoàn tất, bảng điều khiển đã được tự động khởi động lại${plain}"
        exit
#        if [[ $# == 0 ]]; then
#            restart
#        else
#            restart 0
#        fi
    fi
}

uninstall() {
    confirm "Bạn có chắc chắn muốn gỡ cài đặt bảng điều khiển không, v2ray cũng sẽ gỡ cài đặt?" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    systemctl stop v2-ui
    systemctl disable v2-ui
    rm /etc/systemd/system/v2-ui.service -f
    systemctl daemon-reload
    systemctl reset-failed
    rm /etc/v2-ui/ -rf
    rm /usr/local/v2-ui/ -rf

    echo ""
    echo -e "Gỡ cài đặt thành công, nếu bạn muốn xóa tập lệnh này, hãy chạy sau khi thoát tập lệnh ${green}rm /usr/bin/v2-ui -f${plain} xóa"
    echo ""
    echo -e "Telegram 群组: ${green}https://t.me/sprov_blog${plain}"
    echo -e "Github issues: ${green}https://github.com/sprov065/v2-ui/issues${plain}"
    echo -e "Blog: ${green}https://blog.sprov.xyz/v2-ui${plain}"

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

reset_user() {
    confirm "Bạn có chắc chắn muốn đặt lại tên người dùng và mật khẩu cho quản trị viên không" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    /usr/local/v2-ui/v2-ui resetuser
    echo -e "Tên người dùng và mật khẩu đã được đặt lại thành ${green}admin${plain}，Vui lòng khởi động lại bảng điều khiển ngay bây giờ"
    confirm_restart
}

reset_config() {
    confirm "Bạn có chắc chắn muốn đặt lại tất cả cài đặt bảng điều khiển, dữ liệu tài khoản sẽ không bị mất, tên người dùng và mật khẩu sẽ không bị thay đổi" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    /usr/local/v2-ui/v2-ui resetconfig
    echo -e "Tất cả các bảng đã được đặt lại về giá trị mặc định, vui lòng khởi động lại các bảng ngay bây giờ và sử dụng mặc định ${green}54321${plain} Bảng điều khiển truy cập cổng"
    confirm_restart
}

set_port() {
    echo && echo -n -e "Nhập số cổng[1-65535]: " && read port
    if [[ -z "${port}" ]]; then
        echo -e "${yellow}已取消${plain}"
        before_show_menu
    else
        /usr/local/v2-ui/v2-ui setport ${port}
        echo -e "Sau khi thiết lập cổng, vui lòng khởi động lại bảng điều khiển và sử dụng cổng mới đặt ${green}${port}${plain} bảng điều khiển truy cập"
        confirm_restart
    fi
}

start() {
    check_status
    if [[ $? == 0 ]]; then
        echo ""
        echo -e "${green}Bảng đã chạy rồi, không cần khởi động lại, nếu muốn khởi động lại, vui lòng chọn khởi động lại${plain}"
    else
        systemctl start v2-ui
        sleep 2
        check_status
        if [[ $? == 0 ]]; then
            echo -e "${green}v2-ui Đã bắt đầu thành công${plain}"
        else
            echo -e "${red}Bảng điều khiển không khởi động được, có thể do thời gian khởi động vượt quá hai giây, vui lòng kiểm tra thông tin nhật ký sau${plain}"
        fi
    fi

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

stop() {
    check_status
    if [[ $? == 1 ]]; then
        echo ""
        echo -e "${green}Bảng điều khiển đã dừng, không cần dừng lại${plain}"
    else
        systemctl stop v2-ui
        sleep 2
        check_status
        if [[ $? == 1 ]]; then
            echo -e "${green}v2-ui và v2ray đã dừng thành công${plain}"
        else
            echo -e "${red}Bảng điều khiển không dừng được, có thể do thời gian dừng vượt quá hai giây, vui lòng kiểm tra thông tin nhật ký sau${plain}"
        fi
    fi

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

restart() {
    systemctl restart v2-ui
    sleep 2
    check_status
    if [[ $? == 0 ]]; then
        echo -e "${green}v2-ui và v2ray đã khởi động lại thành công${plain}"
    else
        echo -e "${red}Bảng điều khiển không thể khởi động lại, có thể do thời gian khởi động vượt quá hai giây, vui lòng kiểm tra thông tin nhật ký sau${plain}"
    fi
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

status() {
    systemctl status v2-ui -l
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

enable() {
    systemctl enable v2-ui
    if [[ $? == 0 ]]; then
        echo -e "${green}v2-ui đặt khởi động thành công${plain}"
    else
        echo -e "${red}v2-ui không đặt được tự động khởi động khi khởi động${plain}"
    fi

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

disable() {
    systemctl disable v2-ui
    if [[ $? == 0 ]]; then
        echo -e "${green}v2-ui hủy khởi động tự khởi động thành công${plain}"
    else
        echo -e "${red}v2-ui không thể hủy chế độ tự khởi động${plain}"
    fi

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

show_log() {
    echo && echo -n -e "Trong quá trình sử dụng bảng, nhiều nhật ký CẢNH BÁO có thể được xuất ra. Nếu việc sử dụng bảng không có vấn đề gì, hãy nhấn Enter để tiếp tục.: " && read temp
    tail -500f /etc/v2-ui/v2-ui.log
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

install_bbr() {
    bash <(curl -L -s https://github.com/sprov065/blog/raw/master/bbr.sh)
    if [[ $? == 0 ]]; then
        echo ""
        echo -e "${green}cài đặt thành công bbr${plain}"
    else
        echo ""
        echo -e "${red}Không thể tải xuống tập lệnh cài đặt bbr, vui lòng kiểm tra xem máy tính của bạn có thể kết nối với Github không${plain}"
    fi

    before_show_menu
}

update_shell() {
    wget -O /usr/bin/v2-ui -N --no-check-certificate https://github.com/sprov065/v2-ui/raw/master/v2-ui.sh
    if [[ $? != 0 ]]; then
        echo ""
        echo -e "${red}Không tải được script xuống, vui lòng kiểm tra xem máy có thể kết nối với Github không${plain}"
        before_show_menu
    else
        chmod +x /usr/bin/v2-ui
        echo -e "${green}Tập lệnh nâng cấp thành công, vui lòng chạy lại tập lệnh${plain}" && exit 0
    fi
}

# 0: running, 1: not running, 2: not installed
check_status() {
    if [[ ! -f /etc/systemd/system/v2-ui.service ]]; then
        return 2
    fi
    temp=$(systemctl status v2-ui | grep Active | awk '{print $3}' | cut -d "(" -f2 | cut -d ")" -f1)
    if [[ x"${temp}" == x"running" ]]; then
        return 0
    else
        return 1
    fi
}

check_enabled() {
    temp=$(systemctl is-enabled v2-ui)
    if [[ x"${temp}" == x"enabled" ]]; then
        return 0
    else
        return 1;
    fi
}

check_uninstall() {
    check_status
    if [[ $? != 2 ]]; then
        echo ""
        echo -e "${red}Bảng điều khiển đã được cài đặt, vui lòng không cài đặt lại${plain}"
        if [[ $# == 0 ]]; then
            before_show_menu
        fi
        return 1
    else
        return 0
    fi
}

check_install() {
    check_status
    if [[ $? == 2 ]]; then
        echo ""
        echo -e "${red}Vui lòng cài đặt bảng điều khiển trước${plain}"
        if [[ $# == 0 ]]; then
            before_show_menu
        fi
        return 1
    else
        return 0
    fi
}

show_status() {
    check_status
    case $? in
        0)
            echo -e "tình trạng bảng điều khiển: ${green}đã được chạy${plain}"
            show_enable_status
            ;;
        1)
            echo -e "tình trạng bảng điều khiển: ${yellow}không chạy${plain}"
            show_enable_status
            ;;
        2)
            echo -e "tình trạng bảng điều khiển: ${red}Chưa cài đặt${plain}"
    esac
    show_v2ray_status
}

show_enable_status() {
    check_enabled
    if [[ $? == 0 ]]; then
        echo -e "Có tự động bắt đầu không: ${green}Đúng${plain}"
    else
        echo -e "Có tự động bắt đầu không: ${red}không${plain}"
    fi
}

check_v2ray_status() {
    count=$(ps -ef | grep "v2ray-v2-ui" | grep -v "grep" | wc -l)
    if [[ count -ne 0 ]]; then
        return 0
    else
        return 1
    fi
}

show_v2ray_status() {
    check_v2ray_status
    if [[ $? == 0 ]]; then
        echo -e "trạng thái v2ray: ${green}chạy${plain}"
    else
        echo -e "trạng thái v2ray: ${red}không chạy${plain}"
    fi
}

show_usage() {
    echo "Cách sử dụng tập lệnh quản lý v2-ui: "
    echo "------------------------------------------"
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
    echo "------------------------------------------"
}

show_menu() {
    echo -e "
  ${green}tập lệnh quản lý bảng điều khiển v2-ui${plain}
--- https://blog.sprov.xyz/v2-ui ---
  ${green}0.${plain} tập lệnh thoát
————————————————
  ${green}1.${plain} Cài đặt v2-ui
  ${green}2.${plain} cập nhật v2-ui
  ${green}3.${plain} gỡ cài đặt v2-ui
————————————————
  ${green}4.${plain} đặt lại mật khẩu tên người dùng
  ${green}5.${plain} đặt lại cài đặt bảng điều khiển
  ${green}6.${plain} Thiết lập các cổng bảng điều khiển
————————————————
  ${green}7.${plain} bắt đầu v2-ui
  ${green}8.${plain} dừng v2-ui
  ${green}9.${plain} khởi động lại v2-ui
 ${green}10.${plain} Xem trạng thái v2-ui
 ${green}11.${plain} Xem nhật ký v2-ui
————————————————
 ${green}12.${plain} Đặt v2-ui để bắt đầu tự động khi khởi động
 ${green}13.${plain} Hủy tự động khởi động v2-ui
————————————————
 ${green}14.${plain} Một cú nhấp chuột cài đặt bbr (hạt nhân mới nhất)
 "
    show_status
    echo && read -p "Vui lòng nhập một lựa chọn [0-14]: " num

    case "${num}" in
        0) exit 0
        ;;
        1) check_uninstall && install
        ;;
        2) check_install && update
        ;;
        3) check_install && uninstall
        ;;
        4) check_install && reset_user
        ;;
        5) check_install && reset_config
        ;;
        6) check_install && set_port
        ;;
        7) check_install && start
        ;;
        8) check_install && stop
        ;;
        9) check_install && restart
        ;;
        10) check_install && status
        ;;
        11) check_install && show_log
        ;;
        12) check_install && enable
        ;;
        13) check_install && disable
        ;;
        14) install_bbr
        ;;
        *) echo -e "${red}Vui lòng nhập số chính xác [0-14]${plain}"
        ;;
    esac
}


if [[ $# > 0 ]]; then
    case $1 in
        "start") check_install 0 && start 0
        ;;
        "stop") check_install 0 && stop 0
        ;;
        "restart") check_install 0 && restart 0
        ;;
        "status") check_install 0 && status 0
        ;;
        "enable") check_install 0 && enable 0
        ;;
        "disable") check_install 0 && disable 0
        ;;
        "log") check_install 0 && show_log 0
        ;;
        "update") check_install 0 && update 0
        ;;
        "install") check_uninstall 0 && install 0
        ;;
        "uninstall") check_install 0 && uninstall 0
        ;;
        *) show_usage
    esac
else
    show_menu
fi
