'use strict';

const React           = require('react');
const ReactBootstrap  = require('react-bootstrap');
const Tooltip         = ReactBootstrap.Tooltip;
const OverlayTrigger  = ReactBootstrap.OverlayTrigger;
const rtcninja        = require('rtcninja');
const hark            = require('hark');
const classNames      = require('classnames');


class ConferenceParticipantSelf extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false
        }
        this.speechEvents = null;
        this.speechActivityTimer = null;

        // ES6 classes no longer autobind
        this.onVideoClicked = this.onVideoClicked.bind(this);
    }

    componentDidMount() {
        rtcninja.attachMediaStream(this.refs.videoElement, this.props.stream);
        this.refs.videoElement.oncontextmenu = (e) => {
            // disable right click for video elements
            e.preventDefault();
        };
        // factor it out to a function to avoid lint warning about calling setState here
        this.attachSpeechEvents();
    }

    componentWillUnmount() {
        if (this.speechEvents !== null) {
            this.speechEvents.stop();
            this.speechEvents = null;
        }
        clearInterval(this.speechActivityTimer);
    }

    attachSpeechEvents() {
        const options = {
            interval: 150,
            play: false
        };
        this.speechEvents = hark(this.props.stream, options);
        this.speechEvents.on('speaking', () => {
            this.setState({active: true});
        });
        this.speechEvents.on('stopped_speaking', () => {
            this.setState({active: false});
        });
    }

    onVideoClicked() {
        const item = {
            stream: this.props.stream,
            identity: this.props.identity
        };
        this.props.selected(item);
    }

    render() {
        if (this.props.stream == null) {
            return false;
        }

        const tooltip = (
            <Tooltip id="t-myself">{this.props.identity.displayName || this.props.identity.uri}</Tooltip>
        );

        const hasVideo = this.props.stream.getVideoTracks().length > 0;

        const classes = classNames({
            'mirror' : hasVideo,
            'poster' : !hasVideo,
            'conference-active' : this.state.active
        });

        return (
            <OverlayTrigger placement="top" overlay={tooltip}>
                <video ref="videoElement" onClick={this.onVideoClicked} className={classes}  poster="assets/images/transparent-1px.png" autoPlay muted />
            </OverlayTrigger>
        );
    }
}

ConferenceParticipantSelf.propTypes = {
    stream: React.PropTypes.object.isRequired,
    identity: React.PropTypes.object.isRequired,
    selected: React.PropTypes.func.isRequired,
    active: React.PropTypes.func.isRequired
};


module.exports = ConferenceParticipantSelf;
