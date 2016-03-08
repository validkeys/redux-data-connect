```
import ReduxDataConnect, { dataConnectReducer } from 'redux-data-connect';

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
  {
    users: {
      selector: (state, props) => state.users,
      action:   (props) => this.props.actions.loadUsers()
    }
  }
)(dumbComponent)
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
