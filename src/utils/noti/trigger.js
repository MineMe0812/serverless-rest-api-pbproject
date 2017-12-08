import { SNS } from 'aws-sdk';
import { checkValidNotiTriggerMessage } from 'utils/validation';

const sns = new SNS({
  region: 'us-east-1'
});

export function trigger (message) { // eslint-disable-line
  if (!checkValidNotiTriggerMessage(message)) {
    throw new Error('Invalid notification trigger message passed to trigger');
  }

  const params = {
    Message: JSON.stringify({
      default: JSON.stringify(message),
      lambda: JSON.stringify(message),
      email: JSON.stringify(message)
    }),
    MessageStructure: 'json',
    TargetArn: process.env.SNS_NOTI_TRIGGER_ARN
  };

  return sns.publish(params).promise();
}

export const notifyJob = (job) => {
  let performedAction;

  switch (job.status) {
    default: case 'CREATED_BY_PARENT':
      performedAction = 'child.job.CREATED_BY_PARENT';
      break;
    case 'CREATED_BY_CHILD':
      performedAction = 'parent.job.CREATED_BY_CHILD';
      break;
    case 'START_APPROVED':
      performedAction = 'child.job.START_APPROVED';
      break;
    case 'START_DECLINED':
      performedAction = 'child.job.START_DECLINED';
      break;
    case 'STARTED':
      performedAction = 'parent.job.STARTED';
      break;
    case 'FINISHED':
      performedAction = 'parent.job.FINISHED';
      break;
    case 'FINISH_DECLINED':
      performedAction = 'parent.job.FINISH_DECLINED';
      break;
    case 'PAID':
      performedAction = 'child.job.PAID';
      break;
  }

  return trigger({
    content: performedAction,
    jobId: job.id
  });
};

export const notifyWithdrawal = (withdrawal) => {
  let performedAction;

  if (withdrawal.status === 'CREATED_BY_CHILD') {
    performedAction = 'parent.withdrawal.CREATED_BY_CHILD';
  } else if (withdrawal.status === 'CREATED_BY_PARENT') {
    performedAction = 'child.withdrawal.CREATED_BY_PARENT';
  } else if (withdrawal.status === 'APPROVED') {
    performedAction = 'child.withdrawal.APPROVED';
  }
  // todo: notify when withdrawal request is rejected

  return trigger({
    content: performedAction,
    withdrawalId: withdrawal.id
  });
};

export const notifyNewFamilyMemberJoined = (familyMember) => {
  const performedAction = familyMember.userSummary.type === 'parent'
    ? 'family.familyJoined.parent'
    : 'family.familyJoined.child';

  return trigger({
    content: performedAction,
    familyId: familyMember.familyId,
    userId: familyMember.userId
  });
};