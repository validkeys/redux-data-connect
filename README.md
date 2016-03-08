### Redux Data Connect
#### An alpha lib w/ no tests

A declarative way to specify the data that your component needs as well as the actions to fetch that data.

Let's suppose that you have 5 components rendered on the page at a given time. Each of those components requires
lots of different data, but they all require data from a /users endpoint. Each component requires different
data from the users endpoint.

Typically in a Redux application, you'd have the following action(types) fire when each component loads:

USERS_REQUEST > USERS_SUCCESS | USERS_FAILURE (amongst others)

The USERS_REQUEST action gets fired when each of your components mounts and dispatches their data request action (because they each need user data). But you have 5 components each hitting the users endpoint, each firing USERS_REQUEST > USERS_SUCCESS | USERS_FAILURE. So which should your component listen to?

Your component should only care about the data that it needs -- not a global loading state of data _like_ what it needs. ReduxDataConnect allows you to specify the data that your component needs and the action required to fetch that data. RDC then handles the fetching of the data for you but also lets your component know the state of each of it's requests.



```
import ReduxDataConnect, { dataConnectReducer } from 'redux-data-connect';

const anotherAction = ( props ) => {
  return {
    type: "SOMETHING",
    payload: { id: props.id }
  }
}

const dumbComponent = (props) => {
  return (
    <div>My DumbComponent</div>
    {(() => {
      if (this.props.users.request.isPending) {
        return <div>Loading</div>;
      } else {
        return (
          <ul>
            {this.props.users.data.map((user) => {
              return <li>{user.name}</li>;
            })}
          </ul>
        );
      }
    })()}
  );
}

const DataConnectedComponent = ReduxDataConnect(
  // first argument is an object for each data property your component needs
  // each prop should contain a selector and an action
  // the selector is the function that will parse the state to grab the data
  // your component needs. The action is a dataLoading action that will be automatically
  // fired when your component mounts to fetch data from the server.
  //
  // Each action requires a name and a corresponding function
  // Each action will be automatically called to fetch data and
  // will also be made available for your UI to call manually via the
  // this.props.actions property in your component.
  {
    users: {
      selector: (state, props) => state.users,
      action:   {
        name: "fetchUsers",
        fnc:  (props) => this.props.actions.loadUsers()
      }
    }
  }

  // as a second argument, you can pass in additional actions
  // these will simply be added to your component's actions property
  // and pre-bound to dispatch for you
, { anotherAction, aSecondAction })(dumbComponent)
```


Each property that you send in to the config (ex. "users") will be added onto "dumbComponent" with the following structure:

```
this.props.users = {
  data: [] // initially the result of your selector,
  request: {
    isPending:    true/false,
    isRejected:   true/false,
    isFulfilled:  true/false
  }
}
```

The action that you supply in the config is called in the componentWillMount hook of the HOC (ReduxDataConnect);


Here's a few use cases:

```
if (this.props.users.data.length === 0 && this.props.users.request.isPending) {
  showLoadingState();
} elseif (this.props.users.data.length > 0 && this.props.users.request.isPending) {
  showPartialDataAndLoadingIndicator();
} elseif (this.props.users.data.length ===0 && this.props.users.request.isRejected) {
  showErrorState();
}
```
