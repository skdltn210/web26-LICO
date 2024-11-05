export interface User {
  channelId: string;
  channelName: string;
  channelDescription: string;
  followers: string;
}

const mockUsers: Record<string, User> = {
  stream_1: {
    channelId: 'stream_1',
    channelName: '눈송이 TV',
    channelDescription: '안녕하세요! 다이아를 향해 달려가는 롤 스트리머 눈송이입니다. 매일 저녁 8시 방송시작!',
    followers: '234,567',
  },
  stream_2: {
    channelId: 'stream_2',
    channelName: '게임러버의 게임방',
    channelDescription: 'E스포츠 경기 분석과 게임 이슈 다루는 채널입니다. 롤드컵, LCK 같이보기 전문!',
    followers: '178,234',
  },
  stream_3: {
    channelId: 'stream_3',
    channelName: '에임신과 함께하는 FPS 세계',
    channelDescription: '발로란트 레디언트 유지 중! 에임 강의와 플레이 포인트 설명 위주의 방송',
    followers: '145,678',
  },
  stream_4: {
    channelId: 'stream_4',
    channelName: '배틀매니아의 배그생존기',
    channelDescription: '배그 3000시간 플레이! 시청자분들과 함께하는 배틀그라운드 스쿼드. 초보자 가르치는거 좋아해요~',
    followers: '89,123',
  },
  stream_5: {
    channelId: 'stream_5',
    channelName: '메이플여신의 메이플스토리',
    channelDescription: '메이플 15년차 유저입니다. 보스레이드 공략과 초보자 템셋팅 도와드려요!',
    followers: '123,456',
  },
  stream_6: {
    channelId: 'stream_6',
    channelName: '축구황제의 피파방',
    channelDescription: 'EA FC 24 프로 선수 출신! 피파 노하우 전수와 시청자 대전 위주로 진행합니다.',
    followers: '167,890',
  },
  stream_7: {
    channelId: 'stream_7',
    channelName: '던파고수의 던전생활',
    channelDescription: '던전앤파이터 모든 캐릭터 레벨캡 달성! 신캐릭터 컨텐츠 및 레이드 공략 전문',
    followers: '56,789',
  },
  stream_8: {
    channelId: 'stream_8',
    channelName: '테란장인의 스타방송',
    channelDescription: '스타크래프트 테란 래더 그랜드마스터! 저그전, 프로토스전 빌드 설명 및 래더 클라이밍',
    followers: '198,765',
  },
  stream_9: {
    channelId: 'stream_9',
    channelName: '악마사냥꾼의 던전탐험',
    channelDescription: '디아블로4 시즌2 스타트! 효율적인 파밍과 빌드 가이드 제공합니다.',
    followers: '145,678',
  },
  stream_10: {
    channelId: 'stream_10',
    channelName: '워치맨의 오버워치',
    channelDescription: '오버워치2 서포터 그랜드마스터 달성! 포지션별 운영법과 팀 운영 강의',
    followers: '134,567',
  },
  stream_11: {
    channelId: 'stream_11',
    channelName: '쿠키마스터의 쿠키방',
    channelDescription: '쿠키런 킹덤 길드전 전문! 신캐릭터 리뷰와 팀 조합 추천해드립니다.',
    followers: '78,901',
  },
  stream_12: {
    channelId: 'stream_12',
    channelName: '마크장인의 건축세계',
    channelDescription: '마인크래프트 건축과 레드스톤 전문. 시청자분들의 건축 작품도 리뷰해드려요!',
    followers: '89,012',
  },
  stream_13: {
    channelId: 'stream_13',
    channelName: '폴가이저의 폴가이즈',
    channelDescription: '폴가이즈 우승 500회 이상! 맵별 공략과 꿀팁 전수해드립니다.',
    followers: '45,678',
  },
  stream_14: {
    channelId: 'stream_14',
    channelName: '에이펙신의 에이펙스',
    channelDescription: '에이펙스 레전드 프레데터 3시즌 연속 달성! 레전드별 운영법과 에임 강의',
    followers: '201,234',
  },
  stream_15: {
    channelId: 'stream_15',
    channelName: '로아달인의 로스트아크',
    channelDescription: '로스트아크 원데이 클리어 전문! 레이드 공략과 클래스별 빌드 추천',
    followers: '167,890',
  },
  stream_16: {
    channelId: 'stream_16',
    channelName: '냥스트리머의 힐링방송',
    channelDescription: '귀여운 고양이 두 마리와 함께하는 힐링 게임 방송. 잔잔한 수다와 게임 플레이!',
    followers: '98,765',
  },
  stream_17: {
    channelId: 'stream_17',
    channelName: '파티퀸의 엔터테인먼트',
    channelDescription: '시청자분들과 함께하는 즐거운 파티 방송! 게임, 노래, 이벤트 다양하게 진행합니다.',
    followers: '145,678',
  },
  stream_18: {
    channelId: 'stream_18',
    channelName: '게임평론가의 리뷰채널',
    channelDescription: '20년차 게임평론가의 솔직담백한 게임 리뷰. 스팀 신작부터 인디게임까지!',
    followers: '156,789',
  },
  stream_19: {
    channelId: 'stream_19',
    channelName: '모바일러의 게임정보',
    channelDescription: '모바일 게임 전문 스트리머! 신작 소개와 꿀팁 전달해드립니다.',
    followers: '67,890',
  },
  stream_20: {
    channelId: 'stream_20',
    channelName: '콘솔킹의 PS5방송',
    channelDescription: 'PS5 신작 플레이부터 트로피 수집까지! 콘솔 게임 종합 방송',
    followers: '189,012',
  },
};

export default mockUsers;
