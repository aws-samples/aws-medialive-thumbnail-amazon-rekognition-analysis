/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import { SchedulerClient, CreateScheduleCommand, DeleteScheduleCommand } from "@aws-sdk/client-scheduler";
import { Event } from './types';

const schedulerClient = new SchedulerClient({ region: process.env.region });
export const handler = async (event: Event) => {
    switch (event.action) {
      case "create":
        try {
          const cmd = new CreateScheduleCommand({
            Name: event.schedulerName,
            Description: `Run rekognition detection to analyze Media Live channel ${event.channelInfoPayload.ChannelId}`,
            StartDate: event.startDate ? new Date(event.startDate) : undefined, 
            EndDate : event.endDate ? new Date(event.endDate) : undefined, 
            ScheduleExpressionTimezone: "America/Chicago",
            FlexibleTimeWindow: {
                Mode: "OFF",
              },
            ActionAfterCompletion: "DELETE",
            ScheduleExpression: `cron(${event.cron})`,
            KmsKeyArn : process.env.kmsKeyArn,
            Target: {
              RoleArn: process.env.SCHEDULE_ROLE_ARN,
              Arn: process.env.LAMBDA_ARN,
              Input: JSON.stringify({ ...event.channelInfoPayload }),
            }, 
          });
          const result = await schedulerClient.send(cmd);
          return {
            statusCode: 200,
            body: JSON.stringify(result),
          };
        } catch (error) {
          console.log("failed", error);
          return {
            statusCode: 500,
            body: JSON.stringify(error),
          };
        }
      case "delete":
        try {
          await schedulerClient.send(new DeleteScheduleCommand({ Name: event.schedulerName }));
          return {
            statusCode: 200,
            body: `${event.schedulerName} Scheduler deleted`,
          };
        } catch (error) {
          console.log("error", error);
          return {
            statusCode: 500,
            body: JSON.stringify(error),
          };
        }
      default:
        return {
          statusCode: 400,
          body: "Invalid action",
        };
    }
  }