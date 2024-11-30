import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CloudInsightService {
  private readonly isProduction: boolean;
  private readonly cwKey: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly instanceId: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.isProduction = this.configService.get('IS_PRODUCTION') === 'true';
    this.cwKey = this.configService.get('NCLOUD_CW_KEY');
    this.accessKey = this.configService.get('NCLOUD_ACCESS_KEY');
    this.secretKey = this.configService.get('NCLOUD_SECRET_KEY');
    this.instanceId = this.configService.get('NCLOUD_INSIGHT_INSTANCEID');
  }

  async sendData(data: any): Promise<void> {
    if (!this.isProduction) {
      // 로컬 환경에서는 데이터 전송하지 않음
      return;
    }

    const timestamp = Date.now().toString();
    const method = 'POST';
    const url = '/cw_collector/real/data';

    const message = `${method} ${url}\n${timestamp}\n${this.accessKey}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('base64');

    const headers = {
      'Content-Type': 'application/json',
      'x-ncp-apigw-signature-v2': signature,
      'x-ncp-apigw-timestamp': timestamp,
      'x-ncp-iam-access-key': this.accessKey,
    };

    const body = {
      cw_key: this.cwKey,
      data: {instanceId : this.instanceId, ...data},
    };

    try {
      await axios.post(`https://cw.apigw.ntruss.com${url}`, body, { headers });
    } catch (error) {
      this.logger.error('Cloud Insight 데이터 전송 실패:', error);
      // 필요 시 재시도 로직 또는 에러 핸들링 추가
    }
  }
}