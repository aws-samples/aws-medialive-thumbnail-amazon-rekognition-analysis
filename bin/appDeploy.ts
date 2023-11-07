#!/usr/bin/env node
/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import {config} from '../config'; 
import { AwsSolutionsChecks } from 'cdk-nag' 
import { Aspects } from 'aws-cdk-lib'; 

const app = new cdk.App();

// Add the cdk-nag AwsSolutions Pack with extra verbose logging enabled.
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))

//User account details from AWS CLI credentials: 
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION
//const region = 'us-west-2' // static region configuration to target region different from default region configured in cli profile
const env = {account, region}; 

new AppStack(app, 'AiThumbnailMonitor', {
  stackName: `${config.solutionName}-${config.environment}`,
  env,
  ...config
});