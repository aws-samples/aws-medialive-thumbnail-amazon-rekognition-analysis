Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 

## Deploying Additional Schedulers via the Provided Lambda Function  

> The examples below assume your project is deployed to us-west-2 and that your are making use of aws cli [profiles feature](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html). Simply update the region specified and/or remove the command line switches for profile and region to fall back to the AWS CLI default configuration. 


<br>

- First set environment variables: 
    > Change region and channelId to match target environment
    - Linux: ` set AWS_REGION=us-west-2 && set ChannelId=5204063 `
    - Windows: ` $Env:ChannelId=3284674 ; $Env:AWS_REGION="us-west-2  `

<br>

- create scheduler that runs every 5 mins during business hours  
    - create lambda event objects: ` node .\docs\event_configs\config-every5MinBusinessHours.js  `
        > Creates to lambda event objects in the path ./docs/events_object/ that we will use to invoke the lambda via the following commands:
    
    - create scheduler:  `aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/create_EveryHalfHourBusinessHours.json docs/responses/create_EveryHalfHourBusinessHours_response.json --profile dev --region us-west-2 `

    - delete scheduler:  `aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/delete_EveryHalfHourBusinessHours.json docs/responses/delete_EveryHalfHourBusinessHours_response.json --profile dev --region us-west-2 `

        > Both commands above output the lambda response to a corresponding file the path ./docs/responses/ which enables you to verify a 200 response was returned, indicating the create or delete scheduler action was successful.  
 
- create scheduler that runs every 10 mins on week days : 
    - create lambda event objects: ` node .\docs\event_configs\config-every10minWeekdays.js  `

    - create scheduler:  ` aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/create_Every10MinsWeekdays.json docs/responses/create_Every10MinsWeekdays_response.json --profile dev --region us-west-2 `

    - delete scheduler: ` aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/delete_Every10MinsWeekdays.json docs/responses/delete_Every10MinsWeekdays_response.json --profile dev --region us-west-2 `


- create scheduler that runs every half-hour on weekends: 
    - create lambda event objects: ` node .\docs\event_configs\config-everyHalfHourWeekends.js  `

    - create scheduler:  `aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/create_EveryHalfHourWeekends.json docs/responses/create_EveryHalfHourWeekends_response.json --region us-west-2 --profile dev `

    - delete scheduler: `aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/delete_EveryHalfHourWeekends.json docs/responses/delete_EveryHalfHourWeekends_response.json --region us-west-2 --profile dev `

- create scheduler that runs every hour from 9-5pm CST Timezone on weekdays: 
    - create lambda event objects: ` node .\docs\event_configs\config-everyHourFrom9To5CSTWeekdays.js  `

    - create scheduler:  ` aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/create_EveryHourFrom9To5CSTWeekdays.json docs/responses/create_EveryHourFrom9To5CSTWeekdays_response.json --profile dev --region us-west-2   `

    - delete scheduler: ` aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/delete_EveryHourFrom9To5CSTWeekdays.json docs/responses/delete_EveryHourFrom9To5CSTWeekdays_response.json --profile dev --region us-west-2   `


- create scheduler that runs this Sunday from 10am-3pm CST an delete on Monday: 
    - create lambda event objects: ` node .\docs\event_configs\config-thisSunday10To3CstDeleteAfterwards.js  `

    - create scheduler: ` aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/create_ThisSunday10To3CstDeleteAfterwards.json docs/responses/create_ThisSunday10To3CstDeleteAfterwards_response.json --profile dev --region us-west-2   `

    - delete scheduler: ` aws lambda invoke --function-name "MediaLiveStack-scheduler-dev" --cli-binary-format raw-in-base64-out --payload file://docs/event_objects/delete_ThisSunday10To3CstDeleteAfterwards.json docs/responses/delete_ThisSunday10To3CstDeleteAfterwards_response.json --profile dev --region us-west-2   `



## Additional Information and Reference for EventBridge Scheduler: 

### Schedule types on EventBridge Scheduler(https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- Rate-based schedules
- Cron-based schedules
- One-time schedules

### EventBridge Schedule CF Ref[AWS::Scheduler::Schedule](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-scheduler-schedule.html)

(Scheduler CloudFormation API)[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-scheduler-schedule.html]
(Scheduler Javascript SDK)[https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-scheduler/Interface/CreateScheduleCommandInput/]




