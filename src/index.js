import React, { Component }   from 'react';
import { connect }            from 'react-redux';
import { bindActionCreators } from 'redux';
import extend                 from 'lodash/extend';

export const mapStateToProps = (mapping, state) => {
  return (state, props) => {
    let payload = {};
    Object.keys(mapping).forEach((propKey) => {
      if (mapping[propKey].hasOwnProperty('selector')) {
        payload[propKey] = mapping[propKey].selector.call(this, state, props);
      } else {
        throw new Error("Missing selector for key: " + propKey);
      }
    });
    return payload;
  }
}

export const pickAllActions = (mapping) => {
  let actions = [];
  Object.keys(mapping).forEach((propKey) => {
    let item    = mapping[propKey];
    let action  = item.action;
    if (action) {
      if (!action.hasOwnProperty("name")) {
        throw new Error("Your ReduxDataConnect action is missing a name property. Your actoun must be an object like: {name: \"myActionName\", fnc: myActionFunc}");
      }
      if (!action.hasOwnProperty("fnc")) {
        throw new Error("Your ReduxDataConnect action is missing a fnc property. Your actoun must be an object like: {name: \"myActionName\", fnc: myActionFunc}");
      }

      actions.push(extend({}, action, {
        prop: propKey
      }));
    }
  });

  return actions;
}

export default ( mapping = {} ) => {
  return WrappedComponent => {

    class ReduxDataConnect extends Component {

      constructor(props) {
        super(props);
        this.actions = pickAllActions(mapping);
        this.fetches = {};
        this.state   = {};
      }

      updateFetchState( key, fetchItem, err ) {
        const newKey = `fetch:${key}`;
        this.setState({
          [newKey]: {
            isPending:    fetchItem.isPending(),
            isRejected:   fetchItem.isRejected(),
            isFulfilled:  fetchItem.isFulfilled(),
            error:        err
          }
        });
      }

      componentWillMount() {
        const { dispatch } = this.context.store;
        const hocProps = this.props;
        // fire all actions from mapping
        this.actions.forEach((action) => {
          let result = this.fetches[action.prop] = dispatch(action.fnc.apply(this. hocProps));
          if (result.then) {
            this.updateFetchState(action.prop, result)
            result
              .then(() => {
                this.updateFetchState(action.prop, result)
              }).catch((err) => {
                this.updateFetchState(action.prop, result, err);
              })
          }
        });
      }

      render() {
        console.log("PROPS", this.props);
        const { props } = this;
        let mappedProps = {};

        Object.keys(mapping).forEach((propKey) => {
          mappedProps[propKey] = {
            data:     props[propKey],
            request:  this.state[`fetch:${propKey}`]
          }
        });

        Object.keys(props).forEach((ownProp) => {
          if (!mappedProps.hasOwnProperty(ownProp)) {
            mappedProps[ownProp] = props[ownProp];
          }
        })

        return <WrappedComponent {...mappedProps} />;
      }
    }

    ReduxDataConnect.contextTypes = {
      store: React.PropTypes.object
    };

    return connect(
      (state) => {
        return mapStateToProps(mapping, state)
      }, (dispatch, ownProps) => {
        const actions = pickAllActions(mapping);
        let payload = {};
        actions.forEach((action) => {
          payload[action.name] = action.fnc
        });
        return { actions: bindActionCreators(payload, dispatch)};
      }
    )(ReduxDataConnect);
  }
}
