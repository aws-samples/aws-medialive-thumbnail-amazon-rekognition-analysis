/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

export type Event = {
    field: string
    action: string
    startDate: string | undefined
    endDate: string | undefined
    cron: string
    description: string
    timeZone: string  | undefined
    schedulerName: string 
    channelInfoPayload: {
        AWS_REGION: string
        ChannelId: string
        PipelineId: string
        ThumbnailType: string
    },
    source : {
      id: string 
    }
  }