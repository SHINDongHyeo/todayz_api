import { Test, TestingModule } from '@nestjs/testing';
import { DebateChatGateway } from './debate-chat.gateway';

describe('DebateChatGateway', () => {
  let gateway: DebateChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DebateChatGateway],
    }).compile();

    gateway = module.get<DebateChatGateway>(DebateChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
