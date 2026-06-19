#!/bin/bash
# ============================================================
#  gen-passwords.sh
#  Tự động sinh passwords ngẫu nhiên và ghi vào file .env
# ============================================================

set -e

# Kiểm tra file .env đã tồn tại chưa
if [ ! -f ".env" ]; then
    echo "Sao chép .env.template thành .env trước..."
    cp .env.template .env
    echo "✅ Đã tạo file .env từ template"
fi

# Hàm sinh password ngẫu nhiên 32 ký tự
gen_pass() {
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

echo "🔑 Đang sinh passwords ngẫu nhiên..."

JICOFO_AUTH_PASSWORD=$(gen_pass)
JICOFO_COMPONENT_SECRET=$(gen_pass)
JVB_AUTH_PASSWORD=$(gen_pass)
JIBRI_XMPP_PASSWORD=$(gen_pass)
JIBRI_RECORDER_PASSWORD=$(gen_pass)
JIGASI_XMPP_PASSWORD=$(gen_pass)

# Thay thế vào file .env
sed -i "s/CHANGE_ME_JICOFO_PASSWORD/$JICOFO_AUTH_PASSWORD/" .env
sed -i "s/CHANGE_ME_COMPONENT_SECRET/$JICOFO_COMPONENT_SECRET/" .env
sed -i "s/CHANGE_ME_JVB_PASSWORD/$JVB_AUTH_PASSWORD/" .env
sed -i "s/CHANGE_ME_JIBRI_XMPP_PASSWORD/$JIBRI_XMPP_PASSWORD/" .env
sed -i "s/CHANGE_ME_JIBRI_RECORDER_PASSWORD/$JIBRI_RECORDER_PASSWORD/" .env
sed -i "s/CHANGE_ME_JIGASI_PASSWORD/$JIGASI_XMPP_PASSWORD/" .env

echo ""
echo "✅ Passwords đã được sinh và ghi vào .env"
echo ""
echo "⚠️  QUAN TRỌNG: Bước tiếp theo:"
echo "   1. Mở .env và thay YOUR_SERVER_IP bằng IP thật của server"
echo "   2. Chạy: docker compose up -d"
echo ""
