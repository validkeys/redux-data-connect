import React, { Component }   from 'react';
import { connect }            from 'react-redux';
import { bindActionCreators } from 'redux';
import uniqueId               from 'lodash/uniqueId';
import extend                 from 'lodash/extend';
import some                   from 'lodash/some';
import get                    from 'lodash/get';

import {
  mapStateToProps,
  pickAllActions,
  fetchKey
} from './utils';

import {
  registerDataConnection,
  updateDataConnect,
  reducer
} from './modules';

// NOTE:
// reducer needs to be added to consuming application
// with the key: reduxDataConnect
export { reducer as dataConnectReducer };

export default ( mapping = {}, additionalActions = {}) => {
  return WrappedComponent => {

    class ReduxDataConnect extends Component {

      constructor(props) {
        super(props);
        this._id     = uniqueId("redux_data_connect_");
        this.actions = pickAllActions(mapping);
        this.fetches = {};
        this.state   = {};
      }

      updateFetchState( key, status, err ) {
        const { dispatch }  = this.context.store;
        dispatch(updateDataConnect(this._id, key, status, err));
      }

      // TODO:
      // * would be nice to 'queue' the actions here to avoid multiple calls
      fireAction( action, props = this.props ) {
        const { dispatch }  = this.context.store;
        const hocProps      = props;
        let result          = this.fetches[action.prop] = dispatch(action.fnc.call(this, hocProps));

        if (result.then) {
          this.updateFetchState(action.prop, "pending");
          result
            .then(() => this.updateFetchState(action.prop, "fulfilled"))
            .catch((err) => this.updateFetchState(action.prop, "rejected", err))
        }
      }

      componentWillMount() {
        const { dispatch }  = this.context.store;
        dispatch(registerDataConnection(this._id));

        // fire all actions from mapping
        this.actions.forEach((action) => {
          this.fireAction(action);
        });
      }

      componentWillReceiveProps( nextProps ){
        this.actions.forEach((action) => {
          if (action.hasOwnProperty("deps")) {
            let depsHaveChanged = some(action.deps, (dep) => {
              return get(this.props, dep) !== get(nextProps, dep);
            })
            if (depsHaveChanged){
              this.fireAction(action, nextProps);
            }
          }
        });
      }


      componentWillUnmount() {
        const { dispatch }  = this.context.store;
        dispatch(unregisterDataConnection(this._id));
      }

      render() {
        const { props } = this;
        let mappedProps = {};

        Object.keys(mapping).forEach((propKey) => {
          let connectState      = this.props.reduxDataConnect[this._id];
          mappedProps[propKey]  = {
            data:     props[propKey],
            request:  (connectState) ? connectState[propKey] : null
          }
        });

        Object.keys(props).forEach((ownProp) => {
          if (!mappedProps.hasOwnProperty(ownProp)) {
            mappedProps[ownProp] = props[ownProp];
          }
        });

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

        extend(payload, additionalActions);

        return { actions: bindActionCreators(payload, dispatch)};
      }
    )(ReduxDataConnect);
  }
}
