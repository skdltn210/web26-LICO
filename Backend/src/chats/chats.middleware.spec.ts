import { ChatsMiddleware } from './chats.middleware';

describe('ChatsMiddleware', () => {
  it('should be defined', () => {
    expect(new ChatsMiddleware()).toBeDefined();
  });
});
