
import type { Serverless } from 'serverless/aws';

const POST_TABLE = 'posts';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'crud-dynamodb',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  configValidationMode: 'warn',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    settings: {
      POST_TABLE
    }
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-offline'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      posts: POST_TABLE
    },
    profile: 'custom-profile',
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
      ],
      Resource:["arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.settings.POST_TABLE}"]
    }]
  },
  functions: {
    createPost: {
      handler: 'handler.createPost',
      events: [
        {
          http: {
            method: 'post',
            path: '/post',
          }
        }
      ]
    },
    getAllPosts: {
      handler: 'handler.getAllPosts',
      events: [
        {
          http: {
            method: 'get',
            path: '/post',
          }
        }
      ]
    },
    getPosts: {
      handler: 'handler.getPosts',
      events: [
        {
          http: {
            method: 'get',
            path: '/posts/{number}',
          }
        }
      ]
    },
    getPost: {
      handler: 'handler.getPost',
      events: [
        {
          http: {
            method: 'get',
            path: '/post/{id}',
          }
        }
      ]
    },
    updatePost: {
      handler: 'handler.updatePost',
      events: [
        {
          http: {
            method: 'put',
            path: '/post/{id}',
          }
        }
      ]
    },
    deletePost: {
      handler: 'handler.deletePost',
      events: [
        {
          http: {
            method: 'delete',
            path: '/post/{id}',
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      PostsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [{
            AttributeName: "id",
            AttributeType: "S"
          }],
          KeySchema: [{
            AttributeName: "id",
            KeyType: "HASH"
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          TableName: POST_TABLE
        }
      }
    }
  }
}

module.exports = serverlessConfiguration;
