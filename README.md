## 프로젝트소개

![039662A4-0D41-41F0-AEB6-ABA1A7484A56](https://github.com/user-attachments/assets/16eb7136-a0ee-4c95-a580-119cc66c3e75)

### LICO (LIve + COnnection) - 더 쉽고 가까운 라이브 스트리밍 서비스
### [바로가기](https://lico.digital/)

리코는 더 쉽고 간편하게 인터넷 방송을 할 수 있는 라이브 스트리밍 서비스입니다.
보다 더 많은 사람들이 쉽게 인터넷 방송을 시작할 수 있도록 WebRTC 기술을 활용한 웹스튜디오 기능을 지원하여 OBS, PRISM STUDIO등의 
동영상 송출 소프트웨어 설정의 어려움과 진입장벽을 낮추었습니다.
## 기술스택
![lico (7)](https://github.com/user-attachments/assets/50437fdd-3357-4fd5-af3b-bcfc3e6fa6d6)
### Common
  <div align="left"
<img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white">
<img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white">
<img src="https://img.shields.io/badge/eslint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white">
<img src="https://img.shields.io/badge/prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white">
<img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/socketio-010101?style=for-the-badge&logo=socketdotio&logoColor=white">
<img src="https://img.shields.io/badge/jest-C21325?style=for-the-badge&logo=jest&logoColor=white">
  </br>
  </div>
  
### Frontend 
  <div align="left"
<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white">
<img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img src="https://img.shields.io/badge/tailwindcss-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
<img src="https://img.shields.io/badge/tanstackquery-FF4154?style=for-the-badge&logo=reactquery&logoColor=white">
<img src="https://img.shields.io/badge/axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white">
<img src="https://img.shields.io/badge/zustand-513517?style=for-the-badge&logo=&logoColor=white">
<img src="https://img.shields.io/badge/reactrouter-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white">
<img src="https://img.shields.io/badge/webrtc-333333?style=for-the-badge&logo=webrtc&logoColor=white">
<img src="https://img.shields.io/badge/canvas-e72429?style=for-the-badge&logo=canvas&logoColor=white">
<img src="https://img.shields.io/badge/netlify-00c7b7?style=for-the-badge&logo=netlify&logoColor=white">
 </br>
  </div>
  
### Backend
 <div align="left"
<img src="https://img.shields.io/badge/nest.js-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
<img src="https://img.shields.io/badge/typeorm-FE0803?style=for-the-badge&logo=typeorm&logoColor=white">
<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
<img src="https://img.shields.io/badge/ncloud-03C75A?style=for-the-badge&logo=naver&logoColor=white">
<img src="https://img.shields.io/badge/sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white">
<img src="https://img.shields.io/badge/redis-FF4438?style=for-the-badge&logo=redis&logoColor=white">
<img src="https://img.shields.io/badge/passport-34E27A?style=for-the-badge&logo=passport&logoColor=white">
<img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white">
<img src="https://img.shields.io/badge/githubactions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white">
<img src="https://img.shields.io/badge/rclone-3F79AD?style=for-the-badge&logo=rclone&logoColor=white">
 </div>

## 의존성

### Common
- typescript: ~5.6.2
- eslint: ^8.57.1
- prettier: ^3.0.0-^3.3.3
### Frontend Dependencies
- @tanstack/react-query: ^5.59.20
- axios: ^1.7.7 
- hls.js: ^1.5.17
- react: ^18.3.1
- react-dom: ^18.3.1
- react-icons: ^5.3.0
- react-router-dom: ^6.27.0
- socket.io-client: ^4.8.1
- zustand: ^5.0.1
- vite: ^5.4.10
- tailwindcss: ^3.4.14
- postcss: ^8.4.47

### Backend Dependencies
- @nestjs/common: ^10.0.0
- @nestjs/core: ^10.0.0
- @nestjs/jwt: ^10.2.0
- @nestjs/passport: ^10.0.3
- @nestjs/platform-socket.io: ^10.4.7
- @nestjs/typeorm: ^10.0.2
- mysql2: ^3.11.3
- typeorm: ^0.3.20
- winston: ^3.15.0
- jest: ^29.5.0
- ts-node: ^10.9.1

## 주요기능

### OAuth 및 게스트 로그인
![login](https://github.com/user-attachments/assets/7d962991-72af-4b64-bade-98a95f247251)
Oauth를 이용한 간편한 로그인을 지원하며 서비스 체험을 위한 게스트 계정 기능을 지원합니다.

### 방송 시청
![방송 시청 및 채팅](https://github.com/user-attachments/assets/f0ef5344-a3f0-4b04-81a2-0608bf699e89)
현재 진행중인 방송의 시청이 가능합니다.

### 채팅 및 AI 채팅 필터링
![채팅](https://github.com/user-attachments/assets/304148fb-1ef9-44c9-9a94-edc2623e59fe)
방송을 시청중인 다른 유저와 채팅을 통해 소통이 가능하며 CLOVA STUDIO를 이용한 클린봇(AI 채팅 필터링) 기능을 통해 부적절한 채팅을 보지 않을 수 있습니다.

### 방송 송출
![외부 송출](https://github.com/user-attachments/assets/b9f51196-06b1-439c-bafb-5e450af1b4b7)
OBS등 인터넷 방송 보조 프로그램을 통해 방송 송출이 가능합니다.

### 웹 스튜디오
![웹스튜디오](https://github.com/user-attachments/assets/b1f88508-f5ea-4dff-b5a4-2e408de3c2a6)
웹스튜디오를 이용해 별도의 프로그램 설치 없이도 방송 송출이 가능합니다.

## 프로젝트 발표 영상



## 팀원소개

| ![프로필](https://github.com/skdltn210.png) | ![프로필](https://github.com/chologmaesil.png) | ![프로필](https://github.com/gamgyul163.png) | ![프로필](https://github.com/pc5401.png) |
| :-----------------------------------------: | :--------------------------------------------: | :------------------------------------------: | :--------------------------------------: |
|              **J010\_고은수**               |                **J106\_박민석**                |               **J207\_임국희**               |             **J254\_최명권**             |
|                     FE                      |                       FE                       |                      BE                      |                    BE                    |
|   [GitHub](https://github.com/skdltn210)    |   [GitHub](https://github.com/chologmaesil)    |   [GitHub](https://github.com/gamgyul163)    |   [GitHub](https://github.com/pc5401)    |



## 문서
📑 [팀노션](https://far-woodwind-e60.notion.site/TEAM-LICOTA-128af9f4d256805cae54d502f832cff4) |
📝 [기획서](https://far-woodwind-e60.notion.site/12daf9f4d25680f3835ec9747141d58d?pvs=74) |
✨ [그라운드룰](https://far-woodwind-e60.notion.site/276b04231b684386890ce1b77b92ab3a) |
📅 [회의록](https://far-woodwind-e60.notion.site/9c384ef0c9db45d985eb868bbc63a282) |
📚 [개발일지](https://far-woodwind-e60.notion.site/12daf9f4d256808f8c3ed26e0a4ab309) | 
🔥 [트러블슈팅](https://far-woodwind-e60.notion.site/12daf9f4d256802985dce28210c4f062?pvs=4) |
📌 [WIKI](https://github.com/boostcampwm-2024/web26-LICO/wiki)
