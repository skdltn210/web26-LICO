interface CategoryStats {
  id: string;
  name: string;
  totalViewers: number;
  totalLives: number;
  thumbnailUrl: string;
}

const mockCategories: CategoryStats[] = [
  {
    id: 'leagueoflegends',
    name: '리그 오브 레전드',
    totalViewers: 15234,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyMzEyMTFfMjI5/MDAxNzAyMjU5Njk2ODQ5.bQMe6kUHvW9G6o4HkLkMXVZNJTuzRDv6wt9LIXJibP0g.fDL9ksaxRv6H-8WlnhZPRKi7uIz5yRfPAJWDF9_Z9YUg.JPEG/2.%EB%A6%AC%EA%B7%B8%EC%98%A4%EB%B8%8C%EB%A0%88%EC%A0%84%EB%93%9C_%EC%99%84%EC%84%B1%EB%B3%B8_%EC%9D%B4%EC%9D%80%EC%A0%95.jpg',
  },
  {
    id: 'justchatting',
    name: 'Just Chatting',
    totalViewers: 21107,
    totalLives: 6,
    thumbnailUrl: 'https://ssl.pstatic.net/static/nng/glive/icon/category_poster_talk.png',
  },
  {
    id: 'valorant',
    name: 'VALORANT',
    totalViewers: 4521,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyMzEyMTFfMjgx/MDAxNzAyMjgyMzQ1OTY0.j7kSfz4_foTCTHKdfVipCjmRgR_Bld21s3K-wW3xLUkg.7FV8wiUcFqQeS6FghtgVOAYP7wswr9no2V_mmNALzQwg.JPEG/98.%EB%B0%9C%EB%A1%9C%EB%9E%80%ED%8A%B8_%EC%99%84%EC%84%B1%EB%B3%B8_%EC%84%9D%EC%A7%80%EC%97%B0.jpg',
  },
  {
    id: 'battlegrounds',
    name: 'BATTLEGROUNDS',
    totalViewers: 2845,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyNDA0MDFfMjQw/MDAxNzExOTcyMzk5Nzg5.oHT1swUDNXnSgDb27few65QCO2GAPSMlJXrZtfLn3g8g.XNm8NUhnlOMMB4pMGsK23twXWtvFHr7veIfyvq90j10g.PNG/BG_Twitch_GameThumb.png',
  },
  {
    id: 'maplestory',
    name: '메이플스토리',
    totalViewers: 3156,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyMzEyMTFfMjIw/MDAxNzAyMjYzMTE0OTIz.WRwoGGu2x-fCzOYxCq-06snvzB0qNLW7KDpdTsuupncg.K6ENtFRVZZ3dKkcskWC4qmM7iN61_HE98Zlo_RVOEuwg.JPEG/164.%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC_%EC%99%84%EC%84%B1%EB%B3%B8_%EC%9D%B4%EB%8B%AC%EB%8B%98.jpg',
  },
  {
    id: 'eafc24',
    name: 'EA FC 24',
    totalViewers: 5789,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyMzEyMTFfMTMx/MDAxNzAyMjc5Nzc1Mzg5.mFnDC37B4NC0Bot5-oWiJTABVWbAbb1onsxtNjRv21Ig.4114sbMvu9swAyjx9-uo3YtfUdy9bDybnInIKz4nvAog.PNG/1.FC%EC%98%A8%EB%9D%BC%EC%9D%B8.png',
  },
  {
    id: 'dungeonfighter',
    name: '던전앤파이터',
    totalViewers: 1234,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyNDAzMDVfNTkg/MDAxNzA5NjIwOTcwMDgw.u9TniTjv0FmtoCXRpnQvVmb-_OHvnyWLS9ISg7Pqss0g.NqaF10a2WJenWYvMIqErFBYPTAYftocuCqlO0iUiOpEg.PNG/45.png',
  },
  {
    id: 'starcraft',
    name: '스타크래프트',
    totalViewers: 6543,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyMzEyMTJfMTgy/MDAxNzAyMzY2NjIwMjEw.HLxVSv2OAMUhpxDfXmPlaUAMH22v7Ssd10hCHyc_mZkg.-uWjWmavT7cCtbgZyZWjPI_9FAH4DK70y4syz1km8s4g.JPEG/270.%EC%8A%A4%ED%83%80%ED%81%AC%EB%9E%98%ED%94%84%ED%8A%B8_%EB%A6%AC%EB%A7%88%EC%8A%A4%ED%84%B0_%EC%99%84%EC%84%B1%EB%B3%B8_%EC%9D%B4%EC%9D%80%EC%A0%95.jpg',
  },
  {
    id: 'diablo4',
    name: '디아블로 IV',
    totalViewers: 4891,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyMzEyMTJfMjE3/MDAxNzAyMzQ0MTg5MTI5.ZBqfu-vLP7j2k2s3-CALb0mmzBEswyhiydQX321QhNIg.yKANUASnxTbVldaJqHvJBMLazcp_H0dn8k6nS_OovM8g.JPEG/349.%EB%94%94%EC%95%84%EB%B8%94%EB%A1%9C_4_%EC%99%84%EC%84%B1%EB%B3%B8_%EA%B0%95%EB%AF%B8%EC%95%A0.jpg',
  },
  {
    id: 'overwatch2',
    name: '오버워치 2',
    totalViewers: 3567,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyNDA4MjJfMTE2/MDAxNzI0Mjg4NTE0OTA4.LCPG2YFmQdjDtakOASsS_zQ78IUFEj8qgPkkWPl5JKMg.ZPpa6VhesY0t3KKIUSES6gddb0POo3G39PaHXw4OqIYg.PNG/-twitch-600x800_%281%29.png',
  },
  {
    id: 'cookierunkingdom',
    name: '쿠키런: 킹덤',
    totalViewers: 2134,
    totalLives: 1,
    thumbnailUrl:
      'https://i.namu.wiki/i/82EgSA2n4ibQtlwUUKa4GE9v8jgFJefctnhLRBsRSOmQTY_YBFT22ZZt9ps0eTTTvRfFKUeM2dlg-bxwxm7urA.webp',
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    totalViewers: 1876,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyMzEyMTFfMTM3/MDAxNzAyMjgyNjI1MDgw.Ozu1fi3gdfyooyBjO_SGXJBDqRWgDFLlmWAFZg6qYIUg.rlnppQX9tMgn2nvgjhXwqsJhfktN23Gdjj09CgJ--BYg.JPEG/104.%EB%A7%88%EC%9D%B8%ED%81%AC%EB%9E%98%ED%94%84%ED%8A%B8_%EC%99%84%EC%84%B1%EB%B3%B8_%EC%9D%B4%EB%8B%AC%EB%8B%98.jpg',
  },
  {
    id: 'fallguys',
    name: 'Fall Guys',
    totalViewers: 945,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyNDA4MjNfMTc1/MDAxNzI0Mzg2MjA3NDgx.4uwzk9v07zV4kAGJRMYK-FIEhu1CGznVn2qDEnddSGcg.ZB-QPDGnWy0LxYZBD5qfyIhvMQDEXOW9CE4HaD5jdb0g.PNG/FG_Mobile_KeyArt_TwitchGameArt_300x400.png',
  },
  {
    id: 'apexlegends',
    name: 'Apex Legends',
    totalViewers: 7823,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyMzEyMTJfMTAg/MDAxNzAyMzY1ODcyMDg0.bId7HRzfmw9fA64Hy_X9saZav3ZZfTAH2T4BsX112J8g.9bcEcwnEvkaGXCzkLIRrvQHoNplxhHN0jDAdK2Gdhqsg.JPEG/248.%EC%97%90%EC%9D%B4%ED%8E%99%EC%8A%A4_%EB%A0%88%EC%A0%84%EB%93%9C_%EC%99%84%EC%84%B1%EB%B3%B8_%EA%B0%95%EB%AF%B8%EC%95%A0.jpg',
  },
  {
    id: 'lostark',
    name: 'Lost Ark',
    totalViewers: 5432,
    totalLives: 1,
    thumbnailUrl:
      'https://nng-phinf.pstatic.net/MjAyNDAyMjdfMjkz/MDAxNzA5MDA3NjYyNzIz.eWlTbBIGcELR9xUoGEOdTZoCdDj9lX-xd7YT_vRgp6Ig.kaWgTDIJSbuA1cNnezQpZH8AmWsor2-m-yzYsah-u_Ug.PNG/SGR%EC%B9%98%EC%A7%80%EC%A7%81%ED%94%84%EB%A1%9C%ED%95%84_300x400.png',
  },
];

export default mockCategories;
