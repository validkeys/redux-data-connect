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

    payload["reduxDataConnect"] = state.reduxDataConnect;

    return payload;
  }
}
