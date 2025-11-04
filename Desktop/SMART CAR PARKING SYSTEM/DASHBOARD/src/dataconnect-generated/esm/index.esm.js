import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'dashboard',
  location: 'us-central1'
};

export const createParkingZoneRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateParkingZone');
}
createParkingZoneRef.operationName = 'CreateParkingZone';

export function createParkingZone(dc) {
  return executeMutation(createParkingZoneRef(dc));
}

export const listParkingSpacesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListParkingSpaces');
}
listParkingSpacesRef.operationName = 'ListParkingSpaces';

export function listParkingSpaces(dc) {
  return executeQuery(listParkingSpacesRef(dc));
}

export const resolveAlertRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ResolveAlert', inputVars);
}
resolveAlertRef.operationName = 'ResolveAlert';

export function resolveAlert(dcOrVars, vars) {
  return executeMutation(resolveAlertRef(dcOrVars, vars));
}

export const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';

export function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
}

