const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'dashboard',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createParkingZoneRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateParkingZone');
}
createParkingZoneRef.operationName = 'CreateParkingZone';
exports.createParkingZoneRef = createParkingZoneRef;

exports.createParkingZone = function createParkingZone(dc) {
  return executeMutation(createParkingZoneRef(dc));
};

const listParkingSpacesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListParkingSpaces');
}
listParkingSpacesRef.operationName = 'ListParkingSpaces';
exports.listParkingSpacesRef = listParkingSpacesRef;

exports.listParkingSpaces = function listParkingSpaces(dc) {
  return executeQuery(listParkingSpacesRef(dc));
};

const resolveAlertRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ResolveAlert', inputVars);
}
resolveAlertRef.operationName = 'ResolveAlert';
exports.resolveAlertRef = resolveAlertRef;

exports.resolveAlert = function resolveAlert(dcOrVars, vars) {
  return executeMutation(resolveAlertRef(dcOrVars, vars));
};

const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';
exports.listUsersRef = listUsersRef;

exports.listUsers = function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
};
