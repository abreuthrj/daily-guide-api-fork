export const parseVersion = (version: string): number => {
  const [h, t, u] = version.split('.');
  return parseInt(h) * 1000 + parseInt(t) + parseInt(u) / 1000;
};

export const versionCheck = (curVersion: string, minVersion: string) => {
  return parseVersion(curVersion) >= parseVersion(minVersion);
};

export const isMobile = (deviceOS: string) => {
  return ['android', 'ios'].includes(deviceOS.trim().toLowerCase());
};
