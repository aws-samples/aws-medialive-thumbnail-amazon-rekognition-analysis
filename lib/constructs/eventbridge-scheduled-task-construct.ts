/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { ITopic } from 'aws-cdk-lib/aws-sns';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Key } from 'aws-cdk-lib/aws-kms';

export interface IStackProps extends StackProps{
    kmsKey: Key;
    topic: ITopic; 
    detectThumbnailLambda: NodejsFunction
    channelId: CfnParameter
    pipelineId: CfnParameter
    environment: string; 
    costcenter: string; 
    solutionName: string; 
  }

//Consider Splitting this Construct into is own stack to support reuse. 
export class EventBridgeStack extends Construct {

  public readonly schedulerRole: Role

  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id);

    const { region }  = Stack.of(this)

    /* The permissions of this example role should be further scoped as applicable to align with the principals of least privilege */
    const schedulerRole = new Role(this, "schedulerRole", {
       assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
       inlinePolicies:  {
        schedulerPolicy: new PolicyDocument({
          assignSids:true,
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: [props.detectThumbnailLambda.functionArn],
              actions: [
                "lambda:InvokeFunction"
              ],
            }),
            new PolicyStatement({ 
              effect: Effect.ALLOW,
              resources: [
                props.kmsKey.keyArn
              ], 
              actions: [
                "kms:GenerateDataKey",
                "kms:Decrypt"
              ],
            })                 
          ],
        })
    }
    })
  
    this.schedulerRole = schedulerRole

    
    // Create the payload for the scheduler to send to the thumbnail review lambda
    const channelInfoPayload = {
      "AWS_REGION": region,
      "ChannelId": props.channelId.valueAsString,
      "PipelineId": props.pipelineId.valueAsString,
      "ThumbnailType": "CURRENT_ACTIVE"
    };


    //The specification for the AWS::Scheduler::Schedule is found in the link below
    //https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-scheduler-schedule.html
    new cdk.CfnResource(this, "EventBridgeRateScheduler", {
        type: "AWS::Scheduler::Schedule",
        properties: {
         Name: "EventBridgeScheduler",
         Description: `Runs a lambda every 5 Minute`,
         FlexibleTimeWindow: { Mode: "OFF" },   
         ScheduleExpression: `rate(5 minutes)`, 
         ScheduleExpressionTimezone: "America/Chicago",
         KmsKeyArn : props.kmsKey.keyArn,
         Target: {
           Arn: props.detectThumbnailLambda.functionArn,
           RoleArn: schedulerRole.roleArn,
           Input: JSON.stringify(channelInfoPayload)
         },
       }
    })


    }
}

    