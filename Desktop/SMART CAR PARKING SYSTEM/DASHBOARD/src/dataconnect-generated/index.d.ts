import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Alert_Key {
  id: UUIDString;
  __typename?: 'Alert_Key';
}

export interface CreateParkingZoneData {
  parkingZone_insert: ParkingZone_Key;
}

export interface ListParkingSpacesData {
  parkingSpaces: ({
    id: UUIDString;
    spaceNumber: string;
    isOccupied: boolean;
  } & ParkingSpace_Key)[];
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email?: string | null;
    role: string;
  } & User_Key)[];
}

export interface OccupancyRecord_Key {
  id: UUIDString;
  __typename?: 'OccupancyRecord_Key';
}

export interface ParkingSpace_Key {
  id: UUIDString;
  __typename?: 'ParkingSpace_Key';
}

export interface ParkingZone_Key {
  id: UUIDString;
  __typename?: 'ParkingZone_Key';
}

export interface ResolveAlertData {
  alert_update?: Alert_Key | null;
}

export interface ResolveAlertVariables {
  alertId: UUIDString;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateParkingZoneRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateParkingZoneData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateParkingZoneData, undefined>;
  operationName: string;
}
export const createParkingZoneRef: CreateParkingZoneRef;

export function createParkingZone(): MutationPromise<CreateParkingZoneData, undefined>;
export function createParkingZone(dc: DataConnect): MutationPromise<CreateParkingZoneData, undefined>;

interface ListParkingSpacesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListParkingSpacesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListParkingSpacesData, undefined>;
  operationName: string;
}
export const listParkingSpacesRef: ListParkingSpacesRef;

export function listParkingSpaces(): QueryPromise<ListParkingSpacesData, undefined>;
export function listParkingSpaces(dc: DataConnect): QueryPromise<ListParkingSpacesData, undefined>;

interface ResolveAlertRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ResolveAlertVariables): MutationRef<ResolveAlertData, ResolveAlertVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ResolveAlertVariables): MutationRef<ResolveAlertData, ResolveAlertVariables>;
  operationName: string;
}
export const resolveAlertRef: ResolveAlertRef;

export function resolveAlert(vars: ResolveAlertVariables): MutationPromise<ResolveAlertData, ResolveAlertVariables>;
export function resolveAlert(dc: DataConnect, vars: ResolveAlertVariables): MutationPromise<ResolveAlertData, ResolveAlertVariables>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect): QueryPromise<ListUsersData, undefined>;

