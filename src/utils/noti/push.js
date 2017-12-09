import * as R from 'ramda';
import { SNS } from 'aws-sdk';

const sns = new SNS({
  region: 'us-east-1'
});

const startsWith = R.curry((prefix, xs) => R.equals(R.take(prefix.length, xs), prefix));
const is_iOS_token = ({ model }) => startsWith('iPhone', model) || startsWith('iPad', model) || startsWith('iPod', model); // eslint-disable-line

export function sendAPNToSingleDevice(token, msgText) {
  const createEndpointParams = {
    PlatformApplicationArn: process.env.SNS_PUSH_APN_ARN,
    Token: token
  };

  sns
    .createPlatformEndpoint(createEndpointParams).promise()
    .then(({ EndpointArn }) => {
      const payload = {
        default: msgText,
        APNS: JSON.stringify({
          aps: {
            alert: msgText,
            sound: 'default',
            badge: 1
          }
        })
      };

      return sns.publish({
        Message: JSON.stringify(payload),
        MessageStructure: 'json',
        TargetArn: EndpointArn
      }).promise();
    });
}

export const sendPush = (deviceTokens, msgText) => {
  const iosTokens = R.compose(
    R.map(R.prop('token')),
    R.filter(is_iOS_token)
  )(deviceTokens);

  console.log('Trying to send push to ', deviceTokens);
  console.log('With this content:', msgText);

  return Promise.all(iosTokens.map(token => sendAPNToSingleDevice(token, msgText)));
};