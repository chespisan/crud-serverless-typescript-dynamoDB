import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import { v4 } from 'uuid';

// Instance DynamoDB
const db = new AWS.DynamoDB.DocumentClient();
// Environment
const postTable = process.env.posts;
// method response 
const response = (statusCode, message) => {
  return {
    statusCode,
    body: JSON.stringify(message)
  }
}
// method order date 
const sortByDate = (a, b) => {
  if(a.createdAt > b.createdAt) {
    return -1;
  } else return 1; 
}

// FN Lambda create post
export const createPost: any = async (event, context, cb) => {
  const reqBody = JSON.parse(event.body);

  const post = {
    id: v4(),
    createdAt: new Date().toISOString(),
    userId: 1,
    title: reqBody.title,
    body: reqBody.body
  };

  return db.put({
    TableName: postTable,
    Item: post
  }).promise()
  .then(() => {
    cb(null, response(201, post))
  })
  .catch(err => response(null, response(err.statusCode, err)))
}

// FN Lambda get all post
export const getAllPosts = (event, context, cb) => {
  return db.scan({TableName: postTable}).promise()
        .then(res => {
          cb(null, response(200, res.Items.sort(sortByDate)))
        })
        .catch(err => {
          cb(null, response(err.statusCode, err))
        });
}

// FN Lambda get number of post
export const getPosts = (event, context, cb) => {
  const numberOfPost = event.pathParameters.number;
  const params = {
    TableName: postTable,
    Limit: numberOfPost
  }
  return db.scan(params)
    .promise()
      .then(res => {
        cb(null, response(200, res.Items.sort(sortByDate)))
      })
      .catch(err => {
        cb(null, response(err.statusCode, err))
      });
}

// FN Lambda get single post
export const getPost = (event, context, cb) => {
  const id = event.pathParameters.id;
  const params = {
    TableName: postTable,
    key: {
      id
    }
  }
  return db.scan(params)
    .promise()
      .then(res => {
        if (res.Items) cb(null, response(200, res.Items.sort(sortByDate)));
        else cb(null, response(404, {error: 'Post not found'}))
      })
      .catch(err => {
        cb(null, response(err.statusCode, err))
      });
}

// FN Lambda update post
export const updatePost = (event,context, cb) => {
  const id = event.pathParameters.id;
  const reqBody = JSON.parse(event.body);
  const { body, title } = reqBody;

  const params = {
    Key: {
      id: id
    },
    TableName: postTable,
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'SET title = :title, body = :body',
    ExpressionAttributeValues: {
      ':title': title,
      ':body': body
    },
    ReturnValues: 'ALL_NEW'
  };

  return db.update(params)
  .promise()
    .then(res => {
      cb(null, response(200, res))
    })
    .catch(err => {
      cb(null, response(err.statusCode, err))
    });
}


// FN Lambda delete post
export const deletePost = (event, context, cb) => {
  const id = event.pathParameters.id;
  const params = {
    Key: {
      id
    },
    TableName: postTable
  };
  return db.delete(params)
    .promise()
      .then(() => {
        cb(null, response(200, response(200, {message: 'Post deleted successfully'})))
       })
      .catch(err => {
        cb(null, response(err.statusCode, err))
      });
}



// export const hello: APIGatewayProxyHandler = async (event, _context) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
//       input: event,
//     }, null, 2),
//   };
// }
