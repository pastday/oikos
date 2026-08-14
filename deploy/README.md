# 배포 (oikos.pastday.co.kr)

현재 구성은 **Docker 를 사용하지 않는다.** 서버에 이미 동작 중인 nginx 뒤에
Next.js 프로세스를 systemd 서비스로 띄우고 리버스 프록시로 연결한다.

```
인터넷 → nginx (80/443)
          └ oikos.pastday.co.kr → http://127.0.0.1:3100 (systemd: oikos.service)
```

같은 서버에서 `pastday.co.kr`, `iychoi.pastday.co.kr`, `mission.pastday.co.kr` 이
이미 서비스 중이다. **이 설정은 서브도메인 전용 파일로만 추가하며 기존 설정을 수정하지 않는다.**

포트 3100 을 사용한다. (3000 은 개발 서버, 8000·8001·8790·9000·9001 등은 다른 서비스가 사용 중)

---

## 최초 배포

### 1. 빌드

```bash
cd /home/pastday/oikos
npm ci
npm run build
```

`.env.production` 의 `SITE_URL=https://oikos.pastday.co.kr` 이 빌드 시점에 반영되어
canonical / Open Graph URL 이 운영 도메인으로 생성된다.

### 2. Next.js 서비스 등록

```bash
sudo cp /home/pastday/oikos/deploy/systemd/oikos.service /etc/systemd/system/oikos.service
sudo systemctl daemon-reload
sudo systemctl enable --now oikos
systemctl status oikos --no-pager
```

확인:

```bash
curl -I http://127.0.0.1:3100/ko    # 200 이어야 한다
```

### 3. nginx 설정 추가

```bash
sudo cp /home/pastday/oikos/deploy/nginx/oikos.pastday.co.kr.conf \
        /etc/nginx/sites-available/oikos
sudo ln -s /etc/nginx/sites-available/oikos /etc/nginx/sites-enabled/oikos
sudo nginx -t
sudo systemctl reload nginx
```

확인:

```bash
curl -I http://oikos.pastday.co.kr/ko    # 200 이어야 한다
```

### 4. HTTPS 발급

```bash
sudo certbot --nginx -d oikos.pastday.co.kr
```

certbot 이 `sites-available/oikos` 에 TLS 설정과 HTTP→HTTPS 리다이렉트를 자동으로 추가한다.
(다른 서브도메인과 동일한 방식)

확인:

```bash
curl -I https://oikos.pastday.co.kr/
sudo certbot certificates
```

> ⚠️ **certbot 실행 후에는 이 저장소의 nginx 설정 파일을 서버로 다시 복사하지 않는다.**
> certbot 이 서버의 `/etc/nginx/sites-available/oikos` 에 직접 TLS 블록을 추가하므로,
> 저장소 파일로 덮어쓰면 인증서 설정이 사라지고 HTTPS 가 끊긴다.
> nginx 설정을 바꿔야 한다면 서버 파일을 직접 수정하거나,
> 저장소 파일을 고친 뒤 TLS 블록을 유지한 채 필요한 부분만 옮긴다.

#### 자동 갱신

Let's Encrypt 인증서는 90일마다 갱신해야 하며, certbot 패키지가 설치한 타이머가 자동으로 처리한다.

```bash
systemctl list-timers | grep certbot     # 타이머 동작 확인
sudo certbot renew --dry-run             # 갱신 시뮬레이션
```

갱신은 `/.well-known/acme-challenge/` 경로로 이루어진다.
nginx 설정의 숨김 파일 차단 규칙이 이 경로를 막지 않도록
`location ~ /\.(?!well-known)` 형태로 예외를 두었다. 이 규칙을 되돌리지 않는다.

---

## 코드 갱신 후 재배포

```bash
cd /home/pastday/oikos
git pull
npm ci
npm run build
sudo systemctl restart oikos
```

nginx 설정을 바꾸지 않았다면 nginx 는 재시작할 필요가 없다.

---

## 문제 확인

```bash
systemctl status oikos
journalctl -u oikos -n 100 --no-pager      # 애플리케이션 로그
sudo tail -f /var/log/nginx/oikos.error.log # nginx 오류 로그
sudo tail -f /var/log/nginx/oikos.access.log
```

- **502 Bad Gateway** → `oikos.service` 가 죽어 있다. `systemctl status oikos` 확인
- **404** → nginx vhost 가 없거나 심볼릭 링크가 빠졌다. `ls /etc/nginx/sites-enabled/` 확인

---

## 주의

- 현재 배포에는 **데이터베이스가 필요 없다.** 메인 페이지를 포함한 모든 페이지가
  빌드 시점에 정적 생성(SSG)되며 아직 DB 를 조회하지 않는다.
- 5단계 이후 관리자 기능이 들어가면 운영 서버의 `.env` 에
  `DATABASE_URL`, `AUTH_SECRET` 을 추가해야 한다. **이 값들은 절대 Git 에 커밋하지 않는다.**
- `.env.production` 에는 비밀값이 없으므로 Git 에 포함한다.
