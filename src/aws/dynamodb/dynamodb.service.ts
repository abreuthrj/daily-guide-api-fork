import { default as awsConfig } from '#/config/aws-config';
import { AWSConfig } from '#/config/interfaces/aws-config.interface';
import { Inject, Injectable } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk';
import {
  Converter,
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  PutItemInput,
  QueryInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb';

@Injectable()
export class DynamoDBService {
  private readonly dynamodb: DynamoDB;

  constructor(
    @Inject(awsConfig.KEY)
    private readonly awsConfig: AWSConfig,
  ) {
    this.dynamodb = new DynamoDB({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKey,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
  }

  async tables() {
    const tables = await this.dynamodb.listTables().promise();
    return tables.TableNames;
  }

  async scan<T>(tableName: string): Promise<T[]> {
    const query = await this.dynamodb
      .scan({
        TableName: tableName,
      })
      .promise();

    return query.Items.map((item) => Converter.unmarshall(item) as T);
  }

  async query<T>(
    tableName: string,
    data: Record<string, string | number>,
    filter?: string,
    index?: string,
    attributeNames?: ExpressionAttributeNameMap,
    attributeValues?: ExpressionAttributeValueMap,
    limit?: number,
  ): Promise<T[]> {
    const expressionList = [];

    if (data) {
      attributeNames = attributeNames ?? {};
      attributeValues = attributeValues ?? {};
      Object.entries(data).forEach(([k, v]) => {
        expressionList.push(`#${k} = :${k}`);
        attributeNames[`#${k}`] = k;
        attributeValues[`:${k}`] = { [this.selectType(v)]: v };
      });
    }

    const keyExpression = expressionList.join(' AND ');

    const params: QueryInput = {
      TableName: tableName,
      KeyConditionExpression: keyExpression,
      FilterExpression: filter,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      Limit: limit,
      IndexName: index,
    };

    const query = await this.dynamodb.query(params).promise();

    return query.Items.map((item) => Converter.unmarshall(item) as T);
  }

  async save<T>(tableName: string, item: T): Promise<void> {
    const params: PutItemInput = {
      TableName: tableName,
      Item: Converter.marshall(item),
    };

    await this.dynamodb.putItem(params).promise();
  }

  async update<T>(
    tableName: string,
    id: Record<string, any>,
    item: T,
  ): Promise<void> {
    const attributeNames = {};
    const attributeValues = {};

    const expressions = Object.entries(item).map(([key, value]) => {
      attributeNames[`#${key}`] = key;
      attributeValues[`:${key}`] = Converter.marshall({ value }).value;

      return `#${key} = :${key}`;
    });

    const updateExpression = `SET ${expressions.join(', ')}`;

    const params: UpdateItemInput = {
      TableName: tableName,
      Key: Converter.marshall(id),
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
    };

    await this.dynamodb.updateItem(params).promise();
  }

  selectType(value: any): string {
    if (typeof value === 'number') {
      return 'N';
    }
    return 'S';
  }
}
