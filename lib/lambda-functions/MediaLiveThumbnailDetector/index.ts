/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import { Handler, Context, Callback } from 'aws-lambda';
import AWS from 'aws-sdk';



const TopicArn = process.env.TopicArn;

// Initialize AWS services
const sns = new AWS.SNS();
const medialive = new AWS.MediaLive();
const rekognition = new AWS.Rekognition();

// Function to make the MediaLive API call to describe thumbnails
async function describeThumbnails(params: any) {
  return new Promise((resolve, reject) => {
    medialive.describeThumbnails(params, (err: any, data: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


// Function to send message through SNS
async function sendSnsMessage(channelId: string, message: string) {
  const params = {
    Message: `${message}\nChannel ID: ${channelId}`,
    TopicArn
  };
  try {
    await sns.publish(params).promise();
    console.log(`Message sent: ${params.Message}`);
    return `Message sent: ${params.Message}`; // Add this line
  } catch (error) {
    console.log(`Error sending message: ${error}`);
    throw error;
  }
}

// Function to detect sporting events using rekognition
async function detectUnauthorizedContent(imageBuffer: Buffer, channelId: string): Promise<{ statusCode: number; body: string; } | undefined> {
  try {
    const params = {
      Image: {
        Bytes: imageBuffer
      },
      MaxLabels: 10,
      MinConfidence: 70
    };
    const response = await rekognition.detectLabels(params).promise();

    const labels = response.Labels;

    if (labels) {
      let unauthorizedContent = false;
      let unauthorizedContentConfidenceScore: number
      for (let i = 0; i < labels.length; i++) {
        if (labels[i].Name === 'Sport' && labels[i].Confidence > 90) {
          unauthorizedContent = true;
          unauthorizedContentConfidenceScore = labels[i].Confidence
          break;
        }
      }

      if (unauthorizedContent) {
        console.log("Sporting Event Streaming Detected");
        const snsResponse = await sendSnsMessage(channelId, `Sporting event streaming detected with a ${unauthorizedContentConfidenceScore!} confidence level.`); 
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                channelId,
                Message: snsResponse, 
            }),
        };
        return response

      } else {
        console.log('No sporting events detected. Detected labels are: ', labels.map((label: any) => `${label.Name}: ConfidenceLevel=${label.Confidence}`).join(', '));
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                channelId,
                Message: 'No sporting events detected. Detected labels are: ',
                Labels: labels.map((label: any) => `${label.Name}: ConfidenceLevel=${label.Confidence}`).join(', ')
            }),
        };
        return response
      }
    }
  } catch (error) {
    console.log('Error occurred while detecting labels', error);
  }
}


// AWS Lambda handler function
export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
 
 
 // Parameterized properties of the event object: 
  const { AWS_REGION, ChannelId, PipelineId, ThumbnailType } = event;
  AWS.config.update({ region: AWS_REGION });

  //Create the parameter object for the MediaLive API call
  const params = {
    ChannelId,
    PipelineId,
    ThumbnailType
  };
  
  try {

    let response: object | undefined

    // 1. Call MediaLive describeThumbnails() api to retrieve the latest thumbnail 
    const data: any = await describeThumbnails(params);
    
    //console.log("data object: ",JSON.stringify(data, null, 2))

    //console.log("thumbnails length ",data.ThumbnailDetails.length)

    if(data.ThumbnailDetails.length > 0 ){

    const thumbnailBody = data.ThumbnailDetails[0].Thumbnails[0].Body 

    //2. Use the built-in Buffer class to decode the binary data into an image
    const decodedImage = Buffer.from(thumbnailBody, 'base64');
    // Optionally archive image in S3 bucket 
    

    //3. Detect sport events using rekognition
      response = await detectUnauthorizedContent(decodedImage, ChannelId);

    }else {
      console.log('No Thumbnail found... check channel status');
      response = {
        statusCode: 200,
        body: JSON.stringify({
            Message: "No Thumbnail found... check channel status", 
        }),
      };
  }

    callback(null, response);
  } catch (error) {
    console.log('Error occurred while describing thumbnails', error);
    callback(error);
  }
};