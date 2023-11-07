/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import {StackProps, Tags, CfnParameter } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Key } from 'aws-cdk-lib/aws-kms';


interface IStackProps extends StackProps {
  kmsKey: Key;
  snsEmail: CfnParameter
  environment: string; 
  solutionName: string; 
  costcenter: string; 
};

export class SNSTopicConstruct extends Construct {

  public readonly topic: sns.ITopic; 

  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id);

    
    const snsTopic = new sns.Topic(this, 'MedialiveThumbnailRekognitionTopic', {
        topicName: "MediaLiveThumbnailPreview",
        displayName: "Media Live Thumbnail Sports Event Detector",
        masterKey: props.kmsKey
      });
      
      snsTopic.addSubscription(new EmailSubscription(props.snsEmail.valueAsString));

      //For Info on how to send messages to Amazon Chime, Slack, or Microsoft Teams: 
      //https://repost.aws/knowledge-center/sns-lambda-webhooks-chime-slack-teams
      //snsTopic.addSubscription(new LambdaSubscription(myFunction));
  
      this.topic = snsTopic 
 
     
    Tags.of(this).add("environment", props.environment)
    Tags.of(this).add("solution", props.solutionName)
    Tags.of(this).add("costcenter", props.costcenter)

   // new CfnOutput(this, 'bucketArn', {value: storageBucket.bucketArn})

  }
}
