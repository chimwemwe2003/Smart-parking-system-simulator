# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListParkingSpaces*](#listparkingspaces)
  - [*ListUsers*](#listusers)
- [**Mutations**](#mutations)
  - [*CreateParkingZone*](#createparkingzone)
  - [*ResolveAlert*](#resolvealert)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListParkingSpaces
You can execute the `ListParkingSpaces` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listParkingSpaces(): QueryPromise<ListParkingSpacesData, undefined>;

interface ListParkingSpacesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListParkingSpacesData, undefined>;
}
export const listParkingSpacesRef: ListParkingSpacesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listParkingSpaces(dc: DataConnect): QueryPromise<ListParkingSpacesData, undefined>;

interface ListParkingSpacesRef {
  ...
  (dc: DataConnect): QueryRef<ListParkingSpacesData, undefined>;
}
export const listParkingSpacesRef: ListParkingSpacesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listParkingSpacesRef:
```typescript
const name = listParkingSpacesRef.operationName;
console.log(name);
```

### Variables
The `ListParkingSpaces` query has no variables.
### Return Type
Recall that executing the `ListParkingSpaces` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListParkingSpacesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListParkingSpacesData {
  parkingSpaces: ({
    id: UUIDString;
    spaceNumber: string;
    isOccupied: boolean;
  } & ParkingSpace_Key)[];
}
```
### Using `ListParkingSpaces`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listParkingSpaces } from '@dataconnect/generated';


// Call the `listParkingSpaces()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listParkingSpaces();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listParkingSpaces(dataConnect);

console.log(data.parkingSpaces);

// Or, you can use the `Promise` API.
listParkingSpaces().then((response) => {
  const data = response.data;
  console.log(data.parkingSpaces);
});
```

### Using `ListParkingSpaces`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listParkingSpacesRef } from '@dataconnect/generated';


// Call the `listParkingSpacesRef()` function to get a reference to the query.
const ref = listParkingSpacesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listParkingSpacesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.parkingSpaces);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.parkingSpaces);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email?: string | null;
    role: string;
  } & User_Key)[];
}
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateParkingZone
You can execute the `CreateParkingZone` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createParkingZone(): MutationPromise<CreateParkingZoneData, undefined>;

interface CreateParkingZoneRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateParkingZoneData, undefined>;
}
export const createParkingZoneRef: CreateParkingZoneRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createParkingZone(dc: DataConnect): MutationPromise<CreateParkingZoneData, undefined>;

interface CreateParkingZoneRef {
  ...
  (dc: DataConnect): MutationRef<CreateParkingZoneData, undefined>;
}
export const createParkingZoneRef: CreateParkingZoneRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createParkingZoneRef:
```typescript
const name = createParkingZoneRef.operationName;
console.log(name);
```

### Variables
The `CreateParkingZone` mutation has no variables.
### Return Type
Recall that executing the `CreateParkingZone` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateParkingZoneData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateParkingZoneData {
  parkingZone_insert: ParkingZone_Key;
}
```
### Using `CreateParkingZone`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createParkingZone } from '@dataconnect/generated';


// Call the `createParkingZone()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createParkingZone();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createParkingZone(dataConnect);

console.log(data.parkingZone_insert);

// Or, you can use the `Promise` API.
createParkingZone().then((response) => {
  const data = response.data;
  console.log(data.parkingZone_insert);
});
```

### Using `CreateParkingZone`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createParkingZoneRef } from '@dataconnect/generated';


// Call the `createParkingZoneRef()` function to get a reference to the mutation.
const ref = createParkingZoneRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createParkingZoneRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.parkingZone_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.parkingZone_insert);
});
```

## ResolveAlert
You can execute the `ResolveAlert` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
resolveAlert(vars: ResolveAlertVariables): MutationPromise<ResolveAlertData, ResolveAlertVariables>;

interface ResolveAlertRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ResolveAlertVariables): MutationRef<ResolveAlertData, ResolveAlertVariables>;
}
export const resolveAlertRef: ResolveAlertRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
resolveAlert(dc: DataConnect, vars: ResolveAlertVariables): MutationPromise<ResolveAlertData, ResolveAlertVariables>;

interface ResolveAlertRef {
  ...
  (dc: DataConnect, vars: ResolveAlertVariables): MutationRef<ResolveAlertData, ResolveAlertVariables>;
}
export const resolveAlertRef: ResolveAlertRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the resolveAlertRef:
```typescript
const name = resolveAlertRef.operationName;
console.log(name);
```

### Variables
The `ResolveAlert` mutation requires an argument of type `ResolveAlertVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ResolveAlertVariables {
  alertId: UUIDString;
}
```
### Return Type
Recall that executing the `ResolveAlert` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ResolveAlertData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ResolveAlertData {
  alert_update?: Alert_Key | null;
}
```
### Using `ResolveAlert`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, resolveAlert, ResolveAlertVariables } from '@dataconnect/generated';

// The `ResolveAlert` mutation requires an argument of type `ResolveAlertVariables`:
const resolveAlertVars: ResolveAlertVariables = {
  alertId: ..., 
};

// Call the `resolveAlert()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await resolveAlert(resolveAlertVars);
// Variables can be defined inline as well.
const { data } = await resolveAlert({ alertId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await resolveAlert(dataConnect, resolveAlertVars);

console.log(data.alert_update);

// Or, you can use the `Promise` API.
resolveAlert(resolveAlertVars).then((response) => {
  const data = response.data;
  console.log(data.alert_update);
});
```

### Using `ResolveAlert`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, resolveAlertRef, ResolveAlertVariables } from '@dataconnect/generated';

// The `ResolveAlert` mutation requires an argument of type `ResolveAlertVariables`:
const resolveAlertVars: ResolveAlertVariables = {
  alertId: ..., 
};

// Call the `resolveAlertRef()` function to get a reference to the mutation.
const ref = resolveAlertRef(resolveAlertVars);
// Variables can be defined inline as well.
const ref = resolveAlertRef({ alertId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = resolveAlertRef(dataConnect, resolveAlertVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.alert_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.alert_update);
});
```

