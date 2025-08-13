export const extractUserAgent = (userAgent: string) => {
  userAgent = userAgent || '';

  const [
    sysOS,
    sysVersion,
    appVersion,
    deviceName,
    deviceUID,
    platformVersion,
  ] = userAgent.split('|');

  return {
    sysOS,
    sysVersion,
    appVersion,
    deviceName,
    deviceUID,
    platformVersion,
  };
};
