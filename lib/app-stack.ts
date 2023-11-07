/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import * as cdk from 'aws-cdk-lib';
import { CfnOutput, CfnParameter } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AiThumbnailReviewer} from './constructs/lambda-thumbnail-reviewer-construct'
import { SNSTopicConstruct } from './constructs/sns-topic-construct';
import { EventBridgeStack } from './constructs/eventbridge-scheduled-task-construct';
import {LambdaCreateScheduler} from './constructs/lambda-create-scheduler'
import { KmsKeyConstruct } from './constructs/kms-key-construct';

export interface IStackProps extends cdk.StackProps{
  environment: string; 
  costcenter: string; 
  solutionName: string; 
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id, props);

    //Note that the name (logical ID) of the parameter will derive from its name and location within the stack. 
    // Therefore, it is recommended that parameters are defined at the stack level.
    const snsEmail = new CfnParameter(this, 'snsEmail');
    const channelId = new CfnParameter(this, 'channelId');
    const pipelineId = new CfnParameter(this, 'pipelineId');

    const {kmsKey} = new KmsKeyConstruct(this, "kms key", props)
    const {topic} = new SNSTopicConstruct(this, "sns topic",{snsEmail, kmsKey, ...props })
    const {detectThumbnailLambda} = new AiThumbnailReviewer(this, "review medialive thumbnail lambda",{topic,kmsKey, ...props} )
    const {schedulerRole} = new EventBridgeStack(this, "Event Bridge Scheduler", {detectThumbnailLambda, topic, channelId, pipelineId,kmsKey, ...props})
    new LambdaCreateScheduler(this, "create scheduler lambda", {detectThumbnailLambda, schedulerRole, kmsKey, ...props})

    new CfnOutput(this, "SnsTopicName", {value: topic.topicName });  

  }
}
