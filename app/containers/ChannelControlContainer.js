import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ChannelControl from '../components/ChannelControl';
import * as appMainAction from '../modules/appMain';
import * as appRecorderAction from '../modules/appRecorder';

function mapStateToProps(state, ownProps) {
  console.log('mapStateToProps:',state)
  return {
    ...ownProps,
    savedClips: state.appMain.savedClips,
    channelNames: state.appRecorder.channelNames,
    channelStatuses: state.appRecorder.channelStatuses
  }
}

function mapDispatchToProps(dispatch) {
  return {
    AppMainAction: bindActionCreators(appMainAction, dispatch),
    AppRecorderAction: bindActionCreators(appRecorderAction, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelControl);