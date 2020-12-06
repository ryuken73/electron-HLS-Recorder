import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppRecorder from '../components/AppRecorder';
import * as appRecorderAction from '../modules/appRecorder';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  return {
    ...ownProps,
    channelNames: state.appRecorder.channelNames,
    channelStatuses: state.appRecorder.channelStatuses,
  }
}

function mapDispatchToProps(dispatch) {
  return {AppRecorderAction: bindActionCreators(appRecorderAction, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(AppRecorder);