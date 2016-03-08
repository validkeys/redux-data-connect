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

const DataConnectedComponent = (
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
