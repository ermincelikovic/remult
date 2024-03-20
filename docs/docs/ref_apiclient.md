# ApiClient
Interface for configuring the API client used by Remult to perform HTTP calls to the backend.
## httpClient
The HTTP client to use when making API calls. It can be set to a function with the `fetch` signature
or an object that has `post`, `put`, `delete`, and `get` methods. This can also be used to inject
logic before each HTTP call, such as adding authorization headers.
   
   
   *example*
   ```ts
   // Using Axios
   remult.apiClient.httpClient = axios;
   ```
   
   
   *example*
   ```ts
   // Using Angular HttpClient
   remult.apiClient.httpClient = httpClient;
   ```
   
   
   *example*
   ```ts
   // Using fetch (default)
   remult.apiClient.httpClient = fetch;
   ```
   
   
   *example*
   ```ts
   // Adding bearer token authorization
   remult.apiClient.httpClient = (input: RequestInfo | URL, init?: RequestInit) => {
     return fetch(input, {
       ...init,
       headers: {
         authorization: 'Bearer ' + sessionStorage.sessionId,
       },
       cache: 'no-store',
     });
   };
   ```
## url
The base URL for making API calls. By default, it is set to '/api'. It can be modified to be relative
or to use a different domain for the server.
   
   
   *example*
   ```ts
   // Relative URL
   remult.apiClient.url = './api';
   ```
   
   
   *example*
   ```ts
   // Different domain
   remult.apiClient.url = 'https://example.com/api';
   ```
## subscriptionClient
The subscription client used for real-time data updates. By default, it is set to use Server-Sent Events (SSE).
It can be set to any subscription provider as illustrated in the Remult tutorial for deploying to a serverless environment.
   
   
   *see*
   https://remult.dev/tutorials/react-next/deployment.html#deploying-to-a-serverless-environment
## wrapMessageHandling
A function that wraps message handling for subscriptions. This is useful for executing some code before
or after any message arrives from the subscription. For example, in Angular, this can be used to trigger
a render by calling the `NgZone` run method.
   
   
   *example*
   ```ts
   // Angular example
   import { Component, NgZone } from '@angular/core';
   import { remult } from "remult";
   
   export class AppComponent {
     constructor(zone: NgZone) {
       remult.apiClient.wrapMessageHandling = handler => zone.run(() => handler());
     }
   }
   ```

Arguments:
* **x**
