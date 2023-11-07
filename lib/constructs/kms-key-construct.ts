/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import {StackProps, Tags } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { Key } from 'aws-cdk-lib/aws-kms';


interface IStackProps extends StackProps {
  environment: string; 
  solutionName: string; 
  costcenter: string; 
};

export class KmsKeyConstruct extends Construct {

  public readonly kmsKey: Key; 

  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id);

    const snsEncryptionKey = new Key(this, 'TopicKMSKey',{enableKeyRotation: true});

    this.kmsKey = snsEncryptionKey
   
     
    Tags.of(this).add("environment", props.environment)
    Tags.of(this).add("solution", props.solutionName)
    Tags.of(this).add("costcenter", props.costcenter)

   // new CfnOutput(this, 'bucketArn', {value: storageBucket.bucketArn})

  }
}
